import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';'react';
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
import { useVideoStore } from '../../store/videoStore';
import { VideoMetadataFormData, videoMetadataSchema } from '../../utils/validationSchemas';
import { useToast } from '../../context/ToastContext';from '../../utils/validationSchemas';from '../../utils/validationSchemas';
import { useFormPersistence } from '../../hooks/useFormPersistence';

export default function MetadataScreen() {
  const params = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { addVideo } = useVideoStore();
  const { showSuccess, showError } = useToast();
focus
  // Get video data from paramsll);
  const videoUri = params.videoUri as string;
  const thumbnailUri = params.thumbnailUri as string | undefined;
  const duration = Number(params.duration || 5);  const videoUri = params.videoUri as string;
  const thumbnailUri = params.thumbnailUri as string | undefined;
  const duration = Number(params.duration || 5);up form with validation
   = useForm<VideoMetadataFormData>({
  // Set up form with validationResolver(videoMetadataSchema),
  const { },
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,ange',
  } = useForm<VideoMetadataFormData>({
    resolver: zodResolver(videoMetadataSchema),
    defaultValues: {st { control, handleSubmit, formState: { errors, isValid, isDirty }, watch } = form;ode: 'onChange',
      name: '',  });
      description: '',
    },edData } = useFormPersistence(form, `video_metadata_${videoUri}`);ave a valid video URI
    mode: 'onChange',
  });

  // Watch values for character countingred-500">Invalid video. Please try again.</Text>
      <View className="flex-1 items-center justify-center bg-white p-4">
  const descriptionValue = watch('description', '');ed-500">Invalid video. Please try again.</Text>blue-500 rounded-md"
TouchableOpacity onPress={() => router.back()}
  // Check if we have a valid video URI
  if (!videoUri) {uter.back()}text-white font-medium">Go Back</Text>
    return (leOpacity>
      <View className="flex-1 items-center justify-center bg-white p-4">    <Text className="text-white font-medium">Go Back</Text></View>
        <Text className="text-lg text-red-500">Invalid video. Please try again.</Text>     </TouchableOpacity> );
        <TouchableOpacity       </View>  }
          className="mt-4 py-2 px-4 bg-blue-500 rounded-md"
          onPress={() => router.back()}
        > async (data: VideoMetadataFormData) => {
          <Text className="text-white font-medium">Go Back</Text>ion
        </TouchableOpacity>  const onSubmit = async (data: VideoMetadataFormData) => {      setIsSaving(true);
      </View>
    ););th metadata to store
  }

  // Handle form submissionata.description || '', // Convert undefined to empty string
  const onSubmit = async (data: VideoMetadataFormData) => {a.name,oUri,
    try {data.description || '', // Convert undefined to empty string
      setIsSaving(true);ri: videoUri,humbnailUri,
              duration,      });
      // Generate a unique timestamp for the video
      const timestamp = new Date().toISOString();
            showSuccess('Video saved to your diary!');
      // Save video with metadata to storeve saved to the store
      await addVideo({ist
        name: data.name,
        description: data.description || '', // Convert undefined to empty string
        uri: videoUri,
        duration,e your video. Please try again.');
        thumbnailUri, the video list
      }); router.replace('/' as any);
      } catch (error) {
      // Show success toast      console.error('Error saving video metadata:', error);
      showSuccess('Video saved to your diary!');ailed to save your video. Please try again.');

      // Navigate back to the video list
      router.replace('/' as any);
    } catch (error) {
      console.error('Error saving video metadata:', error);ndle cancel
      showError('Failed to save your video. Please try again.');
      setIsSaving(false);.alert(
      'Discard Changes',
      'Are you sure you want to discard this video?',
      [
        { text: 'No', style: 'cancel' },e cancel
        { handleCancel = () => {
          text: 'Yes', (!isDirty) {
          style: 'destructive',  router.back();
          onPress: () => router.back()      return;
        },
      ]
    );ert(ader */}
  };rd Changes',className="flex-row items-center justify-between p-4 border-b border-gray-200">
e you want to discard this video?',Opacity onPress={handleCancel} className="p-2">
  // Modified section with character counter for name field
        { text: 'No', style: 'cancel' },} }) => {
        { className="text-lg font-bold">Add Video Details</Text>
          text: 'Yes',
          style: 'destructive',
          onPress: () => router.back()gray-50 border rounded-md px-3 py-2 mb-1 ${
        },-red-500' : 'border-gray-300'
      ]
    );for your video"os' ? 'padding' : undefined}
  };tColor="#9CA3AF"1"
