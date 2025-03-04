import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function MetadataScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract params
  const videoUri = params.videoUri as string;
  const thumbnailUri = params.thumbnailUri as string | undefined;
  const duration = Number(params.duration || 5);

  // State for form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{name?: string}>({});

  const { addVideo } = useVideoStore();

  // Handle save video
  const handleSave = async () => {
    // Validate form
    const errors: {name?: string} = {};
    if (!name.trim()) {
      errors.name = 'Video name is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      await addVideo({
        name: name.trim(),
        description: description.trim(),
        uri: videoUri,
        duration,
        thumbnailUri: thumbnailUri,
      });

      router.replace('/' as any);
    } catch (error) {
      console.error('Failed to save video:', error);
      Alert.alert('Error', 'Failed to save video. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    Alert.alert(
      'Discard Changes?',
      'If you go back now, your cropped video will be discarded.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Video Details</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView>
          {/* Video Preview */}
          <View style={styles.previewContainer}>
            <Video
              source={{ uri: videoUri }}
              style={styles.videoPreview}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              isLooping
              shouldPlay={false}
            />
          </View>

          {/* Metadata Form */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Video Name*</Text>
            <TextInput
              style={[styles.input, formErrors.name && styles.inputError]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (formErrors.name) {
                  setFormErrors({...formErrors, name: undefined});
                }
              }}
              placeholder="Enter a name for your video"
              placeholderTextColor="#999"
            />
            {formErrors.name && (
              <Text style={styles.errorText}>{formErrors.name}</Text>
            )}

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a description for your video"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Duration: </Text>
                {duration.toFixed(1)} seconds
              </Text>

              {thumbnailUri && (
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>Thumbnail: </Text>
                  Generated
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>Save to Video Diary</Text>
              <Ionicons name="save" size={20} color="#fff" style={styles.saveIcon} />
            </>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  previewContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoPreview: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ff3b30',
    marginTop: -12,
    marginBottom: 16,
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#a0c4ff',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveIcon: {
    marginLeft: 8,
  },
});
