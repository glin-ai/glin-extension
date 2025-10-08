import { Keyring } from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { u8aToHex } from '@polkadot/util';
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

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export class WalletManager {
  private keyringService: KeyringService;
  private client: WalletSDK;
  private currentWallet: Wallet | null = null;
  private currentPair: KeyringPair | null = null;

  // Session state - decrypted seed cached in memory while wallet is unlocked
  // This is cleared on lock() for security
  private decryptedSeed: string | null = null;

  // Connection state - for lazy connection
  private connectionStatus: ConnectionStatus = 'disconnected';
  private lastConnectionError: string | null = null;
  private connectionPromise: Promise<void> | null = null;

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
   * Initialize wallet manager (OFFLINE - no network connection)
   * NOTE: Does NOT auto-load wallet for security - wallet remains locked until unlocked with password
   * NOTE: Does NOT connect to network - connection is lazy and happens on-demand
   */
  async init(): Promise<void> {
    console.log('[WalletManager] init() called - initializing offline (no network connection)');
    await this.keyringService.init();

    // DO NOT connect to network here - make it lazy!
    // Network connection will happen on-demand when needed (balance check, send transaction, etc.)
    console.log('[WalletManager] Initialized offline - wallet remains locked until unlocked with password');
    console.log('[WalletManager] Network connection will be established on-demand when needed');
  }

  /**
   * Ensure network connection is established (lazy connection)
   * Safe to call multiple times - will only connect once
   */
  async ensureConnected(): Promise<void> {
    // Already connected
    if (this.connectionStatus === 'connected' && this.client.isConnected()) {
      return;
    }

    // Connection in progress - wait for it
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Start new connection
    console.log('[WalletManager] Establishing network connection...');
    this.connectionStatus = 'connecting';
    this.lastConnectionError = null;

    this.connectionPromise = (async () => {
      try {
        await this.client.connect();
        this.connectionStatus = 'connected';
        this.lastConnectionError = null;
        console.log('[WalletManager] Network connection established');
      } catch (error) {
        this.connectionStatus = 'error';
        this.lastConnectionError = error instanceof Error ? error.message : 'Unknown connection error';
        console.error('[WalletManager] Network connection failed:', this.lastConnectionError);
        throw new Error(`Network connection failed: ${this.lastConnectionError}`);
      } finally {
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): { status: ConnectionStatus; error: string | null } {
    return {
      status: this.connectionStatus,
      error: this.lastConnectionError,
    };
  }

  /**
   * Manually disconnect from network
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      this.connectionStatus = 'disconnected';
      this.lastConnectionError = null;
      console.log('[WalletManager] Disconnected from network');
    } catch (error) {
      console.error('[WalletManager] Error during disconnect:', error);
    }
  }

  /**
   * Create new wallet
   */
  async createWallet(
    name: string,
    password: string,
    mnemonic?: string,
    isImport: boolean = false
  ): Promise<{ wallet: Wallet; mnemonic: string }> {
    console.log('[WalletManager] createWallet called with name:', name, 'isImport:', isImport);

    // Generate or validate mnemonic
    const seedPhrase = mnemonic || MnemonicService.generate();
    if (!MnemonicService.validate(seedPhrase)) {
      throw new Error('Invalid mnemonic phrase');
    }

    console.log('[WalletManager] Mnemonic validated, length:', seedPhrase.split(' ').length);

    // For imports, use bare mnemonic (no derivation) for compatibility with standard Substrate wallets
    // For new wallets, use //0//0 derivation for HD wallet support
    const derivationPath = isImport ? '' : '//0//0';
    console.log('[WalletManager] Creating keypair with derivation path:', derivationPath || '(bare mnemonic)');
    const pair = this.keyringService.createFromMnemonic(seedPhrase, derivationPath);
    console.log('[WalletManager] Created wallet address:', pair.address);

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
      isActive: true,
      currentAccountIndex: 0, // Default to first account
      firstAccountDerivation: derivationPath, // Store derivation path for first account
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

    // Cache seed in session so createAccount can use it
    this.decryptedSeed = seedPhrase;

    // Create default account (no password needed - uses cached seed)
    console.log('[WalletManager] Creating default account for wallet ID:', wallet.id);
    const createdAccount = await this.createAccount(wallet.id, 0, 'Main Account');
    console.log('[WalletManager] Default account created with address:', createdAccount.address);

    // Set as current - both wallet and the derived keypair
    this.currentWallet = wallet;
    this.currentPair = pair;

    console.log('[WalletManager] Wallet creation complete');
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
    const result = await this.createWallet(name, password, mnemonic, true); // isImport=true
    return result.wallet;
  }

  /**
   * Unlock wallet with password
   * Loads the last selected account based on currentAccountIndex
   */
  async unlockWallet(walletId: number, password: string): Promise<boolean> {
    console.log('[WalletManager] unlockWallet called with walletId:', walletId);
    const wallet = await db.wallets.get(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    console.log('[WalletManager] Wallet found:', {
      id: wallet.id,
      name: wallet.name,
      address: wallet.address,
      currentAccountIndex: wallet.currentAccountIndex
    });

    // Try to decrypt seed
    console.log('[WalletManager] Attempting to decrypt seed...');
    const decryptedSeed = EncryptionService.decrypt(
      wallet.encryptedSeed,
      wallet.nonce,
      wallet.salt,
      password
    );

    if (!decryptedSeed) {
      console.error('[WalletManager] Failed to decrypt seed - incorrect password');
      return false;
    }

    console.log('[WalletManager] Seed decrypted successfully, mnemonic length:', decryptedSeed.split(' ').length);

    // Cache decrypted seed in memory for session (cleared on lock)
    this.decryptedSeed = decryptedSeed;
    console.log('[WalletManager] Seed cached in session memory');

    // Get all accounts for this wallet
    const accounts = await db.accounts
      .where('walletId')
      .equals(walletId)
      .toArray();

    console.log('[WalletManager] Found accounts:', accounts.length);

    // Determine which account to load
    const accountIndex = wallet.currentAccountIndex ?? 0;
    const selectedAccount = accounts.find(acc => acc.index === accountIndex) || accounts[0];

    if (!selectedAccount) {
      console.error('[WalletManager] No accounts found for wallet');
      throw new Error('No accounts found for wallet');
    }

    console.log('═══════════════════════════════════════════════');
    console.log('[UNLOCK DEBUG] Unlocking wallet');
    console.log('[UNLOCK DEBUG] Wallet ID:', walletId);
    console.log('[UNLOCK DEBUG] Wallet name:', wallet.name);
    console.log('[UNLOCK DEBUG] Wallet address (stored):', wallet.address);
    console.log('[UNLOCK DEBUG] Selected account:', {
      index: selectedAccount.index,
      address: selectedAccount.address,
      derivationPath: selectedAccount.derivationPath,
      name: selectedAccount.name
    });
    console.log('[UNLOCK DEBUG] Total accounts in wallet:', accounts.length);
    console.log('[UNLOCK DEBUG] All accounts:', accounts.map(a => ({
      index: a.index,
      address: a.address,
      name: a.name
    })));
    console.log('═══════════════════════════════════════════════');

    // Create keypair from seed using the account's derivation path
    console.log('[WalletManager] Deriving keypair with path:', selectedAccount.derivationPath);
    const pair = this.keyringService.createFromMnemonic(
      decryptedSeed,
      selectedAccount.derivationPath
    );

    console.log('[WalletManager] Derived address:', pair.address);
    console.log('[WalletManager] Expected address:', selectedAccount.address);

    if (pair.address !== selectedAccount.address) {
      console.error('[WalletManager] ADDRESS MISMATCH! Derived address does not match stored address');
      console.error('[WalletManager] This means the derivation path is incorrect or wallet was created with wrong derivation');
    }

    // Set current wallet with the selected account's address
    this.currentWallet = {
      ...wallet,
      address: selectedAccount.address,
      publicKey: selectedAccount.publicKey,
    };
    this.currentPair = pair;

    console.log('[WalletManager] Wallet unlocked successfully');

    // Update last used
    await db.wallets.update(walletId, { lastUsed: new Date() });
    await db.setActiveWallet(walletId);

    return true;
  }

  /**
   * Lock current wallet
   */
  lockWallet(): void {
    console.log('[WalletManager] Locking wallet and clearing session data');
    this.currentWallet = null;
    this.currentPair = null;

    // Clear decrypted seed from memory for security
    this.decryptedSeed = null;
    console.log('[WalletManager] Decrypted seed cleared from memory');
  }

  /**
   * Create new account (derivation)
   * Uses cached decrypted seed from session - wallet must be unlocked first!
   */
  async createAccount(
    walletId: number,
    index: number,
    name: string
  ): Promise<Account> {
    console.log('[WalletManager] createAccount called for walletId:', walletId, 'index:', index);

    // Check if wallet is unlocked (seed cached in memory)
    if (!this.decryptedSeed) {
      throw new Error('Wallet is locked. Please unlock wallet first.');
    }

    const wallet = await db.wallets.get(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    console.log('[WalletManager] Using cached seed from session (no password needed)');

    // Derive the account's keypair using cached seed
    // For the first account (index 0), use the wallet's firstAccountDerivation
    // For subsequent accounts, use //0//1, //0//2, etc.
    const derivationPath = index === 0 && wallet.firstAccountDerivation !== undefined
      ? wallet.firstAccountDerivation
      : `//0//${index}`;
    console.log('[WalletManager] Deriving account with path:', derivationPath || '(bare mnemonic)');
    const pair = this.keyringService.createFromMnemonic(this.decryptedSeed, derivationPath);
    console.log('[WalletManager] Account derived with address:', pair.address);

    // Create account with real derived address
    const account: Account = {
      walletId,
      index,
      name,
      address: pair.address,
      publicKey: pair.publicKey.toString(),
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

    // Ensure network connection before fetching balance
    await this.ensureConnected();

    console.log('═══════════════════════════════════════════════');
    console.log('[BALANCE DEBUG] Getting balance for address:', addr);
    console.log('[BALANCE DEBUG] Address provided as param:', address || 'none (using currentWallet.address)');
    console.log('[BALANCE DEBUG] Current wallet address:', this.currentWallet?.address);
    console.log('[BALANCE DEBUG] Current pair address:', this.currentPair?.address);

    const balance = await this.client.getBalance(addr);

    console.log('[BALANCE DEBUG] Balance returned from chain:', balance.free);
    console.log('[BALANCE DEBUG] Balance in GLIN:', Number(BigInt(balance.free) / BigInt(1e18)));
    console.log('═══════════════════════════════════════════════');

    // Return raw balance - UI will format it for display
    return balance.free;
  }

  /**
   * Send transaction
   * Uses cached decrypted seed from session - wallet must be unlocked first!
   */
  async sendTransaction(
    to: string,
    amount: bigint
  ): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('No wallet selected');
    }

    // Check if wallet is unlocked (seed cached in memory)
    if (!this.decryptedSeed || !this.currentPair) {
      throw new Error('Wallet is locked. Please unlock wallet first.');
    }

    // Ensure network connection before sending transaction
    await this.ensureConnected();

    // Save transaction to database first (convert bigint to string for storage)
    const amountStr = amount.toString();
    const txId = await db.transactions.add({
      hash: '', // Will be updated when we get the hash
      from: this.currentWallet.address,
      to,
      amount: amountStr,
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
  async estimateFee(to: string, amount: bigint): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('No wallet selected');
    }

    // Ensure network connection before estimating fee
    await this.ensureConnected();

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
   * Switch to a different wallet
   * Requires password to decrypt the target wallet's seed
   */
  async switchWallet(walletId: number, password: string): Promise<boolean> {
    console.log('[WalletManager] switchWallet called for walletId:', walletId);

    // Get the target wallet
    const targetWallet = await db.wallets.get(walletId);
    if (!targetWallet) {
      throw new Error('Wallet not found');
    }

    // Try to decrypt seed to verify password
    console.log('[WalletManager] Verifying password for target wallet');
    const decryptedSeed = EncryptionService.decrypt(
      targetWallet.encryptedSeed,
      targetWallet.nonce,
      targetWallet.salt,
      password
    );

    if (!decryptedSeed) {
      console.error('[WalletManager] Failed to decrypt target wallet - incorrect password');
      return false;
    }

    console.log('[WalletManager] Password verified, switching wallet');

    // Deactivate all wallets
    await db.wallets.toCollection().modify({ isActive: false });

    // Activate target wallet
    await db.wallets.update(walletId, {
      isActive: true,
      lastUsed: new Date()
    });

    // Get first account from target wallet
    const accounts = await db.accounts
      .where('walletId')
      .equals(walletId)
      .toArray();

    if (accounts.length === 0) {
      throw new Error('No accounts found for this wallet');
    }

    // Load first account (or use currentAccountIndex if set)
    const accountIndex = targetWallet.currentAccountIndex ?? 0;
    const selectedAccount = accounts.find(acc => acc.index === accountIndex) || accounts[0];

    console.log('[WalletManager] Loading account:', selectedAccount.name, 'at index:', selectedAccount.index);

    // Derive keypair for selected account
    const pair = this.keyringService.createFromMnemonic(
      decryptedSeed,
      selectedAccount.derivationPath
    );

    // Update current wallet and keypair
    this.currentWallet = {
      ...targetWallet,
      address: selectedAccount.address,
      publicKey: selectedAccount.publicKey,
    };
    this.currentPair = pair;
    this.decryptedSeed = decryptedSeed;

    console.log('[WalletManager] Wallet switched successfully to:', targetWallet.name);
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
   * Check wallet status without loading it (for lock state detection)
   * Returns whether wallet is initialized and locked
   */
  async getWalletStatus(): Promise<{ hasWallet: boolean; isLocked: boolean }> {
    const hasWallet = await this.hasWallet();
    const isLocked = hasWallet && !this.currentWallet;

    return {
      hasWallet,
      isLocked,
    };
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
   * Uses cached decrypted seed from session - wallet must be unlocked first!
   */
  async switchAccount(address: string): Promise<boolean> {
    console.log('[WalletManager] switchAccount called for address:', address);

    if (!this.currentWallet) {
      throw new Error('No wallet unlocked');
    }

    // Check if wallet is unlocked (seed cached in memory)
    if (!this.decryptedSeed) {
      throw new Error('Wallet is locked. Please unlock wallet first.');
    }

    // Get the wallet from DB
    const wallet = await db.wallets.get(this.currentWallet.id!);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Find the account to switch to
    const account = await db.accounts
      .where('[walletId+address]')
      .equals([this.currentWallet.id!, address])
      .first();

    if (!account) {
      throw new Error('Account not found');
    }

    console.log('[WalletManager] Switching to account:', account.name, 'at index:', account.index);
    console.log('[WalletManager] Using cached seed from session (no password needed)');

    // Derive the keypair for this account using cached seed
    const pair = this.keyringService.createFromMnemonic(
      this.decryptedSeed,
      account.derivationPath
    );

    console.log('[WalletManager] Keypair derived for address:', pair.address);

    // Update current wallet and keypair
    this.currentWallet.address = account.address;
    this.currentWallet.publicKey = account.publicKey;
    this.currentWallet.currentAccountIndex = account.index;
    this.currentPair = pair;

    // Persist the switch to database
    await db.wallets.update(wallet.id!, {
      currentAccountIndex: account.index,
      lastUsed: new Date(),
    });

    console.log('[WalletManager] Account switch successful');
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
    const mnemonic = EncryptionService.decrypt(
      wallet.encryptedSeed,
      wallet.nonce,
      wallet.salt,
      password
    );

    if (!mnemonic) {
      throw new Error('Incorrect password');
    }

    // Derive the account's keypair from the mnemonic
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromUri(`${mnemonic}${account.derivationPath}`);

    return {
      privateKey: u8aToHex(pair.secretKey),
    };
  }
}