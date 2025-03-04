// components/video/VideoListItem.tsx
import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import { VideoMetadata } from '../../types';

interface VideoListItemProps {
  video: VideoMetadata;
}

export const VideoListItem: React.FC<VideoListItemProps> = ({ video }) => {
  const formattedDate = new Date(video.createdAt).toLocaleDateString();

  return (
    <Link href={`/details/${video.id}`} asChild>
      <Pressable className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <View className="flex-row">
          <View className="w-24 h-24 bg-gray-200">
            <Image
              source={{ uri: video.uri }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <View className="absolute bottom-1 right-1 bg-black bg-opacity-60 px-1 rounded">
              <Text className="text-white text-xs">{video.duration.toFixed(1)}s</Text>
            </View>
          </View>

          <View className="flex-1 p-3">
            <Text className="font-medium text-base" numberOfLines={1}>
              {video.name}
            </Text>
            <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
              {video.description}
            </Text>
            <Text className="text-gray-400 text-xs mt-2">
              {formattedDate}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};
