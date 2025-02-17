import { StyleSheet, ScrollView, View } from "react-native";
import { RecentTrends } from "../modules/Analytics/RecentTrends";
import { TargetAchievements } from "../modules/Analytics/TargetAchievements";
import { TimeDistribution } from "../modules/Analytics/TimeDistribution";
import { ProductivityScore } from "../modules/Analytics/ProductivityScore";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import AllTimeData from "../modules/Analytics/AllTimeData";
import { useEffect } from "react";
import { useTimeLogging } from "../context/TimeLoggingContext";
import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnalyticsScreen() {
  const backgroundColor = useThemeColor({}, "background");

  const { triggerRefresh } = useTimeLogging();
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      console.log("Analytics screen focused - refreshing data");
      triggerRefresh();
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor}}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
      >
        <ThemedView style={styles.container}>
          <ThemedText style={styles.title}>Analytics</ThemedText>
          <View style={styles.cardsContainer}>
            <TimeDistribution />
            <RecentTrends />
            <TargetAchievements />
            <AllTimeData />
            <ProductivityScore />
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1
  },
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    width: "100%",
    alignItems: "center",
    paddingTop: 10
  },
  cardsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    marginTop: 10,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
});
