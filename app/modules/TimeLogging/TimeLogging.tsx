import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React, { useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";

type Category = "productive" | "neutral" | "wasteful";

export function TimeLogging() {
  const [activity, setActivity] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [category, setCategory] = useState<Category>("neutral");

  const inputBackground = useThemeColor({}, "background");
  const inputText = useThemeColor({}, "text");

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
      </View>

      <LinearGradient
        colors={["rgba(197, 205, 228, 0.24)", "rgba(0, 162, 255, 0.2)"]}
        style={styles.timeDisplayGradient}
      >
        <ThemedText style={styles.timeDisplayText}>
          {`${hours}h ${minutes}m`}
        </ThemedText>
      </LinearGradient>

      <View style={styles.categoryContainer}>
        {Object.entries(categoryColors).map(([cat, color]) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              { backgroundColor: color },
              category === cat && styles.selectedCategory,
            ]}
            onPress={() => setCategory(cat as Category)}
          >
            <ThemedText style={styles.categoryText}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logButton}>
        <ThemedText style={styles.logButtonText}>Log Activity</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
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
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: "#fff",
  },
  categoryText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  logButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  logButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Ubuntu_400Regular",
  },
  timeContainer: {
    marginVertical: 15,
  },
  slider: {
    width: "100%",
    height: 40,
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
  timeDisplay: {
    fontSize: 32,
    fontFamily: "Ubuntu_400Regular",
    textAlign: "center",
    color: "#007AFF"
  },
  timeDisplayGradient: {
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  timeDisplayText: {
    fontSize: 32,
    fontFamily: "Ubuntu_400Regular",
    textAlign: "center",
    color: "#007AFF",
    padding: 15,
  },
});
