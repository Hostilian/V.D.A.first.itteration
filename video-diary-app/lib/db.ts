import { Platform } from 'react-native';
import { VideoMetadata } from '../types';

// Import the appropriate SQLite implementation
let SQLite: any;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
} else {
  // Use our web mock for web platform
  const { WebSQLite } = require('./web/sqlite-mock');
  SQLite = WebSQLite;
}

// Define database name
const DATABASE_NAME = 'videodiary.db';

// Database instance
export const db = SQLite.openDatabase(DATABASE_NAME);

// Define types for database operations
interface DBRows {
  rows: {
    _array: any[];
    length: number;
    item: (index: number) => any;
  };
}

export interface VideoRow {
  id: string;
  name: string;
  description: string;
  uri: string;
  duration: number;
  createdAt: string;
}

// Define transaction types
interface SQLTransaction {
  executeSql: (
    sqlStatement: string,
    params: any[],
    successCallback?: (tx: SQLTransaction, resultSet: DBRows) => void,
    errorCallback?: (tx: SQLTransaction, error: Error) => boolean
  ) => void;
}

// Initialize the database
export const initDatabase = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    console.log(`Initializing database on platform: ${Platform.OS}`);

    db.transaction(
      (tx: SQLTransaction) => {
        // Create videos table if it doesn't exist
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS videos (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            uri TEXT NOT NULL,
            duration REAL NOT NULL,
            createdAt TEXT NOT NULL
          );`,
          [],
          () => {
            console.log('Database initialized successfully');
            resolve();
          },
          (_: SQLTransaction, error: Error) => {
            console.error('Error initializing database:', error);
            reject(error);
            return false;
          }
        );
      },
      (error: Error) => {
        console.error('Transaction error during database initialization:', error);
        reject(error);
      }
    );
  });
};

// Save video to database
export const saveVideo = (video: VideoMetadata): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx: SQLTransaction) => {
        tx.executeSql(
          `INSERT INTO videos (id, name, description, uri, duration, createdAt)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [video.id, video.name, video.description, video.uri, video.duration, video.createdAt],
          () => {
            resolve(true);
          },
          (_: SQLTransaction, error: Error) => {
            console.error('Error saving video:', error);
            reject(error);
            return false;
          }
        );
      },
      (error: Error) => {
        console.error('Transaction error during save:', error);
        reject(error);
      }
    );
  });
};

// Get all videos from database
export const getVideos = (): Promise<VideoMetadata[]> => {
  return new Promise((resolve, reject) => {
    const videos: VideoMetadata[] = [];

    db.transaction(
      (tx: SQLTransaction) => {
        tx.executeSql(
          `SELECT * FROM videos ORDER BY createdAt DESC;`,
          [],
          (_: SQLTransaction, { rows }: DBRows) => {
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              videos.push({
                id: row.id,
                name: row.name,
                description: row.description || '',
                uri: row.uri,
                duration: row.duration,
                createdAt: row.createdAt,
              });
            }
            resolve(videos);
          },
          (_: SQLTransaction, error: Error) => {
            console.error('Error fetching videos:', error);
            reject(error);
            return false;
          }
        );
      },
      (error: Error) => {
        console.error('Transaction error during fetch:', error);
        reject(error);
      }
    );
  });
};

// Get video by ID
export const getVideoById = (id: string): Promise<VideoMetadata | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx: SQLTransaction) => {
        tx.executeSql(
          `SELECT * FROM videos WHERE id = ?;`,
          [id],
          (_: SQLTransaction, { rows }: DBRows) => {
            if (rows.length > 0) {
              const row = rows.item(0);
              resolve({
                id: row.id,
                name: row.name,
                description: row.description || '',
                uri: row.uri,
                duration: row.duration,
                createdAt: row.createdAt,
              });
            } else {
              resolve(null);
            }
          },
          (_: SQLTransaction, error: Error) => {
            console.error('Error fetching video by ID:', error);
            reject(error);
            return false;
          }
        );
      },
      (error: Error) => {
        console.error('Transaction error during fetch by ID:', error);
        reject(error);
      }
    );
  });
};

// Update video metadata
export const updateVideo = (id: string, updates: { name?: string; description?: string }): Promise<boolean> => {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }

  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }

  if (fields.length === 0) {
    return Promise.resolve(true);
  }

  values.push(id);

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx: SQLTransaction) => {
        tx.executeSql(
          `UPDATE videos SET ${fields.join(', ')} WHERE id = ?;`,
          values,
          () => {
            resolve(true);
          },
          (_: SQLTransaction, error: Error) => {
            console.error('Error updating video:', error);
            reject(error);
            return false;
          }
        );
      },
      (error: Error) => {
        console.error('Transaction error during update:', error);
        reject(error);
      }
    );
  });
};

// Delete video by ID
export const deleteVideo = (id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx: SQLTransaction) => {
        tx.executeSql(
          'DELETE FROM videos WHERE id = ?;',
          [id],
          () => {
            resolve(true);
          },
          (_: SQLTransaction, error: Error) => {
            console.error('Error deleting video:', error);
            reject(error);
            return false;
          }
        );
      },
      (error: Error) => {
        console.error('Transaction error during delete:', error);
        reject(error);
      }
    );
  });
};
