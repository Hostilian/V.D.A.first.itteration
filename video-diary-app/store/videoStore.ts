// store/videoStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getVideosFromDB, insertVideo, updateVideo as updateVideoDB, deleteVideo as deleteVideoDB } from '../lib/db';
import { VideoMetadata } from '../types';

interface VideoState {
  videos: VideoMetadata[];
  isLoading: boolean;
  error: string | null;
  fetchVideos: () => Promise<void>;
  addVideo: (video: VideoMetadata) => Promise<void>;
  updateVideo: (id: string, updates: { name?: string; description?: string }) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  getVideo: (id: string) => VideoMetadata | undefined;
}

// Create a store with persistence for web
export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      videos: [],
      isLoading: false,
      error: null,

      fetchVideos: async () => {
        set({ isLoading: true, error: null });
        try {
          if (Platform.OS === 'web') {
            // For web, we'll use the persisted state
            // No additional action needed as persist middleware handles it
          } else {
            // For native platforms, fetch from SQLite
            const videos = await getVideosFromDB();
            set({ videos, isLoading: false });
          }
        } catch (error) {
          console.error('Error fetching videos:', error);
          set({ error: 'Failed to fetch videos', isLoading: false });
        }
      },

      addVideo: async (video: VideoMetadata) => {
        try {
          if (Platform.OS !== 'web') {
            await insertVideo(video);
          }

          set((state) => ({
            videos: [video, ...state.videos],
          }));
        } catch (error) {
          console.error('Error adding video:', error);
          set({ error: 'Failed to add video' });
        }
      },

      updateVideo: async (id: string, updates: { name?: string; description?: string }) => {
        try {
          if (Platform.OS !== 'web') {
            await updateVideoDB(id, updates);
          }

          set((state) => ({
            videos: state.videos.map((video) =>
              video.id === id ? { ...video, ...updates } : video
            ),
          }));
        } catch (error) {
          console.error('Error updating video:', error);
          set({ error: 'Failed to update video' });
        }
      },

      deleteVideo: async (id: string) => {
        try {
          if (Platform.OS !== 'web') {
            await deleteVideoDB(id);
          }

          set((state) => ({
            videos: state.videos.filter((video) => video.id !== id),
          }));
        } catch (error) {
          console.error('Error deleting video:', error);
          set({ error: 'Failed to delete video' });
        }
      },

      getVideo: (id: string) => {
        return get().videos.find((video) => video.id === id);
      },
    }),
    {
      name: 'video-store',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ?? null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, value);
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
