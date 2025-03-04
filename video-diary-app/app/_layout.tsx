// app/_layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { initDatabase } from '../lib/db';

// Create query client outside of component
const queryClient = new QueryClient();

export default function AppLayout() {
  useEffect(() => {
    // Initialize database on app start, but only on native platforms
    if (Platform.OS !== 'web') {
      initDatabase().catch(error => 
        console.error('Failed to initialize database:', error)
      );
    }
  }, []);

  return (
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
  );
}
