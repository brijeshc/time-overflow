import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Calendar } from "react-native-calendars";
import { TimeLoggingStorage } from "../TimeLogging/timeLoggingService";
import {
  DEFAULT_TARGETS,
  TimeLogEntry,
} from "@/app/common/interfaces/timeLogging";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TargetsStorage } from "../TimeLogging/timeLoggingService";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";

interface MarkedDates {
  [date: string]: {
    selected: boolean;
    selectedColor: string;
  };
}

export const TargetAchievements = () => {
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const [dailyTargets, setDailyTargets] = useState(DEFAULT_TARGETS);
  const { refreshTrigger } = useTimeLogging();

  useEffect(() => {
    loadAchievements();
    loadTargets();
  }, [refreshTrigger]); // Re-run when refreshTrigger changes

  const loadTargets = async () => {
    const targets = await TargetsStorage.getTargets();
    setDailyTargets(targets);
  };
  const loadAchievements = async () => {
    const logs = await TimeLoggingStorage.getAllLogs();
    const dateMap = processLogsForCalendar(logs);
    setMarkedDates(dateMap);
  };

  const processLogsForCalendar = (logs: TimeLogEntry[]) => {
    const dateMap: MarkedDates = {};
    const groupedLogs = logs.reduce<Record<string, TimeLogEntry[]>>(
      (acc, log) => {
        const date = log.timestamp.split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
      },
      {}
    );

    Object.entries(groupedLogs).forEach(
      ([date, dayLogs]: [string, TimeLogEntry[]]) => {
        const totals: Record<string, number> = {
          productive: 0,
          wasteful: 0,
          neutral: 0,
        };

        dayLogs.forEach((log) => {
          const hours = log.hours + log.minutes / 60;
          totals[log.category] += hours;
        });

        const totalHours = totals.productive + totals.wasteful + totals.neutral;
        const wastefulPercentage = (totals.wasteful / totalHours) * 100;

        let color;
        if (totals.productive >= dailyTargets.productiveHours) {
          color = "#4CAF50"; // Met or exceeded productive target
        } else if (wastefulPercentage > 50) {
          color = "#FF5252"; // More than 50% time was wasteful
        } else {
          color = "#FFC107"; // Neutral day
        }

        dateMap[date] = {
          selected: true,
          selectedColor: color,
        };
      }
    );
    return dateMap;
  };
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Target Achievements</ThemedText>
      <View style={styles.targetsContainer}>
        <ThemedText style={styles.targetText}>
          Daily Productive Target: {dailyTargets.productiveHours}h
        </ThemedText>
        <ThemedText style={styles.targetText}>
          Wasteful Limit: {dailyTargets.wastefulMaxHours}h
        </ThemedText>
        <ThemedText style={styles.targetText}>
          Neutral Limit: {dailyTargets.neutralMaxHours}h
        </ThemedText>
      </View>
      <Calendar
        markedDates={markedDates}
        theme={{
          backgroundColor: backgroundColor,
          calendarBackground: backgroundColor,
          textSectionTitleColor: textColor,
          selectedDayBackgroundColor: tintColor,
          selectedDayTextColor: backgroundColor,
          todayTextColor: tintColor,
          dayTextColor: textColor,
          textDisabledColor: iconColor,
          monthTextColor: textColor,
          arrowColor: tintColor,
          dotColor: tintColor,
          // Add these properties to ensure proper light/dark mode rendering
          textDayStyle: { color: textColor },
          textMonthFontWeight: "500",
          textDayFontWeight: "400",
          textDayHeaderFontWeight: "500",
        }}
        // Add this to ensure the calendar updates with theme changes
        key={backgroundColor}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#4CAF50" }]} />
          <ThemedText style={styles.legendText}>Productive Day</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#FF5252" }]} />
          <ThemedText style={styles.legendText}>Wasteful Day</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#FFC107" }]} />
          <ThemedText style={styles.legendText}>Neutral Day</ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    width: "90%",
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
    marginBottom: 16,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "left",
  },
  targetsContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  targetText: {
    fontSize: 14,
    fontFamily: 'Ubuntu_400Regular',
    marginBottom: 4,
  }
});
