// src/app/actions/walletActions.ts
'use server';

import db from '@/lib/db';
import type { WalletLink } from '@/types';
import { randomUUID } from 'crypto';
import { getUserIdFromSession, getSession } from '@/lib/auth';
import { getAccountDetails } from './explorerActions';
import { addNotification } from './notificationActions';

export interface LinkWalletInput {
  walletAddress: string;
  isPublic?: boolean;
  userExpectedAddress?: string;
  transactionHistory?: string;
}

export async function linkWalletToUser(input: LinkWalletInput): Promise<WalletLink | { error: string }> {
  const userId = await getUserIdFromSession();
  const session = await getSession();

  if (!session?.isVerified) {
    return { error: 'User account email not verified. Please complete OTP verification for your account.' };
  }
  const { walletAddress, isPublic = true, userExpectedAddress, transactionHistory } = input;
  console.log(`[DEBUG] linkWalletToUser: Received request for ${walletAddress} (isPublic: ${isPublic})`);

  const normalizedPublicEmail = session.email?.toLowerCase();
  
  if (!userId) {
     console.error('[DEBUG] linkWalletToUser: userId is missing from session');
     return { error: 'User authenticated but ID missing. Try logging in again.' };
  }
  if (!normalizedPublicEmail) {
     console.error('[DEBUG] linkWalletToUser: email is missing from session');
     return { error: 'User authenticated but Email missing. Try logging in again.' };
  }
  if (!walletAddress) {
     console.error('[DEBUG] linkWalletToUser: walletAddress is missing from input');
     return { error: 'Wallet address is required for linking.' };
  }

  if (!normalizedPublicEmail || !walletAddress) {
    return { error: 'Session email and wallet address are required.' };
  }
  if (!/^\S+@\S+\.\S+$/.test(normalizedPublicEmail)) {
    return { error: 'Invalid session email format.' };
  }
  if (walletAddress.length < 50 || walletAddress.length > 60 || !/^[A-Z0-9]+$/.test(walletAddress)) {
      return { error: 'Invalid Algorand wallet address format.' };
  }

  try {
    const existingLink = await db.get('SELECT id FROM wallet_links WHERE user_id = ?', [userId]) as Pick<WalletLink, 'id'> | null;

    if (existingLink) {
      // User already has a wallet linked. Overwrite the wallet address (1:1 mapping).
      await db.execute(
        'UPDATE wallet_links SET email = ?, wallet_address = ?, is_public = ?, user_expected_address = ?, transaction_history = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [normalizedPublicEmail, walletAddress, isPublic ? 1 : 0, userExpectedAddress, transactionHistory, existingLink.id, userId]
      );
      
      await addNotification(
        userId,
        'success',
        'Wallet Link Updated',
        `Your wallet address ${walletAddress.substring(0, 8)}... has been updated.`
      );

       return {
        id: existingLink.id,
        userId,
        email: normalizedPublicEmail,
        walletAddress,
        isPublic,
        userExpectedAddress,
        transactionHistory
      };
    } else {
      // User has no wallet linked. Create a new link.
      const id = randomUUID();
      await db.execute(
        'INSERT INTO wallet_links (id, user_id, email, wallet_address, is_public, user_expected_address, transaction_history) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, userId, normalizedPublicEmail, walletAddress, isPublic ? 1 : 0, userExpectedAddress, transactionHistory]
      );
      
      await addNotification(
        userId,
        'success',
        'Wallet Successfully Linked',
        `Your wallet address ${walletAddress.substring(0, 8)}... has been linked to your account.`
      );

      return {
        id,
        userId,
        email: normalizedPublicEmail,
        walletAddress,
        isPublic,
        userExpectedAddress,
        transactionHistory
      };
    }
  } catch (error: any) {
    console.error('Error linking/updating wallet:', error);
    const errorMessage = error.message || '';
    if (errorMessage.includes('UNIQUE') || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      if (errorMessage.includes('wallet_address') || errorMessage.includes('idx_wallet_links_wallet_address_unique')) {
        const owner = await db.get('SELECT user_id FROM wallet_links WHERE wallet_address = ?', [walletAddress]) as { user_id: string } | null;
        
        if (owner && owner.user_id === userId) {
          return { error: 'This wallet address is already linked to your account.' };
        } else {
          return { error: 'This wallet address is already linked to another account.' };
        }
      } else if (errorMessage.includes('email') || errorMessage.includes('idx_wallet_links_email_unique')) {
        return { error: 'This email address is already associated with an account. Please contact support if you think this is a mistake.' };
      }
      return { error: 'A unique constraint was violated. This email or wallet combination may already exist in the system.' };
    }
    return { error: error.message || 'Failed to link or update wallet.' };
  }
}

