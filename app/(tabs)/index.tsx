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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TodayActivities } from "../modules/TodayActivities/TodayActivities";
import { TodaySummary } from "../modules/TodaySummary/TodaySummary";
import { EmptyStatePrompt } from "../modules/EmptyStatePrompt/EmptyStatePrompt";
import React from "react";
import { BackHandler } from "react-native";
import { SideMenu } from "../modules/SideMenu/SideMenu";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import PomodoroTimer from "@/components/PomodoroTimer";
import { setupNotificationHandler } from "../common/services/notificationService";

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const [showLogging, setShowLogging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [timerSound, setTimerSound] = useState<Audio.Sound | null>(null);
  const [buttonSound, setButtonSound] = useState<Audio.Sound | null>(null);
  const [startSound, setStartSound] = useState<Audio.Sound | null>(null);
  const [endSound, setEndSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const backAction = () => {
      if (showLogging) {
        setShowLogging(false);
        return true;
      }
      if (showTimer) {
        setShowTimer(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [showLogging, showTimer]);
  

  useEffect(() => {
    setupNotificationHandler();
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/logYourTime.mp3")
      );
      const { sound: pomodoroSound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/timer.mp3")
      );
      const { sound: startSound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/start.mp3")
      );
      const { sound: endSound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/end.mp3")
      );
      await sound.setVolumeAsync(0.3);
      await pomodoroSound.setVolumeAsync(0.3);
      await startSound.setVolumeAsync(0.3);
      await endSound.setVolumeAsync(0.3);
      setButtonSound(sound);
      setTimerSound(pomodoroSound);
      setStartSound(startSound);
      setEndSound(endSound);
    };

    loadSound();

    return () => {
      if (buttonSound) {
        buttonSound.unloadAsync();
      }
    };
  }, []);

  const playButtonSound = async () => {
    try {
      if (buttonSound) {
        await buttonSound.replayAsync();
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const handleTimerPress = async () => {
    try {
      if (timerSound) {
        await timerSound.replayAsync();
      }
    } catch (error) {
      console.error("Error playing timer sound:", error);
    }
    setShowTimer(true);
  };

  const handlePress = async () => {
    await playButtonSound();
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
      }, 80);
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
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
      >
        {showTimer ? (
          <PomodoroTimer onClose={() => setShowTimer(false)}  startSound={startSound}
          endSound={endSound}/>
        ) : (
          <>
            <SideMenu isVisible={showMenu} onClose={() => setShowMenu(false)} />
            <ThemedView style={styles.container}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setShowMenu(true)}
              >
                <Ionicons name="settings-outline" size={24} color={textColor} />
              </TouchableOpacity>
              <TouchableOpacity
                disabled={showLogging}
                style={styles.timerButton}
                onPress={handleTimerPress}
              >
                <ThemedText style={{ fontSize: 20 }}>🍅</ThemedText>
              </TouchableOpacity>

              <AnalogClock />

              {!showLogging ? (
                <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
                  <TouchableOpacity
                    style={styles.logButton}
                    onPress={handlePress}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color="#007AFF"
                    />
                    <ThemedText style={styles.buttonText}>
                      Log Your Time
                    </ThemedText>
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
          </>
        )}
      </ScrollView>
      <SideMenu isVisible={showMenu} onClose={() => setShowMenu(false)} />
    </SafeAreaView>
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
    borderRadius: 25,
    backgroundColor: "rgba(248, 246, 246, 0.1)",
    borderColor: "#3498db",
    borderWidth: 1,
  },
  timerButton: {
    position: "absolute",
    top: 80,
    right: 20,
    padding: 8,
    borderRadius: 25,
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
  },
  logButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(185, 181, 180, 0.2)",
    borderColor: "#3498db",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 30,
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
  },
});
