import { MaterialIcons } from '@expo/vector-icons';
import { Video as ExpoVideo } from 'expo-av';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import { useVideoCropping } from '../../hooks/useVideoCropping';
import { cropParametersSchema } from '../../lib/validation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HANDLE_SIZE = 20;
const MIN_CROP_SIZE = 100;

interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VideoCroppingControlsProps {
  videoUri: string;
  onCropComplete: (croppedVideoUri: string) => void;
  onCancel: () => void;
}

export const VideoCroppingControls: React.FC<VideoCroppingControlsProps> = ({
  videoUri,
  onCropComplete,
  onCancel
}) => {
  // Video player reference
  const videoRef = useRef<ExpoVideo>(null);

  // Animation values
  const buttonOpacity = useSharedValue(0);
  const controlsVisible = useSharedValue(1);

  // Local state for the video dimensions
  const [videoLayout, setVideoLayout] = useState({ width: 0, height: 0 });
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [cropRegion, setCropRegion] = useState<CropRegion | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Use the enhanced video cropping hook
  const {
    originalDimensions,
    updateCropRegion,
    processCrop,
    result,
    isProcessing,
    error
  } = useVideoCropping(videoUri);

  // Set initial crop region when video dimensions are available
  useEffect(() => {
    if (videoLayout.width > 0 && videoLayout.height > 0 && originalDimensions.width > 0) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;

      // Calculate the displayed video dimensions within the layout
      let displayWidth, displayHeight;

      if (videoLayout.width / videoLayout.height > aspectRatio) {
        // Layout is wider than video
        displayHeight = videoLayout.height;
        displayWidth = displayHeight * aspectRatio;
      } else {
        // Layout is taller than video
        displayWidth = videoLayout.width;
        displayHeight = displayWidth / aspectRatio;
      }

      setVideoDimensions({ width: displayWidth, height: displayHeight });

      // Default crop region centered in the video with 80% of the smaller dimension
      const cropSize = Math.min(displayWidth, displayHeight) * 0.8;
      const newCropRegion = {
        x: (displayWidth - cropSize) / 2,
        y: (displayHeight - cropSize) / 2,
        width: cropSize,
        height: cropSize
      };

      setCropRegion(newCropRegion);

      // Convert display coordinates to actual video coordinates for the hook
      const scaleX = originalDimensions.width / displayWidth;
      const scaleY = originalDimensions.height / displayHeight;

      updateCropRegion({
        x: newCropRegion.x * scaleX,
        y: newCropRegion.y * scaleY,
        width: newCropRegion.width * scaleX,
        height: newCropRegion.height * scaleY
      });

      // Show buttons with animation
      buttonOpacity.value = withTiming(1, { duration: 500 });
    }
  }, [videoLayout, originalDimensions, buttonOpacity, updateCropRegion]);

  // Handle crop completion
  useEffect(() => {
    if (result && result.uri && !isProcessing) {
      // Provide success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onCropComplete(result.uri);
    }
  }, [result, onCropComplete, isProcessing]);

  // Error handling
  useEffect(() => {
    if (error) {
      // Provide error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error);
    }
  }, [error]);

  // Set up pan responders for crop handles
  const setupPanResponders = () => {
    if (!cropRegion) return {};

    // Create different pan handlers for each corner and edge
    const createPanResponder = (handlePosition: string) => {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          // Provide haptic feedback when starting to drag
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

          // Hide video controls when dragging
          controlsVisible.value = withTiming(0, { duration: 200 });

          // Pause video while cropping
          if (videoRef.current) {
            videoRef.current.pauseAsync();
            setIsPlaying(false);
          }
        },
        onPanResponderMove: (_, gestureState) => {
          if (!cropRegion) return;

          const { dx, dy } = gestureState;
          let newCrop = { ...cropRegion };

          // Update the crop region based on which handle is being dragged
          switch (handlePosition) {
            case 'topLeft':
              newCrop = {
                x: cropRegion.x + dx,
                y: cropRegion.y + dy,
                width: cropRegion.width - dx,
                height: cropRegion.height - dy
              };
              break;
            case 'topRight':
              newCrop = {
                x: cropRegion.x,
                y: cropRegion.y + dy,
                width: cropRegion.width + dx,
                height: cropRegion.height - dy
              };
              break;
            case 'bottomRight':
              newCrop = {
                x: cropRegion.x,
                y: cropRegion.y,
                width: cropRegion.width + dx,
                height: cropRegion.height + dy
              };
              break;
            case 'bottomLeft':
              newCrop = {
                x: cropRegion.x + dx,
                y: cropRegion.y,
                width: cropRegion.width - dx,
                height: cropRegion.height + dy
              };
              break;
            case 'top':
              newCrop = {
                x: cropRegion.x,
                y: cropRegion.y + dy,
                width: cropRegion.width,
                height: cropRegion.height - dy
              };
              break;
            case 'right':
              newCrop = {
                x: cropRegion.x,
                y: cropRegion.y,
                width: cropRegion.width + dx,
                height: cropRegion.height
              };
              break;
            case 'bottom':
              newCrop = {
                x: cropRegion.x,
                y: cropRegion.y,
                width: cropRegion.width,
                height: cropRegion.height + dy
              };
              break;
            case 'left':
              newCrop = {
                x: cropRegion.x + dx,
                y: cropRegion.y,
                width: cropRegion.width - dx,
                height: cropRegion.height
              };
              break;
            case 'move':
              newCrop = {
                x: cropRegion.x + dx,
                y: cropRegion.y + dy,
                width: cropRegion.width,
                height: cropRegion.height
              };
              break;
          }

          // Validate the new crop region size
          if (newCrop.width >= MIN_CROP_SIZE && newCrop.height >= MIN_CROP_SIZE) {
            // Keep the crop region within the video boundaries
            if (newCrop.x >= 0 &&
                newCrop.y >= 0 &&
                newCrop.x + newCrop.width <= videoDimensions.width &&
                newCrop.y + newCrop.height <= videoDimensions.height) {
              setCropRegion(newCrop);

              // Convert to actual video coordinates and update the hook
              const scaleX = originalDimensions.width / videoDimensions.width;
              const scaleY = originalDimensions.height / videoDimensions.height;

              updateCropRegion({
                x: newCrop.x * scaleX,
                y: newCrop.y * scaleY,
                width: newCrop.width * scaleX,
                height: newCrop.height * scaleY
              });
            }
          }
        },
        onPanResponderRelease: () => {
          // Provide haptic feedback when ending the drag
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

          // Show video controls again
          controlsVisible.value = withTiming(1, { duration: 300 });

          // Validate crop region with schema
          if (cropRegion) {
            try {
              cropParametersSchema.parse({
                x: cropRegion.x,
                y: cropRegion.y,
                width: cropRegion.width,
                height: cropRegion.height
              });
            } catch (error) {
              // If validation fails, reset crop to default
              console.error('Invalid crop parameters:', error);
            }
          }
        }
      });
    };

    return {
      topLeft: createPanResponder('topLeft'),
      topRight: createPanResponder('topRight'),
      bottomLeft: createPanResponder('bottomLeft'),
      bottomRight: createPanResponder('bottomRight'),
      top: createPanResponder('top'),
      right: createPanResponder('right'),
      bottom: createPanResponder('bottom'),
      left: createPanResponder('left'),
      move: createPanResponder('move')
    };
  };

  const panResponders = setupPanResponders();

  // Handle video layout changes
  const handleVideoLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setVideoLayout({ width, height });
  };

  // Handle video playback
  const togglePlayback = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Handle crop action
  const handleCrop = async () => {
    // Validate crop region exists
    if (!cropRegion) {
      Alert.alert('Error', 'Unable to determine crop region');
      return;
    }

    // Provide haptic feedback before processing
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Process the crop
    await processCrop();
  };

  // Animated styles for UI elements
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value
    };
  });

  const controlsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: controlsVisible.value
    };
  });

  // Helper to check if panResponders are ready
  const arePanRespondersReady = () => {
    return cropRegion && panResponders.topLeft;
  };

  // Render crop overlay
  const renderCropOverlay = () => {
    if (!cropRegion) return null;

    const { x, y, width, height } = cropRegion;

    return (
      <View style={[StyleSheet.absoluteFill, styles.cropOverlayContainer]}>
        {/* Semi-transparent overlay */}
        <Svg height="100%" width="100%">
          <Defs>
            <Mask id="mask" x="0" y="0" width="100%" height="100%">
              <Rect x="0" y="0" width="100%" height="100%" fill="white" />
              <Rect x={x} y={y} width={width} height={height} fill="black" />
            </Mask>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" mask="url(#mask)" />
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            strokeWidth={2}
            stroke="#fff"
            fill="transparent"
          />
        </Svg>

        {/* Crop handles */}
        {arePanRespondersReady() && (
          <>
            {/* Corner handles */}
            <View
              style={[styles.handle, { left: x - HANDLE_SIZE/2, top: y - HANDLE_SIZE/2 }]}
              {...panResponders.topLeft?.panHandlers}
            />
            <View
              style={[styles.handle, { right: videoDimensions.width - (x + width) - HANDLE_SIZE/2, top: y - HANDLE_SIZE/2 }]}
              {...panResponders.topRight?.panHandlers}
            />
            <View
              style={[styles.handle, { left: x - HANDLE_SIZE/2, bottom: videoDimensions.height - (y + height) - HANDLE_SIZE/2 }]}
              {...panResponders.bottomLeft?.panHandlers}
            />
            <View
              style={[styles.handle, { right: videoDimensions.width - (x + width) - HANDLE_SIZE/2, bottom: videoDimensions.height - (y + height) - HANDLE_SIZE/2 }]}
              {...panResponders.bottomRight?.panHandlers}
            />

            {/* Edge handles */}
            <View
              style={[styles.edgeHandle, styles.topEdge, { left: x + HANDLE_SIZE, width: width - HANDLE_SIZE * 2 }]}
              {...panResponders.top?.panHandlers}
            />
            <View
              style={[styles.edgeHandle, styles.rightEdge, { top: y + HANDLE_SIZE, height: height - HANDLE_SIZE * 2 }]}
              {...panResponders.right?.panHandlers}
            />
            <View
              style={[styles.edgeHandle, styles.bottomEdge, { left: x + HANDLE_SIZE, width: width - HANDLE_SIZE * 2 }]}
              {...panResponders.bottom?.panHandlers}
            />
            <View
              style={[styles.edgeHandle, styles.leftEdge, { top: y + HANDLE_SIZE, height: height - HANDLE_SIZE * 2 }]}
              {...panResponders.left?.panHandlers}
            />

            {/* Center move area */}
            <View
              style={[styles.moveArea, { left: x, top: y, width, height }]}
              {...panResponders.move?.panHandlers}
            />
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Video player */}
      <View style={styles.videoContainer} onLayout={handleVideoLayout}>
        <ExpoVideo
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode="contain"
          shouldPlay={false}
          isLooping
          useNativeControls={false}
          onPlaybackStatusUpdate={(status) => {
            // Handle playback status changes if needed
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
            }
          }}
        />

        {/* Crop overlay */}
        {renderCropOverlay()}

        {/* Playback controls */}
        <Animated.View style={[styles.playbackControls, controlsAnimatedStyle]}>
          <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
            <MaterialIcons
              name={isPlaying ? "pause" : "play-arrow"}
              size={40}
              color="white"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Action buttons */}
      <Animated.View style={[styles.actionButtonsContainer, buttonAnimatedStyle]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onCancel();
          }}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.cropButton,
            isProcessing && styles.disabledButton
          ]}
          onPress={handleCrop}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Crop Video</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Instructions */}
      <Animated.View style={[styles.instructionsContainer, buttonAnimatedStyle]}>
        <Text style={styles.instructionsText}>
          Drag the handles to adjust the crop region
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cropOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: 'white',
    borderColor: '#0066ff',
    borderWidth: 2,
    zIndex: 2,
  },
  edgeHandle: {
    position: 'absolute',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  topEdge: {
    height: 20,
    top: -10,
  },
  rightEdge: {
    width: 20,
    right: -10,
  },
  bottomEdge: {
    height: 20,
    bottom: -10,
  },
  leftEdge: {
    width: 20,
    left: -10,
  },
  moveArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  playbackControls: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  cancelButton: {
    backgroundColor: '#ff4d4d',
  },
  cropButton: {
    backgroundColor: '#4caf50',
  },
  disabledButton: {
    backgroundColor: '#888',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
  instructionsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
  },
});

export default VideoCroppingControls;
