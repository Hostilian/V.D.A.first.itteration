// hooks/useVideos.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as db from '../lib/db';
import { useVideoStore } from '../store/videoStore';
import { VideoMetadata } from '../types';

export const useVideos = () => {
  const queryClient = useQueryClient();
  const { addVideo, updateVideo, deleteVideo } = useVideoStore();

  // Initialize database
  useEffect(() => {
    db.initDatabase().catch(console.error);
  }, []);

  // Fetch all videos
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: db.getVideos,
  });

  // Add new video
  const addVideoMutation = useMutation({
    mutationFn: (video: VideoMetadata) => db.saveVideo(video),
    onSuccess: (_, video) => {
      addVideo(video);
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    }
  });

  // Update video
  const updateVideoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<VideoMetadata> }) =>
      db.updateVideoById(id, data),
    onSuccess: (_, { id, data }) => {
      updateVideo(id, data);
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video', id] });
    }
  });

  return {
    videos,
    isLoading,
    error,
    addVideo: addVideoMutation.mutate,
    updateVideo: updateVideoMutation.mutate,
    getVideoById: (id: string) => {
      return useQuery({
        queryKey: ['video', id],
        queryFn: () => db.getVideoById(id),
      });
    }
  };
};
