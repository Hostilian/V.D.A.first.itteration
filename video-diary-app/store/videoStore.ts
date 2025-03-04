// store/videoStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { executeQuery } from '../database';

export interface VideoEntry {
  id: string;
  name: string;
  description: string;
  uri: string;
  createdAt: number;
  duration: number;
  thumbnailUri?: string;
}

interface VideoState {
  videos: VideoEntry[];
  isLoading: boolean;
  currentVideo: VideoEntry | null;

  // Actions
  fetchVideos: () => Promise<void>;
  addVideo: (video: Omit<VideoEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  setCurrentVideo: (id: string | null) => void;
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      videos: [],
      isLoading: false,
      currentVideo: null,

      fetchVideos: async () => {
        set({ isLoading: true });
        try {
          const results = await executeQuery(
            'SELECT * FROM videos ORDER BY createdAt DESC'
          );
          set({ videos: results, isLoading: false });
        } catch (error) {
          console.error('Error fetching videos:', error);
          set({ isLoading: false });
        }
      },

      addVideo: async (videoData) => {
        set({ isLoading: true });
        try {
          const id = Date.now().toString();
          const newVideo: VideoEntry = {
            ...videoData,
            id,
            createdAt: Date.now(),
          };

          await executeQuery(
            'INSERT INTO videos (id, name, description, uri, createdAt, duration, thumbnailUri) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              newVideo.id,
              newVideo.name,
              newVideo.description,
              newVideo.uri,
              newVideo.createdAt,
              newVideo.duration,
              newVideo.thumbnailUri || null,
            ]
          );

          const videos = [...get().videos, newVideo];
          set({ videos, isLoading: false });
        } catch (error) {
          console.error('Error adding video:', error);
          set({ isLoading: false });
        }
      },

      deleteVideo: async (id) => {
        set({ isLoading: true });
        try {
          await executeQuery('DELETE FROM videos WHERE id = ?', [id]);
          const videos = get().videos.filter((video) => video.id !== id);
          set({ videos, isLoading: false });
        } catch (error) {
          console.error('Error deleting video:', error);
          set({ isLoading: false });
        }
      },

      setCurrentVideo: (id) => {
        if (id === null) {
          set({ currentVideo: null });
          return;
        }
        const video = get().videos.find((v) => v.id === id) || null;
        set({ currentVideo: video });
      },
    }),
    {
      name: 'video-diary-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
