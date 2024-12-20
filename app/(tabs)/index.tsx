import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AnalogClock } from '@/components/AnalogClock';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <AnalogClock />
      <ThemedText style={styles.subtitle}>Track your time</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 10,
    // justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 30,
    opacity: 0.8,
  },
});
