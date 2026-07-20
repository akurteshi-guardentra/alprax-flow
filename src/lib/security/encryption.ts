import { supabase } from '@/integrations/supabase/client';

/**
 * Secure encryption service for sensitive data like Stellar secret keys
 * Uses AES-256-GCM with PBKDF2 key derivation and high iteration counts
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_DERIVATION_ALGORITHM = 'PBKDF2';
const ITERATIONS = 600000; // High iteration count for security
const SALT_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM
const KEY_LENGTH = 256; // 256 bits

/**
 * Fetch a per-user encryption key material from the server. The key is
 * derived server-side via HKDF from a secret master key that is never
 * exposed to the client, so leaking the encrypted_secret column plus a
 * user's public metadata (id, email, created_at) is no longer enough
 * to decrypt wallet secrets.
 */
let cachedServerKey: string | null = null;
async function fetchServerEncryptionKey(): Promise<string> {
  if (cachedServerKey) return cachedServerKey;
  const { data, error } = await supabase.functions.invoke('wallet-encryption-key');
  if (error || !data?.key) {
    throw new Error('Unable to obtain wallet encryption key');
  }
  cachedServerKey = data.key as string;
  return cachedServerKey;
}

/**
 * Build the password fed into PBKDF2. We combine the server-issued
 * per-user key with the caller's user id so that even if the server
 * key were ever leaked, ciphertexts remain bound to a specific user.
 * Legacy ciphertexts (encrypted with the old user-metadata-only
 * password) are still readable via getLegacyUserEncryptionKey below.
 */
async function getUserEncryptionKey(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  const serverKey = await fetchServerEncryptionKey();
  return `${serverKey}:${user.id}`;
}

async function getLegacyUserEncryptionKey(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return `${user.id}_${user.email}_${user.created_at}`;
}


/**
 * Derive a cryptographic key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const importedKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    KEY_DERIVATION_ALGORITHM,
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: KEY_DERIVATION_ALGORITHM,
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    importedKey,
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a Stellar secret key using AES-256-GCM
 * @param secretKey The Stellar secret key to encrypt
 * @returns Base64 encoded encrypted data with salt and IV
 */
/**
 * Encrypt a Stellar secret key using AES-256-GCM
 * @param secretKey - The Stellar secret key to encrypt
 * @returns Base64-encoded encrypted data with salt and IV
 */
export async function encryptStellarSecret(secretKey: string): Promise<string> {
  try {
    // Validate Stellar secret key format
    if (!secretKey.startsWith('S') || secretKey.length !== 56) {
      throw new Error('Invalid Stellar secret key format');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(secretKey);
    
    // Generate cryptographically secure random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    // Get user's encryption password
    const userPassword = await getUserEncryptionKey();
    
    // Derive encryption key
    const key = await deriveKey(userPassword, salt);
    
    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv
      },
      key,
      data
    );
    
    // Combine salt, IV, and encrypted data
    const combined = new Uint8Array(
      salt.length + iv.length + encryptedData.byteLength
    );
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length);
    
    // Return as base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Failed to encrypt Stellar secret:', error);
    throw new Error('Encryption failed - unable to secure secret key');
  }
}

/**
 * Decrypts a Stellar secret key using AES-256-GCM
 * @param encryptedData Base64 encoded encrypted data
 * @returns The decrypted Stellar secret key
 */
/**
 * Decrypt a Stellar secret key from encrypted data
 * Handles both modern encrypted format and legacy base64 format
 * @param encryptedData - Base64-encoded encrypted data or legacy format
 * @returns Decrypted Stellar secret key
 */
export async function decryptStellarSecret(encryptedData: string): Promise<string> {
  const combined = new Uint8Array(
    atob(encryptedData).split('').map(char => char.charCodeAt(0))
  );

  const minLength = SALT_LENGTH + IV_LENGTH + 1;
  if (combined.length < minLength) {
    throw new Error('Invalid encrypted data format');
  }

  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH);

  const tryDecrypt = async (password: string): Promise<string | null> => {
    try {
      const key = await deriveKey(password, salt);
      const decryptedData = await crypto.subtle.decrypt(
        { name: ENCRYPTION_ALGORITHM, iv },
        key,
        encrypted
      );
      const secretKey = new TextDecoder().decode(decryptedData);
      if (!secretKey.startsWith('S') || secretKey.length !== 56) return null;
      return secretKey;
    } catch {
      return null;
    }
  };

  // Try new server-derived key first, then fall back to legacy password
  // so previously stored ciphertexts remain readable during migration.
  try {
    const modern = await tryDecrypt(await getUserEncryptionKey());
    if (modern) return modern;
  } catch (e) {
    console.warn('Modern decryption path unavailable, trying legacy', e);
  }

  const legacy = await tryDecrypt(await getLegacyUserEncryptionKey());
  if (legacy) return legacy;

  throw new Error('Decryption failed - invalid password or corrupted data');
}



/**
 * Migrate legacy Base64-encoded secrets to proper encryption
 * @param legacyEncryptedData Base64 encoded secret (old format)
 * @returns Properly encrypted secret key
 */
export async function migrateLegacySecret(legacyEncryptedData: string): Promise<string> {
  try {
    // Attempt to decode legacy Base64 data
    const secretKey = atob(legacyEncryptedData);
    
    // Validate it's a Stellar secret key
    if (!secretKey.startsWith('S') || secretKey.length !== 56) {
      throw new Error('Legacy data is not a valid Stellar secret key');
    }
    
    // Re-encrypt with proper encryption
    return await encryptStellarSecret(secretKey);
  } catch (error) {
    console.error('Failed to migrate legacy secret:', error);
    throw new Error('Migration failed - unable to upgrade encryption');
  }
}

/**
 * Detect if encrypted data is in legacy format (simple Base64)
 * @param encryptedData The encrypted data to check
 * @returns True if legacy format, false if modern format
 */
export function isLegacyFormat(encryptedData: string): boolean {
  try {
    // Legacy format: just Base64 encoded secret key
    const decoded = atob(encryptedData);
    return decoded.startsWith('S') && decoded.length === 56;
  } catch {
    return false;
  }
}

/**
 * Generate a secure random encryption salt
 */
export function generateSecureSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generate a secure random IV for encryption
 */
export function generateSecureIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}