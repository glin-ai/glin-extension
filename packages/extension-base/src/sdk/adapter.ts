/**
 * WalletSDK - Migration adapter wrapping @glin-ai/sdk
 *
 * This adapter provides backward compatibility with the old SubstrateClient API
 * while using the new SDK under the hood. Feature flags control gradual rollout.
 */

import { GlinClient, GlinTransfer, type Balance as SDKBalance } from '@glin-ai/sdk';
import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import type { ISubmittableResult } from '@polkadot/types/types';

// Feature flags for gradual migration
export interface WalletSDKConfig {
  useSDKForBalance?: boolean;
  useSDKForTransfer?: boolean;
  useSDKForSubscriptions?: boolean;
  useSDKForBlocks?: boolean;
}

// Maintain old interfaces for backward compatibility
export interface ChainInfo {
  name: string;
  tokenSymbol: string;
  tokenDecimals: number;
  ss58Format: number;
}

export interface Balance {
  free: string;
  reserved: string;
  frozen: string;
  flags: string;
}

export class WalletSDK {
  private client: GlinClient;
  private transferModule: GlinTransfer | null = null;
  private config: WalletSDKConfig;

  constructor(
    private endpoint: string,
    config: WalletSDKConfig = {
      useSDKForBalance: true,
      useSDKForTransfer: true,
      useSDKForSubscriptions: true,
      useSDKForBlocks: true,
    }
  ) {
    this.client = new GlinClient(endpoint);
    this.config = config;
  }

  /**
   * Connect to the chain
   */
  async connect(): Promise<void> {
    await this.client.connect();

    // Initialize transfer module after connection
    const api = this.client.getApi();
    if (api) {
      this.transferModule = new GlinTransfer(api);
    }
  }

  /**
   * Disconnect from the chain
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect();
    this.transferModule = null;
  }

  /**
   * Get API instance (for backward compatibility)
   */
  getApi(): ApiPromise {
    const api = this.client.getApi();
    if (!api) {
      throw new Error('Not connected to chain. Call connect() first.');
    }
    return api;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    const api = this.client.getApi();
    return api !== null && api.isConnected;
  }

