import { StyleSheet, ScrollView, View } from "react-native";
import { RecentTrends } from "../modules/Analytics/RecentTrends";
import { TargetAchievements } from "../modules/Analytics/TargetAchievements";
import { TimeDistribution } from "../modules/Analytics/TimeDistribution";
import { ProductivityScore } from "../modules/Analytics/ProductivityScore";
import { SmartInsights } from "../modules/Analytics/SmartInsights";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import DailySummary from "../modules/DailySummary/DailySummary";
import AllTimeData from "../modules/Analytics/AllTimeData";
import { useEffect } from "react";
import { useTimeLogging } from "../context/TimeLoggingContext";
import { useIsFocused } from "@react-navigation/native";

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
    width: "100%",
    alignItems: "center",
    paddingTop: 20,
    marginTop: 25,
  },
  cardsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_500Medium",
    marginTop: 10,
    marginBottom: 20,
  },
});
