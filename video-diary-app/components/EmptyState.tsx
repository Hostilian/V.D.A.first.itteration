import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
});

export default EmptyState;
