import React, { useState, useEffect, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Slider from '@react-native-community/slider';
import { Video, AVPlaybackStatus } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface VideoScrubberProps {
  videoUri?: string | null;
  startTime: number;
  endTime: number;
  minSegmentDuration?: number;
  maxDuration?: number | null;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  onVideoLoad?: (duration: number) => void;
  onDurationChange?: (duration: number) => void;
}

const VideoScrubber = forwardRef<Video, VideoScrubberProps>(
  ({
    videoUri,
    startTime,
    endTime,
    minSegmentDuration = 5,
    maxDuration = null,
    onStartTimeChange,
    onEndTimeChange,
    onVideoLoad,
    onDurationChange,
  }, ref) => {
    const [videoDuration, setVideoDuration] = useState(100); // Default duration
    const [currentPosition, setCurrentPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [localStartTime, setLocalStartTime] = useState(startTime);
    const [localEndTime, setLocalEndTime] = useState(endTime);

    // Update local state when props change
    useEffect(() => {
      setLocalStartTime(startTime);
    }, [startTime]);

    useEffect(() => {
      setLocalEndTime(endTime);
    }, [endTime]);

    // Animated values for highlight effect
    const highlightOpacity = useSharedValue(0);

    useEffect(() => {
      // Calculate segment duration when start or end time changes
      const segmentDuration = localEndTime - localStartTime;

      // Pulse animation if segment is 5 seconds
      if (Math.abs(segmentDuration - 5) < 0.1) {
        highlightOpacity.value = 1;
        setTimeout(() => {
          highlightOpacity.value = withTiming(0, { duration: 800 });
        }, 200);
      }
    }, [localStartTime, localEndTime]);

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
      if (!status.isLoaded || isDragging) return;

      if (status.positionMillis) {
        const position = status.positionMillis / 1000;
        setCurrentPosition(position);

        // Loop playback within selected segment
        if (isPlaying && position >= localEndTime) {
          seekToPosition(localStartTime);
        }
      }
    };

    const handleVideoLoad = (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;

      const duration = status.durationMillis ? status.durationMillis / 1000 : 0;
      setVideoDuration(duration);

      if (onVideoLoad) {
        onVideoLoad(duration);
      }

      if (onDurationChange) {
        onDurationChange(duration);
      }
    };

    const seekToPosition = async (timeInSeconds: number) => {
      if (ref && 'current' in ref && ref.current) {
        await ref.current.setPositionAsync(timeInSeconds * 1000);
      }
    };

    const handleStartTimeChange = (value: number) => {
      // Ensure start time doesn't exceed (end time - min segment duration)
      const maxStartTime = localEndTime - minSegmentDuration;
      const newStartTime = Math.min(value, maxStartTime);

      setLocalStartTime(newStartTime);
      onStartTimeChange(newStartTime);

      // Seek to the new start time
      seekToPosition(newStartTime);

      // Pause playback during scrubbing
      if (isPlaying) {
        setIsPlaying(false);
        if (ref && 'current' in ref && ref.current) {
          ref.current.pauseAsync();
        }
      }
    };

    const handleEndTimeChange = (value: number) => {
      // Ensure end time is at least (start time + min segment duration)
      const minEndTime = localStartTime + minSegmentDuration;
      const newEndTime = Math.max(value, minEndTime);

      setLocalEndTime(newEndTime);
      onEndTimeChange(newEndTime);

      // Seek to the new end time
      seekToPosition(newEndTime);

      // Pause playback during scrubbing
      if (isPlaying) {
        setIsPlaying(false);
        if (ref && 'current' in ref && ref.current) {
          ref.current.pauseAsync();
        }
      }
    };

    const togglePlayback = async () => {
      if (!ref || !('current' in ref) || !ref.current) return;

      const newIsPlaying = !isPlaying;
      setIsPlaying(newIsPlaying);

      if (newIsPlaying) {
        // If current position is outside selection, seek to start
        if (currentPosition < localStartTime || currentPosition >= localEndTime) {
          await seekToPosition(localStartTime);
        }
        await ref.current.playAsync();
      } else {
        await ref.current.pauseAsync();
      }
    };

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate positions for the selection highlight overlay as numbers (not strings)
    const getSelectionStyle = (): ViewStyle => {
      const startPercent = (localStartTime / Math.max(1, videoDuration)) * 100;
      const endPercent = (localEndTime / Math.max(1, videoDuration)) * 100;
      const widthPercent = endPercent - startPercent;

      return {
        left: `${startPercent}%` as any, // Cast to any to make TypeScript happy
        width: `${widthPercent}%` as any, // Cast to any to make TypeScript happy
      };
    };

    // Same for the progress indicator
    const getProgressIndicatorStyle = (): ViewStyle => {
      const positionPercent = (currentPosition / Math.max(1, videoDuration)) * 100;
      return {
        left: `${positionPercent}%` as any, // Cast to any to make TypeScript happy
      };
    };

    const animatedHighlightStyle = useAnimatedStyle(() => {
      return {
        opacity: highlightOpacity.value,
      };
    });

    return (
      <View style={styles.container}>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>Current: {formatTime(currentPosition)}</Text>
          <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
            <Text style={styles.playButtonText}>
              {isPlaying ? 'Pause' : 'Play'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.timeText}>Total: {formatTime(videoDuration)}</Text>
        </View>

        <View style={styles.scrubberContainer}>
          {/* Track background */}
          <View style={styles.trackBackground} />

          {/* Selection highlight */}
          <View style={[styles.selectionOverlay, getSelectionStyle()]} />

          {/* Animated highlight effect */}
          <Animated.View style={[styles.highlightEffect, getSelectionStyle(), animatedHighlightStyle]} />

          {/* Progress indicator */}
          <View
            style={[
              styles.progressIndicator,
              getProgressIndicatorStyle(),
            ]}
          />
        </View>

        <View style={styles.controlsContainer}>
          <Text style={styles.label}>Start: {formatTime(localStartTime)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={Math.max(0, videoDuration - minSegmentDuration)}
            value={localStartTime}
            onValueChange={handleStartTimeChange}
            onSlidingStart={() => setIsDragging(true)}
            onSlidingComplete={() => setIsDragging(false)}
            minimumTrackTintColor="#4285F4"
            maximumTrackTintColor="#CCCCCC"
            thumbTintColor="#4285F4"
            step={0.1}
          />

          <Text style={styles.label}>End: {formatTime(localEndTime)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={localStartTime + minSegmentDuration}
            maximumValue={videoDuration}
            value={localEndTime}
            onValueChange={handleEndTimeChange}
            onSlidingStart={() => setIsDragging(true)}
            onSlidingComplete={() => setIsDragging(false)}
            minimumTrackTintColor="#4285F4"
            maximumTrackTintColor="#CCCCCC"
            thumbTintColor="#4285F4"
            step={0.1}
          />

          <View style={styles.segmentInfo}>
            <Text style={styles.segmentDuration}>
              Selected Segment: {(localEndTime - localStartTime).toFixed(1)} seconds
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  playButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  playButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrubberContainer: {
    height: 24,
    marginVertical: 8,
    position: 'relative',
  },
  trackBackground: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    height: 8,
    backgroundColor: '#4285F4',
    borderRadius: 4,
  },
  highlightEffect: {
    position: 'absolute',
    top: 6,
    height: 12,
    backgroundColor: '#4285F4',
    borderRadius: 6,
  },
  progressIndicator: {
    position: 'absolute',
    top: 6,
    width: 3,
    height: 12,





























export default VideoScrubber;});  },    color: '#4285F4',    fontWeight: 'bold',    fontSize: 16,  segmentDuration: {  },    marginTop: 8,    alignItems: 'center',  segmentInfo: {  },    height: 40,    width: '100%',  slider: {  },    marginBottom: 4,    color: '#333',    fontSize: 14,  label: {  },    marginTop: 10,  controlsContainer: {  },    marginLeft: -1.5,    borderRadius: 1.5,    backgroundColor: '#ff3b30',
