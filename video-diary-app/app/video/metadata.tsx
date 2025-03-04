import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CharacterCounter from '../../components/CharacterCounter';
import { useToast } from '../../context/ToastContext';
import { useVideoStore } from '../../store/videoStore';
import { VideoMetadataFormData, videoMetadataSchema } from '../../utils/validationSchemas';

export default function MetadataScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const { addVideo } = useVideoStore();
  const { showSuccess, showError } = useToast();

  // Get video data from params
  const videoUri = params.videoUri as string;
  const thumbnailUri = params.thumbnailUri as string | undefined;
  const duration = Number(params.duration || 5);

  // Set up form with validation
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<VideoMetadataFormData>({
    resolver: zodResolver(videoMetadataSchema),
    defaultValues: {
      name: '',
      description: '',
    },
    mode: 'onChange',
  });

  // Check if we have a valid video URI
  if (!videoUri) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-lg text-red-500">Invalid video. Please try again.</Text>
        <TouchableOpacity
          className="mt-4 py-2 px-4 bg-blue-500 rounded-md"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle form submission
  const onSubmit = async (data: VideoMetadataFormData) => {
    try {
      setIsSaving(true);

      // Save video with metadata to store
      await addVideo({
        name: data.name,
        description: data.description || '', // Convert undefined to empty string
        uri: videoUri,
        duration,
        thumbnailUri,
      });

      // Show success toast
      showSuccess('Video saved to your diary!');

      // Navigate back to the video list
      router.replace('/' as any);
    } catch (error) {
      console.error('Error saving video metadata:', error);
      showError('Failed to save your video. Please try again.');
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard this video?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => router.back()
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={handleCancel} className="p-2">
          <Ionicons name="close-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Add Video Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView className="flex-1">
          {/* Video Preview */}
          <View className="aspect-video mx-4 mt-4 rounded-lg overflow-hidden bg-black">
            <Video
              source={{ uri: videoUri }}
              style={{ flex: 1 }}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              isLooping
              shouldPlay={false}
            />
          </View>

          {/* Form Fields */}
          <View className="p-4">
            {/* Name Field */}
            <Text className="text-base font-bold mb-2">Video Name *</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    className={`bg-gray-50 border rounded-md px-3 py-2 mb-1 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter a name for your video"
                    placeholderTextColor="#9CA3AF"
                    onBlur={onBlur}
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={handleCancel} className="p-2">
          <Ionicons name="close-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Add Video Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView className="flex-1">
          {/* Video Preview */}
          <View className="aspect-video mx-4 mt-4 rounded-lg overflow-hidden bg-black">
            <Video
              source={{ uri: videoUri }}
              style={{ flex: 1 }}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              isLooping
              shouldPlay={false}
            />
          </View>

          {/* Form Fields */}
          <View className="p-4">
            {/* Name Field */}
            <Text className="text-base font-bold mb-2">Video Name *</Text>
            <Controller
              control={control}
              name="name"
              render={renderNameField}
            />
            {errors.name && (
              <Text className="text-red-500 text-sm mb-3">
                {errors.name.message}ssName="text-base font-bold mb-2 mt-3">Description (Optional)</Text>
              </Text>            <Controller
            )}
                <Text className="text-sm font-medium text-gray-600">Duration: </Text>w mt-1">
                <Text className="text-sm text-gray-800">{duration.toFixed(1)} seconds</Text>-medium text-gray-600">Thumbnail: </Text>
              </View>
cription && ( </View>
              {thumbnailUri && (ext className="text-red-500 text-sm mb-3">          )}
                <View className="flex-row mt-1">rors.description.message}ew>
                  <Text className="text-sm font-medium text-gray-600">Thumbnail: </Text>ext>ew>
                  <Text className="text-sm text-gray-800">Available</Text>crollView>
    </View>
            {/* Video Information */}  )}
            <View className="bg-blue-50 p-3 rounded-md mt-4">        </View>
              <View className="flex-row">
                <Text className="text-sm font-medium text-gray-600">Duration: </Text>
                <Text className="text-sm text-gray-800">{duration.toFixed(1)} seconds</Text>>
              </View>
              h Save Button */}
              {thumbnailUri && (p-4 border-t border-gray-200">
                <View className="flex-row mt-2">    <TouchableOpacity
                  <Text className="text-sm font-medium text-gray-600">Thumbnail: </Text>me={`py-3 px-4 rounded-md flex-row justify-center items-center ${
                  <Text className="text-sm text-gray-800">{thumbnailUri}</Text>isSaving ? 'bg-blue-400' : 'bg-blue-600'
                </View>      }`}
              )}{handleSubmit(onSubmit)}
            </View>ed={isSaving}
          </View>    >
        </ScrollView>{isSaving ? (
      </KeyboardAvoidingView>vityIndicator color="#FFFFFF" />

      {/* Footer with Save Button */}
      <View className="p-4 border-t border-gray-200">t className="text-white font-semibold mr-2">Save to Video Diary</Text>
        <TouchableOpacity          <Ionicons name="save-outline" size={20} color="#FFFFFF" />
          className={`py-3 px-4 rounded-md flex-row justify-center items-center ${  </>
            isSaving ? 'bg-blue-300' : 'bg-blue-500'
          }`}Opacity>
          onPress={handleSubmit(onSubmit)}
          disabled={isSaving}
        >
          {isSaving && <ActivityIndicator color="#fff" className="mr-2" />}
          <Text className="text-white font-medium">{isSaving ? 'Saving...' : 'Save'}</Text>        </TouchableOpacity>      </View>    </View>  );}
