declare module 'ffmpeg-kit-react-native' {
  export interface FFmpegKitConfig {
    enableRedirection(): Promise<void>;
    setLogLevel(level: number): void;
    cancelRunningProcesses(): Promise<void>;
  }

  export interface FFmpegKit {
    executeAsync(command: string): Promise<FFmpegSession>;
  }

  export interface FFmpegSession {
    getReturnCode(): Promise<ReturnCode>;
    getOutput(): Promise<string>;
  }

  export interface ReturnCode {
    isSuccess(): boolean;
  }

  export const Level: {
    AV_LOG_WARNING: number;
  };
}
