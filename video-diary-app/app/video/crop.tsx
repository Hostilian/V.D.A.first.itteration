import { Ionicons } from '@expo/vector-icons';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import VideoScrubber from '../../components/VideoScrubber';
import useVideoProcessing from '../../hooks/useVideoProcessing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function VideoCropScreen() {
  const router = useRouter();
  const videoRef = useRef<React.ComponentRef<typeof ExpoVideo>>(null);

  // State for video selection and cropping
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);

  // Animation values
  const headerOpacity = useSharedValue(1);
  const footerTranslateY = useSharedValue(0);

  // Video processing hook with TanStack Query
  const {
    cropVideo: processCropVideo,
    isProcessing,
    progress,
  } = useVideoProcessing({
    onSuccess: (result) => {
      router.push({
        pathname: '/video/metadata',
        params: {
          videoUri: result.videoUri,
          thumbnailUri: result.thumbnailUri || undefined,
          duration: result.duration,
        },
      } as any);
    },
  });

  // Select video from device
  const selectVideo = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant media library permissions to select videos');
        return;
      }

      // Pick video
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        setIsVideoLoaded(false);
        setStartTime(0);
        setEndTime(5);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to select video');
    }
  };

  // Handle video load event
  const handleVideoLoad = (status: any) => {
    if (status.durationMillis) {
      const duration = status.durationMillis / 1000;
      setVideoDuration(duration);
      setIsVideoLoaded(true);

      // Set initial end time based on video duration
      if (duration < 5) {
        setEndTime(duration);
        Alert.alert(
          'Video Too Short',
          'This video is shorter than 5 seconds. The entire video will be used.'
        );
      } else {
        setEndTime(Math.min(5, duration));
      }
    }
  };

  // Handle UI visibility toggling
  const toggleUIVisibility = () => {
    const isVisible = headerOpacity.value === 1;
    headerOpacity.value = withTiming(isVisible ? 0 : 1, { duration: 300 });
    footerTranslateY.value = withTiming(isVisible ? 100 : 0, { duration: 300 });
  };

  // Handle start and end time changes from scrubber
  const handleStartTimeChange = useCallback((time: number) => {
    setStartTime(time);
  }, []);

  const handleEndTimeChange = useCallback((time: number) => {
    setEndTime(time);
  }, []);

  // Handle video duration from scrubber
  const handleVideoDurationChange = useCallback((duration: number) => {
    setVideoDuration(duration);
  }, []);

  // Process the video crop operation
  const handleCropVideo = () => {
    if (!videoUri) {
      Alert.alert('Error', 'Please select a video first');
      return;
    }

    // Verify segment duration
    const segmentDuration = endTime - startTime;
    if (segmentDuration !== 5 && videoDuration >= 5) {
      Alert.alert(
        'Invalid Segment',
        'Please select exactly 5 seconds of video',
        [{ text: 'OK' }]
      );
      return;
    }

    // Process the crop operation
    processCropVideo({ videoUri, startTime, endTime });
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const footerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: footerTranslateY.value }],
    opacity: headerOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Crop Video</Text>
        <TouchableOpacity style={styles.actionButton} onPress={selectVideo}>
          <Ionicons name="refresh" size={24} color="#4285F4" />
        </TouchableOpacity>
      </Animated.View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        {videoUri ? (
          <>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.videoWrapper}
              onPress={toggleUIVisibility}
            >
              <ExpoVideo
                ref={videoRef}
                source={{ uri: videoUri }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                onLoad={handleVideoLoad}
                useNativeControls={false}
                shouldPlay={false}
              />
            </TouchableOpacity>

            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.processingText}>Processing video...</Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${progress * 100}%` }
                    ]}
                  />
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="videocam" size={64} color="#cccccc" />
            <Text style={styles.placeholderText}>No video selected</Text>
            <TouchableOpacity style={styles.selectButton} onPress={selectVideo}>
              <Text style={styles.selectButtonText}>Select Video</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Footer */}
      <Animated.View style={[styles.footer, footerAnimatedStyle]}>
        <VideoScrubber
          videoUri={videoUri}
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={handleStartTimeChange}
          onEndTimeChange={handleEndTimeChange}
          onDurationChange={handleVideoDurationChange}
        />
        <TouchableOpacity
          style={styles.cropButton}
          onPress={handleCropVideo}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.cropButtonText}>Crop Video</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  actionButton: {
    padding: 8,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWrapper: {
    width: SCREEN_WIDTH,
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
  },
  video: {
    flex: 1,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#ffffff',
    marginTop: 8,
  },
  progressBarContainer: {
    width: '80%',
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4285F4',
    borderRadius: 2,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#cccccc',
    marginTop: 16,
  },
  selectButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  cropButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  cropButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
