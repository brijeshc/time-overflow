import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TimeLoggingStorage } from "../../common/services/dataStorage";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";
import { Svg, G, Path, Text } from "react-native-svg";

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

  const calculatePieChartData = () => {
    const total = dailySummary.productive + dailySummary.neutral + dailySummary.wasteful;
    if (total === 0) {
      return [{ name: "No Data", value: 1, color: "#d3d3d3" }];
    }
    return [
      { name: "Productive", value: dailySummary.productive, color: "#4CAF50" },
      { name: "Neutral", value: dailySummary.neutral, color: "#FFC107" },
      { name: "Wasteful", value: dailySummary.wasteful, color: "#FF5252" },
    ].filter(slice => slice.value > 0); // Filter out categories with zero values
  };

  const renderPieChart = () => {
    const data = calculatePieChartData();
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = 100;
    const centerX = 150;
    const centerY = 110;
    let cumulativeAngle = 0;

    return (
      <Svg width={300} height={220}>
        <G>
          {data.map((slice, index) => {
            const sliceAngle = (slice.value / total) * 2 * Math.PI;
            const x1 = centerX + radius * Math.cos(cumulativeAngle);
            const y1 = centerY + radius * Math.sin(cumulativeAngle);
            cumulativeAngle += sliceAngle;
            const x2 = centerX + radius * Math.cos(cumulativeAngle);
            const y2 = centerY + radius * Math.sin(cumulativeAngle);
            const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
            const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            return (
              <Path key={index} d={pathData} fill={slice.color} />
            );
          })}
          {data.map((slice, index) => {
            const sliceAngle = (slice.value / total) * 2 * Math.PI;
            const labelAngle = cumulativeAngle - sliceAngle / 2;
            const labelX = centerX + (radius + 20) * Math.cos(labelAngle);
            const labelY = centerY + (radius + 20) * Math.sin(labelAngle);
            return (
              <Text
                key={index}
                x={labelX}
                y={labelY}
                fontSize="10"
                fill={textColor}
                textAnchor="middle"
              >
                {slice.name}
              </Text>
            );
          })}
        </G>
      </Svg>
    );
  };

  return (
    <View style={styles.summaryContainer}>
      <ThemedText style={styles.summaryTitle}>Today's Summary</ThemedText>
      {renderPieChart()}
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