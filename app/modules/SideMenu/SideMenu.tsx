import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import * as DocumentPicker from 'expo-document-picker';
import {
  DailyTargets,
  DEFAULT_TARGETS,
} from "@/app/common/interfaces/timeLogging";
import { TargetsStorage, TimeLoggingStorage } from "../TimeLogging/timeLoggingService";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";

const { width } = Dimensions.get("window");

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

export const SideMenu = ({ isVisible, onClose }: SideMenuProps) => {
  const textColor = useThemeColor({}, "text");
  const inputBackgroundColor = useThemeColor({}, "background");
  const [targets, setTargets] = useState<DailyTargets>(DEFAULT_TARGETS);
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [isBackupVisible, setIsBackupVisible] = useState(false);
  const { triggerRefresh } = useTimeLogging();

  useEffect(() => {
    loadTargets();
  }, [triggerRefresh]);

  const loadTargets = async () => {
    const savedTargets = await TargetsStorage.getTargets();
    setTargets(savedTargets);
  };

  const handleTargetChange = async (newTargets: DailyTargets) => {
    await TargetsStorage.saveTargets(newTargets);
    setTargets(newTargets);
    triggerRefresh();
  };

  const handleInputChange = (field: keyof DailyTargets, value: string) => {
    const numValue = parseInt(value) || 0;
    setTargets((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleSaveTargets = async () => {
    await TargetsStorage.saveTargets(targets);
    triggerRefresh();
    setIsEditingTargets(false);
  };

  const handleShare = async () => {
    try {
      await TimeLoggingStorage.shareLogsFile();
      console.log("Logs shared successfully.");
    } catch (error) {
      console.error("Error sharing logs:", error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(isVisible ? 0 : width) }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ThemedView style={styles.menu}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Preferences</ThemedText>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color={textColor} />
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
                Daily Productive Time Target (hours)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBackgroundColor, color: textColor },
                ]}
                keyboardType="numeric"
                value={String(targets.productiveHours)}
                onChangeText={(value) =>
                  handleInputChange("productiveHours", value)
                }
                placeholder="0"
                placeholderTextColor={textColor}
              />

              <ThemedText style={styles.inputLabel}>
                Daily Wasteful Time Limit (hours)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBackgroundColor, color: textColor },
                ]}
                keyboardType="numeric"
                value={String(targets.wastefulMaxHours)}
                onChangeText={(value) =>
                  handleInputChange("wastefulMaxHours", value)
                }
                placeholder="0"
              />

              <ThemedText style={styles.inputLabel}>
                Daily Neutral Time Limit (hours)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBackgroundColor, color: textColor },
                ]}
                keyboardType="numeric"
                value={String(targets.neutralMaxHours)}
                onChangeText={(value) =>
                  handleInputChange("neutralMaxHours", value)
                }
                placeholder="0"
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveTargets}
              >
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setIsBackupVisible(!isBackupVisible)}
          >
            <ThemedText style={styles.sectionTitle}>Backup Data</ThemedText>
            <Ionicons
              name={isBackupVisible ? "chevron-up" : "chevron-down"}
              size={24}
              color={textColor}
            />
          </TouchableOpacity>

          {isBackupVisible && (
            <View style={styles.backupContainer}>
              <TouchableOpacity onPress={handleShare} style={styles.button}>
                <ThemedText style={styles.buttonText}>Export Time Logs</ThemedText>
              </TouchableOpacity>
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
    marginTop: 10,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    paddingTop: 10,
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
    borderWidth: 1,
    borderColor: "#3498db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Ubuntu_400Regular",
    minWidth: 80,
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
  saveButton: {
    borderColor: "#3498db",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
  backupContainer: {
    marginTop: 10,
  },
  button: {
    padding: 15,
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
});

export default SideMenu;