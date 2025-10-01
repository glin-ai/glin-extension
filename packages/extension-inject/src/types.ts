/**
 * Type definitions for window.glin provider
 */

export interface Account {
  address: string;
  name: string;
  publicKey: string;
}

export interface SignatureResult {
  signature: string;
  publicKey: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    wallet_address: string;
    role: string;
  };
}

export interface ProviderStatus {
  status: 'active' | 'idle' | 'offline';
  hardwareInfo?: any;
  tasks?: {
    active: number;
    completed: number;
  };
  earnings?: {
    today: number;
    total: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: string;
}

export type EventHandler = (...args: any[]) => void;

export interface GlinProvider {
  // Identity
  isGlinWallet: true;
  version: string;

  // Connection
  enable(): Promise<Account[]>;
  getAccounts(): Promise<Account[]>;
  isConnected(): boolean;

  // Signing
  signMessage(message: string): Promise<SignatureResult>;
  signRaw(message: string): Promise<SignatureResult>;

  // Backend authentication (GLIN-specific)
  authenticateWithBackend(): Promise<AuthResult>;

  // Provider features (GLIN-specific)
  provider?: {
    getStatus(): Promise<ProviderStatus>;
    getTasks(): Promise<Task[]>;
    acceptTask(taskId: string): Promise<void>;
  };

  // Events
  on(event: 'accountsChanged', handler: (accounts: Account[]) => void): void;
  on(event: 'chainChanged', handler: (chainId: string) => void): void;
  on(event: 'disconnect', handler: () => void): void;
  removeListener(event: string, handler: EventHandler): void;

  // Internal (not part of public API)
  _events?: Map<string, Set<EventHandler>>;
}

declare global {
  interface Window {
    glin?: GlinProvider;
    injectedWeb3?: Record<string, any>;
  }
}
