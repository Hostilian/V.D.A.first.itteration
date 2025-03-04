import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { WebSQLite } from '../lib/web/sqlite-mock';

// Use the web SQLite mock for web platform
const openDatabase = Platform.OS === 'web' ? WebSQLite.openDatabase : SQLite.openDatabase;

// Open the database
const db = openDatabase('videoDiary.db');

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
          (_, error): boolean => {
            reject(error);
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
};
