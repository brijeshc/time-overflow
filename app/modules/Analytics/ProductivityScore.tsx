import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { TimeLoggingStorage } from "../../common/services/dataStorage";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";

export const ProductivityScore = () => {
  const [score, setScore] = useState<number | null>(null);
  const [totalDays, setTotalDays] = useState<number | null>(null);
  const { refreshTrigger } = useTimeLogging();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const ProdctivityScore =
          await TimeLoggingStorage.calculateProductivityScore();
        setScore(ProdctivityScore?.score || null);
        setTotalDays(ProdctivityScore?.totalDays || null);
      } catch (error) {
        console.error("Error fetching productivity score:", error);
      }
    };

    fetchScore();
  }, [refreshTrigger]);

  const getMotivationalMessage = (score: number) => {
    if (score >= 90) return "Excellent! Keep up the great work!";
    if (score >= 75) return "Great job! You're doing really well!";
    if (score >= 50) return "Good effort! Keep pushing!";
    return "Don't give up! You can do it!";
  };

  const getIconName = (score: number) => {
    if (score >= 90) return "trophy";
    if (score >= 75) return "happy";
    if (score >= 50) return "thumbs-up";
    return "sad";
  };

  const getIconColor = (score: number) => {
    if (score >= 90) return "#FF7722"; // Bhagwa
    if (score >= 75) return "#4CAF50"; // Green
    if (score >= 50) return "#FFA500"; // Orange
    return "#FF0000"; // Red
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedText style={[styles.title, { color: textColor }]}>
        Productivity Score
      </ThemedText>
      {score !== null && score != 0 ? (
        <>
          <Ionicons
            name={getIconName(score)}
            size={80}
            color={getIconColor(score)}
            style={styles.icon}
          />
          <View style={styles.scoreContainer}>
            <ThemedText style={[styles.score, { color: textColor }]}>
              {score.toFixed(2)}%
            </ThemedText>
            <ThemedText style={[styles.totalDays, { color: textColor }]}>
              over {totalDays}{" "}
              {totalDays === 1 ? "working day" : "working days"}
            </ThemedText>
          </View>
          <ThemedText style={[styles.message, { color: textColor }]}>
            {getMotivationalMessage(score)}
          </ThemedText>
        </>
      ) : (
        <ThemedText style={[styles.loading, { color: textColor }]}>
          Start tracking your daily activities to unlock your productivity
          insights! Your personalized score will reflect how well you meet your
          daily goals.
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
    marginBottom: 8,
  },
  icon: {
    marginVertical: 16,
  },
  score: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
  },
  message: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginTop: 16,
    textAlign: "center",
  },
  loading: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginTop: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
    opacity: 0.9,
  },
  scoreContainer: {
    alignItems: "center",
    gap: 4,
  },
  totalDays: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    opacity: 0.8,
  },
});
