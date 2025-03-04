declare module 'expo-av' {
  interface Video {
    pauseAsync(): Promise<void>;
    playAsync(): Promise<void>;
  }
}
