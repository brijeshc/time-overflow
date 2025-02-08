import {
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { AnalogClock } from "@/components/AnalogClock";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { Poppins_500Medium } from "@expo-google-fonts/poppins";
import { Ubuntu_400Regular } from "@expo-google-fonts/ubuntu";
import TimeLogging from "../modules/TimeLogging/TimeLogging";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TodayActivities } from "../modules/TodayActivities/TodayActivities";
import { TodaySummary } from "../modules/TodaySummary/TodaySummary";
import { TimeLoggingProvider } from "../context/TimeLoggingContext";
import { EmptyStatePrompt } from "../modules/EmptyStatePrompt/EmptyStatePrompt";
import React from "react";
import { BackHandler } from "react-native";
import { SideMenu } from "../modules/SideMenu/SideMenu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { scheduleDailyNotification } from "../common/services/notificationService";

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const [showLogging, setShowLogging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const backAction = () => {
      if (showLogging) {
        setShowLogging(false);
        return true; // Prevents default back action
      }
      return false; // Allows default back action (exit app)
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [showLogging]);

  useEffect(() => {
    const requestNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        const hour = 21; // Default 9 PM
        const minute = 0;
        await scheduleDailyNotification(hour, minute);
        await AsyncStorage.setItem(
          "@daily_notification_time",
          JSON.stringify({ hour, minute })
        );
      }
    };

    requestNotificationPermissions();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 20,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowLogging(true);
      }, 100);
    });
  };

  const handleLogComplete = () => {
    setShowLogging(false);
  };

  let [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Poppins_500Medium,
    Ubuntu_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TimeLoggingProvider>
      <ScrollView
        style={[styles.scrollView, { backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
      >
        <SideMenu isVisible={showMenu} onClose={() => setShowMenu(false)} />
        <ThemedView style={styles.container}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenu(true)}
          >
            <Ionicons name="settings-outline" size={24} color={textColor} />
          </TouchableOpacity>

          <AnalogClock style={styles.clockContainer} />

          {!showLogging ? (
            <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
              <TouchableOpacity style={styles.logButton} onPress={handlePress}>
                <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                <ThemedText style={styles.buttonText}>Log Your Time</ThemedText>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TimeLogging onComplete={handleLogComplete} />
          )}
          {!showLogging && (
            <>
              <TodaySummary />
              <TodayActivities />
              <EmptyStatePrompt />
            </>
          )}
        </ThemedView>
      </ScrollView>
      <SideMenu isVisible={showMenu} onClose={() => setShowMenu(false)} />
    </TimeLoggingProvider>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  menuButton: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(248, 246, 246, 0.1)",
    borderColor: "#3498db",
    borderWidth: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 15,
    paddingTop: 20,
  },
  clockContainer: {
    marginTop: 15,
  },
  logButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(248, 246, 246, 0.1)",
    borderColor: "#3498db",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 30,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
  },
});
