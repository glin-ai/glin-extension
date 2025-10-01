/**
 * Transaction Manager Service
 * Handles transaction synchronization, caching, and real-time updates
 */

import { db, Transaction } from '../storage/db';
import { BackendAPIClient } from '../backend/api';
import { decodeAddress } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  blockHash: string;
  timestamp: string;
  extrinsicIndex: number;
  fromAddress: string;
  toAddress: string;
  amount: string;
  fee: string | null;
  method: string;
  status: 'pending' | 'success' | 'failed';
  errorMessage: string | null;
}

export interface TransactionQuery {
  limit?: number;
  offset?: number;
  status?: string;
}

export interface PendingTransaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  submittedAt: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export class TransactionManager {
  private backendClient: BackendAPIClient;
  private wsConnection: WebSocket | null = null;
  private wsReconnectTimer: NodeJS.Timeout | null = null;
  private pendingTransactions: Map<string, PendingTransaction> = new Map();
  private syncInProgress = false;
  private listeners: Array<(tx: Transaction) => void> = [];

  constructor(backendClient: BackendAPIClient) {
    this.backendClient = backendClient;
  }

  /**
   * Convert SS58 address to hex format
   */
  private addressToHex(address: string): string {
    if (address.startsWith('0x')) {
      return address;
    }
    try {
      const decoded = decodeAddress(address);
      return u8aToHex(decoded);
    } catch (error) {
      console.error('Failed to decode address:', address, error);
      return address;
    }
  }

