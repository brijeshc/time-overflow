import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number;
  color?: string;
}

export const ProgressBar = ({ progress, color = '#3498db' }: ProgressBarProps) => {
  const width = Math.min(progress * 100, 100);

  return (
    <View style={styles.container}>
      <View style={[styles.progress, { width: `${width}%`, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
});
