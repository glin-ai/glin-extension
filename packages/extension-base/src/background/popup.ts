/**
 * Popup window management utilities
 */

/**
 * Open approval popup for connection request
 */
export async function openApprovalPopup(requestId: string): Promise<number> {
  try {
    const url = chrome.runtime.getURL(`popup.html#/connection-request?id=${requestId}`);

    const window = await chrome.windows.create({
      url,
      type: 'popup',
      width: 400,
      height: 600,
      focused: true,
    });

    console.log('[Popup] Opened approval popup:', window.id, 'for request:', requestId);

    return window.id!;
  } catch (error) {
    console.error('[Popup] Failed to open approval popup:', error);
    throw error;
  }
}

/**
 * Close popup window
 */
export async function closePopup(windowId: number): Promise<void> {
  try {
    await chrome.windows.remove(windowId);
    console.log('[Popup] Closed popup:', windowId);
  } catch (error) {
    console.log('[Popup] Window already closed or not found:', windowId);
  }
}
