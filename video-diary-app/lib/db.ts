import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { VideoMetadata } from '../types';

// Define types for database operations
interface DBRows {
  rows: {
    _array: any[];
    length: number;
  };
}

export interface VideoRow {
  id: string;
  name: string;
  description: string;
  uri: string;
  duration: number;
  created_at: string;
}

// In-memory store for web platform
let webStorageVideos: VideoMetadata[] = [];

// Open database connection
export const openDB = (): SQLite.SQLiteDatabase | null => {
  if (Platform.OS === 'web') {
    return null; // Return null for web platform
  }
  return SQLite.openDatabaseSync('videodiary.db');
};

// Initialize the database
export const initDatabase = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    // For web, we'll use in-memory storage
    console.log('Using in-memory storage for web platform');
    return;
  }

  const db = openDB();
  if (!db) return;

  db.transaction(
    (tx: SQLite.SQLTransaction) => {
      // Create video table if it doesn't exist
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS videos (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          uri TEXT NOT NULL,
          duration REAL NOT NULL,
          created_at TEXT NOT NULL
        );`
      );
    },
    (_: Error, error: Error) => {
      console.error('Error creating database tables:', error);
      return false;
    }
  );
};

// Save video to database
export const saveVideo = (video: VideoMetadata): Promise<boolean> => {
  if (Platform.OS === 'web') {
    // For web, save to in-memory array
    webStorageVideos.push(video);
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const db = openDB();
    if (!db) return resolve(false);

    db.transaction(
      (tx: SQLite.SQLTransaction) => {
        tx.executeSql(
          `INSERT INTO videos (id, name, description, uri, duration, created_at)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [video.id, video.name, video.description, video.uri, video.duration, video.createdAt]
        );
      },
      (_: Error, error: Error) => {
        console.error('Error saving video:', error);
        resolve(false);
        return false;
      },
      () => {
        resolve(true);
        return true;
      }
    );
  });
};

// Get all videos from database
export const getVideos = (): Promise<VideoMetadata[]> => {
  if (Platform.OS === 'web') {
    // For web, return from in-memory array
    return Promise.resolve([...webStorageVideos]);
  }

  return new Promise((resolve) => {
    const db = openDB();
    if (!db) return resolve([]);

    const videos: VideoMetadata[] = [];

    db.transaction(
      (tx: SQLite.SQLTransaction) => {
        tx.executeSql(
          `SELECT * FROM videos ORDER BY created_at DESC;`,
          [],
          (_: any, { rows }: DBRows) => {
            for (let i = 0; i < rows.length; i++) {
              const row = rows._array[i] as VideoRow;
              videos.push({
                id: row.id,
                name: row.name,
                description: row.description,
                uri: row.uri,
                duration: row.duration,
                createdAt: row.created_at,
              });
            }
          }
        );
      },
      (_: Error, error: Error) => {
        console.error('Error fetching videos:', error);
        resolve([]);
        return false;
      },
      () => {
        resolve(videos);
        return true;
      }
    );
  });
};

// Get video by ID
export const getVideoById = (id: string): Promise<VideoMetadata | null> => {
  if (Platform.OS === 'web') {
    // For web, find in in-memory array
    const video = webStorageVideos.find(v => v.id === id) || null;
    return Promise.resolve(video);
  }

  return new Promise((resolve) => {
    const db = openDB();
    if (!db) return resolve(null);

    let video: VideoMetadata | null = null;

    db.transaction(
      (tx: SQLite.SQLTransaction) => {
        tx.executeSql(
          `SELECT * FROM videos WHERE id = ?;`,
          [id],
          (_: any, { rows }: DBRows) => {
            if (rows.length > 0) {
              const row = rows._array[0] as VideoRow;
              video = {
                id: row.id,
                name: row.name,
                description: row.description,
                uri: row.uri,
                duration: row.duration,
                createdAt: row.created_at,
              };
            }
          }
        );
      },
      (_: Error, error: Error) => {
        console.error('Error fetching video:', error);
        resolve(null);

























        tx.executeSql(      (tx: SQLite.SQLTransaction) => {    db.transaction(        if (!db) return resolve(false);    const db = openDB();  return new Promise((resolve) => {    }    return Promise.resolve(true);    webStorageVideos = webStorageVideos.filter(v => v.id !== id);    // For web, remove from in-memory array  if (Platform.OS === 'web') {export const deleteVideo = (id: string): Promise<boolean> => {// Delete video by ID};  });    );      }        return true;        resolve(video);      () => {      },        return false;
