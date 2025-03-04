import { useMutation } from '@tanstack/react-query';
import { compressVideo } from '../services/ffmpeg';
import { ProcessingResult } from '../types/video';

interface ProcessingOptions {
  quality?: 'high' | 'medium' | 'low';
  onProgress?: (progress: number) => void;
}

export const useVideoProcessing = () => {
  const mutation = useMutation<ProcessingResult, Error, { videoUri: string, options?: ProcessingOptions }>({
    mutationFn: async ({ videoUri, options }): Promise<ProcessingResult> => {
      try {
        // Process the video with the provided options
        const processedVideoPath = await compressVideo(
          videoUri,
          options?.quality || 'medium'
        );

        // Get video duration or other metadata if needed
        const videoDuration = 0; // You could get this from video info service

        return {
          success: true,
          outputPath: processedVideoPath,
          duration: videoDuration
        };
      } catch (error: any) {
        return {
          success: false,
          outputPath: '',
          error: error.message || 'Unknown error'
        };
      }
    }
  });

  return {
    processVideo: mutation.mutate,
    isProcessing: mutation.isPending,
    error: mutation.error,
    result: mutation.data
  };
};
