// src/types/index.ts
export interface WalletLink {
  id: string; // Unique identifier for the link itself
  userId: string; // Identifier for the user who owns this link
  email: string; // Email associated with this link by the user
  walletAddress: string; // The Algorand wallet address
  userExpectedAddress?: string; // User's common or expected address part
  transactionHistory?: string; // A summary or list of recent transactions
  isPublic: boolean; // Whether this link can be publicly resolved by email
  // Timestamps could be added by the database, e.g., created_at, updated_at
}

// No new types needed here for explorer if they are in a separate file
// For larger features like explorer, it's good to have dedicated type files
// e.g., src/types/explorer.ts
