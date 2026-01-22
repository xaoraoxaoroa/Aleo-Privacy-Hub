import CryptoJS from 'crypto-js';

// Encrypt data with a key
export function encrypt(data: string, key: string): string {
  return CryptoJS.AES.encrypt(data, key).toString();
}

// Decrypt data with a key
export function decrypt(encryptedData: string, key: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
}

// Hash data using SHA256
export function hash(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

// Generate random ID
export function generateId(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

// Convert string to field format for Leo
export function stringToField(str: string): string {
  const hashValue = CryptoJS.SHA256(str).toString();
  // Take first 62 chars to fit in field (Aleo field is ~253 bits)
  const truncated = hashValue.slice(0, 62);
  return `${truncated}field`;
}

// Parse field value to extract hash
export function fieldToHash(field: string): string {
  return field.replace('field', '');
}

// Generate a secure random secret
export function generateSecret(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}

// Create a commitment (hash of value + secret)
export function createCommitment(value: string, secret: string): string {
  return hash(value + secret);
}

// Verify a commitment
export function verifyCommitment(value: string, secret: string, commitment: string): boolean {
  return createCommitment(value, secret) === commitment;
}
