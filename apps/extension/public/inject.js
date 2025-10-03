/**
 * GLIN Wallet Provider - Injected into page context
 */

(function() {
  'use strict';

  // Only inject once
  if (window.glin) {
    return;
  }

  class GlinProvider {
    constructor() {
      this.isGlinWallet = true;
      this.version = '0.1.0';
      this._connected = false;
      this._accounts = [];
      this._pendingRequests = new Map();

      // Bind methods to preserve 'this' context
      this.enable = this.enable.bind(this);
      this.getAccounts = this.getAccounts.bind(this);
      this.signMessage = this.signMessage.bind(this);
      this.signRaw = this.signRaw.bind(this);
      this.authenticateWithBackend = this.authenticateWithBackend.bind(this);

      // Listen for responses from content script
      const messageListener = (event) => {
        if (event.source !== window) return;
        if (event.data.type === 'glin:response') {
          this._handleResponse(event.data);
        }
      };
      window.addEventListener('message', messageListener);
    }

    async enable() {
      console.log('[GLIN Provider] enable() called, this:', this);
      console.log('[GLIN Provider] this._connected:', this._connected);
      console.log('[GLIN Provider] this._accounts:', this._accounts);

      if (this._connected && this._accounts.length > 0) {
        return this._accounts;
      }

      console.log('[GLIN Provider] Requesting connection...');
      const result = await this._sendMessage('REQUEST_CONNECTION', {
        origin: window.location.origin,
        appName: document.title,
      });
      console.log('[GLIN Provider] Connection result:', result);

      if (result.approved && result.accounts) {
        this._connected = true;
        this._accounts = result.accounts;
        return this._accounts;
      }

      throw new Error('User rejected connection request');
    }

    async getAccounts() {
      if (!this._connected) {
        throw new Error('Not connected. Call enable() first.');
      }
      return this._accounts;
    }

    async signMessage(message) {
      if (!this._connected) {
        throw new Error('Not connected. Call enable() first.');
      }

      const result = await this._sendMessage('SIGN_MESSAGE', { message });
      return result;
    }

    async signRaw(message) {
      return this.signMessage(message);
    }

    async authenticateWithBackend() {
      if (!this._connected) {
        throw new Error('Not connected. Call enable() first.');
      }

      const result = await this._sendMessage('AUTHENTICATE_BACKEND', {});
      return result;
    }

    _sendMessage(type, payload) {
      return new Promise((resolve, reject) => {
        const id = `glin_${Date.now()}_${Math.random()}`;

        this._pendingRequests.set(id, { resolve, reject });

        // Post message to content script
        window.postMessage({
          type: 'glin:request',
          id,
          messageType: type,
          payload,
        }, '*');

        // Timeout after 60 seconds
        setTimeout(() => {
          if (this._pendingRequests.has(id)) {
            this._pendingRequests.delete(id);
            reject(new Error('Request timeout'));
          }
        }, 60000);
      });
    }

    _handleResponse(response) {
      const pending = this._pendingRequests.get(response.id);
      if (!pending) return;

      this._pendingRequests.delete(response.id);

      if (response.success) {
        pending.resolve(response.data);
      } else {
        pending.reject(new Error(response.error || 'Unknown error'));
      }
    }
  }

  // Inject provider
  const provider = new GlinProvider();
  window.glin = provider;

  // Add to injectedWeb3 for compatibility
  if (!window.injectedWeb3) {
    window.injectedWeb3 = {};
  }
  window.injectedWeb3['glin'] = provider;

  // Announce to the page
  window.dispatchEvent(new CustomEvent('glin#initialized', {
    detail: { version: provider.version }
  }));

  console.log('[GLIN Wallet] Provider injected', provider.version);
})();
