/**
 * Network storage utilities
 */

import {
  NetworkId,
  NetworkStorage,
  STORAGE_KEY_NETWORK,
  STORAGE_KEY_CUSTOM_RPC,
  getNetworkById,
  getDefaultNetwork,
} from '../types/networks';

/**
 * Get current network from chrome.storage
 */
export async function getCurrentNetwork(): Promise<{ networkId: NetworkId; customRpcUrl?: string }> {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY_NETWORK, STORAGE_KEY_CUSTOM_RPC]);

    const networkId = (result[STORAGE_KEY_NETWORK] as NetworkId) || 'localhost';
    const customRpcUrl = result[STORAGE_KEY_CUSTOM_RPC] as string | undefined;

    console.log('[Network Storage] Retrieved network:', { networkId, customRpcUrl });

    return { networkId, customRpcUrl };
  } catch (error) {
    console.error('[Network Storage] Failed to get network:', error);
    // Return default network on error
    return { networkId: 'localhost' };
  }
}

/**
 * Set current network in chrome.storage
 */
export async function setCurrentNetwork(
  networkId: NetworkId,
  customRpcUrl?: string
): Promise<void> {
  try {
    const storageData: Record<string, string> = {
      [STORAGE_KEY_NETWORK]: networkId,
    };

    if (networkId === 'custom' && customRpcUrl) {
      storageData[STORAGE_KEY_CUSTOM_RPC] = customRpcUrl;
    }

    await chrome.storage.local.set(storageData);
    console.log('[Network Storage] Saved network:', { networkId, customRpcUrl });
  } catch (error) {
    console.error('[Network Storage] Failed to save network:', error);
    throw error;
  }
}

/**
 * Get RPC URL for current network
 */
export async function getCurrentRpcUrl(): Promise<string> {
  const { networkId, customRpcUrl } = await getCurrentNetwork();

  const network = getNetworkById(networkId, customRpcUrl);
  if (!network) {
    console.warn('[Network Storage] Network not found, using default');
    return getDefaultNetwork().rpcUrl;
  }

  return network.rpcUrl;
}

/**
 * Initialize network storage with default value on first install
 */
export async function initializeNetworkStorage(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY_NETWORK);

    if (!result[STORAGE_KEY_NETWORK]) {
      // First install, set default network
      await setCurrentNetwork('localhost');
      console.log('[Network Storage] Initialized with default network: localhost');
    }
  } catch (error) {
    console.error('[Network Storage] Failed to initialize:', error);
  }
}
