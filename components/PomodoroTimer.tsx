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
} from "react-native";
import { Pie } from "react-native-progress";
import { nanoid } from "nanoid/non-secure";
import { TimeLoggingStorage } from "@/app/common/services/dataStorage";
import { TimeLogEntry } from "@/app/common/interfaces/timeLogging";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";

const DEFAULT_DURATION = 25;

interface PomodoroTimerProps {
  onClose: () => void;
}

const PomodoroTimer = ({ onClose }: PomodoroTimerProps) => {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const [opacityAnim] = useState(new Animated.Value(0));
  const { triggerRefresh } = useTimeLogging();

  const [duration, setDuration] = useState(DEFAULT_DURATION * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inputMinutes, setInputMinutes] = useState("25");
  const [taskName, setTaskName] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [scaleAnim] = useState(new Animated.Value(0.3));

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

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            logSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    if (isRunning) {
      clearInterval(intervalRef.current!);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const handleSetDuration = () => {
    const mins = parseInt(inputMinutes, 10);
    if (!isNaN(mins) && mins >= 1 && mins <= 90) {
      const newDuration = mins * 60;
      setDuration(newDuration);
      setTimeLeft(newDuration);
    }
    setShowModal(false);
  };

  const logSession = async () => {
    const timeSpentSeconds = duration - timeLeft;
    //log minimum one minute
    if (timeSpentSeconds < 60) {
      Alert.alert(
        "Minimum Focus Time Required",
        "Please focus for at least 1 minute to log your session.",
        [{ text: "OK", onPress: () => {} }]
      );
      return;
    }

    const totalMinutes = Math.floor(timeSpentSeconds / 60);
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
          onPress={endSession}
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
              placeholder="1-90 min"
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
    fontWeight: "bold",
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
  taskLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  taskInput: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    width: 20,
    backgroundColor: "transparent",
  },
});

export default PomodoroTimer;
