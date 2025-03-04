import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';

interface VideoEntry {
  id: string;
  title: string;
  timestamp: number;
  // Add other video properties as needed
}

const VideoListScreen = ({ navigation }: any) => {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch videos from database (using SQLite mock in web)
  useEffect(() => {
    const loadVideos = async () => {
      try {
        // Here you would use your database to fetch videos
        // For now, we'll use an empty array to show the empty state
        setVideos([]);
      } catch (error) {
        console.error('Failed to load videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  const handleAddVideo = () => {
    // Navigate to video creation screen
    navigation?.navigate('CreateVideo');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Diary</Text>

      {videos.length === 0 ? (
        <EmptyState message="No videos yet" />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.videoItem}>
              <Text style={styles.videoTitle}>{item.title}</Text>
              <Text style={styles.videoDate}>
                {new Date(item.timestamp).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}

      <FloatingActionButton onPress={handleAddVideo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
  },
  videoItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default VideoListScreen;
