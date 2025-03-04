import { useMutation } from '@tanstack/react-query';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useVideoStore } from '../store/videoStore';
import { cropVideo } from '../utils/video-processing';

type CropStep = 'SELECT' | 'CROP' | 'METADATA';

export default function useVideoCropping(onSuccess: () => void) {
  // State
  const [currentStep, setCurrentStep] = useState<CropStep>('SELECT');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5); // Initial 5-second segment
  const [videoName, setVideoName] = useState('');
  const [videoDescription, setVideoDescription] = useState('');

  // References
  const videoRef = useRef<Video>(null);

  // Store
  const { addVideo } = useVideoStore();

  // TanStack Query mutation for video processing
  const cropVideoMutation = useMutation({
    mutationFn: async () => {
      if (!videoUri) throw new Error('No video selected');
      return await cropVideo(videoUri, startTime, endTime);
    },
    onSuccess: async (croppedVideoUri) => {
      try {
        await addVideo({
          name: videoName.trim() || 'Untitled Video',
          description: videoDescription,
          uri: croppedVideoUri,
          duration: endTime - startTime,
        });
        onSuccess();
      } catch (error) {
        console.error('Failed to save video', error);
        Alert.alert('Error', 'Failed to save the video. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Video crop error:', error);
      Alert.alert('Error', 'Failed to process the video. Please try again.');
    }
  });

  // Pick a video from the device
  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
      setIsVideoLoaded(false);
      setCurrentStep('CROP');
    }
  };

  // Video load handler
  const handleVideoLoad = (status: any) => {
    if (status.durationMillis) {
      const durationSeconds = status.durationMillis / 1000;
      setVideoDuration(durationSeconds);
      setEndTime(Math.min(startTime + 5, durationSeconds));
      setIsVideoLoaded(true);
    }
  };

  // Update video position during playback
  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && !status.isBuffering) {
      setCurrentPosition(status.positionMillis / 1000);
    }
  };

  // Seek to a specific position
  const seekTo = (timeInSeconds: number) => {
    if (videoRef.current) {
      videoRef.current.setPositionAsync(timeInSeconds * 1000);
    }
  };

  // Update startTime and ensure valid range
  const updateStartTime = (time: number) => {
    const newStartTime = Math.max(0, Math.min(time, videoDuration - 5));
    setStartTime(newStartTime);

    // Ensure endTime is at least 5 seconds after startTime, if possible
    if (endTime < newStartTime + 5) {
      setEndTime(Math.min(newStartTime + 5, videoDuration));
    }

    seekTo(newStartTime);
  };

  // Update endTime and ensure valid range
  const updateEndTime = (time: number) => {
    const newEndTime = Math.max(startTime + 5, Math.min(time, videoDuration));
    setEndTime(newEndTime);
    seekTo(newEndTime);
  };

  // Navigate between steps
  const goToNextStep = () => {
    if (currentStep === 'CROP') {
      setCurrentStep('METADATA');
    } else if (currentStep === 'METADATA') {
      cropVideoMutation.mutate();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 'CROP') {
      setCurrentStep('SELECT');
    } else if (currentStep === 'METADATA') {
      setCurrentStep('CROP');
    }
  };

  return {
    // State
    currentStep,
    videoUri,
    videoDuration,
    isVideoLoaded,
    currentPosition,
    startTime,
    endTime,
    videoName,
    videoDescription,
    videoRef,
    isProcessing: cropVideoMutation.isPending,

    // Actions
    pickVideo,
    handleVideoLoad,
    handlePlaybackStatusUpdate,
    updateStartTime,
    updateEndTime,
    goToNextStep,
    goToPreviousStep,
    setVideoName,
    setVideoDescription,

    // Helper derived values
    canProgress: currentStep !== 'CROP' || isVideoLoaded,
  };
}
