import 'expo-av';

declare module 'expo-av' {
  export interface Video {
    ref: any;
    playAsync(): Promise<AVPlaybackStatus>;
    pauseAsync(): Promise<AVPlaybackStatus>;
    unloadAsync(): Promise<AVPlaybackStatus>;
    setStatusAsync(status: Partial<AVPlaybackStatus>): Promise<AVPlaybackStatus>;
  }
}
