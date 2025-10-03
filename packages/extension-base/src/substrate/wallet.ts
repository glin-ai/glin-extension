import { KeyringPair } from '@polkadot/keyring/types';
import { MnemonicService } from '../crypto/mnemonic';
import { KeyringService } from '../crypto/keyring';
import { EncryptionService } from '../crypto/encryption';
import { db, Wallet, Account, Transaction } from '../storage/db';
import { WalletSDK } from '../sdk/adapter';

export interface WalletService {
  currentWallet: Wallet | null;
  currentAccount: KeyringPair | null;
  client: WalletSDK;
}

export class WalletManager {
  private keyringService: KeyringService;
  private client: WalletSDK;
  private currentWallet: Wallet | null = null;
  private currentPair: KeyringPair | null = null;

  constructor(rpcEndpoint: string) {
    this.keyringService = new KeyringService();
    this.client = new WalletSDK(rpcEndpoint, {
      useSDKForBalance: true,
      useSDKForTransfer: true,
      useSDKForSubscriptions: true,
      useSDKForBlocks: true,
    });
  }

  /**
   * Initialize wallet manager
   */
  async init(): Promise<void> {
    console.log('[WalletManager] init() called');
    await this.keyringService.init();
    await this.client.connect();

    // Load active wallet if exists
    const activeWallet = await db.getActiveWallet();
    console.log('[WalletManager] Active wallet from DB:', activeWallet);
    if (activeWallet) {
      this.currentWallet = activeWallet;
      console.log('[WalletManager] Loaded wallet into memory:', this.currentWallet);
    } else {
      console.log('[WalletManager] No active wallet found in DB');
    }
  }

  /**
   * Create new wallet
   */
  async createWallet(
    name: string,
    password: string,
    mnemonic?: string
  ): Promise<{ wallet: Wallet; mnemonic: string }> {
    // Generate or validate mnemonic
    const seedPhrase = mnemonic || MnemonicService.generate();
    if (!MnemonicService.validate(seedPhrase)) {
      throw new Error('Invalid mnemonic phrase');
    }

    // Create keypair
    const pair = this.keyringService.createFromMnemonic(seedPhrase, name);

    // Encrypt seed for storage
    const encrypted = EncryptionService.encrypt(seedPhrase, password);

    // Save to database
    const wallet: Wallet = {
      name,
      encryptedSeed: encrypted.encrypted,
      nonce: encrypted.nonce,
      salt: encrypted.salt,
      address: pair.address,
      publicKey: pair.publicKey.toString(),
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true
    };

    // Deactivate other wallets
    const allWallets = await db.wallets.toArray();
    for (const wallet of allWallets) {
      if (wallet.isActive && wallet.id) {
        await db.wallets.update(wallet.id, { isActive: false });
      }
    }

    // Save new wallet
    const id = await db.wallets.add(wallet);
    wallet.id = typeof id === 'number' ? id : Number(id);

    // Create default account
    await this.createAccount(wallet.id, 0, 'Main Account');

    // Set as current
    this.currentWallet = wallet;
    this.currentPair = pair;

    return { wallet, mnemonic: seedPhrase };
  }

  /**
   * Import wallet from mnemonic
   */
  async importWallet(
    name: string,
    mnemonic: string,
    password: string
  ): Promise<Wallet> {
    const result = await this.createWallet(name, password, mnemonic);
    return result.wallet;
  }

