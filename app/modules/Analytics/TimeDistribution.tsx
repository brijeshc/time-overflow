import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TimeLoggingStorage } from "../../common/services/dataStorage";
import { Svg, Line, G, Text, Circle } from "react-native-svg";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";

const { width } = Dimensions.get("window");

export const TimeDistribution = () => {
  const textColor = useThemeColor({}, "text");
  const { refreshTrigger } = useTimeLogging();
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { data: number[]; color: string }[];
  }>({
    labels: [],
    datasets: [
      { data: [], color: "#4CAF50" },
      { data: [], color: "#FF5252" },
      { data: [], color: "#FFC107" },
    ],
  });

  useEffect(() => {
    loadChartData();
  }, [refreshTrigger]);

  const loadChartData = async () => {
    try {
      const allLogs = await TimeLoggingStorage.getAllLogs();
      const groupedLogs = allLogs.reduce((acc, log) => {
        const logDate = new Date(log.timestamp);
        logDate.setHours(0, 0, 0, 0);
        const date = logDate.toISOString().split("T")[0];

        if (!acc[date]) {
          acc[date] = { productive: 0, wasteful: 0, neutral: 0 };
        }
        const minutes = log.hours * 60 + log.minutes;
        acc[date][log.category] += minutes;
        return acc;
      }, {} as { [key: string]: { productive: number; wasteful: number; neutral: number } });

      // Add today if not present
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0];
      if (!groupedLogs[todayStr]) {
        groupedLogs[todayStr] = { productive: 0, wasteful: 0, neutral: 0 };
      }

      const labels = Object.keys(groupedLogs).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
      });

      const productiveData = labels.map((date) => groupedLogs[date].productive);
      const wastefulData = labels.map((date) => groupedLogs[date].wasteful);
      const neutralData = labels.map((date) => groupedLogs[date].neutral);

      setChartData({
        labels,
        datasets: [
          { data: productiveData, color: "#4CAF50" },
          { data: wastefulData, color: "#FF5252" },
          { data: neutralData, color: "#FFC107" },
        ],
      });
    } catch (error) {
      console.error("Error loading chart data:", error);
    }
  };

  const renderLineChart = () => {
    const { labels, datasets } = chartData;
    const maxDataValue = Math.max(
      ...datasets.flatMap((dataset) => dataset.data)
    );
    const chartHeight = 220;
    const chartWidth = width - 32;
    const padding = 40;
    const xStep = (chartWidth - padding * 2) / (labels.length - 1);
    const yStep = (chartHeight - padding * 2) / maxDataValue;

    return (
      <>
        <Svg width={chartWidth} height={chartHeight}>
          <G>
            {/* X-axis */}
            <Line
              x1={padding}
              y1={chartHeight - padding}
              x2={chartWidth - padding}
              y2={chartHeight - padding}
              stroke={textColor}
              strokeWidth="1"
            />
            {/* Y-axis */}
            <Line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={chartHeight - padding}
              stroke={textColor}
              strokeWidth="1"
            />
            {/* X-axis labels */}
            {labels.length > 0 && (
              <>
                <Text
                  x={padding}
                  y={chartHeight - padding + 15}
                  fontSize="10"
                  fill={textColor}
                  textAnchor="middle"
                >
                  {labels[0]}
                </Text>
                <Text
                  x={chartWidth - padding}
                  y={chartHeight - padding + 15}
                  fontSize="10"
                  fill={textColor}
                  textAnchor="middle"
                >
                  {labels[labels.length - 1]}
                </Text>
              </>
            )}
            {/* Y-axis labels */}
            {[0, maxDataValue / 2, maxDataValue].map((value, index) => (
              <Text
                key={index}
                x={padding - 10}
                y={chartHeight - padding - value * yStep}
                fontSize="10"
                fill={textColor}
                textAnchor="end"
              >
                {Math.round(value)}
              </Text>
            ))}
            {/* Lines and dots */}
            {datasets.map((dataset, datasetIndex) => (
              <G key={datasetIndex}>
                {dataset.data.map((value, index) => {
                  if (index === 0) return null;
                  const prevValue = dataset.data[index - 1];
                  return (
                    <Line
                      key={index}
                      x1={padding + (index - 1) * xStep}
                      y1={chartHeight - padding - prevValue * yStep}
                      x2={padding + index * xStep}
                      y2={chartHeight - padding - value * yStep}
                      stroke={dataset.color}
                      strokeWidth="2"
                    />
                  );
                })}
                {dataset.data.map((value, index) => (
                  <Circle
                    key={index}
                    cx={padding + index * xStep}
                    cy={chartHeight - padding - value * yStep}
                    r="3"
                    fill={dataset.color}
                  />
                ))}
              </G>
            ))}
          </G>
        </Svg>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#4CAF50" }]}
            />
            <ThemedText style={styles.legendText}>Productive</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#FF5252" }]}
            />
            <ThemedText style={styles.legendText}>Wasteful</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#FFC107" }]}
            />
            <ThemedText style={styles.legendText}>Neutral</ThemedText>
          </View>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Time Distribution</ThemedText>
      {renderLineChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendColor: {
    width: 10,
    height: 10,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});

export default TimeDistribution;
