import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { TimeLoggingStorage } from '../TimeLogging/timeLoggingService';
import { ThemedText } from '@/components/ThemedText';

export const TimeLogBackup = () => {
  const handleExport = async () => {
    try {
      const logs = await TimeLoggingStorage.exportLogs();
      const fileUri = `${FileSystem.documentDirectory}time_overflow_backup.json`;
      await FileSystem.writeAsStringAsync(fileUri, logs);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleExport} style={styles.button}>
        <ThemedText>Export Time Logs</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  button: {
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default TimeLogBackup;
