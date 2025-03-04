import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  duration?: number;
  onHide?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  duration = 3000,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Icon and background color based on toast type
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle',
          backgroundColor: '#2ecc71',
        };
      case 'error':
        return {
          icon: 'error',
          backgroundColor: '#e74c3c',
        };
      case 'info':
      default:
        return {
          icon: 'info',
          backgroundColor: '#3498db',
        };
    }
  };

  const { icon, backgroundColor } = getIconAndColor();

  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;

    if (visible) {
      // Provide haptic feedback based on type
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Show toast animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      hideTimeout = setTimeout(() => {
        hide();
      }, duration);
    }

    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) {
        onHide();
      }
    });
  };

  if (!visible && opacity._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor,
        },
      ]}
    >
      <MaterialIcons name={icon as any} size={24} color="#fff" />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
});

export default Toast;
