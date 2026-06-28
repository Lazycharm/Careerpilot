import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const ORIGINAL = process.env.ENCRYPTION_KEY

beforeAll(() => {
  // 32 bytes of zeros, base64 — fine for tests.
  process.env.ENCRYPTION_KEY = Buffer.alloc(32, 1).toString('base64')
})

afterAll(() => {
  if (ORIGINAL === undefined) delete process.env.ENCRYPTION_KEY
  else process.env.ENCRYPTION_KEY = ORIGINAL
})

describe('encryption (AES-256-GCM)', () => {
  it('round-trips arbitrary UTF-8 strings', async () => {
    const { encrypt, decrypt } = await import('@/lib/security/encryption')
    const samples = [
      'hello world',
      'مرحبا بالعالم',
      'with\nnewlines\tand\ttabs',
      'a'.repeat(2048),
      '🚀🔑',
    ]
    for (const s of samples) {
      const ct = encrypt(s)
      expect(ct).not.toContain(s)
      expect(decrypt(ct)).toBe(s)
    }
  })

  it('produces different ciphertext for the same plaintext (random IV)', async () => {
    const { encrypt } = await import('@/lib/security/encryption')
    const a = encrypt('same')
    const b = encrypt('same')
    expect(a).not.toBe(b)
  })

  it('rejects tampered ciphertext', async () => {
    const { encrypt, decrypt } = await import('@/lib/security/encryption')
    const ct = encrypt('secret')
    const flipped =
      ct.slice(0, ct.length - 4) + (ct.slice(-4) === 'AAAA' ? 'BBBB' : 'AAAA')
    expect(() => decrypt(flipped)).toThrow()
  })
})
