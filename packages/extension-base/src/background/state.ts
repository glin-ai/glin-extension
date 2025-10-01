/**
 * Background service worker state management
 */

import { WalletManager } from '../substrate/wallet';
import { WalletState } from '../messaging/types';

export class BackgroundState {
  private walletManager: WalletManager | null = null;
  private connectedSites: Map<string, {
    appName: string;
    appIcon?: string;
    connectedAt: number;
  }> = new Map();

  private subscriptions: Map<string, {
    type: string;
    unsubscribe: () => void;
  }> = new Map();

  /**
   * Initialize wallet manager
   */
  async init(rpcEndpoint: string): Promise<void> {
    if (this.walletManager) {
      return;
    }

    this.walletManager = new WalletManager(rpcEndpoint);
    await this.walletManager.init();
  }

  /**
   * Get wallet manager
   */
  getWalletManager(): WalletManager | null {
    return this.walletManager;
  }

  /**
   * Get current state
   */
  async getState(): Promise<WalletState> {
    const wallet = this.walletManager?.getCurrentWallet();
    const hasAnyWallet = this.walletManager ? await this.walletManager.hasWallet() : false;
    const balance = wallet ? await this.walletManager?.getBalance() : undefined;

    return {
      isInitialized: hasAnyWallet,
      isLocked: hasAnyWallet && !wallet,
      isConnected: this.walletManager !== null,
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
  }

  /**
   * Disconnect all sites
   */
  disconnectAllSites(): void {
    this.connectedSites.clear();
  }
}

// Singleton instance
export const backgroundState = new BackgroundState();
