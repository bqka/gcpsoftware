import sqlite3 from 'sqlite3';

class Database {
  private db: sqlite3.Database;

  constructor(path: string) {
    this.db = new sqlite3.Database(path, (err) => {
      if (err) {
        console.error('Error connecting to database:', err);
      } else {
        console.log('Connected to database.');
      }
    });
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  async run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  close(): void {
    try {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed.');
        }
      });
    } catch (err) {
      console.error('Error during database closure:', err);
    }
  }
}

export default Database;