// app/details/[id].tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { VideoPlayer } from '../../components/video/VideoPlayer';
import { useVideoStore } from '../../store/videoStore';

export default function VideoDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const getVideo = useVideoStore((state) => state.getVideo);
  const deleteVideo = useVideoStore((state) => state.deleteVideo);

  const video = getVideo(id);

  if (!video) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-xl font-medium text-gray-600">
          Video not found
        </Text>
      </View>
    );
  }

  const handleEdit = () => {
    router.push(`/edit/${id}`);
  };

  const handleDelete = () => {
    deleteVideo(id);
    router.back();
  };

  const formattedDate = new Date(video.createdAt).toLocaleDateString();

  return (
    <ScrollView className="flex-1 bg-white">
      <VideoPlayer video={video} shouldPlay={true} />

      <View className="p-4">
        <Text className="text-2xl font-bold">{video.name}</Text>

        <View className="flex-row items-center mt-2">
          <MaterialIcons name="access-time" size={16} color="#6B7280" />
          <Text className="text-gray-500 ml-1">
            {formattedDate} • {video.duration.toFixed(1)}s
          </Text>
        </View>

        <View className="mt-6">
          <Text className="text-lg font-medium mb-2">Description</Text>
          <Text className="text-gray-700">{video.description || 'No description'}</Text>
        </View>

        <View className="flex-row mt-8 justify-between">
          <Pressable
            className="flex-1 mr-2 py-3 bg-blue-500 rounded-md flex-row justify-center items-center"
            onPress={handleEdit}
          >
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text className="text-white font-medium ml-2">Edit</Text>
          </Pressable>

          <Pressable
            className="flex-1 ml-2 py-3 bg-red-500 rounded-md flex-row justify-center items-center"
            onPress={handleDelete}
          >
            <MaterialIcons name="delete" size={20} color="#fff" />
            <Text className="text-white font-medium ml-2">Delete</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
