import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Dialog } from "@rneui/themed";
import { Calendar } from "react-native-calendars";
import { TimeLoggingStorage } from "../TimeLogging/timeLoggingService";
import {
  DEFAULT_TARGETS,
  TimeLogEntry,
} from "@/app/common/interfaces/timeLogging";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TargetsStorage } from "../TimeLogging/timeLoggingService";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";

interface DayDetails {
  selected: boolean;
  selectedColor: string;
  marked?: boolean;
  dotColor?: string;
}

interface MarkedDates {
  [date: string]: DayDetails;
}

export const TargetAchievements = () => {
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayLogs, setDayLogs] = useState<TimeLogEntry[]>([]);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const [dailyTargets, setDailyTargets] = useState(DEFAULT_TARGETS);
  const { refreshTrigger } = useTimeLogging();

  useEffect(() => {
    loadAchievements();
    loadTargets();
  }, [refreshTrigger]);

  const loadTargets = async () => {
    const targets = await TargetsStorage.getTargets();
    setDailyTargets(targets);
  };

  const loadAchievements = async () => {
    const logs = await TimeLoggingStorage.getAllLogs();
    const holidays = await TimeLoggingStorage.getHolidays();
    const dateMap = processLogsForCalendar(logs, holidays);
    setMarkedDates(dateMap);
  };

  const processLogsForCalendar = (logs: TimeLogEntry[], holidays: string[]) => {
    const dateMap: MarkedDates = {};

    // Process activity logs first
    const groupedLogs = logs.reduce<Record<string, TimeLogEntry[]>>(
      (acc, log) => {
        const date = log.timestamp.split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
      },
      {}
    );

    Object.entries(groupedLogs).forEach(([date, dayLogs]) => {
      const totals = {
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
      const isProductiveDay = totals.productive >= dailyTargets.productiveHours;

      let color;
      if (isProductiveDay) {
        color = "#4CAF50";
      } else if (wastefulPercentage > 50) {
        color = "#FF5252";
      } else {
        color = "#FFC107";
      }

      dateMap[date] = {
        selected: true,
        selectedColor: color,
        marked: false,
      };
    });

    // Now process holidays and combine with productive days
    holidays.forEach((date) => {
      const existingDate = dateMap[date];
      const isProductiveHoliday = existingDate?.selectedColor === "#4CAF50";

      dateMap[date] = {
        selected: true,
        // If it's both productive and holiday, use a gradient-like color
        selectedColor: isProductiveHoliday ? "#1E88E5" : "rgba(52, 152, 219, 0.5)",
        marked: true,
        // If it's both productive and holiday, use green dot to indicate productivity
        dotColor: isProductiveHoliday ? "#4CAF50" : "#3498db",
      };
    });

    return dateMap;
  };

  const onDayPress = async (day: any) => {
    const logs = await TimeLoggingStorage.getAllLogs();
    const selectedDayLogs = logs.filter(
      (log) => log.timestamp.split("T")[0] === day.dateString
    );
    setDayLogs(selectedDayLogs);
    setSelectedDate(day.dateString);
    setShowLogsModal(true);
  };

  const markAsHoliday = async (date: string) => {
    await TimeLoggingStorage.saveHoliday(date);

    // Immediately update local state
    setMarkedDates((prev) => ({
      ...prev,
      [date]: {
        selected: true,
        selectedColor: "#3498db",
        marked: true,
        dotColor: "#ffffff",
      },
    }));

    setShowLogsModal(false);
  };

  const unmarkHoliday = async (date: string) => {
    await TimeLoggingStorage.unmarkHoliday(date);

    // Immediately update local state
    setMarkedDates((prev) => {
      const newMarkedDates = { ...prev };
      delete newMarkedDates[date];
      return newMarkedDates;
    });

    setShowLogsModal(false);
  };

  const isHoliday = (date: string) => {
    return markedDates[date]?.marked;
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "productive":
        return "#4CAF50";
      case "wasteful":
        return "#FF5252";
      case "neutral":
        return "#FFC107";
      default:
        return "#808080";
    }
  };
  
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Activity Calendar</ThemedText>
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
        onDayPress={onDayPress}
        theme={{
          backgroundColor,
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
          textDayStyle: { color: textColor },
          textMonthFontWeight: "500",
          textDayFontWeight: "400",
          textDayHeaderFontWeight: "500",
        }}
        key={backgroundColor}
      />

      <Dialog
        isVisible={showLogsModal}
        onBackdropPress={() => setShowLogsModal(false)}
        overlayStyle={{ backgroundColor: backgroundColor }}
      >
        <Dialog.Title title="Logs" titleStyle={{ color: textColor }} />
        <View style={styles.modalContent}>
          <ThemedText style={[styles.modalTitle, { color: textColor }]}>
            {selectedDate
              ? new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
          </ThemedText>

          {dayLogs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <ThemedText>{log.activity}</ThemedText>
              <ThemedText>
                {log.hours}h {log.minutes}m
              </ThemedText>
              <View
                style={[
                  styles.categoryIndicator,
                  { backgroundColor: getCategoryColor(log.category) },
                ]}
              />
            </View>
          ))}
        </View>
        <Dialog.Actions>
          {isHoliday(selectedDate!) ? (
            <Dialog.Button
              title="Unmark Holiday"
              onPress={() => unmarkHoliday(selectedDate!)}
              style={styles.holidayButton}
            />
          ) : (
            <Dialog.Button
              title="Mark as Holiday"
              onPress={() => markAsHoliday(selectedDate!)}
              style={styles.holidayButton}
            />
          )}
          <Dialog.Button
            title="Close"
            onPress={() => setShowLogsModal(false)}
            buttonStyle={{ backgroundColor: tintColor }}
            titleStyle={{ color: backgroundColor }}
          />
        </Dialog.Actions>
      </Dialog>

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
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "rgba(52, 152, 219, 0.5)" }]} />
          <ThemedText style={styles.legendText}>Holiday</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#1E88E5" }]} />
          <View style={[styles.legendDot, { backgroundColor: "#4CAF50" }]} />
          <ThemedText style={styles.legendText}>Productive Holiday</ThemedText>
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
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: 20,
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: "45%", // Ensures two items per row with some spacing
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    flexShrink: 0, // Prevents the color circle from shrinking
  },
  legendText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    flexShrink: 1, // Allows text to wrap if needed
    flexWrap: 'wrap',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    left: 13, // Position dot to overlap with legendColor
    top: 13,
  },
  targetsContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
  },
  targetText: {
    fontSize: 14,
    fontFamily: "Ubuntu_400Regular",
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
    marginBottom: 16,
  },
  logItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  holidayButton: {
    padding: 10,
    backgroundColor: "rgba(52, 152, 219, 0.2)",
    borderRadius: 8,
    marginRight: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
});

export default TargetAchievements;