/**
 * Content script - injects the provider into the page context
 */

// Inject the script into the page's main world
const script = document.createElement('script');
script.src = chrome.runtime.getURL('public/inject.js');
script.onload = () => {
  script.remove();
  console.log('[GLIN Wallet] Inject script loaded');
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from the injected script and forward to background
window.addEventListener('message', async (event) => {
  if (event.source !== window) return;
  if (event.data.type !== 'glin:request') return;

  const requestData = event.data;
  console.log('[Content Script] Received glin:request:', requestData);

  try {
    // Forward to background script
    console.log('[Content Script] Forwarding to background...');
    const response = await chrome.runtime.sendMessage({
      id: requestData.id,
      type: requestData.messageType,
      payload: requestData.payload,
      origin: window.location.origin,
      timestamp: Date.now(),
    });
    console.log('[Content Script] Background response:', response);

    // Send response back to page
    window.postMessage({
      type: 'glin:response',
      id: requestData.id,
      success: response.success,
      data: response.data,
      error: response.error,
    }, '*');
  } catch (error) {
    // Send error back to page
    window.postMessage({
      type: 'glin:response',
      id: requestData.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, '*');
  }
});