  /**
   * Unlock wallet with password
   */
  async unlockWallet(walletId: number, password: string): Promise<boolean> {
    const wallet = await db.wallets.get(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Try to decrypt seed
    const decryptedSeed = EncryptionService.decrypt(
      wallet.encryptedSeed,
      wallet.nonce,
      wallet.salt,
      password
    );

    if (!decryptedSeed) {
      return false;
    }

    // Create keypair from seed
    const pair = this.keyringService.createFromMnemonic(decryptedSeed, wallet.name);

    // Set as current
    this.currentWallet = wallet;
    this.currentPair = pair;

    // Update last used
    await db.wallets.update(walletId, { lastUsed: new Date() });
    await db.setActiveWallet(walletId);

    return true;
  }

  /**
   * Lock current wallet
   */
  lockWallet(): void {
    this.currentWallet = null;
    this.currentPair = null;
  }

  /**
   * Create new account (derivation)
   */
  async createAccount(
    walletId: number,
    index: number,
    name: string
  ): Promise<Account> {
    const wallet = await db.wallets.get(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const derivationPath = `//0//${index}`;

    // For display purposes, we need to derive the address
    // In a real unlock scenario, we'd derive from the decrypted mnemonic
    const account: Account = {
      walletId,
      index,
      name,
      address: `${wallet.address.slice(0, 6)}...${index}`, // Placeholder
      publicKey: wallet.publicKey,
      derivationPath,
      createdAt: new Date()
    };

    const id = await db.accounts.add(account);
    account.id = typeof id === 'number' ? id : Number(id);

    return account;
  }

  /**
   * Get wallet balance
   */
  async getBalance(address?: string): Promise<string> {
    const addr = address || this.currentWallet?.address;
    if (!addr) {
      throw new Error('No wallet selected');
    }

    const balance = await this.client.getBalance(addr);
    return balance.free;
  }

  /**
   * Send transaction
   */
  async sendTransaction(
    to: string,
    amount: string,
    password: string
  ): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('No wallet selected');
    }

    // Decrypt seed and verify password
    const decryptedSeed = EncryptionService.decrypt(
      this.currentWallet.encryptedSeed,
      this.currentWallet.nonce,
      this.currentWallet.salt,
      password
    );

    if (!decryptedSeed) {
      throw new Error('Invalid password');
    }

    // Create keypair from seed if not already loaded
    if (!this.currentPair) {
      this.currentPair = this.keyringService.createFromMnemonic(decryptedSeed, this.currentWallet.name);
    }

    // Save transaction to database first
    const txId = await db.transactions.add({
      hash: '', // Will be updated when we get the hash
      from: this.currentWallet.address,
      to,
      amount,
      fee: '0', // Will be updated with actual fee
      status: 'pending',
      timestamp: new Date(),
      type: 'send'
    });

    // Send transaction and update status
    const hash = await this.client.transfer(
      this.currentPair,
      to,
      amount,
      async (status) => {
        console.log('Transaction status:', status.status.toString());

        if (status.status.isInBlock) {
          // Update transaction hash when included in block
          await db.transactions.update(txId, {
            hash: status.status.asInBlock.toString(),
            status: 'pending'
          });
        }

        if (status.status.isFinalized) {
          // Mark as success when finalized
          await db.transactions.update(txId, {
            hash: status.status.asFinalized.toString(),
            status: 'success',
            blockNumber: status.status.asFinalized.toString()
          });
        }

        if (status.isError) {
          // Mark as failed if error
          await db.transactions.update(txId, {
            status: 'failed'
          });
        }
      }
    );

    // Update with final hash
    await db.transactions.update(txId, { hash });

    return hash;
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(address?: string): Promise<Transaction[]> {
    const addr = address || this.currentWallet?.address;
    if (!addr) {
      throw new Error('No wallet selected');
    }

    return await db.getRecentTransactions(addr, 50);
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(to: string, amount: string): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('No wallet selected');
    }

    return await this.client.estimateFee(
      this.currentWallet.address,
      to,
      amount
    );
  }

  /**
   * Get all wallets
   */
  async getWallets(): Promise<Wallet[]> {
    return await db.wallets.toArray();
  }

