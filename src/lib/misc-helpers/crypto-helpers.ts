/**
  MIT License

  Copyright (c) 2025 AC Autonomous Systems, LLC

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the “Software”), to deal
  in the Software without restriction, including without limitation the rights  
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
  copies of the Software, and to permit persons to whom the Software is  
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all  
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
  SOFTWARE.
 */

import * as crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});
// Use a secure encryption key stored in an environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes for AES-256
const IV_LENGTH = 16; // Initialization vector length for AES

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error(
    'ENCRYPTION_KEY not found or not of length 64 in hex format.'
  );
}

/**
 * Encrypts the given string.
 * @param {string} apiKey - The string to encrypt.
 * @returns {string} The encrypted string, with IV prepended (base64 encoded).
 */
export function encryptString(apiKey: string): string {
  // Generate a random IV
  const iv = crypto.randomBytes(IV_LENGTH);
  const keyInBuffer = Buffer.from(ENCRYPTION_KEY as string, 'hex');

  // Create a cipher instance
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    new Uint8Array(keyInBuffer),
    new Uint8Array(iv)
  );

  let encrypted = cipher.update(apiKey, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return `${iv.toString('base64')}:${encrypted}`; // Store IV alongside the encrypted data
}

/**
 * Decrypts the string.
 * @param {string} encryptedApiKey - The encrypted string (base64 encoded with IV).
 * @returns {string} - The decrypted string.
 */
export function decryptString(encryptedApiKey: string): string {
  const [ivBase64, encryptedBase64] = encryptedApiKey.split(':');

  if (!ivBase64 || !encryptedBase64) {
    throw new Error('Invalid encrypted string format.');
  }

  const iv = Buffer.from(ivBase64, 'base64');
  const keyInBuffer = Buffer.from(ENCRYPTION_KEY as string, 'hex');

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    new Uint8Array(keyInBuffer),
    new Uint8Array(iv)
  );

  let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
