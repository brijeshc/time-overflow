import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TimeLoggingStorage } from "../TimeLogging/timeLoggingService";
import { TimeLogEntry } from "@/app/common/interfaces/timeLogging";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";

export const AllTimeData = () => {
  const backgroundColor = useThemeColor({}, "background");
  const { refreshTrigger } = useTimeLogging();
  const textColor = useThemeColor({}, "text");

  interface TopActivity {
    activity: string;
    minutes: number;
  }

  interface AllTimeDataType {
    totalHours: number;
    productiveHours: number;
    neutralHours: number;
    wastefulHours: number;
    startDate: string;
    topProductive: TopActivity[];
    topNeutral: TopActivity[];
    topWasteful: TopActivity[];
  }

  const [allTimeData, setAllTimeData] = useState<AllTimeDataType>({
    totalHours: 0,
    productiveHours: 0,
    neutralHours: 0,
    wastefulHours: 0,
    startDate: "",
    topProductive: [],
    topNeutral: [],
    topWasteful: [],
  });

  useEffect(() => {
    loadAllTimeData();
  }, [refreshTrigger]);

  const loadAllTimeData = async () => {
    const allLogs = await TimeLoggingStorage.getAllLogs();
    if (allLogs.length === 0) return;

    const startDate = new Date(allLogs[0].timestamp).toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

    const totals = allLogs.reduce(
      (
        acc: {
          totalHours: number;
          productiveHours: number;
          neutralHours: number;
          wastefulHours: number;
          activities: { [key: string]: number };
        },
        log: TimeLogEntry
      ) => {
        const minutes = log.hours * 60 + log.minutes;
        acc.totalHours += minutes;
        acc[`${log.category}Hours`] += minutes;
        acc.activities[log.activity] =
          (acc.activities[log.activity] || 0) + minutes;
        return acc;
      },
      {
        totalHours: 0,
        productiveHours: 0,
        neutralHours: 0,
        wastefulHours: 0,
        activities: {},
      }
    );

    const topActivities = (category: string): TopActivity[] =>
      Object.entries(totals.activities)
        .filter(([activity, minutes]) =>
          allLogs.find(
            (log) => log.activity === activity && log.category === category
          )
        )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([activity, minutes]) => ({ activity, minutes }));

    setAllTimeData({
      totalHours: totals.totalHours,
      productiveHours: totals.productiveHours,
      neutralHours: totals.neutralHours,
      wastefulHours: totals.wastefulHours,
      startDate,
      topProductive: topActivities("productive"),
      topNeutral: topActivities("neutral"),
      topWasteful: topActivities("wasteful"),
    });
  };

  const formatHours = (minutes: number): string =>
    `${Math.floor(minutes / 60)} hrs ${minutes % 60} mins`;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedText style={styles.title}>All Time Data</ThemedText>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText style={styles.label}>Total Hours Logged:</ThemedText>
          <ThemedText style={styles.value}>{formatHours(allTimeData.totalHours)}</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.label}>Since:</ThemedText>
          <ThemedText style={styles.value}>{allTimeData.startDate}</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.label}>Total Productive Hours:</ThemedText>
          <ThemedText style={styles.value}>{formatHours(allTimeData.productiveHours)}</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.label}>Total Neutral Hours:</ThemedText>
          <ThemedText style={styles.value}>{formatHours(allTimeData.neutralHours)}</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.label}>Total Wasteful Hours:</ThemedText>
          <ThemedText style={styles.value}>{formatHours(allTimeData.wastefulHours)}</ThemedText>
        </View>
      </View>
      <View style={styles.activitiesContainer}>
        <ThemedText style={styles.subtitle}>Top 3 Productive Activities:</ThemedText>
        {allTimeData.topProductive.map((activity, index) => (
          <View key={index} style={styles.activityItem}>
            <ThemedText style={styles.activityLabel}>{activity.activity}:</ThemedText>
            <ThemedText style={styles.activityValue}>{formatHours(activity.minutes)}</ThemedText>
          </View>
        ))}
        <ThemedText style={styles.subtitle}>Top 3 Neutral Activities:</ThemedText>
        {allTimeData.topNeutral.map((activity, index) => (
          <View key={index} style={styles.activityItem}>
            <ThemedText style={styles.activityLabel}>{activity.activity}:</ThemedText>
            <ThemedText style={styles.activityValue}>{formatHours(activity.minutes)}</ThemedText>
          </View>
        ))}
        <ThemedText style={styles.subtitle}>Top 3 Wasteful Activities:</ThemedText>
        {allTimeData.topWasteful.map((activity, index) => (
          <View key={index} style={styles.activityItem}>
            <ThemedText style={styles.activityLabel}>{activity.activity}:</ThemedText>
            <ThemedText style={styles.activityValue}>{formatHours(activity.minutes)}</ThemedText>
          </View>
        ))}
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
    marginBottom: 20,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: '#3498db',
  },
  value: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: '#3498db',
  },
  activitiesContainer: {
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  activityLabel: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: '#3498db',
  },
  activityValue: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: '#3498db',
  },
});

export default AllTimeData;