/**
 * Application-layer encryption (AES-256-GCM).
 *
 * Used for secrets that must hit Postgres but should remain unreadable even
 * if the database is exfiltrated — e.g. OAuth refresh tokens stored on
 * EmailAccount. The key is loaded from `ENCRYPTION_KEY` (base64 of 32 bytes,
 * generated with `openssl rand -base64 32`).
 *
 * Format on disk: a single base64 string of `iv (12B) | ciphertext | tag (16B)`.
 * That's compact (~30 bytes overhead) and self-describing so callers don't
 * need to track an IV separately.
 *
 * Failure mode: if `ENCRYPTION_KEY` is missing, encrypt() throws. We do NOT
 * fall through to plaintext storage — that would be far worse than a hard
 * error during dev setup.
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { env } from '@/lib/env'

const ALG = 'aes-256-gcm'
const IV_LEN = 12 // GCM-recommended
const TAG_LEN = 16

function getKey(): Buffer {
  const raw = env.ENCRYPTION_KEY
  if (!raw) {
    throw new EncryptionError(
      'ENCRYPTION_KEY is not set. Generate one with: openssl rand -base64 32'
    )
  }
  const buf = Buffer.from(raw, 'base64')
  if (buf.length !== 32) {
    throw new EncryptionError(
      `ENCRYPTION_KEY must decode to exactly 32 bytes; got ${buf.length}`
    )
  }
  return buf
}

/** Encrypt a UTF-8 string. Returns base64 ciphertext (iv || ct || tag). */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALG, key, iv)
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, ct, tag]).toString('base64')
}

/** Decrypt a base64 payload produced by `encrypt()`. */
export function decrypt(payload: string): string {
  const key = getKey()
  const buf = Buffer.from(payload, 'base64')
  if (buf.length < IV_LEN + TAG_LEN + 1) {
    throw new EncryptionError('Ciphertext payload too short to be valid')
  }
  const iv = buf.subarray(0, IV_LEN)
  const tag = buf.subarray(buf.length - TAG_LEN)
  const ct = buf.subarray(IV_LEN, buf.length - TAG_LEN)
  const decipher = createDecipheriv(ALG, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8')
}

export class EncryptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EncryptionError'
  }
}
