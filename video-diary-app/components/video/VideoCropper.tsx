// components/video/VideoCropper.tsx
import { Video } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { CropSettings } from '../../types';

interface VideoCropperProps {
  videoUri: string;
  onCropSettingsChange: (settings: CropSettings) => void;
  maxDuration?: number;
}

export const VideoCropper: React.FC<VideoCropperProps> = ({
  videoUri,
  onCropSettingsChange,
  maxDuration = 5
}) => {
  const videoRef = useRef<Video>(null);
  const [duration, setDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Crop settings
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(maxDuration);

  // Animated values for the crop region
  const leftPosition = useSharedValue(0);
  const rightPosition = useSharedValue(100);

  useEffect(() => {
    // Update the crop settings whenever start/end time changes
    onCropSettingsChange({ startTime, endTime });
  }, [startTime, endTime, onCropSettingsChange]);

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      if (isLoading) setIsLoading(false);

      setDuration(status.durationMillis / 1000);
      setCurrentPosition(status.positionMillis / 1000);
      setIsPlaying(status.isPlaying);

      // Initialize end time once we know the duration
      if (status.durationMillis && endTime === maxDuration) {
        const newEndTime = Math.min(maxDuration, status.durationMillis / 1000);
        setEndTime(newEndTime);
        rightPosition.value = (newEndTime / (status.durationMillis / 1000)) * 100;
      }

      // Loop playback within the selected region
      if (status.positionMillis / 1000 >= endTime) {
        videoRef.current?.setPositionAsync(startTime * 1000);
      }
    }
  };

  const leftHandleStyle = useAnimatedStyle(() => {
    return {
      left: `${leftPosition.value}%`,
    };
  });

  const rightHandleStyle = useAnimatedStyle(() => {
    return {
      left: `${rightPosition.value}%`,
    };
  });

  const cropRegionStyle = useAnimatedStyle(() => {
    return {
      left: `${leftPosition.value}%`,
      width: `${rightPosition.value - leftPosition.value}%`,
    };
  });

  const handleLeftDrag = (newPosition: number) => {
    // Ensure new position is within bounds
    const boundedPosition = Math.max(0, Math.min(rightPosition.value - 5, newPosition));

    // Update the left position and start time
    leftPosition.value = withTiming(boundedPosition, { duration: 100 });
    const newStartTime = (boundedPosition / 100) * duration;
    setStartTime(newStartTime);

    // Update video position
    videoRef.current?.setPositionAsync(newStartTime * 1000);
  };

  const handleRightDrag = (newPosition: number) => {
    // Ensure the crop region doesn't exceed maxDuration
    const leftTimePosition = (leftPosition.value / 100) * duration;
    const maxRightPosition = ((leftTimePosition + maxDuration) / duration) * 100;
    const boundedMaxPosition = Math.min(100, maxRightPosition);

    // Ensure new position is within bounds
    const boundedPosition = Math.min(boundedMaxPosition, Math.max(leftPosition.value + 5, newPosition));

    // Update the right position and end time
    rightPosition.value = withTiming(boundedPosition, { duration: 100 });
    const newEndTime = (boundedPosition / 100) * duration;
    setEndTime(newEndTime);
  };

  return (
    <View className="w-full">
      <View className="w-full aspect-video rounded-lg overflow-hidden bg-gray-900">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="contain"
            shouldPlay={true}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            className="w-full h-full"
          />
        )}
      </View>

      <View className="mt-4">
        <View className="h-12 relative">
          {/* Scrubber track */}
          <View className="absolute top-4 left-0 right-0 h-2 bg-gray-300 rounded-full" />

          {/* Crop region */}
          <Animated.View
            className="absolute top-4 h-2 bg-blue-500 rounded-full"
            style={cropRegionStyle}
          />

          {/* Left handle */}
          <Animated.View
            className="absolute top-2 w-8 h-8 bg-blue-700 rounded-full -ml-4 items-center justify-center"
            style={leftHandleStyle}
          >
            <View className="w-1 h-4 bg-white rounded-full" />
          </Animated.View>

          {/* Right handle */}
          <Animated.View
            className="absolute top-2 w-8 h-8 bg-blue-700 rounded-full -ml-4 items-center justify-center"
            style={rightHandleStyle}
          >
            <View className="w-1 h-4 bg-white rounded-full" />
          </Animated.View>
        </View>

        <View className="flex-row justify-between mt-2">
          <Text className="text-sm text-gray-600">
            {startTime.toFixed(1)}s
          </Text>
          <Text className="text-sm text-gray-600">
            {endTime.toFixed(1)}s ({(endTime - startTime).toFixed(1)}s)
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row justify-between">
        <Pressable
          className="px-4 py-2 bg-gray-200 rounded-md"
          onPress={() => {
            videoRef.current?.setPositionAsync(startTime * 1000);
            videoRef.current?.playAsync();
          }}
        >
          <Text>Play Selection</Text>
        </Pressable>

        <Text className="self-center text-gray-600">
          {isPlaying ? 'Playing' : 'Paused'} - {currentPosition.toFixed(1)}s
        </Text>
      </View>
    </View>
  );
};
