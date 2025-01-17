import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Animated,
  PanResponder,
  Vibration,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React, { useState, useMemo } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { TimeLoggingStorage } from "../../common/services/dataStorage";
import { TimeLogEntry } from "@/app/common/interfaces/timeLogging";
import { nanoid } from "nanoid/non-secure";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";

type Category = "productive" | "neutral" | "wasteful";

export default function TimeLogging({ onComplete }: TimeLoggingProps) {
  const { triggerRefresh } = useTimeLogging();
  const selectedBorder = useThemeColor(
    {
      light: "rgba(0, 0, 0, 1)",
      dark: "rgb(219, 246, 248)",
    },
    "text"
  );

  const [activity, setActivity] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [category, setCategory] = useState<Category>("neutral");
  const [fadeAnim] = useState(new Animated.Value(1));

  const totalMinutes = useMemo(() => hours * 60 + minutes, [hours, minutes]);

  const inputBackground = useThemeColor({}, "background");
  const inputText = useThemeColor({}, "text");

  const screenWidth = Dimensions.get("window").width;
  const containerPadding = 40; // 20px padding on each side
  const availableWidth = screenWidth - containerPadding;
  const isSmallScreen = availableWidth < 300;

  const slideAnimation = new Animated.Value(0);
  const buttonWidth = Math.min(250, screenWidth * 0.7);
  const threshold = buttonWidth * 0.4;

  const playSelectionSound = async () => {
    let sound: Audio.Sound | null = null;
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/selection.mp3")
      );
      sound = newSound;
      await sound.setVolumeAsync(0.04); // Reduce volume
      await sound.playAsync();
      // Clean up after playing
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound?.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const handleCategorySelect = async (selectedCategory: Category) => {
    setCategory(selectedCategory);
    await playSelectionSound();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newValue = Math.max(0, Math.min(gestureState.dx, buttonWidth));
      slideAnimation.setValue(newValue);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx >= threshold) {
        Animated.spring(slideAnimation, {
          toValue: buttonWidth,
          useNativeDriver: false,
        }).start(() => {
          Vibration.vibrate([0, 50, 30, 50]);
          handleLogActivity();
        });
      } else {
        Animated.spring(slideAnimation, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onComplete());
  };

  const handleLogActivity = async () => {
    if (totalMinutes === 0) {
      onComplete();
      return;
    }

    const activityName = activity.trim() || category;
    const newEntry: TimeLogEntry = {
      id: nanoid(),
      activity: activityName,
      hours,
      minutes,
      category,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    try {
      await TimeLoggingStorage.saveLogs(newEntry);
      triggerRefresh();
      onComplete();
    } catch (error) {
      console.error("Failed to save time log:", error);
    }
  };

  const handleHoursInput = (value: string) => {
    const numValue = parseInt(value) || 0;
    setHours(Math.max(0, numValue));
  };

  const handleMinutesInput = (value: string) => {
    const numValue = parseInt(value) || 0;
    const additionalHours = Math.floor(numValue / 60);
    const remainingMinutes = numValue % 60;

    setHours((prevHours) => Math.min(24, prevHours + additionalHours));
    setMinutes(remainingMinutes);
  };

  const categoryColors = {
    productive: "#4CAF50",
    neutral: "#FFC107",
    wasteful: "#FF5252",
  };

  const renderSlideToLog = () => (
    <View style={styles.slideContainer}>
      <View style={styles.slideTrack}>
        <Animated.Text
          style={[
            styles.slideText,
            { color: selectedBorder },
            {
              opacity: slideAnimation.interpolate({
                inputRange: [0, buttonWidth / 2],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          Slide to Log
        </Animated.Text>
      </View>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.slideButton,
          {
            transform: [{ translateX: slideAnimation }],
            zIndex: 2,
          },
        ]}
      >
        <Ionicons name="arrow-forward" size={24} color="#fff" />
      </Animated.View>
    </View>
  );

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <ThemedView style={styles.container}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.title}>Log Your Time</ThemedText>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close-circle-outline" size={28} color={"#007AFF"} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={[
            styles.input,
            { backgroundColor: inputBackground, color: inputText },
          ]}
          placeholder="What did you do?"
          placeholderTextColor={inputText}
          value={activity}
          onChangeText={setActivity}
        />

        <View
          style={[
            styles.timeInputContainer,
            isSmallScreen && styles.timeInputContainerSmall,
          ]}
        >
          <View
            style={[styles.timeField, isSmallScreen && styles.timeFieldSmall]}
          >
            <ThemedText style={styles.timeLabel}>Hours</ThemedText>
            <TextInput
              style={[
                styles.timeInput,
                { backgroundColor: inputBackground, color: inputText },
              ]}
              keyboardType="numeric"
              value={String(hours)}
              onChangeText={handleHoursInput}
              maxLength={2}
              placeholder="0"
              placeholderTextColor={inputText}
            />
          </View>

          <View
            style={[styles.timeField, isSmallScreen && styles.timeFieldSmall]}
          >
            <ThemedText style={styles.timeLabel}>Minutes</ThemedText>
            <TextInput
              style={[
                styles.timeInput,
                { backgroundColor: inputBackground, color: inputText },
              ]}
              keyboardType="numeric"
              value={String(minutes)}
              onChangeText={handleMinutesInput}
              maxLength={3}
              placeholder="0"
              placeholderTextColor={inputText}
            />
          </View>

          <View
            style={[styles.timeField, isSmallScreen && styles.timeFieldSmall]}
          >
            <ThemedText style={styles.timeLabel}>Total Time</ThemedText>
            <LinearGradient
              colors={["rgba(233, 222, 222, 0.24)", "rgba(14, 14, 14, 0.2)"]}
              style={styles.inlineTimeDisplay}
            >
              <ThemedText style={styles.inlineTimeText}>
                {`${totalMinutes}m`}
              </ThemedText>
            </LinearGradient>
          </View>
        </View>

        <View
          style={[
            styles.categoryContainer,
            isSmallScreen && styles.categoryContainerSmall,
          ]}
        >
          {Object.entries(categoryColors).map(([cat, color]) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                { backgroundColor: color },
                isSmallScreen && styles.categoryButtonSmall,
                category === cat && [
                  styles.selectedCategory,
                  { borderColor: selectedBorder },
                ],
              ]}
              onPress={() => handleCategorySelect(cat as Category)}
            >
              <ThemedText
                style={[
                  styles.categoryText,
                  isSmallScreen && styles.categoryTextSmall,
                  category === cat && styles.selectedCategoryText,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        {renderSlideToLog()}
      </ThemedView>
    </Animated.View>
  );
}

interface TimeLoggingProps {
  onComplete: () => void;
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Ubuntu_400Regular",
    marginBottom: 15,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    marginBottom: 20,
    width: "100%",
  },
  categoryContainerSmall: {
    flexDirection: "column",
    gap: 8,
    marginHorizontal: 0,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 30,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  categoryButtonSmall: {
    marginHorizontal: 0,
    paddingVertical: 8,
    width: "100%",
    minHeight: 40,
  },
  selectedCategory: {
    borderWidth: 2,
  },
  categoryText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
  },
  categoryTextSmall: {
    fontSize: 13,
  },
  selectedCategoryText: {
    fontWeight: "600",
  },
  timeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timeInputContainerSmall: {
    flexDirection: "column",
    gap: 10,
  },
  timeField: {
    flex: 1,
    marginHorizontal: 5,
  },
  timeFieldSmall: {
    marginHorizontal: 0,
  },
  timeInput: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    textAlign: "center",
    fontSize: 16,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: "Poppins_500Medium",
  },
  inlineTimeDisplay: {
    height: 45,
    borderRadius: 8,
    justifyContent: "center",
  },
  inlineTimeText: {
    fontSize: 16,
    fontFamily: "Ubuntu_400Regular",
    textAlign: "center",
    color: "#007AFF",
  },
  slideContainer: {
    height: 60,
    width: 230,
    backgroundColor: "rgba(248, 246, 246, 0.1)",
    borderColor: "#3498db",
    borderWidth: 1,
    borderRadius: 30,
    overflow: "hidden",
    position: "relative",
    alignSelf: "center",
    marginTop: 20,
  },
  slideTrack: {
    width: "100%",
    height: "100%",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  slideText: {
    fontSize: 16,
    fontFamily: "Ubuntu_400Regular",
  },
  slideButton: {
    width: 50,
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 25,
    position: "absolute",
    top: 5,
    left: 5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  closeButton: {
    padding: 5,
  },
});
