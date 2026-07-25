import { createCipheriv, createDecipheriv, createHmac, createHash, randomBytes, timingSafeEqual } from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;

export function generateTotpSecret(length = 20): string {
  const bytes = randomBytes(length);
  let bits = '';
  for (const byte of bytes) bits += byte.toString(2).padStart(8, '0');

  let secret = '';
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    secret += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  return secret;
}

function decodeBase32(value: string): Buffer {
  const normalized = value.replace(/[=\s-]/g, '').toUpperCase();
  let bits = '';
  for (const character of normalized) {
    const index = BASE32_ALPHABET.indexOf(character);
    if (index === -1) throw new Error('Invalid TOTP secret');
    bits += index.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function generateCode(secret: string, counter: number): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const hash = createHmac('sha1', decodeBase32(secret)).update(counterBuffer).digest();
  const offset = hash[hash.length - 1] & 0x0f;
  const value = ((hash[offset] & 0x7f) << 24) | (hash[offset + 1] << 16) | (hash[offset + 2] << 8) | hash[offset + 3];
  return String(value % 1_000_000).padStart(6, '0');
}

export function verifyTotp(secret: string, code: string, now = Date.now()): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const counter = Math.floor(now / 1000 / STEP_SECONDS);
  for (let offset = -1; offset <= 1; offset++) {
    const candidate = Buffer.from(generateCode(secret, counter + offset));
    const supplied = Buffer.from(code);
    if (candidate.length === supplied.length && timingSafeEqual(candidate, supplied)) return true;
  }
  return false;
}

function encryptionKey(keyMaterial: string): Buffer {
  if (!keyMaterial) throw new Error('MFA_ENCRYPTION_KEY must be configured before enrolling MFA');
  return createHash('sha256').update(keyMaterial).digest();
}

export function encryptSecret(secret: string, keyMaterial: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(keyMaterial), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return [iv.toString('base64'), cipher.getAuthTag().toString('base64'), ciphertext.toString('base64')].join('.');
}

export function decryptSecret(encryptedSecret: string, keyMaterial: string): string {
  const [iv, tag, ciphertext] = encryptedSecret.split('.');
  if (!iv || !tag || !ciphertext) throw new Error('Invalid encrypted MFA secret');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(keyMaterial), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8');
}
