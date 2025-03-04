import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, visible, onHide }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Appear, stay for 3 seconds, then disappear
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(1, { duration: 3000 }),
        withTiming(0, { duration: 300 }, (finished) => {
          if (finished) onHide();
        })
      );
    } else {
      opacity.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: opacity.value * 0 + (1 - opacity.value) * 20 }],
  }));

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (!visible && opacity.value === 0) return null;

  return (
    <Animated.View
      style={[animatedStyle]}
      className={`absolute bottom-5 left-5 right-5 px-4 py-3 rounded-lg shadow-lg flex-row items-center ${getBackgroundColor()}`}
    >
      <Ionicons name={getIconName()} size={24} color="#ffffff" />
      <Text className="text-white font-medium ml-2 flex-1">{message}</Text>
    </Animated.View>
  );
};

export default Toast;
