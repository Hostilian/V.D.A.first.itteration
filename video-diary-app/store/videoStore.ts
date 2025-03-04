import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { VideoMetadata } from '../types/video';

// Define the store state
interface VideoState {
  videos: Record<string, VideoMetadata>;
  loading: boolean;
  error: string | null;

  // Actions
  addVideo: (video: VideoMetadata) => void;
  updateVideo: (id: string, updates: Partial<VideoMetadata>) => void;
  deleteVideo: (id: string) => void;
  loadVideos: () => Promise<void>;
  clearCache: () => Promise<void>;
  saveVideos: () => Promise<void>; // Add missing method to the interface
}

export const useVideoStore = create<VideoState>((set, get) => ({
  videos: {},
  loading: false,
  error: null,

  addVideo: (video: VideoMetadata) => {
    set(state => ({
      videos: {
        ...state.videos,
        [video.id]: video
      }
    }));
    // Save to AsyncStorage
    get().saveVideos();
  },

  updateVideo: (id: string, updates: Partial<VideoMetadata>) => {
    set(state => {
      if (!state.videos[id]) return state;

      const updatedVideo = {
        ...state.videos[id],
        ...updates,
        modifiedAt: new Date()
      };

      return {
        videos: {
          ...state.videos,
          [id]: updatedVideo
        }
      };
    });
    // Save to AsyncStorage
    get().saveVideos();
  },

  deleteVideo: (id: string) => {
    set(state => {
      const newVideos = { ...state.videos };
      delete newVideos[id];
      return { videos: newVideos };
    });
    // Save to AsyncStorage
    get().saveVideos();
  },

  loadVideos: async () => {
    set({ loading: true, error: null });
    try {
      const videosJSON = await AsyncStorage.getItem('videos');
      if (videosJSON) {
        const parsedVideos = JSON.parse(videosJSON);
        // Convert dates back from strings
        Object.keys(parsedVideos).forEach(key => {
          if (parsedVideos[key].createdAt) {
            parsedVideos[key].createdAt = new Date(parsedVideos[key].createdAt);
          }
          if (parsedVideos[key].modifiedAt) {
            parsedVideos[key].modifiedAt = new Date(parsedVideos[key].modifiedAt);
          }
          if (parsedVideos[key].recordedAt) {
            parsedVideos[key].recordedAt = new Date(parsedVideos[key].recordedAt);
          }
        });
        set({ videos: parsedVideos });
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
      set({ error: 'Failed to load videos' });
    } finally {
      set({ loading: false });
    }
  },

  saveVideos: async () => {
    try {
      const { videos } = get();
      await AsyncStorage.setItem('videos', JSON.stringify(videos));
    } catch (error) {
      console.error('Failed to save videos:', error);
      set({ error: 'Failed to save videos' });
    }
  },

  clearCache: async () => {
    try {
      await AsyncStorage.removeItem('videos');
      set({ videos: {}, error: null });
    } catch (error) {
      console.error('Failed to clear cache:', error);
      set({ error: 'Failed to clear cache' });
    }
  }
}));

export default useVideoStore;
