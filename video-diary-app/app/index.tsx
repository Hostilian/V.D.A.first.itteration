// app/index.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { CropModal } from '../components/modals/CropModal';
import { VideoListItem } from '../components/video/VideoListItem';
import { useVideos } from '../hooks/useVideos';
import { VideoMetadata } from '../types';

export default function HomeScreen() {
  const { videos, isLoading, addVideo } = useVideos();
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);

  const handleSaveVideo = (video: VideoMetadata) => {
    addVideo(video);
  };

  return (
    <View className="flex-1 bg-gray-100">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-2">Loading videos...</Text>
        </View>
      ) : (
        <>
          {(!videos || videos.length === 0) ? (
            <View className="flex-1 items-center justify-center p-6">
              <MaterialIcons name="videocam-off" size={64} color="#9CA3AF" />
              <Text className="text-xl font-medium text-gray-600 mt-4">
                No videos yet
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                Tap the + button to create your first video diary entry
              </Text>
            </View>
          ) : (
            <FlatList
              data={videos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <VideoListItem video={item} />}
              contentContainerClassName="p-4"
            />
          )}

          <Pressable
            className="absolute bottom-6 right-6 w-16 h-16 bg-blue-500 rounded-full items-center justify-center shadow-md"
            onPress={() => setIsCropModalVisible(true)}
          >
            <MaterialIcons name="add" size={32} color="#fff" />
          </Pressable>

          <CropModal
            isVisible={isCropModalVisible}
            onClose={() => setIsCropModalVisible(false)}
            onSave={handleSaveVideo}
          />
        </>
      )}
    </View>
  );
}
