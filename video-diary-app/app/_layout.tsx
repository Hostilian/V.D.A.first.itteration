// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initDatabase } from '../lib/db';

const queryClient = new QueryClient();

export default function AppLayout() {
  useEffect(() => {
    // Initialize database on app start
    initDatabase().catch(console.error);
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
