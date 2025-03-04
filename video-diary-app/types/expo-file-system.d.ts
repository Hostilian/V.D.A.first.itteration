import 'expo-file-system';

declare module 'expo-file-system' {
  interface FileInfo {
    modificationTime?: number;
  }
}
