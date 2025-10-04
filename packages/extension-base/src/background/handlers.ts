/**
 * Message handlers for background service worker
 */

import { MessageType, RequestMessage, MessageHandler } from '../messaging/types';
import { MessageBridge } from '../messaging/bridge';
import { backgroundState } from './state';
import { u8aToHex, u8aWrapBytes, stringToU8a } from '@polkadot/util';
import { db } from '../storage/db';
import { setCurrentNetwork, getCurrentNetwork } from '../storage/network';
import { getNetworkById } from '../types/networks';

export class MessageHandlers {
  private handlers: Map<MessageType, MessageHandler> = new Map();

  constructor() {
    this.registerHandlers();
  }

  /**
   * Register all message handlers
   */
  private registerHandlers(): void {
    // Wallet management
    this.handlers.set(MessageType.CREATE_WALLET, this.handleCreateWallet.bind(this));
    this.handlers.set(MessageType.IMPORT_WALLET, this.handleImportWallet.bind(this));
    this.handlers.set(MessageType.UNLOCK_WALLET, this.handleUnlockWallet.bind(this));
    this.handlers.set(MessageType.LOCK_WALLET, this.handleLockWallet.bind(this));
    this.handlers.set(MessageType.DELETE_WALLET, this.handleDeleteWallet.bind(this));
    this.handlers.set(MessageType.EXPORT_SEED, this.handleExportSeed.bind(this));
    this.handlers.set(MessageType.GET_WALLETS, this.handleGetWallets.bind(this));
    this.handlers.set(MessageType.SWITCH_WALLET, this.handleSwitchWallet.bind(this));
    this.handlers.set(MessageType.GET_ACCOUNTS, this.handleGetAccounts.bind(this));
    this.handlers.set(MessageType.CREATE_ACCOUNT, this.handleCreateAccount.bind(this));
    this.handlers.set(MessageType.SWITCH_ACCOUNT, this.handleSwitchAccount.bind(this));
    this.handlers.set(MessageType.RENAME_ACCOUNT, this.handleRenameAccount.bind(this));
    this.handlers.set(MessageType.EXPORT_ACCOUNT, this.handleExportAccount.bind(this));

    // Transactions
    this.handlers.set(MessageType.GET_BALANCE, this.handleGetBalance.bind(this));
    this.handlers.set(MessageType.SEND_TRANSACTION, this.handleSendTransaction.bind(this));
    this.handlers.set(MessageType.ESTIMATE_FEE, this.handleEstimateFee.bind(this));
    this.handlers.set(MessageType.GET_TRANSACTION_HISTORY, this.handleGetTransactionHistory.bind(this));
    this.handlers.set(MessageType.SUBSCRIBE_TRANSACTIONS, this.handleSubscribeTransactions.bind(this));

    // Signing
    this.handlers.set(MessageType.SIGN_MESSAGE, this.handleSignMessage.bind(this));

    // Dapp interaction
    this.handlers.set(MessageType.REQUEST_CONNECTION, this.handleRequestConnection.bind(this));
    this.handlers.set(MessageType.DISCONNECT_SITE, this.handleDisconnectSite.bind(this));
    this.handlers.set(MessageType.GET_CONNECTED_SITES, this.handleGetConnectedSites.bind(this));

    // Authentication
    this.handlers.set(MessageType.AUTHENTICATE_BACKEND, this.handleAuthenticateBackend.bind(this));

    // Provider features
    this.handlers.set(MessageType.GET_PROVIDER_STATUS, this.handleGetProviderStatus.bind(this));
    this.handlers.set(MessageType.GET_PROVIDER_TASKS, this.handleGetProviderTasks.bind(this));
    this.handlers.set(MessageType.ACCEPT_TASK, this.handleAcceptTask.bind(this));
    this.handlers.set(MessageType.GET_TESTNET_POINTS, this.handleGetTestnetPoints.bind(this));

    // State
    this.handlers.set(MessageType.GET_STATE, this.handleGetState.bind(this));

    // Settings
    this.handlers.set(MessageType.CHANGE_PASSWORD, this.handleChangePassword.bind(this));
    this.handlers.set(MessageType.CHANGE_NETWORK, this.handleChangeNetwork.bind(this));
    this.handlers.set(MessageType.GET_NETWORK, this.handleGetNetwork.bind(this));
    this.handlers.set(MessageType.SET_THEME, this.handleSetTheme.bind(this));
    this.handlers.set(MessageType.GET_THEME, this.handleGetTheme.bind(this));
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message: RequestMessage): Promise<any> {
    const handler = this.handlers.get(message.type);

    if (!handler) {
      throw new Error(`No handler for message type: ${message.type}`);
    }

    return handler(message);
  }

