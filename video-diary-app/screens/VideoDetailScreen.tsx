import { MaterialIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Video } from 'expo-av';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { ErrorBoundary } from '../components/ErrorHandling/ErrorBoundary';
import { EnhancedMetadataForm, MetadataFormValues } from '../components/Forms/EnhancedMetadataForm';
import { useVideoStore } from '../store/videoStore';

type RootStackParamList = {
  VideoDetail: { videoUri: string, editMode?: boolean };
  Home: undefined;
};

type VideoDetailScreenRouteProp = RouteProp<RootStackParamList, 'VideoDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const VideoDetailScreen: React.FC = () => {
  const route = useRoute<VideoDetailScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();

  const { videoUri, editMode = false } = route.params;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(editMode);

  const { addVideo, videos, updateVideo } = useVideoStore();

  // Find if this video already exists in our store
  const existingVideo = Object.values(videos).find(
    (video) => video.uri === videoUri
  );

  // Initial form values
  const initialValues: Partial<MetadataFormValues> = existingVideo
    ? {
        title: existingVideo.title || '',
        description: '',
        tags: existingVideo.tags || [],
        recordedAt: existingVideo.createdAt ? new Date(existingVideo.createdAt) : new Date()
      }
    : {
        title: '',
        description: '',
        tags: [],
        recordedAt: new Date()
      };

  // Handle form submission
  const handleSubmit = useCallback((values: MetadataFormValues) => {
    const videoData = {
      id: uuidv4(),
      ...values,
      createdAt: new Date(),
      modifiedAt: new Date(),
      uri: videoUri
    };

    addVideo(videoData);
    // ...rest of submit logic...
  }, [addVideo, videoUri]);

  // Handle video playback
  const togglePlayback = async () => {
    setIsPlaying(!isPlaying);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle cancel
  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (existingVideo) {
      // If editing existing video, just exit edit mode
      setIsEditMode(false);
    } else {
      // If this is a new video, confirm before discarding
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to discard this video?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditMode(!isEditMode);
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        {isEditMode ? (
          <EnhancedMetadataForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isProcessing={isSaving}
          />
        ) : (
          <View style={styles.videoModeContainer}>
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: videoUri }}
                style={styles.video}
                shouldPlay={isPlaying}
                resizeMode="contain"
                isLooping
                useNativeControls
              />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.title}>{existingVideo?.title || 'Untitled Video'}</Text>

              {existingVideo?.tags && existingVideo.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {existingVideo.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.editButton}
                onPress={toggleEditMode}
              >
                <MaterialIcons name="edit" size={18} color="#fff" />
                <Text style={styles.editButtonText}>Edit Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  videoModeContainer: {
    flex: 1,
  },
  videoContainer: {
    height: 300,
    backgroundColor: '#000',
    marginBottom: 16,
  },
  video: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  editButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default VideoDetailScreen;
