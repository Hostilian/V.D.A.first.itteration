// hooks/useVideoProcessing.ts
import { useMutation } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import { useState } from 'react';
import { CropSettings } from '../types';

export const useVideoProcessing = () => {
  const [progress, setProgress] = useState(0);

  const cropVideo = async (videoUri: string, settings: CropSettings) => {
    const { startTime, endTime } = settings;
    const duration = endTime - startTime;

    // Create output path
    const outputFileName = `cropped-${new Date().getTime()}.mp4`;
    const outputPath = `${FileSystem.documentDirectory}${outputFileName}`;

    // Execute FFmpeg command to crop the video
    try {
      await FFmpegKit.execute(
        `-ss ${startTime} -i "${videoUri}" -t ${duration} -c:v mpeg4 "${outputPath}"`
      );

      return outputPath;
    } catch (error) {
      console.error('Error cropping video:', error);
      throw new Error('Failed to crop video');
    }
  };

  const cropVideoMutation = useMutation({
    mutationFn: ({ videoUri, settings }: { videoUri: string, settings: CropSettings }) =>
      cropVideo(videoUri, settings),
    onMutate: () => {
      setProgress(0);
    },
    onSuccess: () => {
      setProgress(100);
    },
    onError: () => {
      setProgress(0);
    }
  });

  return {
    cropVideo: cropVideoMutation.mutate,
    isProcessing: cropVideoMutation.isPending,
    progress,
    error: cropVideoMutation.error,
    data: cropVideoMutation.data,
  };
};
