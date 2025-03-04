// app/edit/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { MetadataForm } from '../../components/forms/MetadataForm';
import { VideoPlayer } from '../../components/video/VideoPlayer';
import { VideoMetadataFormValues } from '../../lib/validation';
import { useVideoStore } from '../../store/videoStore';

export default function EditVideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const getVideo = useVideoStore((state) => state.getVideo);
  const updateVideo = useVideoStore((state) => state.updateVideo);

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

  const handleSubmit = (data: VideoMetadataFormValues) => {
    updateVideo(id, {
      name: data.name,
      description: data.description || '',
    });
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <VideoPlayer video={video} />

      <View className="p-4">
        <Text className="text-2xl font-bold mb-6">Edit Video Details</Text>

        <MetadataForm
          initialValues={{
            name: video.name,
            description: video.description,
          }}
          onSubmit={handleSubmit}
          submitLabel="Update"
        />
      </View>
    </ScrollView>
  );
}
