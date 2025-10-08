/**
 * Background service worker state management
 */

import { WalletManager } from '../substrate/wallet';
import { WalletState } from '../messaging/types';
import { BackendAPIClient } from '../backend/api';
import { TransactionManager } from '../services/TransactionManager';

/**
 * Pending connection request from a dapp
 */
export interface PendingConnectionRequest {
  id: string;
  origin: string;
  appName: string;
  appIcon?: string;
  timestamp: number;
  resolve: (result: any) => void;
  reject: (error: Error) => void;
  windowId?: number; // Track popup window
}

export class BackgroundState {
  private walletManager: WalletManager | null = null;
  private backendClient: BackendAPIClient | null = null;
  private transactionManager: TransactionManager | null = null;
  private connectedSites: Map<string, {
    appName: string;
    appIcon?: string;
    connectedAt: number;
  }> = new Map();

  private subscriptions: Map<string, {
    type: string;
    unsubscribe: () => void;
  }> = new Map();

  // Pending connection requests awaiting user approval
  private pendingRequests: Map<string, PendingConnectionRequest> = new Map();

  /**
   * Initialize wallet manager
   */
  async init(rpcEndpoint: string): Promise<void> {
    if (this.walletManager) {
      return;
    }

    this.walletManager = new WalletManager(rpcEndpoint);
    await this.walletManager.init();

    // Initialize backend API client
    // Use environment variable or fallback to localhost for development
    const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:8080';
    this.backendClient = new BackendAPIClient(backendUrl);

    // Initialize transaction manager
    this.transactionManager = new TransactionManager(this.backendClient);
  }

  /**
   * Switch network - reinitialize wallet manager with new RPC endpoint
   * NOTE: Does NOT connect to new network - connection is lazy
   */
  async switchNetwork(rpcEndpoint: string): Promise<void> {
    console.log('[BackgroundState] Switching network to:', rpcEndpoint);

    // Disconnect from current network if connected
    if (this.walletManager) {
      await this.walletManager.disconnect();
      this.walletManager.lockWallet();
    }

    // Clear subscriptions
    this.clearSubscriptions();

    // Reinitialize wallet manager with new RPC endpoint (offline)
    this.walletManager = new WalletManager(rpcEndpoint);
    await this.walletManager.init();

    console.log('[BackgroundState] Network switched successfully (offline)');
    console.log('[BackgroundState] Network connection will be established on-demand');
  }

  /**
   * Get wallet manager
   */
  getWalletManager(): WalletManager | null {
    return this.walletManager;
  }

  /**
   * Get backend API client
   */
  getBackendClient(): BackendAPIClient | null {
    return this.backendClient;
  }

  /**
   * Get transaction manager
   */
  getTransactionManager(): TransactionManager | null {
    return this.transactionManager;
  }

  /**
   * Get current state
   * NOTE: Does NOT fetch balance automatically - balance will be undefined
   * Use GET_BALANCE message to explicitly fetch balance when needed
   */
  async getState(): Promise<WalletState> {
    const wallet = this.walletManager?.getCurrentWallet();

    // Use getWalletStatus to properly detect wallet existence without auto-loading
    const walletStatus = this.walletManager
      ? await this.walletManager.getWalletStatus()
      : { hasWallet: false, isLocked: false };

    // Get connection status without triggering connection
    const connectionStatus = this.walletManager?.getConnectionStatus();

    // DO NOT fetch balance automatically - this would trigger network connection!
    // Balance must be explicitly fetched by UI when needed
    const balance = undefined;

    return {
      isInitialized: walletStatus.hasWallet,
      isLocked: walletStatus.isLocked,
      isConnected: this.walletManager !== null,
      connectionStatus: connectionStatus?.status || 'disconnected',
      connectionError: connectionStatus?.error || null,
      currentAccount: wallet ? {
        address: wallet.address,
        name: wallet.name,
        publicKey: wallet.publicKey,
        balance,
      } : undefined,
      connectedSites: Array.from(this.connectedSites.keys()),
    };
  }

