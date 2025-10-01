/**
 * Content script that injects window.glin provider
 */

import { GlinProviderImpl } from './provider';

// Only inject once
if (!window.glin) {
  const provider = new GlinProviderImpl();
  window.glin = provider;

  // Also add to injectedWeb3 for compatibility
  if (!window.injectedWeb3) {
    window.injectedWeb3 = {};
  }
  window.injectedWeb3['glin'] = provider;

  // Announce to the page that GLIN wallet is available
  window.dispatchEvent(new CustomEvent('glin#initialized', {
    detail: { version: provider.version }
  }));

  console.log('[GLIN Wallet] Provider injected', provider.version);
}

// Bridge messages between page and background
window.addEventListener('message', async (event) => {
  if (event.source !== window) return;
  if (!event.data.type?.startsWith('glin:request')) return;

  try {
    // Forward to background script
    const response = await chrome.runtime.sendMessage({
      id: `bg_${Date.now()}`,
      type: event.data.messageType,
      payload: event.data.payload,
      origin: window.location.origin,
      timestamp: Date.now(),
    });

    // Send response back to page
    window.postMessage({
      type: 'glin:response',
      id: event.data.id,
      success: response.success,
      data: response.data,
      error: response.error,
    }, '*');
  } catch (error) {
    // Send error back to page
    window.postMessage({
      type: 'glin:response',
      id: event.data.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, '*');
  }
});

export { GlinProviderImpl };
