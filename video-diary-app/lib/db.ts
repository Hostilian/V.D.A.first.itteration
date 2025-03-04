// lib/db.ts
import * as SQLite from 'expo-sqlite';
import { VideoMetadata } from '../types';

const db = SQLite.openDatabase('videoDiary.db');

export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS videos (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          uri TEXT NOT NULL,
          duration REAL NOT NULL,
          createdAt TEXT NOT NULL
        );`,
        [],
        () => { resolve(); },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const saveVideo = (video: VideoMetadata) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO videos (id, name, description, uri, duration, createdAt)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [video.id, video.name, video.description, video.uri, video.duration, video.createdAt],
        () => { resolve(); },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const getVideos = () => {
  return new Promise<VideoMetadata[]>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM videos ORDER BY createdAt DESC;',
        [],
        (_, { rows }) => {
          resolve(rows._array as VideoMetadata[]);
        },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const getVideoById = (id: string) => {
  return new Promise<VideoMetadata | null>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM videos WHERE id = ?;',
        [id],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0) as VideoMetadata);
          } else {
            resolve(null);
          }
        },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};

export const updateVideoById = (id: string, data: Partial<VideoMetadata>) => {
  const fields = Object.keys(data);
  const values = Object.values(data);

  const setClause = fields.map(field => `${field} = ?`).join(', ');

  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE videos SET ${setClause} WHERE id = ?;`,
        [...values, id],
        () => { resolve(); },
        (_, error) => { reject(error); return false; }
      );
    });
  });
};
