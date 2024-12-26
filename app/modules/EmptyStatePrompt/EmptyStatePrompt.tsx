import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { TimeLoggingStorage } from "@/app/common/services/dataStorage";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";
import { useThemeColor } from "@/hooks/useThemeColor";

const floatAnim = new Animated.Value(0);
const opacityAnim = new Animated.Value(0);

export const EmptyStatePrompt = () => {
  const [hasActivities, setHasActivities] = useState(true);
  const { refreshTrigger } = useTimeLogging();
  const iconColor = useThemeColor({}, 'text');
  useEffect(() => {
    checkTodayActivities();
  }, [refreshTrigger]);

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const checkTodayActivities = async () => {
    const allLogs = await TimeLoggingStorage.getAllLogs();
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = allLogs.filter(
      (log) =>
        log.timestamp.split("T")[0] === today &&
        log.activity && // Verify activity exists
        (log.hours > 0 || log.minutes > 0) // Verify time is logged
    );
    setHasActivities(todayLogs.length > 0);
  };

  if (hasActivities) return null;

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <Animated.View
        style={[styles.iconContainer, { transform: [{ translateY }] }]}
      >
        <Ionicons
          name="hourglass-outline"
          size={48}
          color="rgba(0,122,255,0.5)"
        />
        <View style={styles.sparkle}>
        <Ionicons name="sparkles-outline" size={16} color={iconColor} style={{ opacity: 0.6 }} />
        </View>
      </Animated.View>
      <ThemedText style={styles.message}>
        Time flows like sand...{"\n"}
        <ThemedText style={styles.highlight}>Start tracking yours!</ThemedText>
      </ThemedText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    padding: 20,
  },
  iconContainer: {
    position: "relative",
    marginBottom: 16,
  },
  sparkle: {
    position: "absolute",
    top: -8,
    right: -8,
    // transform: [{ rotate: "45deg" }],
  },
  message: {
    fontSize: 16,
    fontFamily: "Ubuntu_400Regular",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.7,
  },
  highlight: {
    fontFamily: "Poppins_500Medium",
    fontSize: 18,
    color: "#007AFF",
  },
});
