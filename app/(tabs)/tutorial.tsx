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
          improve your productivity. This app is designed to act as a behavioral
          nudge to be consicious of how you spend your time. And then gradually
          move towards a more productive lifestyle. The more you log your time,
          the more you will understand how you spend your time. Ofcourse not all
          activities can be categorized as productive, neutral or wasteful. Some
          of our Karma (actions) have values beyond the simple categorization.
          No app should dictate your Karma. This app's domain is limited to
          lower order Karma (actions). Here’s how you can make the most out of
          the app:
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: textColor }]}>
          1. Logging Time
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: textColor }]}>
          Use the Tracker tab to log your activities. You can categorize your
          activities as productive, neutral, or wasteful. Its all upto you to
          decide how you want to categorize your activities. Some activities may
          be productive for you but wasteful for others. Like watching a movie
          can be productive for a film maker.
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: textColor }]}>
          2. Analyzing Data
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: textColor }]}>
          The Analytics tab provides insights into your time usage. You can see
          how much time you spend on different activities and identify areas for
          improvement. The formula for the productive score is a weighted
          average of the productive, wasteful, and neutral scores.
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: textColor }]}>
          3. Setting Targets
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: textColor }]}>
          Set daily targets for productive time and limits for wasteful time.
          This helps you stay focused and achieve your goals.
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: textColor }]}>
          4. Exporting Data
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: textColor }]}>
          Export your logs for further analysis or backup. This ensures you have
          access to your data whenever you need it.
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: textColor }]}>
          We hope you find Time Overflow helpful in managing your time
          effectively. If you have any questions or feedback, feel free to
          contact us.
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
