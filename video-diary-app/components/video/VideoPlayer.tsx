// components/video/VideoPlayer.tsx
import { ResizeMode, Video } from 'expo-av';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { VideoMetadata } from '../../types';

interface VideoPlayerProps {
  video: VideoMetadata;
  shouldPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, shouldPlay = false }) => {
  if (Platform.OS === 'web') {
    // For web, use HTML video element
    return (
      <View style={styles.container}>
        <video
          src={video.uri}
          controls
          autoPlay={shouldPlay}
          style={{ width: '100%', height: '100%' }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: video.uri }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode={ResizeMode.COVER}
        shouldPlay={shouldPlay}
        isLooping={false}
        useNativeControls
        style={styles.video}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
