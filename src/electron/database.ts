import sqlite3 from 'sqlite3';
import fs from 'fs';

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

  async remove(id: number, imagePathField: string = "imagePath"): Promise<void> {
    try {
      const result = await this.query<{ [key: string]: string }>(
        `SELECT ${imagePathField} FROM baseitems WHERE id = ?`,
        [id]
      );

      if (result.length > 0) {
        const imagePath = result[0][imagePathField];

        if (imagePath && fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log("File deleted:", imagePath);
        } else {
          console.warn("File does not exist or no image path provided:", imagePath);
        }
      } else {
        console.warn("No record found with the provided ID:", id);
      }

      await this.run(`DELETE FROM baseitems WHERE id = ?`, [id]);
      console.log("Record deleted successfully:", id);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
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