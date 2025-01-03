import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DailyTargets, DEFAULT_TARGETS, TimeLogEntry, TimeLogAnalytics } from '@/app/common/interfaces/timeLogging';

const STORAGE_KEY = '@time_overflow_logs';
const TARGETS_KEY = '@time_overflow_targets';
const HOLIDAYS_KEY = '@time_overflow_holidays';
const SAVED_ACTIVITIES_KEY = '@saved_activities';
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
      console.error('Error saving time log:', error);
      throw error;
    }
  },

  async getAllLogs(): Promise<TimeLogEntry[]> {
    try {
      const logs = await AsyncStorage.getItem(STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error retrieving logs:', error);
      throw error;
    }
  },

  async exportLogs(): Promise<string> {
    const logs = await this.getAllLogs();
    return JSON.stringify(logs, null, 2);
  },

  async saveLogsToFile(): Promise<void> {
    try {
      const logs = await this.exportLogs();
      await FileSystem.writeAsStringAsync(BACKUP_FILE_PATH, logs);
      console.log('Logs saved to file:', BACKUP_FILE_PATH);
    } catch (error) {
      console.error('Error saving logs to file:', error);
      throw error;
    }
  },

  async shareLogsFile(): Promise<void> {
    try {
      await this.saveLogsToFile();
      await Sharing.shareAsync(BACKUP_FILE_PATH);
    } catch (error) {
      console.error('Error sharing logs file:', error);
      throw error;
    }
  },

  async importLogsFromFile(fileUri: string): Promise<void> {
    try {
      const logs = await FileSystem.readAsStringAsync(fileUri);
      await this.importLogs(logs);
    } catch (error) {
      console.error('Error importing logs from file:', error);
      throw error;
    }
  },

  async importLogs(jsonData: string): Promise<void> {
    try {
      const parsedData = JSON.parse(jsonData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
    } catch (error) {
      console.error('Error importing logs:', error);
      throw error;
    }
  },

  async saveHoliday(date: string): Promise<void> {
    try {
      const existingHolidays = await this.getHolidays();
      existingHolidays.push(date);
      await AsyncStorage.setItem(HOLIDAYS_KEY, JSON.stringify(existingHolidays));
    } catch (error) {
      console.error('Error saving holiday:', error);
      throw error;
    }
  },

  async getHolidays(): Promise<string[]> {
    try {
      const holidays = await AsyncStorage.getItem(HOLIDAYS_KEY);
      return holidays ? JSON.parse(holidays) : [];
    } catch (error) {
      console.error('Error retrieving holidays:', error);
      return [];
    }
  },

  async unmarkHoliday(date: string): Promise<void> {
    try {
      const existingHolidays = await this.getHolidays();
      const updatedHolidays = existingHolidays.filter(holiday => holiday !== date);
      await AsyncStorage.setItem(HOLIDAYS_KEY, JSON.stringify(updatedHolidays));
    } catch (error) {
      console.error('Error unmarking holiday:', error);
      throw error;
    }
  },

  async getSavedActivities(): Promise<{ activity: string; category: string }[]> {
    try {
      const savedActivities = await AsyncStorage.getItem(SAVED_ACTIVITIES_KEY);
      return savedActivities ? JSON.parse(savedActivities) : [];
    } catch (error) {
      console.error('Error retrieving saved activities:', error);
      return [];
    }
  },

  async saveActivity(activity: { activity: string; category: string }): Promise<void> {
    try {
      const existingActivities = await this.getSavedActivities();
      existingActivities.push(activity);
      await AsyncStorage.setItem(SAVED_ACTIVITIES_KEY, JSON.stringify(existingActivities));
    } catch (error) {
      console.error('Error saving activity:', error);
      throw error;
    }
  },

  async calculateProductivityScore(): Promise<number> {
    try {
      const logs = await this.getAllLogs();
      const targets = await TargetsStorage.getTargets();

      const totalProductiveHours = logs.reduce((sum, log) => log.category === 'productive' ? sum + log.hours + log.minutes / 60 : sum, 0);
      const totalWastefulHours = logs.reduce((sum, log) => log.category === 'wasteful' ? sum + log.hours + log.minutes / 60 : sum, 0);
      const totalNeutralHours = logs.reduce((sum, log) => log.category === 'neutral' ? sum + log.hours + log.minutes / 60 : sum, 0);

      const productiveScore = Math.min((totalProductiveHours / targets.productiveHours) * 100, 100);
      const wastefulScore = Math.min((totalWastefulHours / targets.wastefulMaxHours) * 100, 100);
      const neutralScore = Math.min((totalNeutralHours / targets.neutralMaxHours) * 100, 100);

      const overallScore = (productiveScore * 0.6) + ((100 - wastefulScore) * 0.3) + (neutralScore * 0.1);

      return overallScore;
    } catch (error) {
      console.error('Error calculating productivity score:', error);
      throw error;
    }
  }
};

export const TargetsStorage = {
  async saveTargets(targets: DailyTargets): Promise<void> {
    try {
      await AsyncStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
    } catch (error) {
      console.error('Error saving targets:', error);
      throw error;
    }
  },

  async getTargets(): Promise<DailyTargets> {
    try {
      const targets = await AsyncStorage.getItem(TARGETS_KEY);
      return targets ? JSON.parse(targets) : DEFAULT_TARGETS;
    } catch (error) {
      console.error('Error retrieving targets:', error);
      return DEFAULT_TARGETS;
    }
  }
};