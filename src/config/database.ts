import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private pool: mysql.Pool;
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DATABASE_HOST || 'localhost',
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  async query(sql: string, params?: any[]): Promise<any> {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }
}

export default new Database();