/**
 * Message passing bridge between extension components
 */

import { MessageType, RequestMessage, ResponseMessage } from './types';

export class MessageBridge {
  private messageId = 0;
  private pendingRequests = new Map<string, {
    resolve: (data: any) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();

  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  /**
   * Generate unique message ID
   */
  private generateId(): string {
    return `msg_${Date.now()}_${++this.messageId}`;
  }

  /**
   * Send message to background script
   */
  async sendToBackground(type: MessageType, payload?: any): Promise<any> {
    const message: RequestMessage = {
      id: this.generateId(),
      type,
      payload,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(message.id);
        reject(new Error(`Request timeout: ${type}`));
      }, this.REQUEST_TIMEOUT);

      this.pendingRequests.set(message.id, { resolve, reject, timeout });

      chrome.runtime.sendMessage(message, (response: ResponseMessage) => {
        if (chrome.runtime.lastError) {
          this.handleError(message.id, new Error(chrome.runtime.lastError.message));
          return;
        }

        this.handleResponse(response);
      });
    });
  }

  /**
   * Send message to content script
   */
  async sendToContentScript(
    tabId: number,
    type: MessageType,
    payload?: any
  ): Promise<any> {
    const message: RequestMessage = {
      id: this.generateId(),
      type,
      payload,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(message.id);
        reject(new Error(`Request timeout: ${type}`));
      }, this.REQUEST_TIMEOUT);

      this.pendingRequests.set(message.id, { resolve, reject, timeout });

      chrome.tabs.sendMessage(tabId, message, (response: ResponseMessage) => {
        if (chrome.runtime.lastError) {
          this.handleError(message.id, new Error(chrome.runtime.lastError.message));
          return;
        }

        this.handleResponse(response);
      });
    });
  }

  /**
   * Broadcast message to all tabs
   */
  async broadcastToAllTabs(type: MessageType, payload?: any): Promise<void> {
    const message: RequestMessage = {
      id: this.generateId(),
      type,
      payload,
      timestamp: Date.now(),
    };

    const tabs = await chrome.tabs.query({});
    const promises = tabs.map(tab => {
      if (tab.id) {
        return chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Ignore errors for tabs that can't receive messages
        });
      }
    });

    await Promise.all(promises);
  }

  /**
   * Handle response message
   */
  private handleResponse(response: ResponseMessage): void {
    const pending = this.pendingRequests.get(response.requestId);
    if (!pending) return;

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.requestId);

    if (response.success) {
      pending.resolve(response.data);
    } else {
      pending.reject(new Error(response.error || 'Unknown error'));
    }
  }

  /**
   * Handle error
   */
  private handleError(requestId: string, error: Error): void {
    const pending = this.pendingRequests.get(requestId);
    if (!pending) return;

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(requestId);
    pending.reject(error);
  }

  /**
   * Create success response
   */
  static createResponse(requestId: string, data?: any): ResponseMessage {
    return {
      id: `res_${Date.now()}`,
      type: MessageType.RESPONSE,
      requestId,
      success: true,
      data,
      timestamp: Date.now(),
    };
  }

  /**
   * Create error response
   */
  static createError(requestId: string, error: string): ResponseMessage {
    return {
      id: `res_${Date.now()}`,
      type: MessageType.ERROR,
      requestId,
      success: false,
      error,
      timestamp: Date.now(),
    };
  }
}

// Singleton instance
export const messageBridge = new MessageBridge();
