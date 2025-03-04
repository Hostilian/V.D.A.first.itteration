import { ResizeMode, Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';
import { initDatabase } from '../database';
import { useVideoStore } from '../store/videoStore';

export default function VideoListScreen() {
  const [isDbReady, setIsDbReady] = useState(false);
  const { videos, fetchVideos, isLoading } = useVideoStore();
  const router = useRouter();

  // Initialize database on first load
  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        setIsDbReady(true);
        await fetchVideos();
      } catch (error) {
        console.error('Setup error:', error);
      }
    };
    setup();
  }, []);

  const handleAddVideo = () => {
    router.push('/video/crop' as any);
  };

  const handleVideoPress = (id: string) => {
    router.push({
      pathname: '/video/[id]',
      params: { id }
    } as any);
  };

  if (!isDbReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Setting up database...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text style={styles.title}>Video Diary</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading videos...</Text>
        </View>
      ) : videos.length === 0 ? (
        <EmptyState message="No videos yet" />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.videoItem}
              onPress={() => handleVideoPress(item.id)}
            >
              <View style={styles.videoPreview}>
                {item.thumbnailUri ? (
                  <Video
                    source={{ uri: item.uri }}
                    resizeMode={ResizeMode.COVER}
                    style={styles.thumbnail}
                    useNativeControls={false}
                    isMuted={true}
                    shouldPlay={false}
                  />
                ) : (
                  <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                    <Text style={styles.placeholderText}>Video</Text>
                  </View>
                )}
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.videoDescription} numberOfLines={2}>
                  {item.description || 'No description'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <FloatingActionButton onPress={handleAddVideo} />
    </SafeAreaView>
  );
}

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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  videoItem: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  videoPreview: {
    width: 120,
    height: 90,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
  },
  videoInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  videoName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: '#666',
  },
});
