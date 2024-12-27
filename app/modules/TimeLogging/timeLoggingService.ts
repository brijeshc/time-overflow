import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyTargets, DEFAULT_TARGETS, TimeLogEntry } from '@/app/common/interfaces/timeLogging';

const STORAGE_KEY = '@time_overflow_logs';
const TARGETS_KEY = '@time_overflow_targets';

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

  async importLogs(jsonData: string): Promise<void> {
    try {
      const parsedData = JSON.parse(jsonData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
    } catch (error) {
      console.error('Error importing logs:', error);
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
