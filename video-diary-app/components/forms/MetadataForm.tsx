// components/forms/MetadataForm.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { VideoMetadataFormValues, videoMetadataSchema } from '../../lib/validation';

interface MetadataFormProps {
  initialValues?: {
    name?: string;
    description?: string;
  };
  onSubmit: (data: VideoMetadataFormValues) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({
  initialValues = {},
  onSubmit,
  submitLabel = 'Save',
  isLoading = false,
}) => {
  const { control, handleSubmit, formState: { errors } } = useForm<VideoMetadataFormValues>({
    resolver: zodResolver(videoMetadataSchema),
    defaultValues: {
      name: initialValues.name || '',
      description: initialValues.description || '',
    },
  });

  return (
    <View className="w-full">
      <View className="mb-4">
        <Text className="text-gray-700 mb-1 font-medium">Name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="border border-gray-300 rounded-md px-4 py-2"
              onChangeText={onChange}
              value={value}
              placeholder="Enter a name for your video"
            />
          )}
        />
        {errors.name && (
          <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>
        )}
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-1 font-medium">Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="border border-gray-300 rounded-md px-4 py-2 h-24 text-base"
              onChangeText={onChange}
              value={value}
              placeholder="Add a description (optional)"
              multiline
              textAlignVertical="top"
            />
          )}
        />
        {errors.description && (
          <Text className="text-red-500 text-sm mt-1">{errors.description.message}</Text>
        )}
      </View>

      <Pressable
        className={`py-3 rounded-md ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      >
        <Text className="text-white text-center font-medium">
          {isLoading ? 'Processing...' : submitLabel}
        </Text>
      </Pressable>
    </View>
  );
};
