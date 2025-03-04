import create from 'zustand';
import { persist } from 'zustand/middleware';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Define interface for video metadata
interface VideoMetadata {
  id: string;
  uri: string;
  thumbnailUri?: string;
  duration?: number;
  createdAt: number;
  title?: string;
  tags?: string[];
  isProcessed?: boolean;
  processingProgress?: number;
}

// Define interface for processed video cache entry
interface ProcessedVideo {
  uri: string;
  createdAt: number;
}

// Define the store state interface
interface VideoState {
  // Collections
  videos: Record<string, VideoMetadata>;
  processedVideos: Record<string, ProcessedVideo>;
  selectedVideoId: string | null;

  // Processing state
  isProcessing: boolean;
  processingError: string | null;

  // Cache management
  cacheSize: number;
  maxCacheSize: number;

  // Actions
  addVideo: (video: VideoMetadata) => void;
  updateVideo: (id: string, updates: Partial<VideoMetadata>) => void;
  removeVideo: (id: string) => void;
  selectVideo: (id: string | null) => void;

  // Processed video cache management
  addProcessedVideo: (key: string, video: { uri: string }) => void;
  getProcessedVideo: (key: string) => ProcessedVideo | null;
  clearProcessedVideoCache: () => Promise<void>;

  // Batch operations for better performance
  addVideoBatch: (videos: VideoMetadata[]) => void;

  // Processing status updates
  setProcessingStatus: (isProcessing: boolean, error?: string | null) => void;
  updateProcessingProgress: (id: string, progress: number) => void;
}

// Cache directory path
const CACHE_DIRECTORY = `${FileSystem.cacheDirectory}processed-videos/`;

// Initialize cache directory
const ensureCacheDirectoryExists = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIRECTORY, { intermediates: true });
  }
};

