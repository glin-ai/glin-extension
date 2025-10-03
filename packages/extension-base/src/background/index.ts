/**
 * Background service worker entry point
 */

import { backgroundState } from './state';
import { messageHandlers } from './handlers';
import { MessageBridge } from '../messaging/bridge';
import { RequestMessage } from '../messaging/types';
import { getCurrentRpcUrl, initializeNetworkStorage } from '../storage/network';

/**
 * Initialize background service worker
 */
async function init() {
  console.log('[GLIN Wallet] Background service worker starting...');

  try {
    // Initialize network storage
    await initializeNetworkStorage();

    // Get RPC endpoint from storage
    const rpcEndpoint = await getCurrentRpcUrl();
    console.log('[GLIN Wallet] Connecting to RPC:', rpcEndpoint);

    // Initialize wallet manager
    await backgroundState.init(rpcEndpoint);
    console.log('[GLIN Wallet] Wallet manager initialized');

    // Setup message listeners
    chrome.runtime.onMessage.addListener((
      message: RequestMessage,
      sender,
      sendResponse
    ) => {
      handleMessage(message, sender).then(sendResponse);
      return true; // Keep channel open for async response
    });

    // Setup extension icon click
    chrome.action.onClicked.addListener(() => {
      chrome.runtime.openOptionsPage();
    });

    // Setup alarm for periodic tasks
    chrome.alarms.create('periodicCheck', { periodInMinutes: 5 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'periodicCheck') {
        performPeriodicTasks();
      }
    });

    console.log('[GLIN Wallet] Background service worker ready');
  } catch (error) {
    console.error('[GLIN Wallet] Failed to initialize:', error);
  }
}

/**
 * Handle incoming message
 */
async function handleMessage(
  message: RequestMessage,
  sender: chrome.runtime.MessageSender
) {
  try {
    // Add origin to message if from content script
    if (sender.tab?.url) {
      message.origin = new URL(sender.tab.url).origin;
    }

    const data = await messageHandlers.handleMessage(message);
    return MessageBridge.createResponse(message.id, data);
  } catch (error) {
    console.error('[GLIN Wallet] Message handler error:', error);
    return MessageBridge.createError(
      message.id,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Perform periodic background tasks
 */
async function performPeriodicTasks() {
  try {
    // Refresh balance if wallet is unlocked
    const state = await backgroundState.getState();
    if (!state.isLocked && state.currentAccount) {
      // Could update balance, check for notifications, etc.
      console.log('[GLIN Wallet] Periodic check completed');
    }
  } catch (error) {
    console.error('[GLIN Wallet] Periodic task error:', error);
  }
}

/**
 * Handle extension install/update
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[GLIN Wallet] Extension installed');
    // Open onboarding page
    chrome.tabs.create({ url: 'popup.html' });
  } else if (details.reason === 'update') {
    console.log('[GLIN Wallet] Extension updated');
  }
});

// Initialize on load
init();
