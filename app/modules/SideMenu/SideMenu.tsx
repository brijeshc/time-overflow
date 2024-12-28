import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  DailyTargets,
  DEFAULT_TARGETS,
} from "@/app/common/interfaces/timeLogging";
import { TargetsStorage } from "../TimeLogging/timeLoggingService";

const { width } = Dimensions.get("window");

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

export const SideMenu = ({ isVisible, onClose }: SideMenuProps) => {
  const textColor = useThemeColor({}, "text");
  const [targets, setTargets] = useState<DailyTargets>(DEFAULT_TARGETS);
  const [isEditingTargets, setIsEditingTargets] = useState(false);

  // Add state for hours and minutes
  const [productiveHours, setProductiveHours] = useState("0");
  const [productiveMinutes, setProductiveMinutes] = useState("0");

  useEffect(() => {
    loadTargets();
  }, []);

  const loadTargets = async () => {
    const savedTargets = await TargetsStorage.getTargets();
    setTargets(savedTargets);
  };

  const handleTargetChange = async (newTargets: DailyTargets) => {
    await TargetsStorage.saveTargets(newTargets);
    setTargets(newTargets);
  };

  const handleTimeTargetChange = () => {
    const totalHours = Number(productiveHours) + Number(productiveMinutes) / 60;
    handleTargetChange({
      ...targets,
      productiveHours: totalHours,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(isVisible ? 0 : width) }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ThemedView style={styles.menu}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Settings</ThemedText>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setIsEditingTargets(!isEditingTargets)}
          >
            <ThemedText style={styles.sectionTitle}>Daily Targets</ThemedText>
            <Ionicons
              name={isEditingTargets ? "chevron-up" : "chevron-down"}
              size={24}
              color={textColor}
            />
          </TouchableOpacity>

          {isEditingTargets && (
            <View style={styles.targetInputs}>
              <ThemedText style={styles.inputLabel}>
                Daily Productive Time Target
              </ThemedText>
              <View style={styles.timeInputContainer}>
                <View style={styles.timeInput}>
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    value={productiveHours}
                    onChangeText={setProductiveHours}
                    onEndEditing={handleTimeTargetChange}
                    keyboardType="numeric"
                    placeholder="Hours"
                  />
                  <ThemedText>hrs</ThemedText>
                </View>
                <View style={styles.timeInput}>
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    value={productiveMinutes}
                    onChangeText={setProductiveMinutes}
                    onEndEditing={handleTimeTargetChange}
                    keyboardType="numeric"
                    placeholder="Minutes"
                  />
                  <ThemedText>min</ThemedText>
                </View>
              </View>
            </View>
          )}
        </View>
      </ThemedView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: width,
    zIndex: 1000,
  },
  menu: {
    flex: 1,
    width: width * 0.85,
    marginLeft: "auto",
    paddingTop: 50,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_500Medium",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Ubuntu_400Regular",
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  inputLabel: {
    marginBottom: 5,
    fontSize: 14,
    fontFamily: "Ubuntu_400Regular",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#3498db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Ubuntu_400Regular",
    minWidth: 80,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    // color: "#fff", // This ensures text is visible in dark mode
  },
  percentageInput: {
    width: "100%",
    marginVertical: 10,
  },
  inputContainer: {
    marginBottom: 20,
    width: "100%",
  },
  targetInputs: {
    marginTop: 10,
  },
  timeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  timeInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
});

export default SideMenu;