  /**
   * Sync transactions from backend for a specific address
   */
  async syncTransactions(address: string, query?: TransactionQuery): Promise<void> {
    if (this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;

    try {
      const response = await this.backendClient.getTransactions(address, query);

      // Convert backend transactions to local format and save to IndexedDB
      for (const tx of response.transactions) {
        await this.saveCachedTransaction(tx);
      }
    } catch (error) {
      console.error('Failed to sync transactions:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get cached transactions from IndexedDB
   */
  async getCachedTransactions(address: string, limit = 50): Promise<Transaction[]> {
    const hexAddress = this.addressToHex(address);
    console.log('Querying transactions for hex address:', hexAddress);

    return await db.transactions
      .where('from').equals(hexAddress)
      .or('to').equals(hexAddress)
      .reverse()
      .sortBy('timestamp')
      .then(txs => {
        console.log('Found cached transactions:', txs.length);
        return txs.slice(0, limit);
      });
  }

  /**
   * Get combined transactions (cached + pending)
   */
  async getTransactions(address: string, query?: TransactionQuery): Promise<Transaction[]> {
    const hexAddress = this.addressToHex(address);
    console.log('getTransactions called for address:', address, 'hex:', hexAddress);

    // Try to sync from backend first
    try {
      await this.syncTransactions(address, query);
    } catch (error) {
      console.warn('Failed to sync from backend, using cached data:', error);
    }

    // Get cached transactions
    const cached = await this.getCachedTransactions(address, query?.limit);
    console.log('Cached transactions:', cached);

    // Add pending transactions
    const pending = Array.from(this.pendingTransactions.values())
      .filter(tx => {
        const txFromHex = this.addressToHex(tx.from);
        const txToHex = this.addressToHex(tx.to);
        return txFromHex === hexAddress || txToHex === hexAddress;
      })
      .map(tx => this.pendingToTransaction(tx));

    console.log('Pending transactions:', pending);

    // Merge and sort by timestamp
    const all = [...pending, ...cached];
    all.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    console.log('Total transactions:', all.length);
    return all.slice(0, query?.limit || 50);
  }

  /**
   * Save transaction to IndexedDB cache
   */
  private async saveCachedTransaction(tx: BlockchainTransaction): Promise<void> {
    const existing = await db.transactions.where('hash').equals(tx.hash).first();

    if (existing) {
      // Update existing transaction
      await db.transactions.update(existing.id!, {
        status: tx.status,
        blockNumber: tx.blockNumber,
        fee: tx.fee || '0',
        timestamp: new Date(tx.timestamp),
      });
    } else {
      // Insert new transaction
      await db.transactions.add({
        hash: tx.hash,
        from: tx.fromAddress,
        to: tx.toAddress,
        amount: tx.amount,
        fee: tx.fee || '0',
        status: tx.status,
        blockNumber: tx.blockNumber,
        timestamp: new Date(tx.timestamp),
        type: this.inferTransactionType(tx),
        metadata: {
          method: tx.method,
          extrinsicIndex: tx.extrinsicIndex,
          blockHash: tx.blockHash,
          errorMessage: tx.errorMessage,
        },
      });
    }
  }

  /**
   * Track pending transaction (user submitted)
   */
  trackPendingTransaction(hash: string, from: string, to: string, amount: string): void {
    this.pendingTransactions.set(hash, {
      hash,
      from,
      to,
      amount,
      submittedAt: Date.now(),
      status: 'pending',
    });

    // Notify listeners
    const tx = this.pendingToTransaction(this.pendingTransactions.get(hash)!);
    this.notifyListeners(tx);
  }

  /**
   * Subscribe to real-time transaction updates via WebSocket
   */
  async subscribeToUpdates(address: string): Promise<void> {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = await this.backendClient.getWebSocketUrl();
      this.connectWebSocket(wsUrl, address);
    } catch (error) {
      console.error('Failed to subscribe to transaction updates:', error);
    }
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }

    if (this.wsReconnectTimer) {
      clearTimeout(this.wsReconnectTimer);
      this.wsReconnectTimer = null;
    }
  }

  /**
   * Add transaction listener
   */
  addListener(callback: (tx: Transaction) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Connect to WebSocket
   */
  private connectWebSocket(wsUrl: string, address: string): void {
    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onopen = () => {
      console.log('WebSocket connected');

      // Subscribe to address
      this.wsConnection?.send(JSON.stringify({
        type: 'subscribe',
        address,
      }));
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.wsConnection.onclose = () => {
      console.log('WebSocket disconnected');

      // Attempt to reconnect after 5 seconds
      this.wsReconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        this.connectWebSocket(wsUrl, address);
      }, 5000);
    };
  }

  /**
   * Handle WebSocket message
   */
  private async handleWebSocketMessage(data: any): Promise<void> {
    if (data.type === 'transaction') {
      const tx: BlockchainTransaction = data.transaction;

      // Save to cache
      await this.saveCachedTransaction(tx);

      // Remove from pending if exists
      this.pendingTransactions.delete(tx.hash);

      // Notify listeners
      const localTx = await db.transactions.where('hash').equals(tx.hash).first();
      if (localTx) {
        this.notifyListeners(localTx);
      }
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(tx: Transaction): void {
    this.listeners.forEach(callback => {
      try {
        callback(tx);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  /**
   * Convert pending transaction to Transaction format
   */
  private pendingToTransaction(pending: PendingTransaction): Transaction {
    return {
      hash: pending.hash,
      from: pending.from,
      to: pending.to,
      amount: pending.amount,
      fee: '0',
      status: pending.status,
      timestamp: new Date(pending.submittedAt),
      type: 'send',
    };
  }

  /**
   * Infer transaction type from blockchain transaction
   */
  private inferTransactionType(tx: BlockchainTransaction): 'send' | 'receive' | 'faucet' {
    // This would need to be determined based on current user address
    // For now, return 'send' as default
    return 'send';
  }

  /**
   * Clear all cached transactions
   */
  async clearCache(): Promise<void> {
    await db.transactions.clear();
  }

  /**
   * Get transaction by hash
   */
  async getTransactionByHash(hash: string): Promise<Transaction | undefined> {
    // Check pending first
    const pending = this.pendingTransactions.get(hash);
    if (pending) {
      return this.pendingToTransaction(pending);
    }

    // Check cache
    const cached = await db.transactions.where('hash').equals(hash).first();
    if (cached) {
      return cached;
    }

    // Fetch from backend
    try {
      const tx = await this.backendClient.getTransactionByHash(hash);
      await this.saveCachedTransaction(tx);
      return await db.transactions.where('hash').equals(hash).first();
    } catch (error) {
      console.error('Failed to fetch transaction from backend:', error);
      return undefined;
    }
  }
}
