import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Audio from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { videoFileSchema } from '../../lib/validation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMBNAIL_SIZE = SCREEN_WIDTH / 3 - 16;

interface VideoAsset {
  id: string;
  uri: string;
  duration?: number;
  filename?: string;
  mediaType: string;
  creationTime?: number;
  modificationTime?: number;
  albumId?: string;
}

interface EnhancedVideoPickerProps {
  onVideoSelect: (videoUri: string) => void;
  allowMultiple?: boolean;
  maxDuration?: number; // in seconds
}

export const EnhancedVideoPicker: React.FC<EnhancedVideoPickerProps> = ({
  onVideoSelect,
  allowMultiple = false,
  maxDuration = 600 // 10 minutes default
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [videos, setVideos] = useState<VideoAsset[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<MediaLibrary.PermissionStatus | null>(null);

  const navigation = useNavigation();

  // Animation values
  const buttonScale = useSharedValue(1);
  const headerOpacity = useSharedValue(0);

  // Refs
  const videoRef = useRef<Video>(null);

  const requestPermissions = useCallback(async () => {
    setLoading(true);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'This app needs access to your media library to select videos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {} /* Open settings */ }
          ]
        );
        setLoading(false);
        return;
      }

      await loadVideos();
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVideos = useCallback(async () => {
    setLoading(true);

    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.video,
        first: 50, // Load first 50 videos
        sortBy: MediaLibrary.SortBy.creationTime
      });

      setVideos(media.assets.map(asset => ({
        id: asset.id,
        uri: asset.uri,
        duration: asset.duration,
        filename: asset.filename,
        mediaType: asset.mediaType,
        creationTime: asset.creationTime,
        modificationTime: asset.modificationTime,
        albumId: asset.albumId
      })));

      // Animate header in
      headerOpacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.quad)
      });
    } catch (error) {
      console.error('Error loading videos:', error);
      Alert.alert('Error', 'Failed to load videos from your media library.');
    } finally {
      setLoading(false);
    }
  }, [headerOpacity]);

  const openGallery = useCallback(async () => {
    if (!permissionStatus || permissionStatus !== 'granted') {
      await requestPermissions();
    } else {
      setModalVisible(true);
      await loadVideos();
    }
  }, [permissionStatus, requestPermissions, loadVideos]);

  const requestMicrophonePermissions = async () => {
    const { status } = await Audio.Audio.requestPermissionsAsync();
    return status === 'granted';
  };

  const launchCamera = useCallback(async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'This app needs access to your camera to record videos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {} /* Open settings */ }
          ]
        );
        return;
      }

      const microphonePermission = await requestMicrophonePermissions();

      if (!microphonePermission) {
        Alert.alert(
          'Microphone Permission Required',
          'This app needs access to your microphone to record videos with audio.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {} /* Open settings */ }
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
        videoMaxDuration: maxDuration
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];

        // Validate the video
        try {
          const validationData = {
            uri: selectedAsset.uri,
            fileSize: selectedAsset.fileSize,
            mimeType: selectedAsset.mimeType || 'video/mp4',
            duration: selectedAsset.duration
          };

          videoFileSchema.parse(validationData);

          // Perform haptic feedback - success
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          onVideoSelect(selectedAsset.uri);

          // Navigate to cropping screen (assuming you have this route)
          navigation.navigate('/video/crop', { videoUri: selectedAsset.uri });
        } catch (error) {
          console.error('Video validation failed:', error);
          Alert.alert('Invalid Video', 'The recorded video does not meet the requirements.');

          // Perform haptic feedback - error
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
    }
  }, [maxDuration, navigation, onVideoSelect]);

  const handleSelectVideo = useCallback(async (video: VideoAsset) => {
    try {
      setSelectedVideo(video);

      // Validate video
      const asset = await MediaLibrary.getAssetInfoAsync(video.id);

      if (asset.duration && asset.duration > maxDuration) {
        Alert.alert('Video Too Long', `Please select a video shorter than ${Math.floor(maxDuration / 60)} minutes.`);
        return;
      }

      // Perform haptic feedback - selection
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Validate the video with our schema
      try {
        videoFileSchema.parse({
          uri: video.uri,
          duration: video.duration
        });
      } catch (error) {
        console.error('Video validation failed:', error);
        Alert.alert('Invalid Video', 'The selected video does not meet the requirements.');
        return;
      }

      setModalVisible(false);
      onVideoSelect(video.uri);

      // Navigate to cropping screen
      navigation.navigate('/video/crop', { videoUri: video.uri });
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    }
  }, [maxDuration, navigation, onVideoSelect]);

  // Animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value
    };
  });

  // Button press animation handlers
  const onButtonPressIn = () => {
    buttonScale.value = withSpring(0.95);
    // Light haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onButtonPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const renderVideoItem = ({ item }: { item: VideoAsset }) => {
    // Format duration
    const formatDuration = (seconds?: number) => {
      if (!seconds) return '00:00';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
      <TouchableOpacity
        style={styles.thumbnailContainer}
        onPress={() => handleSelectVideo(item)}
        onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            style={[styles.button, styles.galleryButton]}
            onPress={openGallery}
            onPressIn={onButtonPressIn}
            onPressOut={onButtonPressOut}
          >
            <MaterialIcons name="photo-library" size={24} color="#fff" />
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            style={[styles.button, styles.cameraButton]}
            onPress={launchCamera}
            onPressIn={onButtonPressIn}
            onPressOut={onButtonPressOut}
          >
            <MaterialIcons name="videocam" size={24} color="#fff" />
            <Text style={styles.buttonText}>Record</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {selectedVideo && (
        <View style={styles.selectedVideoContainer}>
          <Text style={styles.selectedVideoText}>Selected Video:</Text>
          <Text numberOfLines={1} style={styles.selectedVideoName}>
            {selectedVideo.filename || 'Video'}
          </Text>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalHeader, headerAnimatedStyle]}>
            <Text style={styles.modalHeaderTitle}>Select a Video</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setModalVisible(false);
              }}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </Animated.View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading videos...</Text>
            </View>
          ) : (
            <FlatList
              data={videos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              style={styles.videoList}
              showsVerticalScrollIndicator={false}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              removeClippedSubviews={true}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 140,
  },
  galleryButton: {
    backgroundColor: '#3498db',
  },
  cameraButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedVideoContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  selectedVideoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedVideoName: {
    fontSize: 16,
    marginTop: 4,
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoList: {
    flex: 1,
  },
  listContent: {
    padding: 8,
  },
  thumbnailContainer: {
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default EnhancedVideoPicker;

