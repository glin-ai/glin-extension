/**
 * Format utilities for GLIN Wallet
 *
 * Note: For amount conversions, use parseGLIN() and formatGLIN() from '@glin-ai/sdk'
 * These utilities are for UI-specific formatting only.
 */

/**
 * Format GLIN balance with proper decimals and thousand separators
 * @param balance - Raw balance string (in smallest unit)
 * @returns Formatted balance string with unit
 */
export function formatBalance(balance: string): string {
  const decimals = 18;

  // Convert to BigInt and divide by decimals
  const rawValue = BigInt(balance || '0');
  const divisor = BigInt(10 ** decimals);
  const wholePart = rawValue / divisor;
  const fractionalPart = rawValue % divisor;

  // Format whole part with thousand separators
  const wholeStr = wholePart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Get first 4 decimal places
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0').slice(0, 4);

  // Determine the unit based on value
  let unit = 'tGLIN';
  if (wholePart >= BigInt(1000000)) {
    unit = 'MtGLIN'; // Million tGLIN
    const millions = Number(wholePart) / 1000000;
    return `${millions.toFixed(4)} ${unit}`;
  }

  // Remove trailing zeros from fractional part
  const trimmedFractional = fractionalStr.replace(/0+$/, '');

  if (trimmedFractional) {
    return `${wholeStr}.${trimmedFractional} ${unit}`;
  }

  return `${wholeStr} ${unit}`;
}

/**
 * Format address to shortened form
 * @param address - Full address string
 * @returns Shortened address (6 chars...4 chars)
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Convert user input amount (in GLIN) to smallest unit (planck)
 *
 * @deprecated Use parseGLIN() from '@glin-ai/sdk' instead
 * @example
 * import { parseGLIN } from '@glin-ai/sdk';
 * const amountPlanck = parseGLIN("10.5");
 */
export function parseAmountToSmallestUnit(amount: string): string {
  // This function is deprecated - import parseGLIN from SDK
  throw new Error('parseAmountToSmallestUnit is deprecated. Use parseGLIN from @glin-ai/sdk instead.');
}
