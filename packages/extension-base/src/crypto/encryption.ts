import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { randomAsU8a, blake2AsU8a } from '@polkadot/util-crypto';

export class EncryptionService {
  /**
   * Derive encryption key from password
   */
  static deriveKey(password: string, salt?: Uint8Array): Uint8Array {
    const actualSalt = salt || randomAsU8a(32);
    const passwordBytes = naclUtil.decodeUTF8(password);
    const combined = new Uint8Array(passwordBytes.length + actualSalt.length);
    combined.set(passwordBytes);
    combined.set(actualSalt, passwordBytes.length);

    // Use Blake2 for key derivation (similar to Argon2 but available in Polkadot libs)
    return blake2AsU8a(combined, 256);
  }

  /**
   * Encrypt data with password
   */
  static encrypt(data: string | Uint8Array, password: string): {
    encrypted: string;
    nonce: string;
    salt: string;
  } {
    console.log('[EncryptionService] encrypt called with password length:', password.length);
    const salt = randomAsU8a(32);
    const key = this.deriveKey(password, salt);
    const nonce = randomAsU8a(24);

    const dataBytes = typeof data === 'string'
      ? naclUtil.decodeUTF8(data)
      : data;

    const encrypted = nacl.secretbox(dataBytes, nonce, key.slice(0, 32));

    console.log('[EncryptionService] Data encrypted successfully, salt length:', salt.length);

    return {
      encrypted: naclUtil.encodeBase64(encrypted),
      nonce: naclUtil.encodeBase64(nonce),
      salt: naclUtil.encodeBase64(salt)
    };
  }

  /**
   * Decrypt data with password
   */
  static decrypt(
    encryptedData: string,
    nonce: string,
    salt: string,
    password: string
  ): string | null {
    try {
      console.log('[EncryptionService] decrypt called with password length:', password.length);
      console.log('[EncryptionService] Salt:', salt.substring(0, 20) + '...');

      const key = this.deriveKey(
        password,
        naclUtil.decodeBase64(salt)
      );

      console.log('[EncryptionService] Key derived, attempting decryption...');

      const decrypted = nacl.secretbox.open(
        naclUtil.decodeBase64(encryptedData),
        naclUtil.decodeBase64(nonce),
        key.slice(0, 32)
      );

      if (!decrypted) {
        console.error('[EncryptionService] Decryption returned null - INCORRECT PASSWORD');
        return null;
      }

      console.log('[EncryptionService] Decryption successful!');
      return naclUtil.encodeUTF8(decrypted);
    } catch (error) {
      console.error('[EncryptionService] Decryption exception:', error);
      return null;
    }
  }

  /**
   * Generate secure random password
   */
  static generatePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const randomBytes = randomAsU8a(length);
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset[randomBytes[i] % charset.length];
    }

    return password;
  }

  /**
   * Hash password for verification
   */
  static hashPassword(password: string): string {
    const hash = blake2AsU8a(naclUtil.decodeUTF8(password), 256);
    return naclUtil.encodeBase64(hash);
  }

  /**
   * Verify password against hash
   */
  static verifyPassword(password: string, hash: string): boolean {
    const passwordHash = this.hashPassword(password);
    return passwordHash === hash;
  }

  /**
   * Create encrypted vault data
   */
  static createVault(data: unknown, password: string): {
    vault: string;
    checksum: string;
  } {
    const jsonData = JSON.stringify(data);
    const encrypted = this.encrypt(jsonData, password);

    // Create checksum for integrity
    const checksum = naclUtil.encodeBase64(
      blake2AsU8a(naclUtil.decodeUTF8(jsonData), 128)
    );

    return {
      vault: JSON.stringify(encrypted),
      checksum
    };
  }

  /**
   * Open encrypted vault
   */
  static openVault(vault: string, password: string): unknown | null {
    try {
      const vaultData = JSON.parse(vault);
      const decrypted = this.decrypt(
        vaultData.encrypted,
        vaultData.nonce,
        vaultData.salt,
        password
      );

      if (!decrypted) {
        return null;
      }

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to open vault:', error);
      return null;
    }
  }
}