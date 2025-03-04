/**
 * Type definitions for expo-sqlite
 */

declare module 'expo-sqlite' {
  export interface Database {
    transaction(
      callback: (tx: SQLTransaction) => void,
      errorCallback?: (error: any) => void,
      successCallback?: () => void
    ): void;
  }

  export interface SQLTransaction {
    executeSql(
      sqlStatement: string,
      args?: any[],
      callback?: (tx: SQLTransaction, resultSet: SQLResultSet) => void,
      errorCallback?: (tx: SQLTransaction, error: SQLError) => boolean
    ): void;
  }

  export interface SQLResultSet {
    insertId: number;
    rowsAffected: number;
    rows: {
      length: number;
      item(index: number): any;
      _array: any[];
    };
  }

  export interface SQLError {
    code: number;
    message: string;
  }

  export function openDatabase(name: string): Database;
  export function deleteAsync(name: string): Promise<void>;
}
