import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export const ProductivityScore = () => {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Productivity Score</ThemedText>
      {/* Gamification elements implementation */}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      padding: 16,
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Poppins_500Medium',
    }
  });