  // Wallet management handlers

  private async handleCreateWallet(message: RequestMessage): Promise<any> {
    const { name, password } = message.payload;
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    const result = await manager.createWallet(name, password);
    return result;
  }

  private async handleImportWallet(message: RequestMessage): Promise<any> {
    const { name, mnemonic, password } = message.payload;
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    const wallet = await manager.importWallet(name, mnemonic, password);
    return wallet;
  }

  private async handleUnlockWallet(message: RequestMessage): Promise<any> {
    let { walletId, password } = message.payload;
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    // Auto-detect walletId if not provided (use active wallet)
    if (!walletId) {
      const activeWallet = await db.getActiveWallet();
      if (!activeWallet || !activeWallet.id) {
        throw new Error('No wallet found to unlock');
      }
      walletId = activeWallet.id;
    }

    console.log('[handleUnlockWallet] Attempting to unlock walletId:', walletId, 'with password length:', password?.length);
    const success = await manager.unlockWallet(walletId, password);
    console.log('[handleUnlockWallet] Unlock result:', success);
    return { success };
  }

  private async handleLockWallet(): Promise<any> {
    await backgroundState.lock();
    return { success: true };
  }

  private async handleDeleteWallet(message: RequestMessage): Promise<any> {
    const { walletId, password } = message.payload;
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    const success = await manager.deleteWallet(walletId, password);
    return { success };
  }

  private async handleExportSeed(message: RequestMessage): Promise<any> {
    const { password } = message.payload;
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    const seedPhrase = manager.exportSeedPhrase(password);
    return { seedPhrase };
  }

  private async handleGetWallets(): Promise<any> {
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    const wallets = await manager.getWallets();

    // Get account count for each wallet
    const walletsWithCounts = await Promise.all(
      wallets.map(async (wallet) => {
        const accounts = await db.accounts.where('walletId').equals(wallet.id!).toArray();
        return {
          id: wallet.id,
          name: wallet.name,
          address: wallet.address,
          isActive: wallet.isActive,
          createdAt: wallet.createdAt,
          lastUsed: wallet.lastUsed,
          accountCount: accounts.length,
        };
      })
    );

    return walletsWithCounts;
  }

  private async handleSwitchWallet(message: RequestMessage): Promise<any> {
    const { walletId, password } = message.payload;
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    const success = await manager.switchWallet(walletId, password);

    if (!success) {
      throw new Error('Incorrect password');
    }

    return { success };
  }

  private async handleGetAccounts(): Promise<any> {
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    // Check if there's a current wallet
    const wallet = manager.getCurrentWallet();
    console.log('[Background] getCurrentWallet():', wallet);
    if (!wallet) {
      // No wallet created yet, return empty accounts
      console.log('[Background] No wallet found, returning empty accounts');
      return [];
    }

    try {
      const accounts = await manager.getAccounts();
      console.log('[Background] getAccounts() returned:', accounts);
      return accounts;
    } catch (error) {
      console.error('[Background] Error getting accounts:', error);
      // If there's an error getting accounts, return empty array
      return [];
    }
  }

  private async handleCreateAccount(message: RequestMessage): Promise<any> {
    const { name } = message.payload;
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    const wallet = manager.getCurrentWallet();
    if (!wallet) {
      throw new Error('No wallet unlocked');
    }

    // Get next account index
    const accounts = await manager.getAccounts();
    const nextIndex = accounts.length;

    // No password needed - uses cached seed from session
    const account = await manager.createAccount(wallet.id!, nextIndex, name);
    return { account };
  }

  private async handleSwitchAccount(message: RequestMessage): Promise<any> {
    const { address } = message.payload;
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    // No password needed - uses cached seed from session
    const success = await manager.switchAccount(address);
    return { success };
  }

  private async handleRenameAccount(message: RequestMessage): Promise<any> {
    const { address, name } = message.payload;
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    const success = await manager.renameAccount(address, name);
    return { success };
  }

  private async handleExportAccount(message: RequestMessage): Promise<any> {
    const { address } = message.payload;
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    // For security, we should require password here
    // But for now, we'll pass an empty string (this should be improved)
    const result = await manager.exportAccount(address, '');
    return result;
  }

  // Transaction handlers

  private async handleGetBalance(): Promise<any> {
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    const balance = await manager.getBalance();
    return { balance };
  }

