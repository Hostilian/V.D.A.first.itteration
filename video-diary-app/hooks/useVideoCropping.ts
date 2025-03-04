import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Dimensions } from 'react-native';
import ffmpegService from '../services/ffmpeg';
import { useVideoStore } from '../store/videoStore';
import { debounce } from 'lodash';

// Types for crop parameters
interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropResult {
  uri: string;
  width: number;
  height: number;
  isProcessing: boolean;
}

// Constant for minimum crop dimensions
const MIN_CROP_DIMENSION = 100;

export const useVideoCropping = (videoUri: string | null) => {
  const [cropRegion, setCropRegion] = useState<CropRegion | null>(null);
  const [result, setResult] = useState<CropResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });

  // Store the current video URI to track changes
  const videoUriRef = useRef(videoUri);

  // Get screen dimensions for responsive calculations
  const screenDimensions = useMemo(() => {
    return Dimensions.get('window');
  }, []);

  // Access video caching from store
  const { addProcessedVideo, getProcessedVideo } = useVideoStore(state => ({
    addProcessedVideo: state.addProcessedVideo,
    getProcessedVideo: state.getProcessedVideo
  }));

  // Initialize video dimensions when URI changes
  useEffect(() => {
    const loadVideoDimensions = async () => {
      if (videoUri) {
        try {
          const info = await ffmpegService.getVideoInfo(videoUri);
          if (info && info.streams && info.streams[0]) {
            const { width, height } = info.streams[0];
            setOriginalDimensions({ width, height });

            // Set default crop region to center of video with suitable dimensions
            const defaultWidth = Math.min(width, height) * 0.8;
            setCropRegion({
              x: Math.floor((width - defaultWidth) / 2),
              y: Math.floor((height - defaultWidth) / 2),
              width: Math.floor(defaultWidth),
              height: Math.floor(defaultWidth)
            });
          }
        } catch (err) {
          console.error('Failed to load video dimensions:', err);
          setError('Failed to load video dimensions');
        }
      }
    };

    // Only load dimensions if the video URI has changed
    if (videoUri !== videoUriRef.current) {
      videoUriRef.current = videoUri;
      setResult(null);
      loadVideoDimensions();
    }
  }, [videoUri]);

  // Memoized crop key for caching
  const cropCacheKey = useMemo(() => {
    if (!videoUri || !cropRegion) return null;
    return `${videoUri}:${cropRegion.x},${cropRegion.y},${cropRegion.width},${cropRegion.height}`;
  }, [videoUri, cropRegion]);

  // Check cache before processing
  useEffect(() => {
    if (cropCacheKey) {
      const cached = getProcessedVideo(cropCacheKey);
      if (cached) {
        setResult({
          uri: cached.uri,
          width: cropRegion?.width || 0,
          height: cropRegion?.height || 0,
          isProcessing: false
        });
      }
    }
  }, [cropCacheKey, getProcessedVideo]);

  // Calculate scale factor between display and actual video dimensions
  const calculateScaleFactor = useCallback(() => {
    if (originalDimensions.width === 0 || originalDimensions.height === 0) {
      return 1;
    }

    const displayWidth = Math.min(screenDimensions.width, screenDimensions.height * (originalDimensions.width / originalDimensions.height));
    return originalDimensions.width / displayWidth;
  }, [originalDimensions, screenDimensions]);

  // Update crop region with debouncing to prevent too many updates
  const debouncedSetCropRegion = useCallback(
    debounce((region: CropRegion) => {
      setCropRegion(region);
    }, 100),
    []
  );

  // Handler for crop region changes from UI
  const updateCropRegion = useCallback((region: CropRegion) => {
    // Validate minimum dimensions
    if (region.width < MIN_CROP_DIMENSION || region.height < MIN_CROP_DIMENSION) {
      return;
    }

    // Ensure region is within bounds
    const boundedRegion = {
      x: Math.max(0, region.x),
      y: Math.max(0, region.y),
      width: Math.min(originalDimensions.width - region.x, region.width),
      height: Math.min(originalDimensions.height - region.y, region.height)
    };

    debouncedSetCropRegion(boundedRegion);
  }, [originalDimensions, debouncedSetCropRegion]);

  // Convert UI coordinates to actual video coordinates
  const convertToVideoCoordinates = useCallback((uiRegion: CropRegion): CropRegion => {
    const scale = calculateScaleFactor();
    return {
      x: Math.floor(uiRegion.x * scale),
      y: Math.floor(uiRegion.y * scale),
      width: Math.floor(uiRegion.width * scale),
      height: Math.floor(uiRegion.height * scale)
    };
  }, [calculateScaleFactor]);

  // Process crop operation with memoization
  const processCrop = useCallback(async () => {
    if (!videoUri || !cropRegion) {
      setError('Video or crop region is not defined');
      return null;
    }

    // Check cache first
    if (cropCacheKey) {
      const cached = getProcessedVideo(cropCacheKey);
      if (cached) {
        setResult({
          uri: cached.uri,
          width: cropRegion.width,
          height: cropRegion.height,
          isProcessing: false
        });
        return cached.uri;
      }
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Convert display coordinates to actual video coordinates
      const videoCropRegion = convertToVideoCoordinates(cropRegion);

















































export default useVideoCropping;};  };    error    isProcessing,    result,    originalDimensions,    processCrop,    updateCropRegion,    cropRegion,  return {  }, []);    };      ffmpegService.cancelOperation();      // Cancel any ongoing operations when the component unmounts    return () => {  useEffect(() => {  // Cleanup function  }, [videoUri, cropRegion, cropCacheKey, convertToVideoCoordinates, getProcessedVideo, addProcessedVideo]);    }      setIsProcessing(false);    } finally {      return null;      setError('Failed to crop video');      console.error('Video cropping failed:', err);    } catch (err) {      return outputUri;            }        addProcessedVideo(cropCacheKey, { uri: outputUri });      if (cropCacheKey) {      // Add to cache            setResult(newResult);      };        isProcessing: false        height: cropRegion.height,        width: cropRegion.width,        uri: outputUri,      const newResult = {      // Update result state            const outputUri = await ffmpegService.cropVideo(videoUri, videoCropRegion);      // Process the video with FFmpeg
