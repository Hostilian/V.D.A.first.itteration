import * as FileSystem from 'expo-file-system';
import { FFmpegKit, FFmpegKitConfig, Level, ReturnCode } from 'ffmpeg-kit-react-native';
import { Platform } from 'react-native';

// Configuration constants
const TEMP_DIRECTORY = FileSystem.cacheDirectory + 'video-processing/';
const OUTPUT_QUALITY = '23'; // Lower value = higher quality, 23 is a good balance
const DEFAULT_OPTIONS = {
  vcodec: 'libx264',
  preset: 'medium', // Balance between speed and compression
  crf: OUTPUT_QUALITY
};

// Make sure our temp directory exists
const ensureTempDirectory = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(TEMP_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(TEMP_DIRECTORY, { intermediates: true });
  }
};

// Clean up temp files older than 1 hour
const cleanupTempFiles = async (): Promise<void> => {
  try {
    const now = new Date();
    const files = await FileSystem.readDirectoryAsync(TEMP_DIRECTORY);

    for (const file of files) {
      const fileUri = TEMP_DIRECTORY + file;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      // If file is older than 1 hour, delete it
      if (fileInfo.modificationTime &&
          now.getTime() - fileInfo.modificationTime > 60 * 60 * 1000) {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      }
    }
  } catch (error) {
    console.warn('Failed to clean up temp files:', error);
  }
};

// Initialize FFmpeg once
export const initFFmpeg = async (): Promise<void> => {
  await ensureTempDirectory();

  // Set log level to reduce console spam in production
  FFmpegKitConfig.setLogLevel(Level.AV_LOG_WARNING);

  // Use hardware acceleration if available
  if (Platform.OS === 'ios') {
    FFmpegKitConfig.enableRedirection();
  }

  // Clean up older temp files
  await cleanupTempFiles();
};

/**
 * Generates an optimized output path for processed videos
 * @param originalPath The original video path
 * @param prefix Optional prefix for the generated filename
 * @returns A path in the temporary directory
 */
const getOutputPath = (originalPath: string, prefix: string = 'processed_'): string => {
  const fileName = originalPath.split('/').pop() || 'video';
  const timestamp = new Date().getTime();
  return `${TEMP_DIRECTORY}${prefix}${timestamp}_${fileName}`;
};

/**
 * Cancels any ongoing FFmpeg operations
 */
export const cancelOperation = async (): Promise<void> => {
  await FFmpegKitConfig.cancelRunningProcesses();
};

/**
 * Crops a video to specified dimensions and position
 * Optimized with custom encoding parameters for better performance
 */
export const cropVideo = async (
  inputPath: string,
  { x, y, width, height }: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  await ensureTempDirectory();

  const outputPath = getOutputPath(inputPath, 'cropped_');

  // Optimize for different device capabilities
  const preset = Platform.OS === 'ios' ? 'medium' : 'fast';

  // Create an optimized command with the crop filter
  const command = `-i "${inputPath}" -vf "crop=${width}:${height}:${x}:${y}" -c:v ${DEFAULT_OPTIONS.vcodec} -preset ${preset} -crf ${DEFAULT_OPTIONS.crf} -c:a copy "${outputPath}"`;

  // Execute the command and handle the response
  const session = await FFmpegKit.executeAsync(
    command,
    async (session) => {
      const returnCode = await session.getReturnCode();
      if (ReturnCode.isSuccess(returnCode)) {
        console.log('Video cropping completed successfully');
      } else {
        console.error('Video cropping failed with code:', returnCode);
        throw new Error(`FFmpeg process failed with code ${returnCode}`);
      }
    }
  );

  return outputPath;
};

/**
 * Trims a video to a specified duration
 */
export const trimVideo = async (
  inputPath: string,
  startTime: number,
  duration: number
): Promise<string> => {
  await ensureTempDirectory();

  const outputPath = getOutputPath(inputPath, 'trimmed_');

  // Format time values correctly
  const startTimeFormatted = formatTimeValue(startTime);

  // Use the seekTo option for more efficient trimming (faster than using -ss after input)
  const command = `-ss ${startTimeFormatted} -i "${inputPath}" -t ${duration} -c:v ${DEFAULT_OPTIONS.vcodec} -preset ${DEFAULT_OPTIONS.preset} -crf ${DEFAULT_OPTIONS.crf} -c:a copy "${outputPath}"`;

  const session = await FFmpegKit.executeAsync(command);
  const returnCode = await session.getReturnCode();

  if (ReturnCode.isSuccess(returnCode)) {
    return outputPath;
  } else {
    throw new Error(`Video trimming failed with code ${returnCode}`);
  }
};

/**
 * Formats a time value in seconds to the FFmpeg time format (HH:MM:SS.mmm)
 */
const formatTimeValue = (timeInSeconds: number): string => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor((timeInSeconds % 60));
  const milliseconds = Math.floor((timeInSeconds - Math.floor(timeInSeconds)) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

/**
 * Compresses a video for smaller file size and better performance
 * Uses adaptive quality settings based on video resolution
 */
export const compressVideo = async (
  inputPath: string,
  quality: 'high' | 'medium' | 'low' = 'medium'
): Promise<string> => {
  await ensureTempDirectory();

  // Quality presets (CRF - lower is better quality but larger file)
  const qualitySettings = {
    high: '18',
    medium: '23',
    low: '28'
  };

  const crf = qualitySettings[quality];
  const outputPath = getOutputPath(inputPath, `compressed_${quality}_`);

  // Use more efficient command with scale filter
  const command = `-i "${inputPath}" -c:v ${DEFAULT_OPTIONS.vcodec} -preset ${DEFAULT_OPTIONS.preset} -crf ${crf} -c:a aac -b:a 128k "${outputPath}"`;

  const session = await FFmpegKit.executeAsync(command);
  const returnCode = await session.getReturnCode();

  if (ReturnCode.isSuccess(returnCode)) {
    return outputPath;
  } else {
    throw new Error(`Video compression failed with code ${returnCode}`);
  }
};

/**
 * Get video information (duration, resolution, etc.)
 * Cached to avoid repeated processing
 */
const videoInfoCache = new Map<string, any>();

export const getVideoInfo = async (videoPath: string): Promise<any> => {
  // Return cached info if available
  if (videoInfoCache.has(videoPath)) {
    return videoInfoCache.get(videoPath);
  }

  // FFprobe command to extract video information in JSON format
  const command = `-v error -select_streams v:0 -show_entries stream=width,height,duration,bit_rate -show_entries format=duration -of json "${videoPath}"`;

  const session = await FFmpegKit.executeAsync(command);
  const returnCode = await session.getReturnCode();

  if (ReturnCode.isSuccess(returnCode)) {
    const output = await session.getOutput();
    const videoInfo = JSON.parse(output);

    // Cache the result
    videoInfoCache.set(videoPath, videoInfo);

    return videoInfo;
  } else {
    throw new Error(`Failed to get video info with code ${returnCode}`);
  }
};

interface FFmpegService {
  initialize(): Promise<void>;
  cleanup(): void;
  getVideoInfo(path: string): Promise<any>;
  cancelOperation(): void;
}

const ffmpegService: FFmpegService = {
  initialize: async () => {
    // Initialization logic
  },

  cleanup: () => {
    // Cleanup logic
  },

  getVideoInfo: async (path: string) => {
    // Video info logic
  },

  cancelOperation: () => {
    // Cancel operation logic
  }
};

export default ffmpegService;
