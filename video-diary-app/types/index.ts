// types/index.ts
// Define common types used across the app

export interface VideoMetadata {
  id: string;
  name: string;
  description: string;
  uri: string;
  duration: number; // in seconds
  createdAt: string;
}

export interface CropSettings {
  startTime: number; // in seconds
  endTime: number; // in seconds
}

export interface VideoProcessingOptions {
  videoUri: string;
  settings: CropSettings;
}
