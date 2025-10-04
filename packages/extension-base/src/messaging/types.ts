/**
 * Message types for communication between extension components
 */

export enum MessageType {
  // Wallet management
  CREATE_WALLET = 'CREATE_WALLET',
  IMPORT_WALLET = 'IMPORT_WALLET',
  UNLOCK_WALLET = 'UNLOCK_WALLET',
  LOCK_WALLET = 'LOCK_WALLET',
  DELETE_WALLET = 'DELETE_WALLET',
  EXPORT_SEED = 'EXPORT_SEED',
  GET_WALLETS = 'GET_WALLETS',
  SWITCH_WALLET = 'SWITCH_WALLET',
  GET_ACCOUNTS = 'GET_ACCOUNTS',
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  SWITCH_ACCOUNT = 'SWITCH_ACCOUNT',
  RENAME_ACCOUNT = 'RENAME_ACCOUNT',
  EXPORT_ACCOUNT = 'EXPORT_ACCOUNT',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',

  // Settings
  CHANGE_NETWORK = 'CHANGE_NETWORK',
  GET_NETWORK = 'GET_NETWORK',
  SET_THEME = 'SET_THEME',
  GET_THEME = 'GET_THEME',

  // Transactions
  GET_BALANCE = 'GET_BALANCE',
  SEND_TRANSACTION = 'SEND_TRANSACTION',
  ESTIMATE_FEE = 'ESTIMATE_FEE',
  GET_TRANSACTION_HISTORY = 'GET_TRANSACTION_HISTORY',

  // Signing
  SIGN_MESSAGE = 'SIGN_MESSAGE',
  SIGN_TRANSACTION = 'SIGN_TRANSACTION',

  // Dapp interaction
  REQUEST_CONNECTION = 'REQUEST_CONNECTION',
  DISCONNECT_SITE = 'DISCONNECT_SITE',
  GET_CONNECTED_SITES = 'GET_CONNECTED_SITES',

  // Authentication
  AUTHENTICATE_BACKEND = 'AUTHENTICATE_BACKEND',
  GET_AUTH_TOKEN = 'GET_AUTH_TOKEN',

  // Provider features (GLIN-specific)
  GET_PROVIDER_STATUS = 'GET_PROVIDER_STATUS',
  GET_PROVIDER_TASKS = 'GET_PROVIDER_TASKS',
  ACCEPT_TASK = 'ACCEPT_TASK',
  GET_TESTNET_POINTS = 'GET_TESTNET_POINTS',

  // Subscriptions
  SUBSCRIBE_BALANCE = 'SUBSCRIBE_BALANCE',
  SUBSCRIBE_EVENTS = 'SUBSCRIBE_EVENTS',
  SUBSCRIBE_TRANSACTIONS = 'SUBSCRIBE_TRANSACTIONS',
  UNSUBSCRIBE = 'UNSUBSCRIBE',

  // State
  GET_STATE = 'GET_STATE',
  STATE_UPDATE = 'STATE_UPDATE',

  // Responses
  RESPONSE = 'RESPONSE',
  ERROR = 'ERROR',
}

export interface BaseMessage {
  id: string;
  type: MessageType;
  timestamp: number;
}

export interface RequestMessage extends BaseMessage {
  payload?: any;
  origin?: string;
}

export interface ResponseMessage extends BaseMessage {
  requestId: string;
  success: boolean;
  data?: any;
  error?: string;
}

// Specific message payloads

export interface CreateWalletPayload {
  name: string;
  password: string;
}

export interface ImportWalletPayload {
  name: string;
  mnemonic: string;
  password: string;
}

export interface UnlockWalletPayload {
  walletId: number;
  password: string;
}

export interface SendTransactionPayload {
  to: string;
  amount: string;
  password: string;
}

export interface SignMessagePayload {
  message: string;
  password?: string;
}

export interface RequestConnectionPayload {
  origin: string;
  appName?: string;
  appIcon?: string;
}

export interface AcceptTaskPayload {
  taskId: string;
}

// State types

export interface WalletState {
  isInitialized: boolean;
  isLocked: boolean;
  isConnected: boolean;
  currentAccount?: {
    address: string;
    name: string;
    publicKey: string;
    balance?: string;
  };
  connectedSites: string[];
}

// Subscription types

export interface SubscriptionMessage extends BaseMessage {
  subscriptionId: string;
  data: any;
}

export type MessageHandler = (message: RequestMessage) => Promise<any>;