  /**
   * Delete wallet
   */
  async deleteWallet(walletId: number, password: string): Promise<boolean> {
    const wallet = await db.wallets.get(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Verify password
    const decryptedSeed = EncryptionService.decrypt(
      wallet.encryptedSeed,
      wallet.nonce,
      wallet.salt,
      password
    );

    if (!decryptedSeed) {
      return false;
    }

    // Delete wallet and related data
    await db.transaction('rw', db.wallets, db.accounts, db.transactions, async () => {
      await db.wallets.delete(walletId);
      await db.accounts.where('walletId').equals(walletId).delete();
      // Keep transactions for history
    });

    // If this was the current wallet, clear it
    if (this.currentWallet?.id === walletId) {
      this.lockWallet();
    }

    return true;
  }

  /**
   * Export wallet seed phrase
   */
  exportSeedPhrase(password: string): string | null {
    if (!this.currentWallet) {
      throw new Error('No wallet selected');
    }

    return EncryptionService.decrypt(
      this.currentWallet.encryptedSeed,
      this.currentWallet.nonce,
      this.currentWallet.salt,
      password
    );
  }

  /**
   * Get current wallet
   */
  getCurrentWallet(): Wallet | null {
    return this.currentWallet;
  }

  /**
   * Check if any wallet exists
   */
  async hasWallet(): Promise<boolean> {
    const wallets = await db.wallets.toArray();
    return wallets.length > 0;
  }

  /**
   * Get substrate client
   */
  getClient(): WalletSDK {
    return this.client;
  }

  /**
   * Get all accounts for current wallet
   */
  async getAccounts(): Promise<Array<{ address: string; name: string; balance: string }>> {
    console.log('[WalletManager] getAccounts() called, currentWallet:', this.currentWallet);

    if (!this.currentWallet) {
      console.log('[WalletManager] No current wallet, returning empty');
      return [];
    }

    console.log('[WalletManager] Querying accounts for walletId:', this.currentWallet.id);
    const accounts = await db.accounts
      .where('walletId')
      .equals(this.currentWallet.id!)
      .toArray();

    console.log('[WalletManager] Found accounts in DB:', accounts);

    // Return accounts without balance for now (balance fetching can hang if RPC not available)
    // Balance will be fetched separately when needed
    const accountsWithoutBalance = accounts.map((account) => ({
      address: account.address,
      name: account.name,
      balance: '0', // Default to 0, will be updated when balance is fetched
    }));

    console.log('[WalletManager] Returning accounts:', accountsWithoutBalance);
    return accountsWithoutBalance;
  }

  /**
   * Switch to a different account by address
   */
  async switchAccount(address: string): Promise<boolean> {
    if (!this.currentWallet) {
      throw new Error('No wallet unlocked');
    }

    const account = await db.accounts
      .where('[walletId+address]')
      .equals([this.currentWallet.id!, address])
      .first();

    if (!account) {
      throw new Error('Account not found');
    }

    // Update current wallet's address to the selected account
    this.currentWallet.address = account.address;
    this.currentWallet.publicKey = account.publicKey;

    return true;
  }

  /**
   * Rename an account
   */
  async renameAccount(address: string, newName: string): Promise<boolean> {
    if (!this.currentWallet) {
      throw new Error('No wallet unlocked');
    }

    const account = await db.accounts
      .where('[walletId+address]')
      .equals([this.currentWallet.id!, address])
      .first();

    if (!account) {
      throw new Error('Account not found');
    }

    await db.accounts.update(account.id!, { name: newName });
    return true;
  }

  /**
   * Export account private key
   */
  async exportAccount(address: string, password: string): Promise<{ privateKey: string }> {
    if (!this.currentWallet) {
      throw new Error('No wallet unlocked');
    }

    const wallet = await db.wallets.get(this.currentWallet.id!);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const account = await db.accounts
      .where('[walletId+address]')
      .equals([this.currentWallet.id!, address])
      .first();

    if (!account) {
      throw new Error('Account not found');
    }

    // Decrypt the seed
    const mnemonic = await this.decryptSeed(
      wallet.encryptedSeed,
      wallet.nonce,
      wallet.salt,
      password
    );

    // Derive the account's keypair from the mnemonic
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromUri(`${mnemonic}${account.derivationPath}`);

    return {
      privateKey: u8aToHex(pair.secretKey),
    };
  }
}