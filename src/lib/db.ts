// src/lib/db.ts
import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

const STORAGE_MODE = process.env.STORAGE_MODE || 'local';

interface UniversalDB {
  execute(sql: string, args?: any[]): Promise<{ lastInsertRowid?: number | bigint; changes: number }>;
  query<T = any>(sql: string, args?: any[]): Promise<T[]>;
  get<T = any>(sql: string, args?: any[]): Promise<T | null>;
  exec(sql: string): Promise<void>; // For schema initialization
}

let dbClient: UniversalDB;

if (STORAGE_MODE === 'cloud') {
  console.log('[DB]: Initializing Cloud Storage (Turso)');
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  });

  dbClient = {
    async execute(sql, args = []) {
      const res = await client.execute({ sql, args });
      return { 
        lastInsertRowid: res.lastInsertRowid, 
        changes: res.rowsAffected 
      };
    },
    async query(sql, args = []) {
      const res = await client.execute({ sql, args });
      return res.rows as any[];
    },
    async get(sql, args = []) {
      const res = await client.execute({ sql, args });
      return (res.rows[0] as any) || undefined;
    },
    async exec(sql) {
      await client.execute(sql);
    }
  };
} else {
  console.log('[DB]: Initializing Local Storage (SQLite)');
  const RAW_DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'database', 'algolink.db');
  const DB_PATH = path.isAbsolute(RAW_DB_PATH) ? RAW_DB_PATH : path.join(process.cwd(), RAW_DB_PATH);
  const DB_DIR = path.dirname(DB_PATH);

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const localDb = new Database(DB_PATH);
  localDb.pragma('foreign_keys = ON');

  dbClient = {
    async execute(sql, args = []) {
      const stmt = localDb.prepare(sql);
      const res = stmt.run(...args);
      return { 
        lastInsertRowid: res.lastInsertRowid, 
        changes: res.changes 
      };
    },
    async query(sql, args = []) {
      const stmt = localDb.prepare(sql);
      return stmt.all(...args) as any[];
    },
    async get(sql, args = []) {
      const stmt = localDb.prepare(sql);
      return (stmt.get(...args) as any) || undefined;
    },
    async exec(sql) {
      localDb.exec(sql);
    }
  };
}

// Function to initialize schema
async function initializeSchema() {
  const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      email_verified_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await dbClient.exec(createUserTable);

  const createWalletLinksTable = `
    CREATE TABLE IF NOT EXISTS wallet_links (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      wallet_address TEXT NOT NULL,
      is_public BOOLEAN DEFAULT TRUE,
      user_expected_address TEXT,
      transaction_history TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (wallet_address),
      UNIQUE (email)
    );
  `;
  await dbClient.exec(createWalletLinksTable);

  await dbClient.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);`);
  await dbClient.exec(`CREATE INDEX IF NOT EXISTS idx_wallet_links_user_id ON wallet_links (user_id);`);
  await dbClient.exec(`CREATE INDEX IF NOT EXISTS idx_wallet_links_email_public ON wallet_links (email, is_public);`);

  const createNotificationsTable = `
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  await dbClient.exec(createNotificationsTable);
  await dbClient.exec(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);`);

  console.log('[DB]: Schema initialized/verified.');
}

// Initialize schema (non-blocking in background for Next.js, 
// though top-level await is better if environment supports it)
initializeSchema().catch(err => {
  console.error('[DB]: Schema initialization failed:', err);
});

export default dbClient;
