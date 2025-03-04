import { useCallback, useEffect, useState } from 'react';
import ffmpegService, { cropVideo } from '../services/ffmpeg';
import { CropRegion } from '../types/video';

interface VideoCroppingResult {
  uri: string;
  width: number;
  height: number;
}

export const useVideoCropping = (videoUri: string) => {
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [cropRegion, setCropRegion] = useState<CropRegion | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VideoCroppingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load video dimensions
    const getVideoDimensions = async () => {
      try {
        const videoInfo = await ffmpegService.getVideoInfo(videoUri);
        setOriginalDimensions({
          width: videoInfo.streams[0].width,
          height: videoInfo.streams[0].height
        });
      } catch (err) {
        setError('Failed to get video dimensions');
        console.error(err);
      }
    };

    getVideoDimensions();
  }, [videoUri]);

  const updateCropRegion = useCallback((region: CropRegion) => {
    setCropRegion(region);
  }, []);

  const processCrop = useCallback(async () => {
    if (!cropRegion) {
      setError('No crop region defined');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const croppedVideoUri = await cropVideo(videoUri, cropRegion);

      // Get dimensions of cropped video
      const croppedVideoInfo = await ffmpegService.getVideoInfo(croppedVideoUri);

      setResult({
        uri: croppedVideoUri,
        width: croppedVideoInfo.streams[0].width,
        height: croppedVideoInfo.streams[0].height
      });

    } catch (err: any) {
      setError(err.message || 'Failed to crop video');
      console.error('Crop processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [videoUri, cropRegion]);

  return {
    originalDimensions,
    updateCropRegion,
    processCrop,
    result,
    isProcessing,
    error
  };
};