  /**
   * Get chain info
   */
  async getChainInfo(): Promise<ChainInfo> {
    const api = this.getApi();
    const properties = api.registry.getChainProperties();

    const tokenSymbolArray = properties?.tokenSymbol.toJSON() as string[] | undefined;
    const tokenDecimalsArray = properties?.tokenDecimals.toJSON() as number[] | undefined;
    const ss58FormatValue = properties?.ss58Format.toJSON() as number | undefined;

    return {
      name: api.runtimeChain.toString(),
      tokenSymbol: tokenSymbolArray?.[0] || 'GLIN',
      tokenDecimals: tokenDecimalsArray?.[0] || 18,
      ss58Format: ss58FormatValue || 42
    };
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<Balance> {
    if (this.config.useSDKForBalance) {
      const sdkBalance = await this.client.getBalance(address);
      return {
        free: sdkBalance.free,
        reserved: sdkBalance.reserved,
        frozen: sdkBalance.frozen,
        flags: '0' // SDK doesn't have flags field
      };
    }

    // Fallback to direct API (should never be needed)
    const api = this.getApi();
    const account = await api.query.system.account(address);
    const accountInfo = account as unknown as {
      data: {
        free: { toString(): string };
        reserved: { toString(): string };
        frozen: { toString(): string };
        flags: { toString(): string };
      }
    };

    return {
      free: accountInfo.data.free.toString(),
      reserved: accountInfo.data.reserved.toString(),
      frozen: accountInfo.data.frozen.toString(),
      flags: accountInfo.data.flags.toString()
    };
  }

  /**
   * Get current block number
   */
  async getCurrentBlock(): Promise<number> {
    if (this.config.useSDKForBlocks) {
      return await this.client.getBlockNumber();
    }

    const api = this.getApi();
    const header = await api.rpc.chain.getHeader();
    return header.number.toNumber();
  }

  /**
   * Subscribe to balance changes
   */
  subscribeBalance(
    address: string,
    callback: (balance: Balance) => void
  ): () => void {
    if (this.config.useSDKForSubscriptions) {
      let unsubscribe: (() => void) | null = null;

      this.client.subscribeBalance(address, (sdkBalance) => {
        callback({
          free: sdkBalance.free,
          reserved: sdkBalance.reserved,
          frozen: sdkBalance.frozen,
          flags: '0'
        });
      }).then(unsub => {
        unsubscribe = unsub;
      });

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }

    // Fallback to direct API
    const api = this.getApi();
    let unsubscribe: (() => void) | null = null;

    api.query.system.account(address, (account: unknown) => {
      const accountInfo = account as {
        data: {
          free: { toString(): string };
          reserved: { toString(): string };
          frozen: { toString(): string };
          flags: { toString(): string };
        }
      };
      callback({
        free: accountInfo.data.free.toString(),
        reserved: accountInfo.data.reserved.toString(),
        frozen: accountInfo.data.frozen.toString(),
        flags: accountInfo.data.flags.toString()
      });
    }).then((unsub: unknown) => {
      unsubscribe = unsub as () => void;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  /**
   * Transfer tokens
   */
  async transfer(
    from: KeyringPair,
    to: string,
    amount: string,
    onStatus?: (status: ISubmittableResult) => void
  ): Promise<string> {
    if (this.config.useSDKForTransfer && this.transferModule) {
      return await this.transferModule.transfer(from, to, amount, onStatus);
    }

    // Fallback to direct API
    const api = this.getApi();
    const decimals = 18;
    const amountInSmallestUnit = BigInt(Math.floor(parseFloat(amount) * (10 ** decimals))).toString();
    const transfer = api.tx.balances.transferKeepAlive(to, amountInSmallestUnit);

    return new Promise((resolve, reject) => {
      transfer.signAndSend(from, (result) => {
        if (onStatus) {
          onStatus(result);
        }

        if (result.status.isFinalized) {
          resolve(result.status.asFinalized.toString());
        }

        if (result.isError) {
          reject(new Error('Transaction failed'));
        }
      }).catch(reject);
    });
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(
    from: string,
    to: string,
    amount: string
  ): Promise<string> {
    if (this.config.useSDKForTransfer) {
      return await this.client.estimateFee(from, to, amount);
    }

    // Fallback to direct API
    const api = this.getApi();
    const decimals = 18;
    const amountInSmallestUnit = BigInt(Math.floor(parseFloat(amount) * (10 ** decimals))).toString();
    const transfer = api.tx.balances.transferKeepAlive(to, amountInSmallestUnit);
    const info = await transfer.paymentInfo(from);
    return info.partialFee.toString();
  }

  /**
   * Get transaction details
   */
  async getTransaction(hash: string): Promise<{ hash: string; method: string; section: string; args: string[] } | null> {
    // No SDK method for this yet, use direct API
    const api = this.getApi();
    const blockHash = await api.rpc.chain.getBlockHash();
    const signedBlock = await api.rpc.chain.getBlock(blockHash);

    const tx = signedBlock.block.extrinsics.find(
      (ex) => ex.hash.toString() === hash
    );

    if (tx) {
      return {
        hash: tx.hash.toString(),
        method: tx.method.method,
        section: tx.method.section,
        args: tx.args.map(arg => arg.toString())
      };
    }

    return null;
  }

  /**
   * Subscribe to new blocks
   */
  subscribeNewHeads(callback: (blockNumber: number) => void): () => void {
    if (this.config.useSDKForSubscriptions) {
      let unsubscribe: (() => void) | null = null;

      this.client.subscribeNewBlocks((blockNumber) => {
        callback(blockNumber);
      }).then(unsub => {
        unsubscribe = unsub;
      });

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }

    // Fallback to direct API
    const api = this.getApi();
    let unsubscribe: (() => void) | null = null;

    api.rpc.chain.subscribeNewHeads((header) => {
      callback(header.number.toNumber());
    }).then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }
}
