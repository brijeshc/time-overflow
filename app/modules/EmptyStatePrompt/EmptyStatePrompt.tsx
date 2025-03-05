import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { TimeLoggingStorage } from "../../common/services/dataStorage";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";
import { useThemeColor } from "@/hooks/useThemeColor";

const floatAnim = new Animated.Value(0);
const opacityAnim = new Animated.Value(0);

export const EmptyStatePrompt = () => {
  const [hasActivities, setHasActivities] = useState(true);
  const { refreshTrigger } = useTimeLogging();
  const [isHoliday, setIsHoliday] = useState(false);
  const iconColor = useThemeColor({}, "text");
  useEffect(() => {
    checkTodayActivities();
    checkIfHoliday();
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

  const checkIfHoliday = async () => {
    const holidays = await TimeLoggingStorage.getHolidays();
    const today = new Date().toISOString().split("T")[0];
    setIsHoliday(holidays.includes(today));
  };

  const checkTodayActivities = async () => {
    const todayLogs = await TimeLoggingStorage.getTodayLogs();
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
        {isHoliday ? (
          <Ionicons
            name="sunny-outline"
            size={48}
            color="rgba(255,164,0,0.5)"
          />
        ) : (
          <Ionicons
            name="hourglass-outline"
            size={48}
            color="rgba(0,122,255,0.5)"
          />
        )}
        {isHoliday ? null : (
          <View style={styles.sparkle}>
            <Ionicons
              name={"sparkles-outline"}
              size={16}
              color={iconColor}
              style={{ opacity: 0.6 }}
            />
          </View>
        )}
      </Animated.View>
      <ThemedText style={styles.message}>
        {isHoliday ? (
          <>
            It's your day off!{"\n"}
            <ThemedText style={[styles.highlight, styles.holidayHighlight]}>
              Time to relax and recharge
            </ThemedText>
          </>
        ) : (
          <>
            Time flows like sand...{"\n"}
            <ThemedText style={styles.highlight}>
              Start tracking yours!
            </ThemedText>
          </>
        )}
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
  holidayHighlight: {
    color: "#FFA400",
  },
});

export default EmptyStatePrompt;