onBlur={onBlur}yboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
  return (
    <View className="flex-1 bg-white">ue={value}llView className="flex-1">
      {/* Header */}    autoCapitalize="sentences"    {/* Video Preview */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">      maxLength={50}      <View className="aspect-video mx-4 mt-4 rounded-lg overflow-hidden bg-black">
        <TouchableOpacity onPress={handleCancel} className="p-2">        />            <Video
          <Ionicons name="close-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Add Video Details</Text>zeMode={ResizeMode.CONTAIN}
        <View style={{ width: 40 }} />iveControls
      </View>

      {/* Content */}} }) => {
      <KeyboardAvoidingViewew>
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}gray-50 border rounded-md px-3 py-2 mb-1 min-h-[100px] ${="p-4">
      >'border-red-500' : 'border-gray-300'
        <ScrollView className="flex-1">
          {/* Video Preview */}er="Add a description for your video"ller
          <View className="aspect-video mx-4 mt-4 rounded-lg overflow-hidden bg-black">9CA3AF"
            <Video
              source={{ uri: videoUri }}nChange}field: { onChange, onBlur, value } }) => (
              style={{ flex: 1 }}value={value || ''} // Ensure value is never undefined      <View>
              resizeMode={ResizeMode.CONTAIN}
              useNativeControlstAlignVertical="top"       className={`bg-gray-50 border rounded-md px-3 py-2 mb-1 ${
              isLooping    numberOfLines={4}                errors.name ? 'border-red-500' : 'border-gray-300'
              shouldPlay={false}      maxLength={500}                }`}
            />        />                    placeholder="Enter a name for your video"
          </View>haracterCounter current={(value || '').length} max={500} />          placeholderTextColor="#9CA3AF"

          {/* Form Fields */}onChange}
          <View className="p-4">
            {/* Name Field */}
            <Controller
              control={control} bg-white">
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (center justify-between p-4 border-b border-gray-200">
                <FormFieldhableOpacity onPress={handleCancel} className="p-2"> )}
                  label="Video Name"          <Ionicons name="close-outline" size={24} color="#000" />            />
                  placeholder="Enter a name for your video"acity>ame && (
                  value={value}xt-lg font-bold">Add Video Details</Text>me="text-red-500 text-sm mb-3">
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  showCount/* Content */}
                  maxLength={50}
                  currentLength={nameValue.length}== 'ios' ? 'padding' : undefined}xt-base font-bold mb-2 mt-3">Description (Optional)</Text>
                  autoCapitalize="sentences"
                  returnKeyType="next"rticalOffset={Platform.OS === 'ios' ? 64 : 0}rol={control}
                  onSubmitEditing={() => descriptionRef.current?.focus()}
                  blurOnSubmit={false}ex-1"> onChange, onBlur, value } }) => (
                  required
                  autoFocusct-video mx-4 mt-4 rounded-lg overflow-hidden bg-black">
                />e={`bg-gray-50 border rounded-md px-3 py-2 mb-1 min-h-[100px] ${
              )}eoUri }}cription ? 'border-red-500' : 'border-gray-300'
            />style={{ flex: 1 }}      }`}
