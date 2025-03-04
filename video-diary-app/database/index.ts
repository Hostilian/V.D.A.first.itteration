import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { WebSQLite } from '../lib/web/sqlite-mock';

// SQLite transaction and result types
type SQLTransaction = SQLite.SQLTransaction;
type SQLResultSet = SQLite.SQLResultSet;
type SQLError = SQLite.SQLError;

// Use the web SQLite mock for web platform
const getDatabase = () => {
  if (Platform.OS === 'web') {
    return WebSQLite.openDatabase('videoDiary.db');
  } else {
    return SQLite.openDatabase('videoDiary.db');
  }
};

// Open the database
const db = getDatabase();

// Initialize database tables
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx: SQLTransaction) => {
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
      (error: SQLError) => {
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
      (tx: SQLTransaction) => {
        tx.executeSql(
          query,
          params,
          (_: SQLTransaction, { rows }: SQLResultSet) => {
            resolve(rows._array);
          },
          (_: SQLTransaction, error: SQLError): boolean => {
            reject(error);
            return false;
          }
        );
      },
      (error: SQLError) => reject(error)
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
