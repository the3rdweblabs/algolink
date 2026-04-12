// src/lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const RAW_DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'database', 'algolink.db');
const DB_PATH = path.isAbsolute(RAW_DB_PATH) ? RAW_DB_PATH : path.join(process.cwd(), RAW_DB_PATH);
const DB_DIR = path.dirname(DB_PATH);

// Ensure the database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Function to initialize schema
function initializeSchema() {
  // Users table
  // Added display_name and avatar_url
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
  db.exec(createUserTable);

  // WalletLinks table
  const createWalletLinksTable = `
    CREATE TABLE IF NOT EXISTS wallet_links (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL, -- This is the email the user wants to associate with the wallet for public resolution
      wallet_address TEXT NOT NULL,
      is_public BOOLEAN DEFAULT TRUE,
      user_expected_address TEXT,
      transaction_history TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (wallet_address),        -- A wallet can be linked to only one email across the entire system
      UNIQUE (email)                 -- An email can be linked to only one wallet across the entire system
    );
  `;
  db.exec(createWalletLinksTable);

  // Indexes for performance
  const createUserEmailIndex = `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);`;
  db.exec(createUserEmailIndex);
  const createWalletLinksUserIdIndex = `CREATE INDEX IF NOT EXISTS idx_wallet_links_user_id ON wallet_links (user_id);`;
  db.exec(createWalletLinksUserIdIndex);
  const createWalletLinksEmailIndex = `CREATE INDEX IF NOT EXISTS idx_wallet_links_email_public ON wallet_links (email, is_public);`;
  db.exec(createWalletLinksEmailIndex);
  const createWalletLinksUserWalletIndex = `CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_links_user_wallet ON wallet_links (user_id, wallet_address);`;
  db.exec(createWalletLinksUserWalletIndex);
  const createWalletLinksUserPublicEmailIndex = `CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_links_user_public_email ON wallet_links (user_id, email);`;
  db.exec(createWalletLinksUserPublicEmailIndex);
  
  // New Global Unique Indexes
  const createWalletLinksWalletAddressUniqueIndex = `CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_links_wallet_address_unique ON wallet_links (wallet_address);`;
  db.exec(createWalletLinksWalletAddressUniqueIndex);
  const createWalletLinksEmailUniqueIndex = `CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_links_email_unique ON wallet_links (email);`;
  db.exec(createWalletLinksEmailUniqueIndex);
  const createWalletLinksUserIdUniqueIndex = `CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_links_user_id_unique ON wallet_links (user_id);`;
  db.exec(createWalletLinksUserIdUniqueIndex);

  // Notifications table
  const createNotificationsTable = `
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL, -- 'info', 'success', 'warning', 'message'
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  db.exec(createNotificationsTable);

  const createNotificationsUserIdIndex = `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);`;
  db.exec(createNotificationsUserIdIndex);

  console.log('Database schema checked/initialized (notifications table added).');
}

// Initialize schema immediately
initializeSchema();

// Add a PRAGMA for foreign keys to be enforced
db.pragma('foreign_keys = ON');

export default db;

