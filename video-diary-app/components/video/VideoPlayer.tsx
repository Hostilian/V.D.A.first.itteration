// components/video/VideoPlayer.tsx
import { ResizeMode, Video } from 'expo-av';
import React from 'react';
import { View } from 'react-native';
import { VideoMetadata } from '../../types';

interface VideoPlayerProps {
  video: VideoMetadata;
  shouldPlay?: boolean;
  style?: any;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  shouldPlay = false,
  style = {}
}) => {
  const videoRef = React.useRef<Video>(null);

  return (
    <View className="w-full aspect-video rounded-lg overflow-hidden" style={style}>
      <Video
        ref={videoRef}
        source={{ uri: video.uri }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={shouldPlay}
        isLooping={false}
        className="w-full h-full"
        useNativeControls
      />
    </View>
  );
};
