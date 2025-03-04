import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from '../lib/db';
import { useVideoStore } from '../store/videoStore';

// Create query client outside of component
const queryClient = new QueryClient();

export default function AppLayout() {
  const fetchVideos = useVideoStore((state) => state.fetchVideos);

  useEffect(() => {
    const setupApp = async () => {
      try {
        // Initialize database (now handles web/native differences)
        await initDatabase();

        // Fetch videos from database
        await fetchVideos();
      } catch (error) {
        console.error('Error setting up app:', error);
      }
    };

    setupApp();
  }, [fetchVideos]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Video Diary",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="details/[id]"
            options={{
              title: "Video Details",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="edit/[id]"
            options={{
              title: "Edit Video",
              headerShown: true,
            }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
