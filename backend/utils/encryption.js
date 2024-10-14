// utils/encryption.js
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest('base64').substr(0, 32);
const ivLength = 16; // AES block size is 16 bytes

// Encrypt function
export function encrypt(text) {
  const iv = crypto.randomBytes(ivLength); // Generate a random IV
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex'); // Return IV and encrypted text
}

// Decrypt function
export function decrypt(text) {
  const [iv, encryptedText] = text.split(':');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'), 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
