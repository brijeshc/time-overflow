import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  View,
  TextInput,
  Switch,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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
import {
  TargetsStorage,
  TimeLoggingStorage,
} from "../../common/services/dataStorage";
import { useTimeLogging } from "@/app/context/TimeLoggingContext";
import {
  cancelDailyNotification,
  scheduleDailyNotification,
} from "../../common/services/notificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import Constants from "expo-constants";

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
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [isDangerZoneVisible, setIsDangerZoneVisible] = useState(false);
  const [notificationTime, setNotificationTime] = useState(
    new Date(0, 0, 0, 21, 0)
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { triggerRefresh } = useTimeLogging();

  useEffect(() => {
    loadTargets();
    loadNotificationPreference();
  }, [triggerRefresh]);

  const loadTargets = async () => {
    try {
      const currentTargets = await TargetsStorage.getTargetsForDate(
        new Date().toISOString()
      );
      setTargets(currentTargets);
    } catch (error) {
      console.error("Error loading targets:", error);
      setTargets(DEFAULT_TARGETS);
    }
  };

  const loadNotificationPreference = async () => {
    const notificationId = await AsyncStorage.getItem("@daily_notification");
    setIsNotificationEnabled(notificationId !== null ? !!notificationId : true);

    const notificationTime = await AsyncStorage.getItem(
      "@daily_notification_time"
    );
    if (notificationTime) {
      const { hour, minute } = JSON.parse(notificationTime);
      setNotificationTime(new Date(0, 0, 0, hour, minute));
    } else {
      const defaultTime = new Date(0, 0, 0, 21, 0);
      setNotificationTime(defaultTime);
    }
  };

  const handleInputChange = (field: keyof DailyTargets, value: string) => {
    const numValue = parseInt(value) || 0;
    setTargets((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleSaveTargets = async () => {
    const newTargets = {
      ...targets,
      timestamp: new Date().toISOString(),
    };

    try {
      await TargetsStorage.saveTargets(newTargets);
      triggerRefresh();
      setIsEditingTargets(false);
      Alert.alert(
        "Targets Updated",
        "New targets will apply to future time logs. Previous logs will maintain their original targets."
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save targets");
    }
  };

  const handleShare = async () => {
    try {
      await TimeLoggingStorage.shareLogsFile();
      console.log("Logs shared successfully.");
    } catch (error) {
      console.error("Error sharing logs:", error);
    }
  };

  const handleNotificationToggle = async () => {
    if (isNotificationEnabled) {
      await cancelDailyNotification();
      Alert.alert(
        "Notification Disabled",
        "Daily reminder notifications have been disabled."
      );
    } else {
      const hour = notificationTime.getHours();
      const minute = notificationTime.getMinutes();
      await scheduleDailyNotification(hour, minute);
      Alert.alert(
        "Notification Enabled",
        "Daily reminder notifications have been enabled."
      );
    }
    setIsNotificationEnabled(!isNotificationEnabled);
  };

  const handleDeleteAllData = async () => {
    Alert.alert(
      "Delete All Data",
      "Are you sure you want to delete all your data? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await TimeLoggingStorage.clearAllLogs();
              await TargetsStorage.clearTargets();
              await AsyncStorage.clear();
              triggerRefresh();
              Alert.alert("Success", "All data has been deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete data");
            }
          },
        },
      ]
    );
  };

  const handleTimeChange = async (
    event: any,
    selectedTime: Date | undefined
  ) => {
    if (selectedTime) {
      setNotificationTime(selectedTime);
      setShowTimePicker(false);
      if (isNotificationEnabled) {
        const hour = selectedTime.getHours();
        const minute = selectedTime.getMinutes();
        await scheduleDailyNotification(hour, minute);
        Alert.alert(
          "Notification Time Updated",
          `Daily reminder notifications will be sent at ${hour}:${
            minute < 10 ? "0" : ""
          }${minute}.`
        );
      }
    } else {
      setShowTimePicker(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(isVisible ? 0 : width) }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ThemedView style={styles.menu}>
        <ScrollView showsVerticalScrollIndicator={false}>
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
                  <ThemedText style={styles.buttonText}>
                    Export Time Logs
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>
                Reminder Notification
              </ThemedText>
              <Switch
                value={isNotificationEnabled}
                onValueChange={handleNotificationToggle}
              />
            </View>
            <ThemedText style={styles.infoText}>
              Enable this to receive daily reminders if you haven't logged
              enough productive hours.
            </ThemedText>
            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <ThemedText style={styles.timePickerText}>
                {`Notification Time: ${notificationTime.getHours()}:${
                  notificationTime.getMinutes() < 10 ? "0" : ""
                }${notificationTime.getMinutes()}`}
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setIsDangerZoneVisible(!isDangerZoneVisible)}
            >
              <ThemedText style={styles.sectionTitle}>Danger Zone</ThemedText>
              <Ionicons
                name={isDangerZoneVisible ? "chevron-up" : "chevron-down"}
                size={24}
                color={textColor}
              />
            </TouchableOpacity>

            {isDangerZoneVisible && (
              <View>
                <TouchableOpacity
                  onPress={handleDeleteAllData}
                  style={[styles.button, styles.deleteButton]}
                >
                  <ThemedText style={[styles.buttonText]}>
                    Delete All Data
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://buymeacoffee.com/brijeshc2049")
              }
            >
              <ThemedText style={styles.linkText}>Support Developer</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.timeoverflow.app"
                )
              }
            >
              <ThemedText style={styles.linkText}>Rate us</ThemedText>
              <ThemedText>⭐⭐⭐⭐⭐</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://time-overflow.vercel.app/privacy")
              }
            >
              <ThemedText style={styles.linkText}>Privacy Policy</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={{ paddingBottom: 60 }} />
          <View style={styles.versionContainer}>
            <ThemedText style={styles.versionText}>
              Version {Constants.expoConfig?.version || "1.0.0"}
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>

      {showTimePicker && (
        <Modal transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={notificationTime}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
              <TouchableOpacity
                onPress={() => setShowTimePicker(false)}
                style={styles.modalCloseButton}
              >
                <ThemedText style={styles.modalCloseButtonText}>
                  Close
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    borderColor: "#007AFF",
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Ubuntu_400Regular",
    color: "#888",
    marginTop: 10,
  },
  timePickerText: {
    fontSize: 16,
    fontFamily: "Ubuntu_400Regular",
    color: "#007AFF",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
  deleteButton: {
    borderColor: "#ff3b30",
  },
  linkText: {
    color: "#007AFF",
    textDecorationLine: "underline",
    fontSize: 16,
    fontFamily: "Ubuntu_400Regular",
  },
  versionContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    fontFamily: "Ubuntu_400Regular",
    color: "#888",
  },
});

export default SideMenu;
