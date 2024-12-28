import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { TimeLoggingStorage } from "../TimeLogging/timeLoggingService";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";

export const TodaySummary = () => {
  const [summary, setSummary] = useState({
    productive: 0,
    neutral: 0,
    wasteful: 0,
  });
  const { refreshTrigger } = useTimeLogging();

  useEffect(() => {
    loadTodaySummary();
  }, [refreshTrigger]);

  const loadTodaySummary = async () => {
    const allLogs = await TimeLoggingStorage.getAllLogs();
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = allLogs.filter(
      (log) => log.timestamp.split("T")[0] === today
    );

    const totals = todayLogs.reduce(
      (acc, log) => {
        const minutes = log.hours * 60 + log.minutes;
        acc[log.category] += minutes;
        return acc;
      },
      { productive: 0, neutral: 0, wasteful: 0 }
    );

    setSummary(totals);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTotalMinutes = () => {
    return summary.productive + summary.neutral + summary.wasteful;
  };

  const getWidthPercentage = (minutes: number) => {
    const total = getTotalMinutes();
    return total > 0 ? (minutes / total) * 100 : 0;
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Today's Distribution</ThemedText>
      <View style={styles.summaryContainer}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${getWidthPercentage(summary.productive)}%`,
                backgroundColor: "#4CAF50",
              },
            ]}
          />
          <View
            style={[
              styles.progressBar,
              {
                width: `${getWidthPercentage(summary.neutral)}%`,
                backgroundColor: "#FFC107",
              },
            ]}
          />
          <View
            style={[
              styles.progressBar,
              {
                width: `${getWidthPercentage(summary.wasteful)}%`,
                backgroundColor: "#FF5252",
              },
            ]}
          />
        </View>
        <View style={styles.labelsContainer}>
          <View style={styles.labelItem}>
            <ThemedText style={styles.timeValue}>
              {formatTime(summary.productive)}
            </ThemedText>
            <ThemedText style={styles.categoryLabel}>Productive</ThemedText>
          </View>
          <View style={styles.labelItem}>
            <ThemedText style={styles.timeValue}>
              {formatTime(summary.neutral)}
            </ThemedText>
            <ThemedText style={styles.categoryLabel}>Neutral</ThemedText>
          </View>
          <View style={styles.labelItem}>
            <ThemedText style={styles.timeValue}>
              {formatTime(summary.wasteful)}
            </ThemedText>
            <ThemedText style={styles.categoryLabel}>Wasteful</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginTop: 15,
  },
  title: {
    fontSize: 17,
    fontFamily: "Poppins_500Medium",
    marginBottom: 10,
  },
  summaryContainer: {
    backgroundColor: "rgba(200, 200, 200, 0.2)",
    borderRadius: 10,
    padding: 12,
  },
  progressBarContainer: {
    height: 6,
    flexDirection: "row",
    backgroundColor: "rgba(200, 200, 200, 0.15)",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    opacity: 0.8,
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labelItem: {
    alignItems: "center",
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: "Ubuntu_400Regular",
    opacity: 0.7,
  },
  timeValue: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    marginBottom: 2,
  },
});

export default TodaySummary;