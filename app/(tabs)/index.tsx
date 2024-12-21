import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AnalogClock } from '@/components/AnalogClock';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Poppins_500Medium } from '@expo-google-fonts/poppins';
import { Ubuntu_400Regular } from '@expo-google-fonts/ubuntu';

export default function HomeScreen() {
  let [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Poppins_500Medium,
    Ubuntu_400Regular
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <AnalogClock />
      <ThemedText style={styles.title}>Track your time</ThemedText>
      <ThemedText style={styles.subtitle}>Make every minute count</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 20,
  },
  title: {
    fontSize: 25,
    fontFamily: 'Ubuntu_400Regular',
    marginTop: 35,
    // fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 18,
    marginTop: 3,
    opacity: 0.8,
    fontFamily: 'Poppins_500Medium',
    fontStyle: 'italic'
  },
});
