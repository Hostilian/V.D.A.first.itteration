import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { useFormValidation, videoMetadataSchema } from '../../lib/validation';
import { ErrorBoundary } from '../ErrorHandling/ErrorBoundary';

// Define TagInput component
interface TagInputProps {
  tags?: string[];
  addTag: (tag: string) => void;
  removeTag: (index: number) => void;
  error?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags = [], addTag, removeTag, error }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<NativeTextInput>(null);

  const handleSubmit = useCallback(() => {
    if (input.trim()) {
      addTag(input.trim());
      setInput('');
      // Provide haptic feedback for adding tag
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [input, addTag]);

  return (
    <View style={styles.tagInputContainer}>
      <Text style={styles.inputLabel}>Tags</Text>
      <View style={styles.tagInputRow}>
        <TextInput
          ref={inputRef}
          style={[styles.input, styles.tagInput, error ? styles.inputError : null]}
          value={input}
          onChangeText={setInput}
          placeholder="Add a tag..."
          onSubmitEditing={handleSubmit}
          blurOnSubmit={false}
        />
        <TouchableOpacity style={styles.addTagButton} onPress={handleSubmit}>
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity onPress={() => {
              removeTag(index);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}>
              <MaterialIcons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

export interface MetadataFormValues {
  title: string;
  description?: string;
  tags?: string[];
  recordedAt?: Date;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
}

interface EnhancedMetadataFormProps {
  initialValues?: Partial<MetadataFormValues>;
  onSubmit: (values: MetadataFormValues) => void;
  onCancel?: () => void;
  isProcessing?: boolean;
}

export const EnhancedMetadataForm: React.FC<EnhancedMetadataFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
  isProcessing = false
}) => {
  // Form validation with custom hook
  const {
    values,
    setValues,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    validateField
  } = useFormValidation(videoMetadataSchema, {
    title: initialValues.title || '',
    description: initialValues.description || '',
    tags: initialValues.tags || [],
    recordedAt: initialValues.recordedAt || new Date(),
    location: initialValues.location || {}
  });

  // UI States
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [showLocationSpinner, setShowLocationSpinner] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  // Animation values
  const shake = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  // Animation styles
  const shakeAnimationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shake.value }]
    };
  });

  const successAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity: successOpacity.value
    };
  });

  // Handle shaking animation for errors
  const triggerShake = useCallback(() => {
    shake.value = withSequence(
      withTiming(10, { duration: 50, easing: Easing.linear }),
      withTiming(-10, { duration: 50, easing: Easing.linear }),
      withTiming(10, { duration: 50, easing: Easing.linear }),
      withTiming(-10, { duration: 50, easing: Easing.linear }),
      withTiming(0, { duration: 50, easing: Easing.linear })
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [shake]);

  // Handle success animation
  const triggerSuccess = useCallback(() => {
    successOpacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [successOpacity]);

  // Tag operations
  const addTag = useCallback((tag: string) => {
    if (values.tags && values.tags.includes(tag)) {
      Alert.alert('Duplicate Tag', 'This tag already exists.');
      return;
    }

    setValues({
      ...values,
      tags: [...(values.tags || []), tag]
    });
    validateField('tags', [...(values.tags || []), tag]);
  }, [values, setValues, validateField]);

  const removeTag = useCallback((index: number) => {
    const newTags = [...(values.tags || [])];
    newTags.splice(index, 1);
    setValues({
      ...values,
      tags: newTags
    });
    validateField('tags', newTags);
  }, [values, setValues, validateField]);

  // Location functions
  useEffect(() => {
    const checkLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    };
    checkLocationPermission();
  }, []);

  const getCurrentLocation = async () => {
    if (!locationPermission) {
      Alert.alert('Permission Required', 'Location permission is required to use this feature.');
      return;
    }

    try {
      setShowLocationSpinner(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;

      // Get address
      const [addressResponse] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = addressResponse
        ? `${addressResponse.city || ''}, ${addressResponse.region || ''}, ${addressResponse.country || ''}`
        : '';

      setValues({
        ...values,
        location: { latitude, longitude, address }
      });

      // Success feedback
      triggerSuccess();

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Failed to retrieve your current location.');
      triggerShake();
    } finally {
      setShowLocationSpinner(false);
    }
  };

  // Form submission
  const handleFormSubmit = useCallback(() => {
    Keyboard.dismiss();

    if (validateAll()) {
      onSubmit(values as MetadataFormValues);
    } else {
      triggerShake();
      // Focus first field with error
      for (const field in errors) {
        if (errors[field]) {
          Alert.alert('Validation Error', `Please check the form for errors. ${errors[field]}`, [
            { text: 'OK' }
          ]);
          break;
        }
      }
    }
  }, [values, onSubmit, validateAll, errors, triggerShake]);

  // Handle date change
  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    setDatePickerVisible(false);
    if (selectedDate) {
      setValues({
        ...values,
        recordedAt: selectedDate
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [values, setValues]);

  return (
    <ErrorBoundary fallbackComponent={(error) => (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={48} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Something went wrong!</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        {onCancel && (
          <TouchableOpacity style={styles.errorButton} onPress={onCancel}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    )}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Success animation overlay */}
          <Animated.View style={[styles.successOverlay, successAnimationStyle]}>
            <MaterialIcons name="check-circle" size={60} color="#4caf50" />
          </Animated.View>

          {/* Title input */}
          <Animated.View style={shakeAnimationStyle}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={[styles.input, errors.title && touched.title ? styles.inputError : null]}
              value={values.title}
              onChangeText={(value) => handleChange('title', value)}
              onBlur={() => handleBlur('title')}
              placeholder="Enter video title..."
              autoCapitalize="sentences"
              maxLength={100}
            />
            {errors.title && touched.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </Animated.View>

          {/* Description input */}
          <View>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.description && touched.description ? styles.inputError : null
              ]}
              value={values.description}
              onChangeText={(value) => handleChange('description', value)}
              onBlur={() => handleBlur('description')}
              placeholder="Enter video description..."
              multiline
              numberOfLines={4}
              autoCapitalize="sentences"
              maxLength={500}
            />
            {errors.description && touched.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
            {values.description && (
              <Text style={styles.charCount}>{values.description.length}/500</Text>
            )}
          </View>

          {/* Tags input */}
          <TagInput
            tags={values.tags}
            addTag={addTag}
            removeTag={removeTag}
            error={errors.tags && touched.tags ? errors.tags : undefined}
          />

          {/* Date picker */}
          <View>
            <Text style={styles.inputLabel}>Recording Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => {
                setDatePickerVisible(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.dateText}>
                {values.recordedAt ? values.recordedAt.toLocaleDateString() : 'Select date'}
              </Text>
              <MaterialIcons name="calendar-today" size={24} color="#555" />
            </TouchableOpacity>

            {isDatePickerVisible && (
              <DateTimePicker
                value={values.recordedAt || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Location picker */}
          <View>
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.locationContainer}>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={getCurrentLocation}
                disabled={showLocationSpinner}
              >
                {showLocationSpinner ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="my-location" size={18} color="#fff" />
                    <Text style={styles.locationButtonText}>Get Current Location</Text>
                  </>
                )}
              </TouchableOpacity>

              {values.location && values.location.address && (
                <View style={styles.locationDisplay}>
                  <MaterialIcons name="place" size={18} color="#555" />
                  <Text style={styles.locationText}>{values.location.address}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            {onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onCancel();
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                isProcessing ? styles.disabledButton : null
              ]}
              onPress={handleFormSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  errorButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 24
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  disabledButton: {
    opacity: 0.7
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#2ecc71'
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    marginRight: 8
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  locationText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8
  },
  locationButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600'
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  locationContainer: {
    marginBottom: 16
  },
  dateText: {
    fontSize: 16,
    color: '#333'
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 16
  },
  tagText: {
    color: 'white',
    marginRight: 6
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  addTagButton: {
    backgroundColor: '#3498db',
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tagInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  tagInputContainer: {
    marginBottom: 16
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: -12,
    marginBottom: 16
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16
  },
  inputError: {
    borderColor: '#e74c3c'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9'
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  scrollContainer: {
    flex: 1
  }
});
