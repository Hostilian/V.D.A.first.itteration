// store/videoStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { VideoMetadata } from '../types';

interface VideoState {
  videos: VideoMetadata[];
  addVideo: (video: VideoMetadata) => void;
  updateVideo: (id: string, data: Partial<VideoMetadata>) => void;
  deleteVideo: (id: string) => void;
  getVideo: (id: string) => VideoMetadata | undefined;
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      videos: [],
      addVideo: (video) => set((state) => ({
        videos: [...state.videos, video]
      })),
      updateVideo: (id, data) => set((state) => ({
        videos: state.videos.map((video) =>
          video.id === id ? { ...video, ...data } : video
        ),
      })),
      deleteVideo: (id) => set((state) => ({
        videos: state.videos.filter((video) => video.id !== id),
      })),
      getVideo: (id) => get().videos.find((video) => video.id === id),
    }),
    {
      name: 'video-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
