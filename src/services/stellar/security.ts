
/**
 * Encrypts a Stellar secret key
 * Note: This is a simple encryption for demo purposes only
 * In production, use a proper encryption library
 */
export function encryptSecretKey(secretKey: string, password: string): string {
  // In a real app, use a proper encryption library
  // This is just for demonstration
  return btoa(`${password}:${secretKey}`);
}

/**
 * Decrypts a Stellar secret key
 */
export function decryptSecretKey(encryptedKey: string, password: string): string {
  try {
    const decoded = atob(encryptedKey);
    const [storedPassword, secretKey] = decoded.split(':');
    
    if (storedPassword !== password) {
      throw new Error('Invalid password');
    }
    
    return secretKey;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt secret key');
  }
}

