/**
 * SQLite mock implementation for web platform
 * This provides an in-memory database with a SQLite-like interface
 */

// In-memory storage for tables
const inMemoryDatabase: {
  [tableName: string]: any[];
} = {};

// Mock transaction interface
class Transaction {
  executeSql(
    sqlStatement: string,
    params: any[] = [],
    successCallback?: (tx: any, resultSet: any) => void,
    errorCallback?: (tx: any, error: any) => boolean
  ) {
    try {
      console.log(`[WebSQLite] Executing: ${sqlStatement}`);

      // Parse the SQL statement (very basic parsing)
      const normalizedSql = sqlStatement.trim().toLowerCase();

      // CREATE TABLE statement
      if (normalizedSql.startsWith('create table')) {
        const tableMatch = sqlStatement.match(/create table if not exists (\w+)/i);
        if (tableMatch && tableMatch[1]) {
          const tableName = tableMatch[1];
          if (!inMemoryDatabase[tableName]) {
            inMemoryDatabase[tableName] = [];
            console.log(`[WebSQLite] Created table: ${tableName}`);
          }
        }
      }
      // INSERT statement
      else if (normalizedSql.startsWith('insert into')) {
        const tableMatch = sqlStatement.match(/insert into (\w+)/i);
        if (tableMatch && tableMatch[1]) {
          const tableName = tableMatch[1];

          if (!inMemoryDatabase[tableName]) {
            inMemoryDatabase[tableName] = [];
          }

          // Extract column names and values
          const record: any = {};
          const columnsMatch = sqlStatement.match(/\(([^)]+)\)/);

          if (columnsMatch && columnsMatch[1]) {
            const columns = columnsMatch[1].split(',').map(col => col.trim());

            // Assign values to columns
            columns.forEach((column, index) => {
              record[column] = params[index];
            });

            inMemoryDatabase[tableName].push(record);
            console.log(`[WebSQLite] Inserted record into ${tableName}`);
          }
        }
      }
      // SELECT statement
      else if (normalizedSql.startsWith('select')) {
        const tableMatch = sqlStatement.match(/from (\w+)/i);
        if (tableMatch && tableMatch[1]) {
          const tableName = tableMatch[1];
          let records = inMemoryDatabase[tableName] || [];

          // Handle WHERE clause (very basic)
          const whereMatch = sqlStatement.match(/where ([^;]+)/i);
          if (whereMatch && whereMatch[1]) {
            const whereClause = whereMatch[1].trim();
            const idMatch = whereClause.match(/(\w+)\s*=\s*\?/);

            if (idMatch && idMatch[1]) {
              const field = idMatch[1];
              const value = params[0];
              records = records.filter(record => record[field] === value);
            }
          }

          // Handle ORDER BY (very basic)
          const orderMatch = sqlStatement.match(/order by ([^;]+)/i);
          if (orderMatch && orderMatch[1]) {
            const orderClause = orderMatch[1].trim();
            const [field, direction] = orderClause.split(/\s+/);

            records = [...records].sort((a, b) => {
              if (direction && direction.toLowerCase() === 'desc') {
                return a[field] > b[field] ? -1 : 1;
              }
              return a[field] > b[field] ? 1 : -1;
            });
          }

          // Call success callback with results
          if (successCallback) {
            const resultSet = {
              rows: {
                _array: records,
                length: records.length,
                item: (index: number) => records[index]
              }
            };
            successCallback(this, resultSet);
          }
        }
      }
      // DELETE statement
      else if (normalizedSql.startsWith('delete')) {
        const tableMatch = sqlStatement.match(/from (\w+)/i);
        if (tableMatch && tableMatch[1]) {
          const tableName = tableMatch[1];

          if (inMemoryDatabase[tableName]) {
            // Handle WHERE clause
            const whereMatch = sqlStatement.match(/where ([^;]+)/i);
            if (whereMatch && whereMatch[1]) {
              const whereClause = whereMatch[1].trim();
              const idMatch = whereClause.match(/(\w+)\s*=\s*\?/);

              if (idMatch && idMatch[1]) {
                const field = idMatch[1];
                const value = params[0];

                const initialLength = inMemoryDatabase[tableName].length;
                inMemoryDatabase[tableName] = inMemoryDatabase[tableName].filter(
                  record => record[field] !== value
                );
                const removedCount = initialLength - inMemoryDatabase[tableName].length;

                console.log(`[WebSQLite] Deleted ${removedCount} records from ${tableName}`);
              }
            }
          }
        }
      }

      // Default success callback if operation doesn't return data
      if (successCallback && !normalizedSql.startsWith('select')) {
        const emptyResultSet = {
          rows: {
            _array: [],
            length: 0,
            item: () => null
          }
        };
        successCallback(this, emptyResultSet);
      }

      return true;
    } catch (error) {
      console.error('[WebSQLite] Error executing SQL:', error);
      if (errorCallback) {
        errorCallback(this, error);
      }
      return false;
    }
  }
}

// Mock Database class
class Database {
  private name: string;

  constructor(name: string) {
    this.name = name;
    console.log(`[WebSQLite] Opened database: ${name}`);
  }

  transaction(
    transactionFunction: (tx: Transaction) => void,
    errorCallback?: (error: any) => void,
    successCallback?: () => void
  ) {
    try {
      const tx = new Transaction();
      transactionFunction(tx);
      if (successCallback) {
        successCallback();
      }
    } catch (error) {
      console.error('[WebSQLite] Transaction error:', error);
      if (errorCallback) {
        errorCallback(error);
      }
    }
  }
}

// Mock SQLite module
export const WebSQLite = {
  openDatabase: (name: string) => new Database(name),
  openDatabaseSync: (name: string) => new Database(name),
};

// Helper function to get a dump of the database (for debugging)
export const getDatabaseDump = () => {
  return { ...inMemoryDatabase };
};
