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
      // UPDATE statement
      else if (normalizedSql.startsWith('update')) {
        const tableMatch = sqlStatement.match(/update (\w+)/i);
        if (tableMatch && tableMatch[1]) {
          const tableName = tableMatch[1];

          if (inMemoryDatabase[tableName]) {
            // Extract field updates
            const setMatch = sqlStatement.match(/set ([^;]+?)(?:\s+where|$)/i);
            if (setMatch && setMatch[1]) {
              const sets = setMatch[1].split(',').map(s => s.trim());
              const updateFields: Record<string, any> = {};

              let paramIndex = 0;
              sets.forEach(set => {
                const [field] = set.split('=').map(s => s.trim());
                updateFields[field] = params[paramIndex++];
              });

              // Handle WHERE clause
              const whereMatch = sqlStatement.match(/where ([^;]+)/i);
              if (whereMatch && whereMatch[1]) {
                const whereClause = whereMatch[1].trim();
                const idMatch = whereClause.match(/(\w+)\s*=\s*\?/);

                if (idMatch && idMatch[1]) {
                  const field = idMatch[1];
                  const value = params[params.length - 1];

                  inMemoryDatabase[tableName] = inMemoryDatabase[tableName].map(record => {
                    if (record[field] === value) {
                      return { ...record, ...updateFields };
                    }
                    return record;
                  });

                  console.log(`[WebSQLite] Updated records in ${tableName}`);
                }
              }
            }
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

  // Clear all data (for testing)
  _reset() {
    Object.keys(inMemoryDatabase).forEach(key => {
      delete inMemoryDatabase[key];
    });
  }
}

// Mock SQLite module
export const WebSQLite = {
  openDatabase: (name: string) => new Database(name),
  // Add support for the sync version as well
  openDatabaseSync: (name: string) => new Database(name),
};

// Helper function to get a dump of the database (for debugging)
export const getDatabaseDump = () => {
  return { ...inMemoryDatabase };
};
