import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress, icon = "+" }) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.fabIcon}>{icon}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#4285F4',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
  fabIcon: {
    fontSize: 30,
    color: 'white',
  }
});

export default FloatingActionButton;
