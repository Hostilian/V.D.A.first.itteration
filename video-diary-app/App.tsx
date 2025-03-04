import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { ErrorBoundary } from './components/ErrorHandling/ErrorBoundary';
import Toast from './components/ui/Toast';
import { AppNavigator } from './navigation/AppNavigator';
import ffmpegService from './services/ffmpeg';

// Ignore specific logs in development
LogBox.ignoreLogs([
  'ReactNativeFiberHostComponent: Calling getNode() on the ref of an Animated component',
  'Setting a timer for a long period of time',
]);

export default function App() {
  const [ffmpegReady, setFFmpegReady] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    message: '',
    type: 'info' as 'info' | 'success' | 'error',
  });

  // Initialize FFmpeg
  useEffect(() => {
    const initializeFFmpeg = async () => {
      try {
        await ffmpegService.initialize();
        setFFmpegReady(true);
        showToast('Video processing engine ready', 'success');
      } catch (error) {
        console.error('Failed to initialize FFmpeg:', error);
        showToast('Video processing engine failed to initialize', 'error');
      }
    };

    initializeFFmpeg();

    return () => {
      ffmpegService.cleanup();
    };
  }, []);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastConfig({
      visible: true,
      message,
      type,
    });
  };

  const hideToast = () => {
    setToastConfig(prev => ({ ...prev, visible: false }));
  };

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <AppNavigator />
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onHide={hideToast}
      />
    </ErrorBoundary>
  );
}
