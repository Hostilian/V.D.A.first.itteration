declare module 'expo-av' {
  interface Video {
    pauseAsync(): Promise<void>;
    playAsync(): Promise<void>;
  }
}

export interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: Date;
  modifiedAt: Date;
  recordedAt?: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  uri: string;
  duration?: number;
}

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProcessingResult {
  success: boolean;
  outputPath: string;
  duration?: number;
  error?: string;
}
