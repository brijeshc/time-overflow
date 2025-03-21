import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATION_KEY = "@daily_notification";
const NOTIFICATION_TIME_KEY = "@daily_notification_time";
const POMODORO_NOTIFICATION_KEY = "@pomodoro_notification";

export const setupNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

export const showPomodoroCompletionNotification = async (
  focusDuration: number
) => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Great Job!",
      body: `You've completed your focus session for ${focusDuration} minutes. Keep up the good work!`,
    },
    trigger: null, // null means show immediately
  });
};

export const scheduleDailyNotification = async (
  hour: number,
  minute: number
) => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }

  await cancelDailyNotification();

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Time Log Reminder",
      body: "Remember to log your activities for today!",
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
  const notificationTime = await AsyncStorage.getItem(NOTIFICATION_TIME_KEY);
  const { hour, minute } = notificationTime
    ? JSON.parse(notificationTime)
    : { hour: 21, minute: 0 };

  await scheduleDailyNotification(hour, minute);
};

export const cancelPomodoroNotification = async () => {
  const notificationId = await AsyncStorage.getItem(POMODORO_NOTIFICATION_KEY);
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    await AsyncStorage.removeItem(POMODORO_NOTIFICATION_KEY);
  }
};
