import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // GCM standard
// const SALT_LENGTH = 64; // For key derivation - not using salt for IV directly with GCM
const KEY_LENGTH = 32; // For AES-256
const TAG_LENGTH = 16; // GCM standard

// Ensure TOKEN_ENCRYPTION_KEY is set and is a string
const secretKeyInput = process.env.TOKEN_ENCRYPTION_KEY;

let encryptionKey: Buffer;

if (!secretKeyInput || typeof secretKeyInput !== 'string' || secretKeyInput.length < 32) {
  console.error(
    'FATAL: TOKEN_ENCRYPTION_KEY is not set, not a string, or is less than 32 characters long. Please provide a strong, 32-byte (256-bit) key.',
  );
  // In a real app, you might throw an error here or have a more robust config system.
  // Using a predictable fallback key is highly insecure and for demonstration only.
  // Replace this with a proper key management strategy or ensure the env var is always set.
  encryptionKey = crypto.pbkdf2Sync(
    'default-highly-insecure-fallback-key-replace-me',
    'fixed-salt-for-redario-token-encryption',
    100000,
    KEY_LENGTH,
    'sha512',
  );
  if (process.env.NODE_ENV === 'production') {
    // Optional: throw an error in production if a fallback is used or key is weak
    // throw new Error("TOKEN_ENCRYPTION_KEY is not configured securely for production.");
  }
} else {
  // Use PBKDF2 to ensure the key is of the correct length and to add some resistance to dictionary attacks
  // if the provided key isn't perfectly random (though a random 32-byte string is best).
  encryptionKey = crypto.pbkdf2Sync(
    secretKeyInput,
    'fixed-salt-for-redario-token-encryption', // Use a fixed, application-specific salt
    100000, // Iterations - adjust as needed for your security/performance balance
    KEY_LENGTH, // 32 bytes for AES-256
    'sha512',
  );
}


/**
 * Encrypts a plaintext string.
 * @param text The plaintext string to encrypt.
 * @returns A string in the format "iv:encryptedData:authTag" or null if encryption fails.
 */
export function encrypt(text: string): string | null {
  try {
    if (!encryptionKey) { // Should be initialized by now
      console.error("Encryption failed: Encryption key is not available.");
      return null;
    }
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
}

/**
 * Decrypts a string that was encrypted with the encrypt function.
 * @param encryptedText The encrypted string in "iv:encryptedData:authTag" format.
 * @returns The original plaintext string or null if decryption fails.
 */
export function decrypt(encryptedText: string): string | null {
  try {
    if (!encryptionKey) { // Should be initialized by now
      console.error("Decryption failed: Encryption key is not available.");
      return null;
    }
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      console.error('Decryption error: Invalid encrypted text format. Expected iv:encryptedData:authTag');
      return null;
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');

    if (iv.length !== IV_LENGTH) {
        console.error('Decryption error: Invalid IV length.');
        return null;
    }
    if (authTag.length !== TAG_LENGTH) {
        console.error('Decryption error: Invalid authTag length.');
        return null;
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // Errors here can include "Unsupported state or unable to authenticate data" if authTag is wrong or data corrupted
    console.error('Decryption error:', error);
    return null;
  }
} 