import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { TimeLoggingStorage } from "../../common/services/dataStorage";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";

interface DayStats {
  date: string;
  productive: number;
  wasteful: number;
  neutral: number;
  totalHours: number;
  productivityScore: number;
}

export const RecentTrends = () => {
  const [weekData, setWeekData] = useState<DayStats[]>([]);
  const [weeklyHighlight, setWeeklyHighlight] = useState({
    mostProductiveDay: "",
    totalProductiveHours: 0,
    improvementRate: 0,
  });
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

      const calculateHours = (category: string) => {
        return dayLogs
          .filter((log) => log.category === category)
          .reduce((sum, log) => sum + log.hours + log.minutes / 60, 0);
      };

      const productive = calculateHours("productive");
      const wasteful = calculateHours("wasteful");
      const neutral = calculateHours("neutral");
      const totalHours = productive + wasteful + neutral;

      return {
        date,
        productive,
        wasteful,
        neutral,
        totalHours,
        productivityScore: totalHours > 0 ? (productive / totalHours) * 100 : 0,
      };
    });

    // Calculate weekly highlights
    const highlights = {
      mostProductiveDay: weekStats.reduce((a, b) =>
        a.productive > b.productive ? a : b
      ).date,
      totalProductiveHours: weekStats.reduce(
        (sum, day) => sum + day.productive,
        0
      ),
      improvementRate: calculateImprovementRate(weekStats),
    };

    setWeekData(weekStats);
    setWeeklyHighlight(highlights);
  };

  const calculateImprovementRate = (data: DayStats[]) => {
    if (data.length < 2) return 0;
    const firstHalf = data.slice(0, 3);
    const secondHalf = data.slice(3);

    const firstHalfAvg =
      firstHalf.reduce((sum, day) => sum + day.productivityScore, 0) /
      firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, day) => sum + day.productivityScore, 0) /
      secondHalf.length;

    return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Weekly Progress</ThemedText>

      <View style={styles.chartWrapper}>
        <View style={styles.yAxisLabels}>
          <ThemedText style={styles.axisLabel}>24h</ThemedText>
          <ThemedText style={styles.axisLabel}>18h</ThemedText>
          <ThemedText style={styles.axisLabel}>12h</ThemedText>
          <ThemedText style={styles.axisLabel}>6h</ThemedText>
          <ThemedText style={styles.axisLabel}>0h</ThemedText>
        </View>

        <View style={styles.graphContainer}>
          {weekData.map((day, index) => (
            <View key={day.date} style={styles.dayColumn}>
              <View style={styles.stackedBar}>
                <View
                  style={[
                    styles.barSegment,
                    styles.productiveBar,
                    { height: `${(day.productive / 24) * 100}%` },
                  ]}
                />
                <View
                  style={[
                    styles.barSegment,
                    styles.neutralBar,
                    {
                      height: `${(day.neutral / 24) * 100}%`,
                      bottom: `${(day.productive / 24) * 100}%`,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.barSegment,
                    styles.wastefulBar,
                    {
                      height: `${(day.wasteful / 24) * 100}%`,
                      bottom: `${((day.productive + day.neutral) / 24) * 100}%`,
                    },
                  ]}
                />
              </View>
              <ThemedText style={styles.dayLabel}>
                {new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </ThemedText>
              <ThemedText style={styles.scoreLabel}>
                {Math.round(day.productivityScore)}%
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.highlightsContainer}>
        <ThemedText style={styles.highlight}>
          Most productive:{" "}
          {new Date(weeklyHighlight.mostProductiveDay).toLocaleDateString(
            "en-US",
            { weekday: "long" }
          )}
        </ThemedText>
        <ThemedText style={styles.highlight}>
          Weekly productive hours:{" "}
          {Math.round(weeklyHighlight.totalProductiveHours)}
        </ThemedText>
        {weeklyHighlight.improvementRate !== 0 && (
          <ThemedText
            style={[
              styles.highlight,
              {
                color:
                  weeklyHighlight.improvementRate > 0 ? "#4CAF50" : "#FF5252",
              },
            ]}
          >
            {weeklyHighlight.improvementRate > 0 ? "↑" : "↓"}
            {Math.abs(Math.round(weeklyHighlight.improvementRate))}% from early
            week
          </ThemedText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "#3498db",
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
    marginBottom: 20,
  },
  chartWrapper: {
    flexDirection: "row",
    height: 200,
    marginLeft: 10,
  },
  yAxisLabels: {
    width: 30,
    height: 150,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 8,
  },
  graphContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  stackedBar: {
    width: 8,
    height: 150,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  axisLabel: {
    fontSize: 10,
    fontFamily: "Ubuntu_400Regular",
    opacity: 0.7,
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
  },

  barSegment: {
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  productiveBar: {
    backgroundColor: "#4CAF50",
  },
  neutralBar: {
    backgroundColor: "#FFC107",
  },
  wastefulBar: {
    backgroundColor: "#FF5252",
  },
  dayLabel: {
    fontSize: 12,
    marginTop: 8,
    fontFamily: "Ubuntu_400Regular",
  },
  scoreLabel: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 4,
  },
  highlightsContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
  },
  highlight: {
    fontSize: 14,
    fontFamily: "Ubuntu_400Regular",
    marginVertical: 4,
  },
});

export default RecentTrends;
