import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useVideoStore } from '../../store/videoStore';
import { formatDuration } from '../../utils/format';

// Define the form data structure
type FormData = {
  name: string;
  description?: string;
};

export default function VideoMetadataScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { videoUri, thumbnailUri, duration } = params as {
    videoUri: string;
    thumbnailUri?: string;
    duration: string;
  };

  // State
  const [isSaving, setIsSaving] = useState(false);
  const { addVideo } = useVideoStore();

  // Form setup with React Hook Form
  const { control, handleSubmit, formState: { errors, isValid, isDirty }, watch } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
    },
    mode: 'onChange',
  });

  // Format the video duration for display
  const videoDuration = parseFloat(duration);
  const formattedDuration = formatDuration(videoDuration);

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);

      // Save the video with metadata to the store
      await addVideo({
        name: data.name.trim() || 'Untitled Video',
        description: data.description,
        uri: videoUri,
        duration: videoDuration,
      });

      // Success! Navigate back to the video list
      router.replace('/(tabs)/videos');
    } catch (error) {
      console.error('Failed to save video:', error);
      Alert.alert(
        'Save Failed',
        'Failed to save your video. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel with confirmation if form is dirty
  const handleCancel = () => {
    if (isDirty) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your video metadata changes?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={handleCancel}>
          <Text className="text-gray-600 font-medium">Cancel</Text>
        </TouchableOpacity>

        <Text className="text-lg font-bold">Add Video Details</Text>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSaving || !isValid}
          className={`rounded-md px-4 py-2 ${!isSaving && isValid ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Video Thumbnail */}
        {thumbnailUri ? (
          <View className="items-center mb-6">
            <View className="relative rounded-lg overflow-hidden">
              <Image
                source={{ uri: thumbnailUri }}
                className="w-64 h-36 rounded-lg"
                resizeMode="cover"
              />
              <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded-md">
                <Text className="text-white text-xs">{formattedDuration}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="items-center mb-6 bg-gray-200 w-64 h-36 rounded-lg self-center justify-center">
            <Text className="text-gray-500">No preview available</Text>
          </View>
        )}

        {/* Form Fields */}
        <View className="mb-6">
          <Text className="text-sm font-bold mb-1 text-gray-700">Video Title *</Text>
          <Controller
            control={control}
            rules={{
              required: 'Video title is required',
              maxLength: { value: 100, message: 'Title cannot exceed 100 characters' }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-gray-300 rounded-md p-3 text-base bg-white"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Enter a title for your video"
                placeholderTextColor="#A0AEC0"
              />
            )}
            name="name"
          />
          {errors.name && (
            <Text className="text-red-500 text-xs mt-1">{errors.name.message}</Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-sm font-bold mb-1 text-gray-700">Description</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-gray-300 rounded-md p-3 text-base bg-white"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Add a description (optional)"
                placeholderTextColor="#A0AEC0"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ height: 100 }}
              />
            )}
            name="description"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
