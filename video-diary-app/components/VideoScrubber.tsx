import Slider from '@react-native-community/slider';
import { AVPlaybackStatus, Video } from 'expo-av';
import React, { forwardRef, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

interface VideoScrubberProps {
  videoUri: string;
  minSegmentDuration: number;
  maxDuration: number | null;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  onVideoLoad: (duration: number) => void;
}

const VideoScrubber = forwardRef<Video, VideoScrubberProps>(
  ({ videoUri, minSegmentDuration = 5, maxDuration = null, onStartTimeChange, onEndTimeChange, onVideoLoad }, ref) => {
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(minSegmentDuration);
    const [isDragging, setIsDragging] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Animated values for highlight effect
    const highlightOpacity = useSharedValue(0);

    useEffect(() => {
      // Show highlight effect when selection changes
      highlightOpacity.value = withTiming(0.3, { duration: 300 });

      // Hide highlight after a short delay
      const timer = setTimeout(() => {
        highlightOpacity.value = withTiming(0, { duration: 300 });
      }, 1000);

      return () => clearTimeout(timer);
    }, [startTime, endTime]);

    const highlightStyle = useAnimatedStyle(() => {
      return {
        opacity: highlightOpacity.value,
      };
    });

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
      if (!status.isLoaded || isDragging) return;

      if (status.positionMillis) {
        const position = status.positionMillis / 1000;
        setCurrentPosition(position);

        // Loop playback within selected segment
        if (isPlaying && position >= endTime) {
          seekToPosition(startTime);
        }
      }
    };

    const handleVideoLoad = (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;

      const duration = status.durationMillis ? status.durationMillis / 1000 : 0;
      setVideoDuration(duration);

      // Initialize end time based on duration and constraints
      const initialEndTime = Math.min(
        startTime + minSegmentDuration,
        maxDuration ? Math.min(maxDuration, duration) : duration
      );
      setEndTime(initialEndTime);

      // Notify parent component
      onVideoLoad(duration);
    };

    const seekToPosition = async (timeInSeconds: number) => {
      if (ref && 'current' in ref && ref.current) {
        await ref.current.setPositionAsync(timeInSeconds * 1000);
      }
    };

    const handleStartTimeChange = (value: number) => {
      // Ensure start time doesn't exceed (end time - min segment duration)
      const maxStartTime = endTime - minSegmentDuration;
      const newStartTime = Math.min(value, maxStartTime);

      setStartTime(newStartTime);
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
      const minEndTime = startTime + minSegmentDuration;
      const newEndTime = Math.max(value, minEndTime);

      setEndTime(newEndTime);
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
        if (currentPosition < startTime || currentPosition >= endTime) {
          await seekToPosition(startTime);
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

    // Calculate positions for the selection highlight overlay
    const getSelectionStyle = () => {
      const startPercent = (startTime / videoDuration) * 100;
      const endPercent = (endTime / videoDuration) * 100;
      const widthPercent = endPercent - startPercent;

      return {
        left: `${startPercent}%`,
        width: `${widthPercent}%`,
      };
    };

    return (
      <View style={styles.container}>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>Current: {formatTime(currentPosition)}</Text>
          <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
            <Text style={styles.playButtonText}>
              {isPlaying ? 'Pause' : 'Play Selection'}
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
          <Animated.View style={[styles.highlightEffect, getSelectionStyle(), highlightStyle]} />

          {/* Progress indicator */}
          <View
            style={[
              styles.progressIndicator,
              { left: `${(currentPosition / videoDuration) * 100}%` },
            ]}
          />
        </View>

        <View style={styles.controlsContainer}>
          <Text style={styles.label}>Start: {formatTime(startTime)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={Math.max(0, videoDuration - minSegmentDuration)}
            value={startTime}
            onValueChange={handleStartTimeChange}
            onSlidingStart={() => setIsDragging(true)}
            onSlidingComplete={() => setIsDragging(false)}
            minimumTrackTintColor="#4285F4"
            maximumTrackTintColor="#CCCCCC"
            thumbTintColor="#4285F4"
            step={0.1}
          />

          <Text style={styles.label}>End: {formatTime(endTime)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={startTime + minSegmentDuration}
            maximumValue={videoDuration}
            value={endTime}
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
              Selected Segment: {(endTime - startTime).toFixed(1)} seconds
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
    backgroundColor: '#ff3b30',
    borderRadius: 1.5,
    marginLeft: -1.5,
  },
  controlsContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  segmentInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  segmentDuration: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
  },
});

export default VideoScrubber;
