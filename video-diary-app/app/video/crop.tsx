import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useMutation } from '@tanstack/react-query';
import { ResizeMode, Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useVideoStore } from '../../store/videoStore';

// FFMPEG video processing would be added here
const processCropVideo = async (
  videoUri: string,
  startTime: number,
  endTime: number
): Promise<string> => {
  // This is a mock implementation as FFMPEG for React Native would require
  // native module setup and configuration
  console.log(`Processing video crop from ${startTime}s to ${endTime}s`);

  // In a real implementation, we would use react-native-ffmpeg or similar
  // For now, we'll simulate processing delay and return the original URI
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In a real app, this would return the path to the cropped video
  return videoUri;
};

// Step types for the video crop flow
type CropStep = 'SELECT' | 'CROP' | 'METADATA';

export default function VideoCropScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const { addVideo } = useVideoStore();

  // State management
  const [currentStep, setCurrentStep] = useState<CropStep>('SELECT');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5); // Initial 5-second segment
  const [videoName, setVideoName] = useState('');
  const [videoDescription, setVideoDescription] = useState('');

  // TanStack Query mutation for video processing
  const cropVideoMutation = useMutation({
    mutationFn: async () => {
      if (!videoUri) throw new Error('No video selected');

      return await processCropVideo(videoUri, startTime, endTime);
    },
    onSuccess: async (croppedVideoUri) => {
      try {
        await addVideo({
          name: videoName.trim() || 'Untitled Video',
          description: videoDescription,
          uri: croppedVideoUri,
          duration: endTime - startTime,
        });
        router.replace('/' as any);
      } catch (error) {
        console.error('Failed to save video', error);
        Alert.alert('Error', 'Failed to save the video. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Video crop error:', error);
      Alert.alert('Error', 'Failed to process the video. Please try again.');
    }
  });

  // Pick a video from the device
  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
      setIsVideoLoaded(false);
      setCurrentStep('CROP');
    }
  };

  // Video load handler
  const handleVideoLoad = (status: any) => {
    if (status.durationMillis) {
      const durationSeconds = status.durationMillis / 1000;
      setVideoDuration(durationSeconds);
      setEndTime(Math.min(startTime + 5, durationSeconds));
      setIsVideoLoaded(true);
    }
  };

  // Update video position during playback
  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && !status.isBuffering) {
      setCurrentPosition(status.positionMillis / 1000);
    }
  };

  // Seek to a specific position
  const seekTo = (timeInSeconds: number) => {
    if (videoRef.current) {
      videoRef.current.setPositionAsync(timeInSeconds * 1000);
    }
  };

  // Update startTime and ensure valid range
  const updateStartTime = (time: number) => {
    const newStartTime = Math.max(0, Math.min(time, videoDuration - 5));
    setStartTime(newStartTime);

    // Ensure endTime is at least 5 seconds after startTime, if possible
    if (endTime < newStartTime + 5) {
      setEndTime(Math.min(newStartTime + 5, videoDuration));
    }

    seekTo(newStartTime);
  };

  // Update endTime and ensure valid range
  const updateEndTime = (time: number) => {
    const newEndTime = Math.max(startTime + 5, Math.min(time, videoDuration));
    setEndTime(newEndTime);
    seekTo(newEndTime);
  };

  // Go back to previous step or exit
  const handleBack = () => {
    if (currentStep === 'SELECT' || cropVideoMutation.isPending) {
      router.back();
    } else if (currentStep === 'CROP') {
      setCurrentStep('SELECT');
    } else if (currentStep === 'METADATA') {
      setCurrentStep('CROP');
    }
  };

  // Proceed to next step
  const handleNext = () => {
    if (currentStep === 'CROP') {
      setCurrentStep('METADATA');
    } else if (currentStep === 'METADATA') {
      cropVideoMutation.mutate();
    }
  };

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'SELECT':
        return (
          <View style={styles.selectContainer}>
            <Ionicons name="videocam" size={64} color="#888" style={styles.icon} />
            <Text style={styles.selectPrompt}>Select a video to crop</Text>
            <TouchableOpacity style={styles.selectButton} onPress={pickVideo}>
              <Text style={styles.selectButtonText}>Choose from Library</Text>
            </TouchableOpacity>
          </View>
        );

      case 'CROP':
        return (
          <View style={styles.cropContainer}>
            {videoUri && (
              <>
                <View style={styles.videoPreview}>
                  <Video
                    ref={videoRef}
                    source={{ uri: videoUri }}
                    style={styles.video}
                    resizeMode={ResizeMode.CONTAIN}
                    onLoad={handleVideoLoad}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    useNativeControls
                  />
                </View>

                {isVideoLoaded && (
                  <View style={styles.cropControls}>
                    <Text style={styles.cropInstructions}>
                      Select a 5-second segment to crop
                    </Text>

                    <View style={styles.timeContainer}>
                      <Text style={styles.timeLabel}>Start Time: </Text>
                      <Text style={styles.timeValue}>{startTime.toFixed(1)}s</Text>
                    </View>

                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={Math.max(0, videoDuration - 5)}
                      value={startTime}
                      onValueChange={updateStartTime}
                      minimumTrackTintColor="#4285F4"
                      maximumTrackTintColor="#CCCCCC"
                      thumbTintColor="#4285F4"
                    />

                    <View style={styles.timeContainer}>
                      <Text style={styles.timeLabel}>End Time: </Text>
                      <Text style={styles.timeValue}>{endTime.toFixed(1)}s</Text>
                    </View>

                    <Slider
                      style={styles.slider}
                      minimumValue={startTime + 5}
                      maximumValue={videoDuration}
                      value={endTime}
                      onValueChange={updateEndTime}
                      minimumTrackTintColor="#4285F4"
                      maximumTrackTintColor="#CCCCCC"
                      thumbTintColor="#4285F4"
                    />

                    <Text style={styles.segmentDuration}>
                      Segment Duration: {(endTime - startTime).toFixed(1)}s
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        );

      case 'METADATA':
        return (
          <KeyboardAvoidingView
            style={styles.formContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView>
              <Text style={styles.formLabel}>Video Name</Text>
              <TextInput
                style={styles.input}
                value={videoName}
                onChangeText={setVideoName}
                placeholder="Enter a name for your video"
                placeholderTextColor="#999"
              />

              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={videoDescription}
                onChangeText={setVideoDescription}
                placeholder="Add a description (optional)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {videoUri && (
                <View style={styles.previewContainer}>
                  <Text style={styles.previewLabel}>Video Preview</Text>
                  <Video
                    source={{ uri: videoUri }}
                    style={styles.previewVideo}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                  />
                  <View style={styles.cropDetails}>
                    <Text style={styles.cropDetail}>
                      Segment: {startTime.toFixed(1)}s - {endTime.toFixed(1)}s
                    </Text>
                    <Text style={styles.cropDetail}>
                      Duration: {(endTime - startTime).toFixed(1)}s
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          disabled={cropVideoMutation.isPending}
        >
          <Ionicons name="arrow-back" size={24} color={cropVideoMutation.isPending ? "#ccc" : "#000"} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {currentStep === 'SELECT' && 'Select Video'}
          {currentStep === 'CROP' && 'Crop Video'}
          {currentStep === 'METADATA' && 'Add Details'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {renderStepContent()}
      </View>

      <View style={styles.footer}>
        {currentStep !== 'SELECT' && (
          <TouchableOpacity
            style={[
              styles.nextButton,
              (currentStep === 'CROP' && !isVideoLoaded) || cropVideoMutation.isPending ? styles.disabledButton : {}
            ]}
            onPress={handleNext}
            disabled={(currentStep === 'CROP' && !isVideoLoaded) || cropVideoMutation.isPending}
          >
            {cropVideoMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentStep === 'METADATA' ? 'Save Video' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  selectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  selectPrompt: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  selectButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cropContainer: {
    flex: 1,
  },
  videoPreview: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  cropControls: {
    padding: 16,
  },
  cropInstructions: {
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 16,
    color: '#555',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  timeLabel: {
    fontSize: 16,
    color: '#333',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  segmentDuration: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  previewContainer: {
    marginTop: 20,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  previewVideo: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cropDetails: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  cropDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  nextButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#a0c4ff',
  },
});
