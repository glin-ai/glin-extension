/**
 * window.glin provider implementation
 */

import { GlinProvider, Account, SignatureResult, AuthResult, EventHandler } from './types';
import { MessageType } from '@glin-extension/extension-base/src/messaging/types';

export class GlinProviderImpl implements GlinProvider {
  public readonly isGlinWallet = true;
  public readonly version = '0.1.0';
  public _events: Map<string, Set<EventHandler>> = new Map();

  private connected = false;
  private accounts: Account[] = [];

  constructor() {
    // Listen for messages from background
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      if (event.data.type?.startsWith('glin:')) {
        this.handleProviderEvent(event.data);
      }
    });
  }

  /**
   * Request connection to wallet
   */
  async enable(): Promise<Account[]> {
    if (this.connected && this.accounts.length > 0) {
      return this.accounts;
    }

    const result = await this.sendMessage(MessageType.REQUEST_CONNECTION, {
      origin: window.location.origin,
      appName: document.title,
      appIcon: this.getFavicon(),
    });

    if (result.approved && result.accounts) {
      this.connected = true;
      this.accounts = result.accounts;
      return this.accounts;
    }

    throw new Error('User rejected connection request');
  }

  /**
   * Get connected accounts
   */
  async getAccounts(): Promise<Account[]> {
    if (!this.connected) {
      return [];
    }

    const result = await this.sendMessage(MessageType.GET_ACCOUNTS);
    this.accounts = result || [];
    return this.accounts;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Sign message
   */
  async signMessage(message: string): Promise<SignatureResult> {
    if (!this.connected) {
      throw new Error('Not connected. Call enable() first.');
    }

    const result = await this.sendMessage(MessageType.SIGN_MESSAGE, {
      message,
    });

    return result;
  }

  /**
   * Sign raw message (alias for signMessage)
   */
  async signRaw(message: string): Promise<SignatureResult> {
    return this.signMessage(message);
  }

  /**
   * Authenticate with GLIN backend
   */
  async authenticateWithBackend(): Promise<AuthResult> {
    if (!this.connected) {
      throw new Error('Not connected. Call enable() first.');
    }

    const result = await this.sendMessage(MessageType.AUTHENTICATE_BACKEND);
    return result;
  }

  /**
   * Provider-specific features
   */
  provider = {
    getStatus: async () => {
      return this.sendMessage(MessageType.GET_PROVIDER_STATUS);
    },

    getTasks: async () => {
      return this.sendMessage(MessageType.GET_PROVIDER_TASKS);
    },

    acceptTask: async (taskId: string) => {
      return this.sendMessage(MessageType.ACCEPT_TASK, { taskId });
    },
  };

  /**
   * Event listeners
   */
  on(event: string, handler: EventHandler): void {
    if (!this._events.has(event)) {
      this._events.set(event, new Set());
    }
    this._events.get(event)!.add(handler);
  }

  removeListener(event: string, handler: EventHandler): void {
    const handlers = this._events.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Send message to background script
   */
  private async sendMessage(type: MessageType, payload?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageId = `msg_${Date.now()}_${Math.random()}`;

      // Listen for response
      const responseHandler = (event: MessageEvent) => {
        if (
          event.source === window &&
          event.data.type === 'glin:response' &&
          event.data.id === messageId
        ) {
          window.removeEventListener('message', responseHandler);

          if (event.data.success) {
            resolve(event.data.data);
          } else {
            reject(new Error(event.data.error || 'Request failed'));
          }
        }
      };

      window.addEventListener('message', responseHandler);

      // Send message to content script
      window.postMessage({
        type: 'glin:request',
        id: messageId,
        messageType: type,
        payload,
      }, '*');

      // Timeout after 30 seconds
      setTimeout(() => {
        window.removeEventListener('message', responseHandler);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  }

  /**
   * Handle events from background
   */
  private handleProviderEvent(data: any): void {
    switch (data.type) {
      case 'glin:accountsChanged':
        this.accounts = data.accounts || [];
        this.emit('accountsChanged', this.accounts);
        break;

      case 'glin:chainChanged':
        this.emit('chainChanged', data.chainId);
        break;

      case 'glin:disconnect':
        this.connected = false;
        this.accounts = [];
        this.emit('disconnect');
        break;
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, ...args: any[]): void {
    const handlers = this._events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Get page favicon
   */
  private getFavicon(): string | undefined {
    const link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]');
    return link?.href;
  }
}
