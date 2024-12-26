import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { TimeLogEntry } from "@/app/common/interfaces/timeLogging";
import { TimeLoggingStorage } from "@/app/common/services/dataStorage";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";
import { useThemeColor } from "@/hooks/useThemeColor";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const RecentTrends = () => {
    const backgroundColor = useThemeColor({}, "background");
  const [weekData, setWeekData] = useState<
    {
      date: string;
      productive: number;
      total: number;
      score: number;
    }[]
  >([]);
  const { refreshTrigger } = useTimeLogging();

  useEffect(() => {
    loadWeekData();
  }, [refreshTrigger]);

  const loadWeekData = async () => {
    const allLogs = await TimeLoggingStorage.getAllLogs();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    const weekStats = last7Days.map((date) => {
      const dayLogs = allLogs.filter(
        (log) => log.timestamp.split("T")[0] === date
      );
      const productive = dayLogs.reduce((sum, log) => {
        if (log.category === "productive") {
          return sum + (log.hours * 60 + log.minutes);
        }
        return sum;
      }, 0);
      const total = dayLogs.reduce(
        (sum, log) => sum + (log.hours * 60 + log.minutes),
        0
      );

      return {
        date,
        productive,
        total,
        score: total > 0 ? (productive / total) * 100 : 0,
      };
    });

    setWeekData(weekStats);
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor + '20' }]}>
      <ThemedText style={styles.title}>Weekly Productivity</ThemedText>
      <View style={styles.graphContainer}>
        {weekData.map((day, index) => (
          <View key={day.date} style={styles.dayColumn}>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${day.score}%`,
                    backgroundColor:
                      day.score > 70
                        ? "#4CAF50"
                        : day.score > 40
                        ? "#FFC107"
                        : "#FF5252",
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.dayLabel}>
              {DAYS[new Date(day.date).getDay()]}
            </ThemedText>
            <ThemedText style={styles.scoreLabel}>
              {Math.round(day.score)}%
            </ThemedText>
          </View>
        ))}
      </View>
      <View style={styles.streakContainer}>
        <ThemedText style={styles.streakText}>
          {weekData.filter((day) => day.score > 70).length} productive days this
          week
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        width: '90%',
        padding: 20,
        alignItems: 'center',
        borderColor: '#3498db',
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
  graphContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    height: 150,
    alignItems: "flex-end",
  },
  barContainer: {
    height: 100,
    width: 8,
    backgroundColor: "rgba(248, 246, 246, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
    marginBottom: 16,
  },

  dayColumn: {
    alignItems: "center",
    flex: 1,
  },

  bar: {
    width: "100%",
    borderRadius: 4,
    opacity: 0.8,
  },
  dayLabel: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: "Ubuntu_400Regular",
  },
  scoreLabel: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 2,
  },
  streakContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  streakText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    opacity: 0.8,
  },
});
