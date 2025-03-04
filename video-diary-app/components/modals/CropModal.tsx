// components/modals/CropModal.tsx
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useCallback, useState } from 'react';
import { Modal, Pressable, SafeAreaView, Text, View } from 'react-native';
import { useVideoProcessing } from '../../hooks/useVideoProcessing';
import { VideoMetadataFormValues } from '../../lib/validation';
import { CropSettings, VideoMetadata } from '../../types';
import { MetadataForm } from '../forms/MetadataForm';
import { VideoCropper } from '../video/VideoCropper';

interface CropModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (video: VideoMetadata) => void;
}

enum Step {
  SELECT_VIDEO = 0,
  CROP_VIDEO = 1,
  ADD_METADATA = 2,
}

export const CropModal: React.FC<CropModalProps> = ({
  isVisible,
  onClose,
  onSave,
}) => {
  const [step, setStep] = useState<Step>(Step.SELECT_VIDEO);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [cropSettings, setCropSettings] = useState<CropSettings>({ startTime: 0, endTime: 5 });

  const { cropVideo, isProcessing, data: croppedVideoUri } = useVideoProcessing();

  const handleVideoSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        setSelectedVideo(result.assets.uri);
        setStep(Step.CROP_VIDEO);
      }
    } catch (error) {
      console.error('Error selecting video:', error);
    }
  };

  const handleCropSettingsChange = useCallback((settings: CropSettings) => {
    setCropSettings(settings);
  }, []);

  const handleCropVideo = () => {
    if (selectedVideo) {
      cropVideo({
        videoUri: selectedVideo,
        settings: cropSettings
      });
      setStep(Step.ADD_METADATA);
    }
  };

  const handleSaveVideo = (metadata: VideoMetadataFormValues) => {
    if (croppedVideoUri) {
      const newVideo: VideoMetadata = {
        id: `video-${Date.now()}`,
        name: metadata.name,
        description: metadata.description || '',
        uri: croppedVideoUri,
        duration: cropSettings.endTime - cropSettings.startTime,
        createdAt: new Date().toISOString(),
      };

      onSave(newVideo);
      resetModal();
      onClose();
    }
  };

  const resetModal = () => {
    setStep(Step.SELECT_VIDEO);
    setSelectedVideo(null);
    setCropSettings({ startTime: 0, endTime: 5 });
  };

  const renderStepContent = () => {
    switch (step) {
      case Step.SELECT_VIDEO:
        return (
          <View className="flex-1 items-center justify-center p-6">
            <Pressable
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center"
              onPress={handleVideoSelect}
            >
              <MaterialIcons name="video-library" size={64} color="#4B5563" />
              <Text className="mt-4 text-lg font-medium text-gray-700">
                Select a video from your device
              </Text>
              <Text className="mt-2 text-sm text-gray-500 text-center">
                Tap here to browse your videos
              </Text>
            </Pressable>
          </View>
        );

      case Step.CROP_VIDEO:
        return (
          <View className="flex-1 p-6">
            <Text className="text-xl font-bold mb-4">
              Crop Video (5 seconds)
            </Text>

            {selectedVideo && (
              <VideoCropper
                videoUri={selectedVideo}
                onCropSettingsChange={handleCropSettingsChange}
                maxDuration={5}
              />
            )}

            <View className="mt-6">
              <Pressable
                className="bg-blue-500 py-3 rounded-md"
                onPress={handleCropVideo}
              >
                <Text className="text-white text-center font-medium">
                  Crop Video
                </Text>
              </Pressable>
            </View>
          </View>
        );

      case Step.ADD_METADATA:
        return (
          <View className="flex-1 p-6">
            <Text className="text-xl font-bold mb-4">
              Add Details
            </Text>

            <MetadataForm
              onSubmit={handleSaveVideo}
              submitLabel="Save Video"
              isLoading={isProcessing}
            />
          </View>
        );
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={() => {
        resetModal();
        onClose();
      }}
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <Text className="text-lg font-bold">
            {step === Step.SELECT_VIDEO ? 'Select Video' :
             step === Step.CROP_VIDEO ? 'Crop Video' : 'Add Details'}
          </Text>

          <Pressable
            onPress={() => {
              resetModal();
              onClose();
            }}
            hitSlop={10}
          >
            <MaterialIcons name="close" size={24} color="#000" />
          </Pressable>
        </View>

        {renderStepContent()}
      </SafeAreaView>
    </Modal>
  );
};
