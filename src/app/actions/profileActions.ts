'use server';

import db from '@/lib/db';
import { getSession, createSession, getUserIdFromSession } from '@/lib/auth';
import { addNotification } from './notificationActions';
import { sendProfileUpdateEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';
import { getAccountDetails, getAssetDetails } from './explorerActions';
import { getWalletsForUser } from './walletActions';
import { uploadAvatar, validateAvatar, deleteAvatar } from '@/lib/storage';

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error('You must be logged in to update your profile.');
  }

  const userId = session.userId;
  const displayName = formData.get('displayName') as string;
  const avatarEntry = formData.get('avatar');
  const directAvatarUrl = formData.get('avatarUrl') as string | null;
  const oldAvatarUrl = session.avatarUrl;

  try {
    let avatarUrl = directAvatarUrl || oldAvatarUrl;

    // Handle avatar upload if provided and not empty
    if (avatarEntry instanceof File && avatarEntry.size > 0) {
      const avatarFile = avatarEntry;
      
      const validation = validateAvatar(avatarFile);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      // Use the hybrid storage utility
      avatarUrl = await uploadAvatar(avatarFile, userId);

      // Clean up the old avatar if a new one was just successfully uploaded
      if (avatarUrl !== oldAvatarUrl) {
        await deleteAvatar(oldAvatarUrl);
      }
    }

    // Update database
    await db.execute(`
      UPDATE users 
      SET display_name = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [displayName, avatarUrl, userId]);

    // Update session cookie
    await createSession(
      userId,
      session.email,
      session.isVerified,
      displayName,
      avatarUrl
    );

    // Add dashboard notification
    await addNotification(
      userId,
      'success',
      'Profile Updated',
      'Your profile information and avatar have been successfully updated.'
    );

    // Send security email
    try {
      await sendProfileUpdateEmail(session.email, displayName);
    } catch (emailError) {
      console.error('Failed to send profile update email:', emailError);
    }

    revalidatePath('/dashboard');
    return { success: true, avatarUrl, message: 'Profile updated successfully!' };

  } catch (error: any) {
    console.error('[PROFILE-ACTION-ERROR]:', error);
    return { success: false, message: error.message || 'Failed to update profile. Please try again.' };
  }
}

/**
 * Fetches NFTs owned by the user from all linked wallets across Mainnet and Testnet.
 */
export async function getUserNfts() {
    const userId = await getUserIdFromSession();
    if (!userId) return [];

    try {
        const wallets = await getWalletsForUser();
        if (wallets.length === 0) return [];

        const nftPromises: Promise<any>[] = [];
        const networks: ('mainnet' | 'testnet')[] = ['mainnet', 'testnet'];

        for (const wallet of wallets) {
            for (const network of networks) {
                nftPromises.push((async () => {
                    const accountDetails = await getAccountDetails(wallet.walletAddress, network);
                    if (!accountDetails || !accountDetails.assets) return [];

                    // Filter for likely NFTs (amount=1, decimals=0)
                    const potentialNfts = accountDetails.assets.filter(a => a.amount === 1 && a.decimals === 0);
                    
                    // Resolve full details for these assets
                    const detailedNfts = await Promise.all(
                        potentialNfts.map(async (asset) => {
                            try {
                                return await getAssetDetails(asset.assetId.toString(), network);
                            } catch (e) {
                                return null;
                            }
                        })
                    );

                    return detailedNfts.filter(Boolean);
                })());
            }
        }

        const results = await Promise.all(nftPromises);
        return results.flat();
    } catch (error) {
        console.error('Error fetching user NFTs:', error);
        return [];
    }
}
