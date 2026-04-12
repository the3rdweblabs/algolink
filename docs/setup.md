# Developer Setup Guide

This document provides instructions for setting up the AlgoLink development environment and understanding its technical architecture.

## 🛠️ Required Stack
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Database**: [SQLite](https://www.sqlite.org/) (via `better-sqlite3`)
- **Styling**: Tailwind CSS + Shadcn UI
- **Blockchain**: Algorand (via `algosdk`)
- **Email**: SMTP-based notifications

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory. You can use `.env.example` as a template.

### Algorand Node Configuration
```bash
# Mainnet
NEXT_PUBLIC_INDEXER_SERVER_MAINNET="https://mainnet-idx.algonode.cloud/v2"
NEXT_PUBLIC_ALGOD_SERVER_MAINNET="https://mainnet-api.algonode.cloud"

# Testnet
NEXT_PUBLIC_INDEXER_SERVER_TESTNET="https://testnet-idx.algonode.cloud/v2"
NEXT_PUBLIC_ALGOD_SERVER_TESTNET="https://testnet-api.algonode.cloud"
```

### IPFS & Media Gateways
```bash
# IPFS Resolution
NEXT_PUBLIC_IPFS_GATEWAY="https://ipfs.algonode.xyz/ipfs/"
NEXT_PUBLIC_IPFS_GATEWAY_BACKUP="https://ipfs.algonode.dev/ipfs/"
NEXT_PUBLIC_ARWEAVE_GATEWAY="https://arweave.net/"
```

### SMTP Email Configuration
Used for security alerts and profile update notifications.
```bash
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASS="your-password"
SMTP_FROM="noreply@algolink.xyz"
```

### Authentication
```bash
SESSION_SECRET="your-32-character-secret-key"
```

---

## 🗄️ Database Schema

AlgoLink uses SQLite for lightweight, local-first storage of user identities and wallet links.

### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    is_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Wallet Links Table
```sql
CREATE TABLE wallet_links (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    wallet_address TEXT UNIQUE NOT NULL,
    is_public INTEGER DEFAULT 1,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
```

---

## 🚀 Local Development Workflow

1.  **Dependencies**: Run `npm install`.
2.  **Database**: The database is automatically initialized on the first run if it doesn't exist.
3.  **Run**: Launch the dev server with `npm run dev`.
4.  **Verify**: Open [http://localhost:3000](http://localhost:3000).

---

## 📦 Build & Deployment
To create a production build:
```bash
npm run build
```
Note: Ensure you have your production environment variables set if you are deploying to a VPS or platform like Vercel.
