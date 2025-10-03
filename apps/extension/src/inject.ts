/**
 * Inject script that runs in the page context
 * This has access to the page's window object
 */

import { GlinProviderImpl } from '@glin-extension/extension-inject/src/provider';

// Only inject once
if (!(window as any).glin) {
  const provider = new GlinProviderImpl();
  (window as any).glin = provider;

  // Also add to injectedWeb3 for compatibility
  if (!(window as any).injectedWeb3) {
    (window as any).injectedWeb3 = {};
  }
  (window as any).injectedWeb3['glin'] = provider;

  // Announce to the page that GLIN wallet is available
  window.dispatchEvent(new CustomEvent('glin#initialized', {
    detail: { version: provider.version }
  }));

  console.log('[GLIN Wallet] Provider injected', provider.version);
}

// Bridge messages between page and content script
window.addEventListener('message', async (event) => {
  if (event.source !== window) return;
  if (!event.data.type?.startsWith('glin:request')) return;

  try {
    // Forward to content script, which will forward to background
    window.postMessage({
      type: 'glin:to-background',
      data: event.data,
    }, '*');
  } catch (error) {
    console.error('[GLIN Wallet] Inject message error:', error);
  }
});
