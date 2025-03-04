import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { WebSQLite } from '../lib/web/sqlite-mock';

// Use the web SQLite mock for web platform or the native SQLite implementation
const getDatabase = () => {
  if (Platform.OS === 'web') {
    return WebSQLite.openDatabase('videoDiary.db');
  } else {
    // Using the correct function for SQLite
    return SQLite.openDatabase('videoDiary.db');
  }
};

// Open the database
const db = getDatabase();

// Initialize database tables
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create videos table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS videos (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            uri TEXT NOT NULL,
            createdAt INTEGER NOT NULL,
            duration REAL NOT NULL,
            thumbnailUri TEXT
          )`
        );
      },
      (error) => {
        console.error('Error initializing database:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve();
      }
    );
  });
};

// Generic query executor
export const executeQuery = (
  query: string,
  params: any[] = []
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
};

// Get a single record by id
export const getById = async (table: string, id: string): Promise<any | null> => {
  const results = await executeQuery(
    `SELECT * FROM ${table} WHERE id = ?`,
    [id]
  );

  return results.length > 0 ? results[0] : null;
};
