import * as SQLite from 'expo-sqlite';
import { SQLTransaction } from 'expo-sqlite';
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

// Open database connection
export const openDB = (): SQLite.SQLiteDatabase => {
  return SQLite.openDatabaseSync('videodiary.db');
};

// Initialize the database
export const initDatabase = async (): Promise<void> => {
  const db = openDB();

  db.transaction(
    (tx: SQLTransaction) => {
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
  return new Promise((resolve) => {
    const db = openDB();

    db.transaction(
      (tx: SQLTransaction) => {
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
  return new Promise((resolve) => {
    const db = openDB();
    const videos: VideoMetadata[] = [];

    db.transaction(
      (tx: SQLTransaction) => {
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
  return new Promise((resolve) => {
    const db = openDB();
    let video: VideoMetadata | null = null;

    db.transaction(
      (tx: SQLTransaction) => {
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
        return false;
      },
      () => {
        resolve(video);
        return true;
      }
    );
  });
};

// Delete video by ID
export const deleteVideo = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const db = openDB();

    db.transaction(
      (tx: SQLTransaction) => {
        tx.executeSql(
          `DELETE FROM videos WHERE id = ?;`,
          [id]
        );
      },
      (_: Error, error: Error) => {
        console.error('Error deleting video:', error);
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
