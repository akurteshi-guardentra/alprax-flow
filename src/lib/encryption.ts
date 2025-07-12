import { supabase } from '@/integrations/supabase/client';

/**
 * Encryption utilities for sensitive data like Stellar secret keys
 * This provides a more secure way to encrypt/decrypt sensitive information
 */

// Generate a key from a password using PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const importedKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    importedKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
}

// Get or create encryption key for the user
async function getUserEncryptionKey(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Use user ID as part of the encryption key
  // In production, this should be combined with additional entropy
  return `stellar_key_${user.id}_${user.email}`;
}

/**
 * Encrypts a Stellar secret key using AES-GCM
 * @param secretKey The Stellar secret key to encrypt
 * @returns Base64 encoded encrypted data with salt and IV
 */
export async function encryptStellarSecret(secretKey: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(secretKey);
    
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Get user's encryption password
    const userPassword = await getUserEncryptionKey();
    
    // Derive encryption key
    const key = await deriveKey(userPassword, salt);
    
    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );
    
    // Combine salt, IV, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length);
    
    // Return as base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Failed to encrypt Stellar secret:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypts a Stellar secret key using AES-GCM
 * @param encryptedData Base64 encoded encrypted data
 * @returns The decrypted Stellar secret key
 */
export async function decryptStellarSecret(encryptedData: string): Promise<string> {
  try {
    // Decode from base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    
    // Get user's encryption password
    const userPassword = await getUserEncryptionKey();
    
    // Derive decryption key
    const key = await deriveKey(userPassword, salt);
    
    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encrypted
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Failed to decrypt Stellar secret:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Legacy decrypt function for backwards compatibility
 * This handles secrets that were encrypted with simple base64 encoding
 */
export function legacyDecryptStellarSecret(encryptedData: string): string {
  try {
    return atob(encryptedData);
  } catch (error) {
    throw new Error('Legacy decryption failed');
  }
}