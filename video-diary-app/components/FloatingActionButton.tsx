import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'add',
  size = 24,
  color = '#fff',
  backgroundColor = '#4285F4',
  style,
  disabled = false,
}) => {
  // Animated style for button press feedback
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(disabled ? 0.95 : 1, {
            damping: 20,
            stiffness: 300,
          }),
        },
      ],
      opacity: withSpring(disabled ? 0.7 : 1),
    };
  });

  return (
    <Animated.View style={[styles.fabContainer, animatedStyle]}>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor }, style]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Ionicons name={icon} size={size} color={color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default FloatingActionButton;