export async function getWalletsForUser(): Promise<WalletLink[]> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return [];
  }
  try {
    const wallets = await db.query('SELECT id, user_id as userId, email, wallet_address as walletAddress, is_public as isPublic, user_expected_address as userExpectedAddress, transaction_history as transactionHistory FROM wallet_links WHERE user_id = ? ORDER BY created_at DESC', [userId]) as WalletLink[];
    return wallets.map(w => ({...w, isPublic: Boolean(w.isPublic)}));
  } catch (error: any) {
    console.error('Error fetching wallets:', error);
    return [];
  }
}

export async function updateWalletPrivacy(walletId: string, isPublic: boolean): Promise<{ success: boolean; error?: string }> {
  const userId = await getUserIdFromSession();
   if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  try {
    const result = await db.execute('UPDATE wallet_links SET is_public = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [isPublic ? 1 : 0, walletId, userId]);
    if (result.changes > 0) {
      await addNotification(
        userId,
        'info',
        'Wallet Privacy Updated',
        `Your wallet link is now ${isPublic ? 'Public' : 'Private'}.`
      );
      return { success: true };
    }
    return { success: false, error: 'Wallet not found or permission denied.' };
  } catch (error: any) {
    console.error('Error updating wallet privacy:', error);
    return { success: false, error: error.message || 'Failed to update privacy.' };
  }
}

export async function removeWalletLink(walletId: string): Promise<{ success: boolean; error?: string }> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  try {
    const result = await db.execute('DELETE FROM wallet_links WHERE id = ? AND user_id = ?', [walletId, userId]);
    if (result.changes > 0) {
      await addNotification(
        userId,
        'warning',
        'Wallet Unlinked',
        'Your wallet has been successfully unlinked from your account.'
      );
      return { success: true };
    }
    return { success: false, error: 'Wallet not found or permission denied.' };
  } catch (error: any) {
    console.error('Error removing wallet link:', error);
    return { success: false, error: error.message || 'Failed to remove wallet.' };
  }
}

export async function getPublicWalletByEmail(email: string): Promise<Pick<WalletLink, 'email' | 'walletAddress'> | null> {
  if (!email) return null;
  try {
    const result = await db.get('SELECT email, wallet_address as walletAddress FROM wallet_links WHERE email = ? AND is_public = 1 LIMIT 1', [email.toLowerCase()]) as Pick<WalletLink, 'email' | 'walletAddress'> | null;
    return result || null;
  } catch (error) {
    console.error('Error fetching public wallet by email:', error);
    return null;
  }
}

export interface TopWallet extends Pick<WalletLink, 'email' | 'walletAddress'> {
  balance: number;
}

export async function getTopPublicWalletsByBalance(limit: number = 5): Promise<TopWallet[]> {
  try {
    const links = await db.query(
      'SELECT email, wallet_address as walletAddress FROM wallet_links WHERE is_public = 1'
    ) as Pick<WalletLink, 'email' | 'walletAddress'>[];

    const walletsWithBalancePromises = links.map(async (link) => {
      // We only need mainnet balances for this leaderboard.
      const accountDetails = await getAccountDetails(link.walletAddress, 'mainnet');
      return {
        ...link,
        balance: accountDetails?.balance ?? 0,
      };
    });

    const walletsWithBalances = await Promise.all(walletsWithBalancePromises);

    const sortedWallets = walletsWithBalances.sort((a, b) => b.balance - a.balance);

    return sortedWallets.slice(0, limit);
  } catch (error) {
    console.error('Error fetching top public wallets:', error);
    return []; // Return an empty array in case of error
  }
}
