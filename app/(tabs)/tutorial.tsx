import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function Tutorial() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          Welcome to Time Overflow
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: textColor }]}>
          Time Overflow is designed to help you track your time efficiently and
          improve your productivity. The core purpose of this app is to maintain
          honest time logging for yourself. It serves as a behavioral nudge to
          make you aware of how you spend your time, helping you consciously
          move towards a more productive lifestyle. The more you log your time,
          the better you'll understand your time allocation patterns. Not all
          activities fit neatly into productive, neutral, or wasteful
          categories. Some of our actions (Karma) have value beyond simple
          categorization. While the app isn't primarily designed to track
          quality family time or routine activities, you're welcome to log
          everything you wish. Here's how to maximize your experience with the
          app:
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: textColor }]}>
          1. Logging Time
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: textColor }]}>
          Use the Tracker tab to log your activities. You can categorize them as
          productive, neutral, or wasteful based on your personal assessment.
          What's productive for one person might be considered wasteful for
          another - for instance, watching movies could be productive for a
          filmmaker.
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: textColor }]}>
          2. Analyzing Data
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: textColor }]}>
          The Analytics tab offers detailed insights into your time usage
          patterns. Monitor how you allocate time across different activities
          and identify potential areas for improvement. Your productive score is
          calculated using a weighted average of productive, wasteful, and
          neutral activities.
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: textColor }]}>
          3. Setting Targets
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: textColor }]}>
          Establish daily targets for productive time and set limits for
          activities you consider wasteful. This feature helps maintain focus
          and achieve your personal goals.
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: textColor }]}>
          4. Exporting Data
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: textColor }]}>
          Access and export your logs for in-depth analysis or backup purposes.
          Your data remains accessible whenever you need it.
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: textColor }]}>
          We hope you find Time Overflow helpful in managing your time
          effectively. If you have any questions or feedback, feel free to
          contact us at fromzerotoinfinity13@gmail.com. Visit our website at
          https://time-overflow.vercel.app/ for more information. Happy time
          tracking!
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 15,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    paddingTop: 5,
    marginTop: 10,
    fontFamily: "Poppins_500Medium",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginBottom: 10,
  },
});
