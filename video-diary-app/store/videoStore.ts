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
  updateVideo: (id: string, video: Partial<Omit<VideoEntry, 'id' | 'createdAt'>>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  setCurrentVideo: (id: string | null) => void;
}

// Configuration for AsyncStorage persistence
const storageConfig = {
  name: 'video-diary-storage',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state: VideoState) => ({
    videos: state.videos
  }),
};

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

          // Save to SQLite database
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

          // Update state
          const videos = [...get().videos, newVideo];
          set({ videos, isLoading: false });

          console.log('Video added successfully:', newVideo.id);
        } catch (error) {
          console.error('Error adding video:', error);
          set({ isLoading: false });
          throw error; // Re-throw to handle in the UI
        }
      },

      updateVideo: async (id, videoData) => {
        set({ isLoading: true });
        try {
          const currentVideo = get().videos.find(v => v.id === id);

          if (!currentVideo) {
            throw new Error('Video not found');
          }

          const updatedVideo = {
            ...currentVideo,
            ...videoData,
          };

          // Update in database
          const fields = Object.keys(videoData);
          let query = 'UPDATE videos SET ';
          query += fields.map(field => `${field} = ?`).join(', ');
          query += ' WHERE id = ?';

          const values = [...fields.map(field => videoData[field as keyof typeof videoData]), id];

          await executeQuery(query, values);

          // Update in state
          const videos = get().videos.map(v =>
            v.id === id ? updatedVideo : v
          );

          set({
            videos,
            isLoading: false,
            currentVideo: id === get().currentVideo?.id ? updatedVideo : get().currentVideo
          });
        } catch (error) {
          console.error('Error updating video:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      deleteVideo: async (id) => {
        set({ isLoading: true });
        try {
          // Delete from database
          await executeQuery('DELETE FROM videos WHERE id = ?', [id]);

          // Delete from state
          const videos = get().videos.filter((video) => video.id !== id);

          // Reset current video if it was the one deleted
          const currentVideo = get().currentVideo && get().currentVideo.id === id
            ? null
            : get().currentVideo;

          set({ videos, currentVideo, isLoading: false });
        } catch (error) {
          console.error('Error deleting video:', error);
          set({ isLoading: false });
          throw error;
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
    storageConfig
  )
);
