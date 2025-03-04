// types/index.ts
export interface VideoMetadata {
  id: string;
  name: string;
  description: string;
  uri: string;
  duration: number;
  createdAt: string;
}

export interface CropSettings {
  startTime: number;
  endTime: number;
}
