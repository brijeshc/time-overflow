import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeLogEntry } from '@/app/common/interfaces/timeLogging';

const STORAGE_KEY = '@time_overflow_logs';

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