  /**
   * Add connected site
   */
  addConnectedSite(origin: string, appName: string, appIcon?: string): void {
    this.connectedSites.set(origin, {
      appName,
      appIcon,
      connectedAt: Date.now(),
    });
  }

  /**
   * Remove connected site
   */
  removeConnectedSite(origin: string): void {
    this.connectedSites.delete(origin);
  }

  /**
   * Check if site is connected
   */
  isConnected(origin: string): boolean {
    return this.connectedSites.has(origin);
  }

  /**
   * Get connected sites
   */
  getConnectedSites(): Array<{
    origin: string;
    appName: string;
    appIcon?: string;
    connectedAt: number;
  }> {
    return Array.from(this.connectedSites.entries()).map(([origin, data]) => ({
      origin,
      ...data,
    }));
  }

  /**
   * Add subscription
   */
  addSubscription(id: string, type: string, unsubscribe: () => void): void {
    this.subscriptions.set(id, { type, unsubscribe });
  }

  /**
   * Remove subscription
   */
  removeSubscription(id: string): void {
    const sub = this.subscriptions.get(id);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(id);
    }
  }

  /**
   * Clear all subscriptions
   */
  clearSubscriptions(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
  }

  /**
   * Lock wallet and clear sensitive data
   */
  async lock(): Promise<void> {
    this.walletManager?.lockWallet();
    this.clearSubscriptions();

    // Unsubscribe from transaction updates
    this.transactionManager?.unsubscribe();
  }

  /**
   * Disconnect all sites
   */
  disconnectAllSites(): void {
    this.connectedSites.clear();
  }

  /**
   * Add pending connection request
   */
  addPendingRequest(request: PendingConnectionRequest): void {
    this.pendingRequests.set(request.id, request);
    console.log('[BackgroundState] Added pending request:', request.id, 'from', request.origin);

    // Auto-cleanup after 5 minutes
    setTimeout(() => {
      if (this.pendingRequests.has(request.id)) {
        console.log('[BackgroundState] Request timeout:', request.id);
        this.rejectPendingRequest(request.id, 'Request timeout');
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Get pending connection request
   */
  getPendingRequest(id: string): PendingConnectionRequest | null {
    return this.pendingRequests.get(id) || null;
  }

  /**
   * Approve pending connection request
   */
  async approvePendingRequest(requestId: string): Promise<void> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      throw new Error('Request not found or already processed');
    }

    console.log('[BackgroundState] Approving connection request:', requestId);

    // Add to connected sites
    this.addConnectedSite(request.origin, request.appName, request.appIcon);

    // Get accounts to return
    const accounts = await this.walletManager?.getAccounts() || [];

    // Resolve the promise
    request.resolve({ accounts, approved: true });

    // Remove from pending
    this.pendingRequests.delete(requestId);

    // Close popup window if exists
    if (request.windowId) {
      try {
        await chrome.windows.remove(request.windowId);
      } catch (error) {
        console.log('[BackgroundState] Window already closed');
      }
    }
  }

  /**
   * Reject pending connection request
   */
  rejectPendingRequest(requestId: string, reason?: string): void {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      console.log('[BackgroundState] Request not found or already processed:', requestId);
      return;
    }

    console.log('[BackgroundState] Rejecting connection request:', requestId, reason || '');

    // Reject the promise
    request.reject(new Error(reason || 'User rejected connection request'));

    // Remove from pending
    this.pendingRequests.delete(requestId);

    // Close popup window if exists
    if (request.windowId) {
      chrome.windows.remove(request.windowId).catch(() => {
        console.log('[BackgroundState] Window already closed');
      });
    }
  }

  /**
   * Set popup window ID for pending request
   */
  setPendingRequestWindow(requestId: string, windowId: number): void {
    const request = this.pendingRequests.get(requestId);
    if (request) {
      request.windowId = windowId;
    }
  }
}

// Singleton instance
export const backgroundState = new BackgroundState();
