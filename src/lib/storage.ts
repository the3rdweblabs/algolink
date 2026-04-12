// src/lib/storage.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { put } from '@vercel/blob';

const STORAGE_MODE = process.env.STORAGE_MODE || 'local';

/**
 * Uploads an avatar image to either local disk or Vercel Blob.
 * Returns the public URL of the uploaded image.
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const fileExtension = file.name.split('.').pop() || 'png';
  const fileName = `${userId}-${Date.now()}.${fileExtension}`;

  if (STORAGE_MODE === 'cloud') {
    console.log('[STORAGE]: Uploading to Vercel Blob');
    // Ensure you have BLOB_READ_WRITE_TOKEN set in your environment
    const blob = await put(`avatars/${fileName}`, file, {
      access: 'public',
      contentType: file.type,
    });
    return blob.url;
  } else {
    console.log('[STORAGE]: Uploading to Local Disk');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    
    // Return relative URL for local development
    return `/uploads/avatars/${fileName}`;
  }
}

/**
 * Basic file validation for avatars
 */
export function validateAvatar(file: File) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, message: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.' };
  }

  // Max size: 7MB (as requested)
  if (file.size > 7 * 1024 * 1024) {
    return { valid: false, message: 'File too large. Max size is 7MB.' };
  }

  return { valid: true };
}
