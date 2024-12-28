import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { PieChart } from "react-native-chart-kit";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TimeLoggingStorage } from "../TimeLogging/timeLoggingService";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";

export const DailySummary = () => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const [dailySummary, setDailySummary] = useState({
    productive: 0,
    neutral: 0,
    wasteful: 0,
  });
  
  const { refreshTrigger } = useTimeLogging();

  useEffect(() => {
    loadDailySummary();
  }, [refreshTrigger]);

  const loadDailySummary = async () => {
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

    setDailySummary(totals);
  };

  const chartData = [
    {
      name: "Productive",
      population: dailySummary.productive,
      color: "#4CAF50",
      legendFontColor: textColor,
      legendFontSize: 12,
    },
    {
      name: "Neutral",
      population: dailySummary.neutral,
      color: "#FFC107",
      legendFontColor: textColor,
      legendFontSize: 12,
    },
    {
      name: "Wasteful",
      population: dailySummary.wasteful,
      color: "#FF5252",
      legendFontColor: textColor,
      legendFontSize: 12,
    },
  ];

  return (
    <View style={styles.summaryContainer}>
      <ThemedText style={styles.summaryTitle}>Today's Summary</ThemedText>
      <PieChart
        data={chartData}
        width={300}
        height={220}
        chartConfig={{
          backgroundColor: backgroundColor,
          backgroundGradientFrom: backgroundColor,
          backgroundGradientTo: backgroundColor,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
    marginBottom: 10,
  },
});

export default DailySummary;