izeMode={ResizeMode.CONTAIN}   placeholder="Add a description for your video"
            {/* Description Field */}              useNativeControls                    placeholderTextColor="#9CA3AF"
            <Controller
              control={control}={onChange}
              name="description"ure value is never undefined
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Description"={4}
                  placeholder="Add a description for your video"="p-4">ngth={500}
                  value={value || ''}
                  onChangeText={onChange}ext className="text-base font-bold mb-2">Video Name *</Text>    <CharacterCounter current={(value || '').length} max={500} />
                  onBlur={onBlur}
                  error={errors.description?.message}
                  showCount
                  maxLength={500}
                  currentLength={(value || '').length}<Text className="text-red-500 text-sm mb-3">
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"rs.name.message}ssName="text-base font-bold mb-2 mt-3">Description (Optional)</Text>
                  className="min-h-[100px]"            <Controller
                  ref={descriptionRef}
                />: </Text>w mt-1">
              )}dium text-gray-600">Thumbnail: </Text>
            />
 ( </View>     <Text className="text-sm text-gray-800">{duration.toFixed(1)} seconds</Text>
            {/* Video Information */}Name="text-red-500 text-sm mb-3">          )}
            <View className="bg-blue-50 p-4 rounded-lg mt-2">
              <Text className="font-bold text-blue-800 mb-2">Video Information</Text>m font-medium text-gray-600">Thumbnail: </Text>ext>ew>

              <View className="flex-row mb-1">
                <Ionicons name="time-outline" size={18} color="#4B5563" className="mr-2" /> Information */}  )}xt className="text-sm text-gray-800">Available</Text>
                <Text className="text-sm font-medium text-gray-600">Duration: </Text>-blue-50 p-3 rounded-md mt-4">        </View>
                <Text className="text-sm text-gray-800">{duration.toFixed(1)} seconds</Text>
              </View>uration: </Text>

              {thumbnailUri && (
                <View className="flex-row mt-1">
                  <Ionicons name="image-outline" size={18} color="#4B5563" className="mr-2" />er-t border-gray-200">
                  <Text className="text-sm font-medium text-gray-600">Thumbnail: </Text>"flex-row mt-2">    <TouchableOpacityn */}
                  <Text className="text-sm text-gray-800">Available</Text>t className="text-sm font-medium text-gray-600">Thumbnail: </Text>me={`py-3 px-4 rounded-md flex-row justify-center items-center ${"p-4 border-t border-gray-200">
                </View>"text-sm text-gray-800">{thumbnailUri}</Text>isSaving ? 'bg-blue-400' : 'bg-blue-600'
              )}
            </View>              )}{handleSubmit(onSubmit)}            isSaving || !isValid ? 'bg-blue-400' : 'bg-blue-600'
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer with Save Button */}
      <View className="p-4 border-t border-gray-200 bg-white"> Save Button */}Indicator color="#FFFFFF" />
        <TouchableOpacity-gray-200">t className="text-white font-semibold mr-2">Save to Video Diary</Text>
          className={`py-3 px-4 rounded-md flex-row justify-center items-center ${      <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            isSaving || !isValid ? 'bg-blue-400' : 'bg-blue-600' className={`py-3 px-4 rounded-md flex-row justify-center items-center ${  </>     <Text className="text-white font-semibold mr-2">Save to Video Diary</Text>
          }`}
          onPress={handleSubmit(onSubmit)}
          disabled={isSaving || !isValid}          onPress={handleSubmit(onSubmit)}          )}





















}  );    </View>      </View>        )}          </Text>            Please fill in all required fields correctly          <Text className="text-red-500 text-xs text-center mt-2">        {!isValid && isDirty && (                </TouchableOpacity>          )}            </>              <Ionicons name="save-outline" size={20} color="#FFFFFF" />              <Text className="text-white font-semibold mr-2">Save to Video Diary</Text>            <>          ) : (            <ActivityIndicator color="#FFFFFF" size="small" />          {isSaving ? (        >




          <Text className="text-white font-medium">{isSaving ? 'Saving...' : 'Save'}</Text>        </TouchableOpacity>      </View>    </View>  );}          {isSaving && <ActivityIndicator color="#fff" className="mr-2" />}        >          disabled={isSaving}        </TouchableOpacity>
      </View>
    </View>
  );
}