// Calculate directory size
const calculateDirectorySize = async (directory: string): Promise<number> => {
  try {
    const files = await FileSystem.readDirectoryAsync(directory);

    let totalSize = 0;

    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${directory}${file}`);
      if (fileInfo.exists && !fileInfo.isDirectory) {
        totalSize += fileInfo.size || 0;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Failed to calculate directory size:', error);
    return 0;
  }
};

// Create the store with persistence
export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      // Initial state
      videos: {},
      processedVideos: {},
      selectedVideoId: null,
      isProcessing: false,
      processingError: null,
      cacheSize: 0,
      maxCacheSize: 500 * 1024 * 1024, // 500MB default max cache size

      // Add a new video to the store
      addVideo: (video: VideoMetadata) => {
        set(state => ({
          videos: {
            ...state.videos,
            [video.id]: video
          }
        }));
      },

      // Update an existing video
      updateVideo: (id: string, updates: Partial<VideoMetadata>) => {
        set(state => {
          const video = state.videos[id];
          if (!video) return state;

          return {
            videos: {
              ...state.videos,
              [id]: {
                ...video,
                ...updates
              }
            }
          };
        });
      },

      // Remove a video
      removeVideo: (id: string) => {
        set(state => {
          const newVideos = { ...state.videos };
          delete newVideos[id];

          // Also clear selection if needed
          const newSelectedId = state.selectedVideoId === id ? null : state.selectedVideoId;

          return {
            videos: newVideos,
            selectedVideoId: newSelectedId
          };
        });
      },

      // Select a video
      selectVideo: (id: string | null) => set({ selectedVideoId: id }),

      // Add a processed video to cache
      addProcessedVideo: (key: string, video: { uri: string }) => {
        const processedVideo: ProcessedVideo = {
          uri: video.uri,
          createdAt: Date.now()
        };

        set(state => ({
          processedVideos: {
            ...state.processedVideos,
            [key]: processedVideo
          }
        }));

        // Update cache size asynchronously
        (async () => {
          try {
            const cacheSize = await calculateDirectorySize(CACHE_DIRECTORY);
            set({ cacheSize });

            // Clean cache if needed
            const { maxCacheSize } = get();
            if (cacheSize > maxCacheSize) {
              await get().clearOldCache(maxCacheSize * 0.7); // Clear down to 70% of max
            }
          } catch (error) {
            console.error('Failed to update cache size:', error);
          }
        })();
      },

      // Get a processed video from cache
      getProcessedVideo: (key: string) => {
        const { processedVideos } = get();
        const video = processedVideos[key];

        if (!video) return null;

        // Verify file still exists
        (async () => {
          const fileInfo = await FileSystem.getInfoAsync(video.uri);
          if (!fileInfo.exists) {
            // File doesn't exist, remove from cache
            set(state => {
              const newProcessedVideos = { ...state.processedVideos };
              delete newProcessedVideos[key];
              return { processedVideos: newProcessedVideos };
            });
            return null;
          }
        })();

        return video;
      },

      // Clear processed video cache
      clearProcessedVideoCache: async () => {
        try {
          await ensureCacheDirectoryExists();

          const files = await FileSystem.readDirectoryAsync(CACHE_DIRECTORY);

          for (const file of files) {
            await FileSystem.deleteAsync(`${CACHE_DIRECTORY}${file}`, { idempotent: true });
          }

          set({
            processedVideos: {},
            cacheSize: 0
          });
        } catch (error) {
          console.error('Failed to clear cache:', error);
        }
      },

      // Clear old cache entries to free space














































































































































export default useVideoStore;ensureCacheDirectoryExists().catch(console.error);// Initialize cache directory when module loads);  )    }      }),        maxCacheSize: state.maxCacheSize,        selectedVideoId: state.selectedVideoId,        videos: state.videos,      partialize: (state) => ({      // Only persist core video metadata, not the entire cache      }),        },          }            console.error('Failed to remove persisted state:', e);          } catch (e) {            }              localStorage.removeItem(name);            } else {              await FileSystem.deleteAsync(FileSystem.documentDirectory + name, { idempotent: true });            if (Platform.OS !== 'web') {          try {        removeItem: async (name) => {        },          }            return null;            console.error('Failed to load persisted state:', e);          } catch (e) {            }              return localStorage.getItem(name);            } else {              return null;              }                return await FileSystem.readAsStringAsync(FileSystem.documentDirectory + name);              if (exists.exists) {              const exists = await FileSystem.getInfoAsync(FileSystem.documentDirectory + name);            if (Platform.OS !== 'web') {          try {        getItem: async (name) => {        },          }            console.error('Failed to persist state:', e);          } catch (e) {            }              localStorage.setItem(name, value);            } else {              );                value                FileSystem.documentDirectory + name,              await FileSystem.writeAsStringAsync(            if (Platform.OS !== 'web') {          try {        setItem: async (name, value) => {        // In a real app, use AsyncStorage or other persistent storage        // This is a simplified storage adapter for React Native      getStorage: () => ({      name: 'video-store',    {    }),      }        });          };            }              }                isProcessed: progress >= 1 // Mark as processed when complete                processingProgress: progress,                ...video,              [id]: {              ...state.videos,            videos: {          return {                    if (!video) return state;          const video = state.videos[id];        set(state => {      updateProcessingProgress: (id: string, progress: number) => {      // Update processing progress for a specific video            },        set({ isProcessing, processingError: error });      setProcessingStatus: (isProcessing: boolean, error: string | null = null) => {      // Set processing status            },        }));          }            ...videoMap            ...state.videos,          videos: {        set(state => ({                });          videoMap[video.id] = video;        videos.forEach(video => {        const videoMap: Record<string, VideoMetadata> = {};      addVideoBatch: (videos: VideoMetadata[]) => {      // Add multiple videos at once for better performance            },        }          console.error('Failed to clear old cache:', error);        } catch (error) {          });            cacheSize: currentSize            processedVideos: newProcessedVideos,          set({                    }            }              console.error(`Failed to delete cache file ${entry.uri}:`, error);            } catch (error) {              delete newProcessedVideos[entry.key];              // Remove from cache object                            }                currentSize -= fileInfo.size || 0;                await FileSystem.deleteAsync(entry.uri, { idempotent: true });                // Delete file              if (fileInfo.exists) {              const fileInfo = await FileSystem.getInfoAsync(entry.uri);              // Get file size            try {                        if (currentSize <= targetSize) break;          for (const entry of entries) {          // Remove oldest entries until we get below target size                    const newProcessedVideos = { ...processedVideos };          let currentSize = get().cacheSize;                      .sort((a, b) => a.createdAt - b.createdAt);            .map(([key, value]) => ({ key, ...value }))          const entries = Object.entries(processedVideos)          // Convert to array and sort by creation date (oldest first)                    const { processedVideos } = get();        try {      clearOldCache: async (targetSize: number) => {
