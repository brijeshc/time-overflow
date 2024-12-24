import { ScrollView, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { AnalogClock } from "@/components/AnalogClock";
import { useFonts, PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { Poppins_500Medium } from "@expo-google-fonts/poppins";
import { Ubuntu_400Regular } from "@expo-google-fonts/ubuntu";
import TimeLogging from "../modules/TimeLogging/TimeLogging";
import { useState, useRef } from "react";
import { Ionicons } from '@expo/vector-icons';


export default function HomeScreen() {
  const [showLogging, setShowLogging] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  let [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Poppins_500Medium,
    Ubuntu_400Regular,
  });

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
    setShowLogging(true);
  };

  const handleLogComplete = () => {
    setShowLogging(false);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <AnalogClock style={styles.clockContainer}/>
        
        {!showLogging ? (
          <Animated.View style={[styles.actionContainer, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handlePress}
            >
              <Ionicons name="add-circle" size={64} color="#007AFF" />
            </TouchableOpacity>
            <ThemedText style={styles.actionText}>Log Your Activity</ThemedText>
          </Animated.View>
        ) : (
          <TimeLogging onComplete={handleLogComplete} />
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 15,
    paddingTop: 20,
  },
  clockContainer: {
    marginTop: 15
  },
  actionContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  addButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionText: {
    marginTop: 15,
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
    opacity: 0.8
  }
});