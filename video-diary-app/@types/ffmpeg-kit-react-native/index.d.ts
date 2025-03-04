declare module 'ffmpeg-kit-react-native' {
  export class FFmpegKit {
    static execute(command: string): Promise<any>;
  }
}
