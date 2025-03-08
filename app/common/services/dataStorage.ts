import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  DailyTargets,
  DEFAULT_TARGETS,
  ProductivityScore,
  TargetHistory,
  TimeLogEntry,
} from "@/app/common/interfaces/timeLogging";

const STORAGE_KEY = "@time_overflow_logs";
const TARGETS_KEY = "@time_overflow_targets";
const HOLIDAYS_KEY = "@time_overflow_holidays";
const SAVED_ACTIVITIES_KEY = "@saved_activities";
const BACKUP_FILE_PATH = `${FileSystem.documentDirectory}time_logs_backup.json`;

export const TimeLoggingStorage = {
  async saveLogs(entry: TimeLogEntry): Promise<void> {
    try {
      const existingLogsString = await AsyncStorage.getItem(STORAGE_KEY);
      const existingLogs: TimeLogEntry[] = existingLogsString
        ? JSON.parse(existingLogsString)
        : [];

      existingLogs.push(entry);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingLogs));
    } catch (error) {
      console.error("Error saving time log:", error);
      throw error;
    }
  },

  async getTodayLogs(): Promise<TimeLogEntry[]> {
    const allLogs = await this.getAllLogs();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of current day

    return allLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0); // Set to start of log day
      return logDate.getTime() === today.getTime();
    });
  },
  async updateTodayLogs(updatedTodayLogs: TimeLogEntry[]): Promise<void> {
    const allLogs = await this.getAllLogs();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nonTodayLogs = allLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() !== today.getTime();
    });

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...nonTodayLogs, ...updatedTodayLogs])
    );
  },

  async getAllLogs(): Promise<TimeLogEntry[]> {
    try {
      const logs = await AsyncStorage.getItem(STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error("Error retrieving logs:", error);
      throw error;
    }
  },

  async groupLogsByDate(): Promise<{
    [key: string]: { productive: number; wasteful: number; neutral: number };
  }> {
    const logs = await this.getAllLogs();
    return logs.reduce((acc, log) => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      const date = logDate.toISOString().split("T")[0];

      if (!acc[date]) {
        acc[date] = { productive: 0, wasteful: 0, neutral: 0 };
      }
      const minutes = log.hours * 60 + log.minutes;
      acc[date][log.category] += minutes;
      return acc;
    }, {} as { [key: string]: { productive: number; wasteful: number; neutral: number } });
  },
  async exportLogs(): Promise<string> {
    const logs = await this.getAllLogs();
    return JSON.stringify(logs, null, 2);
  },

  async saveLogsToFile(): Promise<void> {
    try {
      const logs = await this.exportLogs();
      await FileSystem.writeAsStringAsync(BACKUP_FILE_PATH, logs);
      console.log("Logs saved to file:", BACKUP_FILE_PATH);
    } catch (error) {
      console.error("Error saving logs to file:", error);
      throw error;
    }
  },

  async shareLogsFile(): Promise<void> {
    try {
      await this.saveLogsToFile();
      await Sharing.shareAsync(BACKUP_FILE_PATH);
    } catch (error) {
      console.error("Error sharing logs file:", error);
      throw error;
    }
  },

  async importLogsFromFile(fileUri: string): Promise<void> {
    try {
      const logs = await FileSystem.readAsStringAsync(fileUri);
      await this.importLogs(logs);
    } catch (error) {
      console.error("Error importing logs from file:", error);
      throw error;
    }
  },

  async importLogs(jsonData: string): Promise<void> {
    try {
      const parsedData = JSON.parse(jsonData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
    } catch (error) {
      console.error("Error importing logs:", error);
      throw error;
    }
  },

  async saveHoliday(date: string): Promise<void> {
    try {
      const existingHolidays = await this.getHolidays();
      existingHolidays.push(date);
      await AsyncStorage.setItem(
        HOLIDAYS_KEY,
        JSON.stringify(existingHolidays)
      );
    } catch (error) {
      console.error("Error saving holiday:", error);
      throw error;
    }
  },

  async getHolidays(): Promise<string[]> {
    try {
      const holidays = await AsyncStorage.getItem(HOLIDAYS_KEY);
      return holidays ? JSON.parse(holidays) : [];
    } catch (error) {
      console.error("Error retrieving holidays:", error);
      return [];
    }
  },

  async unmarkHoliday(date: string): Promise<void> {
    try {
      const existingHolidays = await this.getHolidays();
      const updatedHolidays = existingHolidays.filter(
        (holiday) => holiday !== date
      );
      await AsyncStorage.setItem(HOLIDAYS_KEY, JSON.stringify(updatedHolidays));
    } catch (error) {
      console.error("Error unmarking holiday:", error);
      throw error;
    }
  },

  async getSavedActivities(): Promise<
    { activity: string; category: string }[]
  > {
    try {
      const savedActivities = await AsyncStorage.getItem(SAVED_ACTIVITIES_KEY);
      return savedActivities ? JSON.parse(savedActivities) : [];
    } catch (error) {
      console.error("Error retrieving saved activities:", error);
      return [];
    }
  },

  async saveActivity(activity: {
    activity: string;
    category: string;
  }): Promise<void> {
    try {
      const existingActivities = await this.getSavedActivities();
      existingActivities.push(activity);
      await AsyncStorage.setItem(
        SAVED_ACTIVITIES_KEY,
        JSON.stringify(existingActivities)
      );
    } catch (error) {
      console.error("Error saving activity:", error);
      throw error;
    }
  },

  async calculateProductivityScore(): Promise<ProductivityScore | null> {
    try {
      const logs = await this.getAllLogs();
      if (logs.length === 0) return null;

      const holidays = await this.getHolidays();

      const logsByDate = logs.reduce((acc, log) => {
        const logDate = new Date(log.timestamp);
        logDate.setHours(0, 0, 0, 0);
        const date = logDate.toISOString().split("T")[0];

        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
      }, {} as Record<string, TimeLogEntry[]>);

      const dailyScores = await Promise.all(
        Object.entries(logsByDate).map(async ([date, dayLogs]) => {
          const targets = await TargetsStorage.getTargetsForDate(date);
          const isHoliday = holidays.includes(date);

          const totals = dayLogs.reduce(
            (sum, log) => {
              const multiplier = log.isPomodoro ? 1.5 : 1;
              const hours = (log.hours + log.minutes / 60) * multiplier;
              sum[log.category] += hours;
              return sum;
            },
            { productive: 0, wasteful: 0, neutral: 0 }
          );

          if (isHoliday) {
            // Only consider productive hours on holidays
            const productiveScore =
              (totals.productive / targets.productiveHours) * 100;
            return {
              date,
              score: productiveScore, // Direct productive hour contribution
              hasActivity: totals.productive > 0,
              countTowardsTotalDays: false,
            };
          }

          const productiveScore = Math.min(
            (totals.productive / targets.productiveHours) * 100,
            100
          );
          const wastefulPenalty = Math.min(
            (totals.wasteful / targets.wastefulMaxHours) * 100,
            100
          );
          const neutralBalance = Math.min(
            (totals.neutral / targets.neutralMaxHours) * 100,
            100
          );

          const dailyScore =
            productiveScore * 0.6 +
            (100 - wastefulPenalty) * 0.3 +
            neutralBalance * 0.1;

          return {
            date,
            score: dailyScore,
            hasActivity: true,
            countTowardsTotalDays: true,
          };
        })
      );

      const sortedScores = dailyScores.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const weightedScores = sortedScores.map((day, index) => {
        const weight = Math.pow(0.9, index);
        return day.score * weight;
      });

      const totalWeight = sortedScores.reduce(
        (sum, _, i) => sum + Math.pow(0.9, i),
        0
      );

      const finalScore =
        weightedScores.reduce((sum, score) => sum + score, 0) / totalWeight;
      const totalDays = sortedScores.filter(
        (day) => day.countTowardsTotalDays
      ).length;

      return {
        score: Math.round(finalScore * 100) / 100,
        totalDays,
      };
    } catch (error) {
      console.error("Error calculating productivity score:", error);
      return null;
    }
  },
  async clearAllLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(HOLIDAYS_KEY);
      await AsyncStorage.removeItem(SAVED_ACTIVITIES_KEY);
    } catch (error) {
      console.error("Error clearing logs:", error);
      throw error;
    }
  },
};
export const TargetsStorage = {
  async saveTargets(targets: DailyTargets): Promise<void> {
    try {
      let history = await this.getTargetHistory();
      // Initialize if undefined
      if (!history || !history.targets) {
        history = { targets: [] };
      }
      history.targets.push(targets);
      await AsyncStorage.setItem(TARGETS_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Error saving targets:", error);
      throw error;
    }
  },

  async getTargetHistory(): Promise<TargetHistory> {
    try {
      const historyString = await AsyncStorage.getItem(TARGETS_KEY);
      if (!historyString) {
        return { targets: [DEFAULT_TARGETS] };
      }
      const history = JSON.parse(historyString);
      // Ensure valid structure
      if (!history || !Array.isArray(history.targets)) {
        return { targets: [DEFAULT_TARGETS] };
      }
      return history;
    } catch (error) {
      console.error("Error getting target history:", error);
      return { targets: [DEFAULT_TARGETS] };
    }
  },

  async getTargetsForDate(date: string): Promise<DailyTargets> {
    try {
      const history = await this.getTargetHistory();
      if (!history.targets || history.targets.length === 0) {
        return DEFAULT_TARGETS;
      }

      const targetDate = new Date(date);
      const today = new Date();

      if (targetDate > today) {
        const mostRecentTargets = history.targets.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        return mostRecentTargets || DEFAULT_TARGETS;
      }

      const previousTargets = history.targets
        .filter((t) => new Date(t.timestamp) <= targetDate)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];

      return previousTargets || DEFAULT_TARGETS;
    } catch (error) {
      console.error(`Error getting targets for date ${date}:`, error);
      return DEFAULT_TARGETS;
    }
  },
  async clearTargets(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TARGETS_KEY);
    } catch (error) {
      console.error("Error clearing targets:", error);
      throw error;
    }
  },
};
