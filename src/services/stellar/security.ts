
import CryptoJS from 'crypto-js';

/**
 * Enhanced encryption for Stellar secret keys using AES encryption
 */
export function encryptSecretKey(secretKey: string, password: string): string {
  try {
    // Generate a random salt for better security
    const salt = CryptoJS.lib.WordArray.random(128/8);
    
    // Derive key using PBKDF2 with salt
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    // Encrypt the secret key
    const encrypted = CryptoJS.AES.encrypt(secretKey, key, {
      iv: salt,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });
    
    // Combine salt and encrypted data
    const combined = salt.concat(encrypted.ciphertext);
    return combined.toString(CryptoJS.enc.Base64);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt secret key');
  }
}

/**
 * Enhanced decryption for Stellar secret keys
 */
export function decryptSecretKey(encryptedKey: string, password: string): string {
  try {
    // Parse the combined data
    const combined = CryptoJS.enc.Base64.parse(encryptedKey);
    
    // Extract salt (first 16 bytes) and ciphertext
    const salt = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
    const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(4));
    
    // Derive the same key using PBKDF2
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    // Decrypt the ciphertext directly using AES
    const decrypted = CryptoJS.AES.decrypt(
      ciphertext.toString(CryptoJS.enc.Base64),
      key,
      {
        iv: salt,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      }
    );
    
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      throw new Error('Invalid password or corrupted data');
    }
    
    return decryptedText;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt secret key - invalid password or corrupted data');
  }
}

/**
 * Validate if a string is a valid Stellar secret key
 */
export function isValidStellarSecret(secretKey: string): boolean {
  try {
    return secretKey.startsWith('S') && secretKey.length === 56;
  } catch {
    return false;
  }
}

/**
 * Generate a secure random password for encryption
 */
export function generateSecurePassword(): string {
  return CryptoJS.lib.WordArray.random(256/8).toString();
}
