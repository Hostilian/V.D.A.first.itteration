import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useVideoStore } from '../../store/videoStore';

export default function VideoDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { videos, setCurrentVideo, currentVideo, deleteVideo } = useVideoStore();
  const router = useRouter();

  useEffect(() => {
    if (id && typeof id === 'string') {
      setCurrentVideo(id);
    }

    return () => {
      // Clean up when leaving the screen
      setCurrentVideo(null);
    };
  }, [id, setCurrentVideo]);

  const handleBack = () => {
    router.back();
  };

  const handleDelete = async () => {
    if (currentVideo) {
      await deleteVideo(currentVideo.id);
      router.back();
    }
  };

  if (!currentVideo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Video not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Return to List</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {currentVideo.name}
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#ff3b30" />
        </TouchableOpacity>
      </View>

      <View style={styles.videoContainer}>
        <Video
          source={{ uri: currentVideo.uri }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
        />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>Description</Text>
        <Text style={styles.description}>
          {currentVideo.description || 'No description provided.'}
        </Text>

        <Text style={styles.detailsTitle}>Details</Text>
        <View style={styles.metadataRow}>
          <Text style={styles.metadataLabel}>Duration:</Text>
          <Text style={styles.metadataValue}>
            {currentVideo.duration.toFixed(1)} seconds
          </Text>
        </View>
        <View style={styles.metadataRow}>
          <Text style={styles.metadataLabel}>Created:</Text>
          <Text style={styles.metadataValue}>
            {new Date(currentVideo.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginHorizontal: 16,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    width: '100%',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 16,
    color: '#666',
    width: 80,
  },
  metadataValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    color: '#ff3b30',
    textAlign: 'center',
    marginVertical: 20,
  },
});