  private async handleSendTransaction(message: RequestMessage): Promise<any> {
    const { recipient, to, amount } = message.payload; // Support both 'recipient' and 'to'
    const recipientAddress = recipient || to; // Use whichever is provided
    const walletManager = backgroundState.getWalletManager();
    const transactionManager = backgroundState.getTransactionManager();

    if (!walletManager) {
      throw new Error('Wallet manager not initialized');
    }

    const wallet = walletManager.getCurrentWallet();
    if (!wallet) {
      throw new Error('No wallet unlocked');
    }

    // Convert string amount to bigint (amount is already in planck from UI)
    const amountBigInt = BigInt(amount);

    const hash = await walletManager.sendTransaction(recipientAddress, amountBigInt);

    // Track pending transaction in TransactionManager
    if (transactionManager) {
      transactionManager.trackPendingTransaction(hash, wallet.address, recipientAddress, amount);
    }

    return { hash };
  }

  private async handleEstimateFee(message: RequestMessage): Promise<any> {
    const { to, amount } = message.payload;
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    // This would need to be implemented in WalletManager
    return { fee: '0' };
  }

  private async handleGetTransactionHistory(message: RequestMessage): Promise<any> {
    const transactionManager = backgroundState.getTransactionManager();
    const walletManager = backgroundState.getWalletManager();

    if (!transactionManager) {
      throw new Error('Transaction manager not initialized');
    }

    if (!walletManager) {
      throw new Error('Wallet manager not initialized');
    }

    const wallet = walletManager.getCurrentWallet();
    if (!wallet) {
      throw new Error('No wallet unlocked');
    }

    const { limit, offset, status } = message.payload || {};

    // Get transactions from TransactionManager (hybrid: cached + backend sync)
    const transactions = await transactionManager.getTransactions(wallet.address, {
      limit,
      offset,
      status,
    });

    // Subscribe to real-time updates for this address
    await transactionManager.subscribeToUpdates(wallet.address);

    return { transactions };
  }

  // Signing handlers

  private async handleSignMessage(message: RequestMessage): Promise<any> {
    const { message: messageToSign } = message.payload;
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    // Get current wallet
    const wallet = manager.getCurrentWallet();
    if (!wallet) {
      throw new Error('No wallet unlocked. Please unlock your wallet first.');
    }

    // Get the keypair (this is the private implementation detail)
    // In production, you might want to show a signing approval popup to the user
    const keypair = (manager as any).currentPair;
    if (!keypair) {
      throw new Error('No keypair available. Please unlock wallet.');
    }

    // Convert message to bytes
    const messageU8a = stringToU8a(messageToSign);

    // Wrap the message bytes with <Bytes>...</Bytes>
    // This matches what Polkadot.js does for signRaw with type: 'bytes'
    const wrappedMessage = u8aWrapBytes(messageU8a);

    // Sign the wrapped message
    const signatureU8a = keypair.sign(wrappedMessage);

    // Convert signature to hex
    const signature = u8aToHex(signatureU8a);

    return {
      signature,
      publicKey: u8aToHex(keypair.publicKey),
    };
  }

  // Dapp interaction handlers

  private async handleRequestConnection(message: RequestMessage): Promise<any> {
    const { origin, appName, appIcon } = message.payload;

    const manager = backgroundState.getWalletManager();
    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    // Check if wallet exists
    const wallet = manager.getCurrentWallet();
    if (!wallet) {
      throw new Error('No wallet found. Please create or import a wallet first.');
    }

    // Check if already connected
    if (backgroundState.isConnected(origin)) {
      const accounts = await this.handleGetAccounts(message);
      return { accounts, approved: true };
    }

    // TODO: Show approval popup to user
    // For now, auto-approve for development
    backgroundState.addConnectedSite(origin, appName || origin, appIcon);
    const accounts = await this.handleGetAccounts(message);

    return { accounts, approved: true };
  }

  private async handleDisconnectSite(message: RequestMessage): Promise<any> {
    const { origin } = message.payload;
    backgroundState.removeConnectedSite(origin);
    return { success: true };
  }

  private async handleGetConnectedSites(): Promise<any> {
    const sites = backgroundState.getConnectedSites();
    return { sites };
  }

  // Authentication handlers

