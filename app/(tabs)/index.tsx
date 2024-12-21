import { ScrollView, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AnalogClock } from "@/components/AnalogClock";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { Poppins_500Medium } from "@expo-google-fonts/poppins";
import { Ubuntu_400Regular } from "@expo-google-fonts/ubuntu";
import { TimeLogging } from "../modules/TimeLogging/TimeLogging";

export default function HomeScreen() {
  let [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Poppins_500Medium,
    Ubuntu_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <AnalogClock style={styles.clockContainer}/>
        <TimeLogging />
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
  }
});
