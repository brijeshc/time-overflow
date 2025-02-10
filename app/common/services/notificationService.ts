import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TargetsStorage,
  TimeLoggingStorage,
} from "@/app/common/services/dataStorage";
import {
  TimeLogEntry,
  DailyTargets,
} from "@/app/common/interfaces/timeLogging";

const NOTIFICATION_KEY = "@daily_notification";
const NOTIFICATION_TIME_KEY = "@daily_notification_time";

export const scheduleDailyNotification = async (
  hour: number,
  minute: number
) => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }

  // Cancel any existing notification before scheduling a new one
  await cancelDailyNotification();

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Reminder",
      body: "You haven't logged enough hours today. Don't forget to log your time!",
    },
    trigger: {
      hour,
      minute,
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
    },
  });

  await AsyncStorage.setItem(NOTIFICATION_KEY, notificationId);
  await AsyncStorage.setItem(
    NOTIFICATION_TIME_KEY,
    JSON.stringify({ hour, minute })
  );
};

export const cancelDailyNotification = async () => {
  const notificationId = await AsyncStorage.getItem(NOTIFICATION_KEY);
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    await AsyncStorage.removeItem(NOTIFICATION_KEY);
    await AsyncStorage.removeItem(NOTIFICATION_TIME_KEY);
  }
};

export const checkAndScheduleNotification = async () => {
  const today = new Date().toISOString().split("T")[0];
  const targets: DailyTargets = await TargetsStorage.getTargetsForDate(today);

  const todayLogs = await TimeLoggingStorage.getTodayLogs();
  const totalProductiveHours = todayLogs.reduce(
    (sum, log) =>
      log.category === "productive" ? sum + log.hours + log.minutes / 60 : sum,
    0
  );

  if (totalProductiveHours < targets.productiveHours) {
    const notificationTime = await AsyncStorage.getItem(NOTIFICATION_TIME_KEY);
    const { hour, minute } = notificationTime
      ? JSON.parse(notificationTime)
      : { hour: 21, minute: 0 };
    await scheduleDailyNotification(hour, minute);
  } else {
    await cancelDailyNotification();
  }
};