  private async handleAuthenticateBackend(message: RequestMessage): Promise<any> {
    const manager = backgroundState.getWalletManager();
    const backendClient = backgroundState.getBackendClient();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    if (!backendClient) {
      throw new Error('Backend API client not initialized');
    }

    // Get current wallet
    const wallet = manager.getCurrentWallet();
    if (!wallet) {
      throw new Error('No wallet unlocked. Please unlock your wallet first.');
    }

    try {
      // Step 1: Request nonce from backend
      const nonceData = await backendClient.getNonce(wallet.address);

      // Step 2: Sign the nonce message using our signMessage handler
      const signResult = await this.handleSignMessage({
        id: `auth_${Date.now()}`,
        type: MessageType.SIGN_MESSAGE,
        timestamp: Date.now(),
        payload: {
          message: nonceData.message,
        },
      } as RequestMessage);

      // Step 3: Login with wallet signature
      const authResponse = await backendClient.loginWithWallet(
        wallet.address,
        signResult.signature,
        nonceData.nonce
      );

      // Return authentication result
      return {
        accessToken: authResponse.access_token,
        refreshToken: authResponse.refresh_token,
        user: {
          id: authResponse.user.id,
          wallet_address: authResponse.user.walletAddress,
          role: 'task_creator', // Default role, backend might provide this
        },
      };
    } catch (error) {
      console.error('Backend authentication failed:', error);
      throw new Error(
        `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // State handlers

  private async handleGetState(): Promise<any> {
    const state = await backgroundState.getState();
    return state;
  }

  // Settings handlers

  private async handleChangePassword(message: RequestMessage): Promise<any> {
    const { currentPassword, newPassword } = message.payload;
    const manager = backgroundState.getWalletManager();

    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }

    // Verify current password by attempting to export seed
    try {
      await manager.exportSeedPhrase(currentPassword);
    } catch {
      throw new Error('Incorrect current password');
    }

    // Change password (re-encrypt wallet with new password)
    const wallet = manager.getCurrentWallet();
    if (!wallet) {
      throw new Error('No wallet unlocked');
    }

    // TODO: Implement password change in WalletManager
    // For now, return success
    return { success: true };
  }

  private async handleChangeNetwork(message: RequestMessage): Promise<any> {
    const { networkId, customRpcUrl } = message.payload;

    // Validate network
    const network = getNetworkById(networkId, customRpcUrl);
    if (!network) {
      throw new Error('Invalid network configuration');
    }

    console.log('[Background] Changing network to:', network.name, network.rpcUrl);

    // Save network preference
    await setCurrentNetwork(networkId, customRpcUrl);

    // Switch network (reinitialize wallet manager with new RPC URL)
    await backgroundState.switchNetwork(network.rpcUrl);

    return { success: true, network: networkId, rpcUrl: network.rpcUrl };
  }

  private async handleGetNetwork(): Promise<any> {
    const { networkId, customRpcUrl } = await getCurrentNetwork();

    return {
      network: networkId,
      customRpcUrl: customRpcUrl
    };
  }

  private async handleSetTheme(message: RequestMessage): Promise<any> {
    const { theme } = message.payload;

    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ theme });
    }

    return { success: true, theme };
  }

  private async handleGetTheme(): Promise<any> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get('theme');
      return { theme: result.theme || 'dark' };
    }
    return { theme: 'dark' };
  }

  // Provider feature handlers

  private async handleGetProviderStatus(): Promise<any> {
    const client = backgroundState.getBackendClient();

    if (!client) {
      throw new Error('Backend client not initialized');
    }

    try {
      const status = await client.getProviderStatus();
      return status;
    } catch (error) {
      console.error('Failed to get provider status:', error);
      throw error;
    }
  }

  private async handleGetProviderTasks(message: RequestMessage): Promise<any> {
    const client = backgroundState.getBackendClient();

    if (!client) {
      throw new Error('Backend client not initialized');
    }

    const { status } = message.payload || {};

    try {
      const tasks = await client.getTasks(status);
      return { tasks };
    } catch (error) {
      console.error('Failed to get provider tasks:', error);
      throw error;
    }
  }

  private async handleAcceptTask(message: RequestMessage): Promise<any> {
    const client = backgroundState.getBackendClient();

    if (!client) {
      throw new Error('Backend client not initialized');
    }

    const { taskId } = message.payload;

    if (!taskId) {
      throw new Error('Task ID is required');
    }

    try {
      await client.acceptTask(taskId);
      return { success: true };
    } catch (error) {
      console.error('Failed to accept task:', error);
      throw error;
    }
  }

  private async handleGetTestnetPoints(): Promise<any> {
    const client = backgroundState.getBackendClient();

    if (!client) {
      throw new Error('Backend client not initialized');
    }

    try {
      const points = await client.getTestnetPoints();
      return points;
    } catch (error) {
      console.error('Failed to get testnet points:', error);
      throw error;
    }
  }

  // Transaction subscription handler

  private async handleSubscribeTransactions(message: RequestMessage): Promise<any> {
    const transactionManager = backgroundState.getTransactionManager();
    const walletManager = backgroundState.getWalletManager();

    if (!transactionManager) {
      throw new Error('Transaction manager not initialized');
    }

    if (!walletManager) {
      throw new Error('Wallet manager not initialized');
    }

    const wallet = walletManager.getCurrentWallet();
    if (!wallet) {
      throw new Error('No wallet unlocked');
    }

    // Subscribe to real-time transaction updates
    await transactionManager.subscribeToUpdates(wallet.address);

    return { success: true };
  }
}

export const messageHandlers = new MessageHandlers();
