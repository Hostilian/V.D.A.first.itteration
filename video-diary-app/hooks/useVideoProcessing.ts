// hooks/useVideoProcessing.ts
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert } from 'react-native';
import { cropVideo, extractThumbnail } from '../services/ffmpeg';

interface UseVideoProcessingProps {
  onSuccess?: (result: { videoUri: string; thumbnailUri: string | null; duration: number }) => void;
  onError?: (error: Error) => void;
}

export default function useVideoProcessing({ onSuccess, onError }: UseVideoProcessingProps = {}) {
  const [progress, setProgress] = useState(0);

  // Mutation for video cropping
  const cropMutation = useMutation({
    mutationFn: async ({
      videoUri,
      startTime,
      endTime,
    }: {
      videoUri: string;
      startTime: number;
      endTime: number;
    }) => {
      try {
        // Start processing
        setProgress(0.1);

        // Crop the video
        const cropResult = await cropVideo(videoUri, startTime, endTime);
        setProgress(0.7);

        if (!cropResult.success || !cropResult.outputPath) {
          throw new Error(cropResult.error || 'Failed to crop video');
        }

        // Generate thumbnail from the middle of the segment
        const thumbnailPosition = startTime + (endTime - startTime) / 2;
        const thumbnailUri = await extractThumbnail(cropResult.outputPath, thumbnailPosition);
        setProgress(1.0);

        return {
          videoUri: cropResult.outputPath,
          thumbnailUri,
          duration: cropResult.duration || (endTime - startTime),
        };
      } catch (error) {
        console.error('Video processing error:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      if (onSuccess) {
        onSuccess(result);
      }
    },
    onError: (error: Error) => {
      console.error('Video processing failed:', error);
      Alert.alert(






















}  };    reset: cropMutation.reset,    progress,    error: cropMutation.error,    isError: cropMutation.isError,    isSuccess: cropMutation.isSuccess,    isProcessing: cropMutation.isPending,    cropVideoAsync: cropMutation.mutateAsync,    cropVideo: cropMutation.mutate,  return {  });    },      }        onError(error);      if (onError) {      );        [{ text: 'OK' }]        'There was an error processing your video. Please try again.',        'Processing Failed',
