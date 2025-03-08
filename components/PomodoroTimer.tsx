import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useColorScheme,
  Animated,
  Alert,
  AppState,
  AppStateStatus,
} from "react-native";
import { Pie } from "react-native-progress";
import { nanoid } from "nanoid/non-secure";
import { TimeLoggingStorage } from "@/app/common/services/dataStorage";
import { TimeLogEntry } from "@/app/common/interfaces/timeLogging";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";
import { Dialog } from "@rneui/themed";
import { ThemedText } from "./ThemedText";
import { Audio } from "expo-av";
import {
  schedulePomodoroCompletionNotification,
  cancelPomodoroNotification,
} from "@/app/common/services/notificationService";

const DEFAULT_DURATION = 25;

interface PomodoroTimerProps {
  onClose: () => void;
  startSound?: Audio.Sound | null;
  endSound?: Audio.Sound | null;
}

const PomodoroTimer = ({
  onClose,
  startSound,
  endSound,
}: PomodoroTimerProps) => {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const [opacityAnim] = useState(new Animated.Value(0));
  const { triggerRefresh } = useTimeLogging();
  const [showFocusDialog, setShowFocusDialog] = useState(false);
  const [isFirstStart, setIsFirstStart] = useState(true);
  const [duration, setDuration] = useState(DEFAULT_DURATION * 60);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inputMinutes, setInputMinutes] = useState("25");
  const [taskName, setTaskName] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [scaleAnim] = useState(new Animated.Value(0.3));
  const startTimeRef = useRef<number>(0);
  const initialDurationRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);

  // Animation effect on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Automatically end session when timer runs out
  useEffect(() => {
    if (timeLeft === 0 && !isRunning) {
      endSession();
    }
  }, [timeLeft, isRunning]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && isRunningRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = initialDurationRef.current - elapsed;

        if (remaining <= 0) {
          setTimeLeft(0);
          endSession();
        } else {
          setTimeLeft(remaining);
          startTimeRef.current = Date.now() - elapsed * 1000;
          initialDurationRef.current = remaining;
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress = (duration - timeLeft) / duration;

  const playStartSound = async () => {
    if (startSound) {
      await startSound.playAsync();
    }
  };

  const startTimer = async () => {
    if (!isRunning) {
      await playStartSound();
      if (isFirstStart) {
        setShowFocusDialog(true);
      } else {
        setIsRunning(true);
        startInterval();
      }
    }
  };

  const startInterval = () => {
    cancelPomodoroNotification();
    startTimeRef.current = Date.now();
    initialDurationRef.current = timeLeft;
    isRunningRef.current = true;

    const endTime = new Date(Date.now() + timeLeft * 1000);
    schedulePomodoroCompletionNotification(endTime, duration / 60);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          isRunningRef.current = false;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (isRunning) {
      clearInterval(intervalRef.current!);
      setIsRunning(false);
      isRunningRef.current = false;
    }
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    isRunningRef.current = false;
    setTimeLeft(duration);
    cancelPomodoroNotification();
  };

  const handleSetDuration = async () => {
    const mins = parseInt(inputMinutes, 10);
    if (!isNaN(mins) && mins >= 2 && mins <= 90) {
      await playStartSound();
      const newDuration = mins * 60;
      setDuration(newDuration);
      setIsFirstStart(true);
      setTimeLeft(newDuration);
    }
    setShowModal(false);
  };

  const logSession = async () => {
    const timeSpent = duration - timeLeft;
    const isCompletedSession = timeLeft === 0;

    // Only show alert if session was manually stopped before completing
    if (!isCompletedSession && timeSpent < 60) {
      Alert.alert(
        "Minimum Focus Time Required",
        "Please focus for at least 1 minute to log your session.",
        [{ text: "OK", onPress: () => {} }]
      );
      return;
    }

    const totalMinutes = Math.floor(timeSpent / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const activityName = taskName.trim() || "Focus Mode";

    const newEntry: TimeLogEntry = {
      id: nanoid(),
      activity: activityName,
      hours,
      minutes,
      category: "productive",
      timestamp: new Date().toISOString(),
      synced: false,
      isPomodoro: true,
    };

    try {
      await TimeLoggingStorage.saveLogs(newEntry);
      triggerRefresh();
      onClose();
    } catch (error) {
      console.error("Failed to log time:", error);
    }
  };

  const endSession = () => {
    if (isRunning) {
      pauseTimer();
    }
    if (endSound) {
      endSound.replayAsync();
    }
    logSession();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.closeButton,
          {
            backgroundColor:
              colorScheme === "dark"
                ? "rgba(1, 1, 1, 0.3)"
                : "rgba(255,255,255,0.3)",
            borderColor: textColor,
          },
        ]}
        onPress={handleClose}
        disabled={isRunning}
      >
        <Ionicons name="close" size={24} color={textColor} />
      </TouchableOpacity>

      <View style={styles.timerContainer}>
        <Pie
          size={250}
          progress={progress}
          color={"rgb(5, 90, 23)"}
          unfilledColor={
            colorScheme === "dark"
              ? "rgba(10, 82, 47, 0.2)"
              : "rgba(142, 240, 245, 0.2)"
          }
          borderWidth={2}
        />
      </View>

      <Text style={[styles.timeText, { color: textColor }]}>
        {formatTime(timeLeft)}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.circularButton,
            {
              backgroundColor: "transparent",
              borderColor: textColor,
            },
          ]}
          onPress={isRunning ? pauseTimer : startTimer}
        >
          <Ionicons
            name={isRunning ? "pause" : "play"}
            size={24}
            color={textColor}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.circularButton,
            {
              backgroundColor: "transparent",
              borderColor: textColor,
            },
          ]}
          onPress={resetTimer}
        >
          <Ionicons name="refresh" size={24} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.circularButton,
            {
              backgroundColor: "transparent",
              borderColor: textColor,
            },
          ]}
          onPress={() => {
            cancelPomodoroNotification();
            endSession();
          }}
        >
          <Ionicons name="stop" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.durationContainer}>
        <Text style={[styles.durationText, { color: textColor }]}>
          Duration: {duration / 60} min
        </Text>
        {showModal ? (
          <View style={styles.inlineDurationInput}>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: textColor,
                  color: textColor,
                  backgroundColor: "transparent",
                },
              ]}
              keyboardType="numeric"
              value={inputMinutes}
              onChangeText={setInputMinutes}
              placeholder="2-90 min"
              placeholderTextColor={iconColor}
              maxLength={2}
            />
            <TouchableOpacity
              style={[styles.circularButton, { borderColor: textColor }]}
              onPress={handleSetDuration}
            >
              <Ionicons name="checkmark" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.circularButton,
              styles.durationButton,
              {
                borderColor: textColor,
                opacity: isRunning ? 0.5 : 1,
              },
            ]}
            onPress={() => setShowModal(true)}
            disabled={isRunning}
          >
            <Ionicons name="timer-outline" size={24} color={textColor} />
            <Text style={[styles.setButtonText, { color: textColor }]}>
              Set Duration
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.taskContainer}>
        <TextInput
          style={[
            styles.taskInput,
            {
              borderBottomColor: textColor,
              color: textColor,
            },
          ]}
          placeholder="Focus on..."
          placeholderTextColor={iconColor}
          value={taskName}
          maxLength={50}
          onChangeText={setTaskName}
        />
      </View>
      <Dialog isVisible={showFocusDialog} overlayStyle={{ backgroundColor }}>
        <Dialog.Title
          title="🍅 Focus Time Starting"
          titleStyle={{ color: textColor, fontSize: 18, textAlign: "left" }}
        />
        <View style={styles.focusDialogContent}>
          <ThemedText style={styles.focusText}>
            • Focus solely on your task{"\n"}• Put other distractions aside
            {"\n"}• Keep the app open{"\n"}• Stay committed to your goal
          </ThemedText>
        </View>
        <Dialog.Actions>
          <Dialog.Button
            title="Not Now"
            onPress={() => setShowFocusDialog(false)}
            titleStyle={{ color: textColor }}
          />
          <Dialog.Button
            title="Let's Focus"
            onPress={async () => {
              setShowFocusDialog(false);
              setIsFirstStart(false);
              setIsRunning(true);
              startInterval();
            }}
            buttonStyle={styles.dialogPrimaryButton}
            titleStyle={{ color: "#fff" }}
          />
        </Dialog.Actions>
      </Dialog>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    width: 250,
    height: 250,
  },
  timeText: {
    fontSize: 48,
    fontWeight: "light",
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 30,
  },
  durationContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  durationText: {
    fontSize: 16,
  },
  setButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 8,
    borderRadius: 25,
    borderWidth: 1,
    zIndex: 1,
  },
  circularButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    borderWidth: 1,
  },
  durationButton: {
    backgroundColor: "transparent",
    marginTop: 10,
    width: "auto",
    paddingHorizontal: 20,
    flexDirection: "row",
    gap: 8,
  },
  inlineDurationInput: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 7,
  },
  dialogPrimaryButton: {
    backgroundColor: "rgb(5, 90, 23)",
    borderRadius: 50,
    marginEnd: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 50,
    width: 80,
    paddingVertical: 8,
    textAlign: "center",
    fontSize: 16,
  },
  taskContainer: {
    width: "40%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    alignSelf: "center",
  },
  taskInput: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    width: 20,
    backgroundColor: "transparent",
  },
  focusDialogContent: {
    padding: 10,
    alignItems: "flex-start",
  },
  focusText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default PomodoroTimer;
