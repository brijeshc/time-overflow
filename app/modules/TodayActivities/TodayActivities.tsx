import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { TimeLoggingStorage } from "../TimeLogging/timeLoggingService";
import { TimeLogEntry } from "@/app/common/interfaces/timeLogging";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";

const calculateTotalMinutes = (hours: number, minutes: number) => {
  return hours * 60 + minutes;
};

export const TodayActivities = () => {
  const [todayActivities, setTodayActivities] = useState<TimeLogEntry[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const { triggerRefresh } = useTimeLogging();
  useEffect(() => {
    loadTodayActivities();
  }, []);

  const loadTodayActivities = async () => {
    const allLogs = await TimeLoggingStorage.getAllLogs();
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = allLogs.filter(
      (log) => log.timestamp.split("T")[0] === today
    );
    setTodayActivities(todayLogs);
  };

  const handleLongPress = (activityId: string) => {
    setSelectedActivities((prev) => {
      if (prev.includes(activityId)) {
        return prev.filter((id) => id !== activityId);
      }
      return [...prev, activityId];
    });
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      "Delete Activities",
      `Are you sure you want to delete ${selectedActivities.length} selected activities?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteSelectedActivities,
        },
      ]
    );
  };

  const deleteSelectedActivities = async () => {
    try {
      const updatedLogs = todayActivities.filter(
        activity => !selectedActivities.includes(activity.id)
      );
      await TimeLoggingStorage.importLogs(JSON.stringify(updatedLogs));
      setTodayActivities(updatedLogs);
      setSelectedActivities([]);
      triggerRefresh(); // Trigger refresh after successful deletion
    } catch (error) {
      Alert.alert("Error", "Failed to delete activities");
    }
  };

  const getTotalDayMinutes = () => {
    return todayActivities.reduce((total, activity) => {
      return total + calculateTotalMinutes(activity.hours, activity.minutes);
    }, 0);
  };

  const getProgressWidth = (activity: TimeLogEntry) => {
    const totalDayMinutes = getTotalDayMinutes();
    const activityMinutes = calculateTotalMinutes(
      activity.hours,
      activity.minutes
    );
    return (activityMinutes / totalDayMinutes) * 100;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      productive: "#4CAF50",
      neutral: "#FFC107",
      wasteful: "#FF5252",
    };
    return colors[category] || colors.neutral;
  };

  if (todayActivities.length === 0) return null;

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Today's Activities</ThemedText>
      {todayActivities.map((activity) => (
        <TouchableOpacity
          key={activity.id}
          onPress={() => {
            if (selectedActivities.length > 0) {
              handleLongPress(activity.id);
            }
          }}
          onLongPress={() => handleLongPress(activity.id)}
          delayLongPress={500}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.activityItem,
              selectedActivities.includes(activity.id) &&
                styles.selectedActivity,
            ]}
          >
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${getProgressWidth(activity)}%`,
                    backgroundColor: getCategoryColor(activity.category),
                  },
                ]}
              />
            </View>
            <View style={styles.activityContent}>
              <ThemedText style={styles.activityName}>
                {activity.activity}
              </ThemedText>
              <ThemedText style={styles.activityTime}>
                {`${activity.hours}h ${activity.minutes}m`}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {selectedActivities.length > 0 && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteSelected}
        >
          <ThemedText style={styles.deleteButtonText}>
            Delete Selected ({selectedActivities.length})
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(200, 200, 200, 0.3)", // Better contrast in light mode
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedActivity: {
    backgroundColor: "rgba(100, 100, 100, 0.3)",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  categoryIndicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityName: {
    fontSize: 16,
    fontFamily: "Ubuntu_400Regular",
  },
  activityTime: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    opacity: 0.8,
  },
  deleteButton: {
    backgroundColor: "#FF5252",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  deleteButtonText: {
    color: "white",
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 4,
    left: 8,
    right: 8,
    height: 4,
    backgroundColor: 'rgba(200, 200, 200, 0.15)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    opacity: 0.8,
    borderRadius: 8,
    // Add subtle gradient effect through shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
});
