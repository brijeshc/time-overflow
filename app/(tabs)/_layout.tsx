import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import Ionicons from "@expo/vector-icons/Ionicons";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TimeLoggingProvider } from "../context/TimeLoggingContext";

export default function TabLayout() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <TimeLoggingProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            display: keyboardVisible ? "none" : "flex",
          },
          default: {
            display: keyboardVisible ? "none" : "flex",
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tracker",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="hourglass-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="stats-chart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tutorial"
        options={{
          title: "Tutorial",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="book-outline" color={color} />
          ),
        }}
      />
    </Tabs>
    </TimeLoggingProvider>
  );
}
