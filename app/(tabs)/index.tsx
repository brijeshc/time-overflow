import { ScrollView, StyleSheet, Animated, TouchableOpacity, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { AnalogClock } from "@/components/AnalogClock";
import { useFonts, PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { Poppins_500Medium } from "@expo-google-fonts/poppins";
import { Ubuntu_400Regular } from "@expo-google-fonts/ubuntu";
import TimeLogging from "../modules/TimeLogging/TimeLogging";
import { useState, useRef } from "react";
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from "@/hooks/useThemeColor";
import { TodayActivities } from "../modules/TodayActivities/TodayActivities";
import { TodaySummary } from "../modules/TodaySummary/TodaySummary";
import { TimeLoggingProvider } from "../context/TimeLoggingContext";

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, "background"); 
  const [showLogging, setShowLogging] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
      })
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
      <ThemedView style={styles.container}>
        <AnalogClock style={styles.clockContainer}/>
        
        
        {!showLogging ? (
          <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity 
              style={styles.logButton}
              onPress={handlePress}
            >
              <Ionicons name="time-outline" size={24} color="#007AFF"/>
              <ThemedText style={styles.buttonText}>Log Your Time</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TimeLogging onComplete={handleLogComplete} />
        )}
         {!showLogging && <TodaySummary />}
        {!showLogging && <TodayActivities />}
      </ThemedView>

    </ScrollView>
    </TimeLoggingProvider>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
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
    marginTop: 15
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(248, 246, 246, 0.1)",
    borderColor: '#3498db',
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
  }
});