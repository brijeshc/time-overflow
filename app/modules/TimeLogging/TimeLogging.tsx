import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Animated,
  PanResponder,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React, { useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import { TimeLoggingStorage } from "./timeLoggingService";
import { TimeLogEntry } from "@/app/common/interfaces/timeLogging";
import { nanoid } from 'nanoid/non-secure';
import { useTimeLogging } from "@/app/context/TimeLoggingContext";

type Category = "productive" | "neutral" | "wasteful";

export default function TimeLogging({ onComplete }: TimeLoggingProps) {

  const { triggerRefresh } = useTimeLogging();
  const selectedBorder = useThemeColor({
    light: "rgba(0, 0, 0, 1)",    // Subtle dark border for light mode
    dark: "rgb(219, 246, 248)" // Subtle light border for dark mode
  }, "text");

  const [activity, setActivity] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [category, setCategory] = useState<Category>("neutral");

  const inputBackground = useThemeColor({}, "background");
  const inputText = useThemeColor({}, "text");

  const slideAnimation = new Animated.Value(0);
  const buttonWidth = 250;
  const threshold = buttonWidth * 0.4;

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

  const handleLogActivity = async () => {
    if (hours === 0 && minutes === 0) {
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
      synced: false
    };
  
    try {
      await TimeLoggingStorage.saveLogs(newEntry);
      triggerRefresh();
      onComplete();
    } catch (error) {
      // Handle error appropriately
      console.error('Failed to save time log:', error);
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
            [styles.slideText, {color: selectedBorder}],
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
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Log Your Time</ThemedText>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: inputBackground,
            color: inputText,
          },
        ]}
        placeholder="What did you do?"
        placeholderTextColor={inputText}
        value={activity}
        onChangeText={setActivity}
      />

      <View style={styles.timeInputContainer}>
        <View style={styles.timeField}>
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

        <View style={styles.timeField}>
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

        <View style={styles.timeField}>
          <ThemedText style={styles.timeLabel}>Selected Time</ThemedText>
          <LinearGradient
            colors={["rgba(233, 222, 222, 0.24)", "rgba(14, 14, 14, 0.2)"]}
            style={styles.inlineTimeDisplay}
          >
            <ThemedText style={styles.inlineTimeText}>
              {`${hours}h ${minutes}m`}
            </ThemedText>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        {Object.entries(categoryColors).map(([cat, color]) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              { backgroundColor: color },
              category === cat && [styles.selectedCategory, { borderColor: selectedBorder }],
            ]}
            onPress={() => setCategory(cat as Category)}
          >
            <ThemedText style={styles.categoryText}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      {renderSlideToLog()}
    </ThemedView>
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
    marginBottom: 20,
  },
  categoryButton: {
    padding: 10,
    borderRadius: 30,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  selectedCategory: {
    borderWidth: 3
  },
  categoryText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  timeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timeField: {
    flex: 1,
    marginHorizontal: 5,
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
    borderColor: '#3498db',
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
    // color: "#007AFF",
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
});