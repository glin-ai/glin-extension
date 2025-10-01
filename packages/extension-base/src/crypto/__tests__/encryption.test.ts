import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../encryption';

describe('Encryption Utilities', () => {
  it('encrypts and decrypts data correctly', async () => {
    const originalData = 'sensitive data';
    const password = 'test-password-123';

    const encrypted = await encrypt(originalData, password);

    expect(encrypted.ciphertext).toBeTruthy();
    expect(encrypted.nonce).toBeTruthy();
    expect(encrypted.salt).toBeTruthy();
    expect(encrypted.ciphertext).not.toBe(originalData);

    const decrypted = await decrypt(
      encrypted.ciphertext,
      encrypted.nonce,
      encrypted.salt,
      password
    );

    expect(decrypted).toBe(originalData);
  });

  it('fails to decrypt with wrong password', async () => {
    const originalData = 'sensitive data';
    const correctPassword = 'correct-password';
    const wrongPassword = 'wrong-password';

    const encrypted = await encrypt(originalData, correctPassword);

    await expect(
      decrypt(encrypted.ciphertext, encrypted.nonce, encrypted.salt, wrongPassword)
    ).rejects.toThrow();
  });

  it('generates different ciphertext for same data', async () => {
    const data = 'test data';
    const password = 'password';

    const encrypted1 = await encrypt(data, password);
    const encrypted2 = await encrypt(data, password);

    // Different salts and nonces should produce different ciphertexts
    expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
    expect(encrypted1.nonce).not.toBe(encrypted2.nonce);
    expect(encrypted1.salt).not.toBe(encrypted2.salt);

    // But both should decrypt to the same data
    const decrypted1 = await decrypt(
      encrypted1.ciphertext,
      encrypted1.nonce,
      encrypted1.salt,
      password
    );
    const decrypted2 = await decrypt(
      encrypted2.ciphertext,
      encrypted2.nonce,
      encrypted2.salt,
      password
    );

    expect(decrypted1).toBe(data);
    expect(decrypted2).toBe(data);
  });
});
