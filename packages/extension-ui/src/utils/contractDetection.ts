/**
 * Contract transaction detection and decoding utilities
 */

export interface ContractTransaction {
  type: 'CONTRACT_CALL' | 'CONTRACT_DEPLOY' | 'CONTRACT_UPLOAD_CODE' | 'REGULAR';
  section: string;
  method: string;
  args: any[];
  // Specific to contract calls
  contractAddress?: string;
  value?: string;
  gasLimit?: {
    refTime: string;
    proofSize: string;
  };
  storageDepositLimit?: string | null;
  data?: string; // Encoded contract call data
  // Specific to contract deployment
  codeHash?: string;
  salt?: string;
}

/**
 * Detect if an extrinsic is a contract-related transaction
 */
export function detectTransactionType(extrinsic: any): ContractTransaction {
  const { section, method, args } = extrinsic.method || extrinsic;

  // Contract call
  if (section === 'contracts' && method === 'call') {
    return {
      type: 'CONTRACT_CALL',
      section,
      method,
      args,
      contractAddress: args[0]?.toString(),
      value: args[1]?.toString(),
      gasLimit: parseGasLimit(args[2]),
      storageDepositLimit: args[3]?.toString() || null,
      data: args[4]?.toString(),
    };
  }

  // Contract instantiation
  if (section === 'contracts' && (method === 'instantiate' || method === 'instantiateWithCode')) {
    return {
      type: 'CONTRACT_DEPLOY',
      section,
      method,
      args,
      value: args[0]?.toString(),
      gasLimit: parseGasLimit(args[1]),
      storageDepositLimit: args[2]?.toString() || null,
      codeHash: method === 'instantiate' ? args[3]?.toString() : undefined,
      data: args[method === 'instantiate' ? 4 : 3]?.toString(),
      salt: args[method === 'instantiate' ? 5 : 4]?.toString(),
    };
  }

  // Upload code only
  if (section === 'contracts' && method === 'uploadCode') {
    return {
      type: 'CONTRACT_UPLOAD_CODE',
      section,
      method,
      args,
      storageDepositLimit: args[1]?.toString() || null,
    };
  }

  // Regular transaction
  return {
    type: 'REGULAR',
    section,
    method,
    args,
  };
}

/**
 * Parse gas limit from extrinsic argument
 */
function parseGasLimit(gasArg: any): { refTime: string; proofSize: string } | undefined {
  if (!gasArg) return undefined;

  try {
    // Handle WeightV2 format
    if (gasArg.refTime !== undefined && gasArg.proofSize !== undefined) {
      return {
        refTime: gasArg.refTime.toString(),
        proofSize: gasArg.proofSize.toString(),
      };
    }

    // Handle plain object
    if (typeof gasArg === 'object') {
      return {
        refTime: gasArg.refTime?.toString() || '0',
        proofSize: gasArg.proofSize?.toString() || '0',
      };
    }

    return undefined;
  } catch (error) {
    console.error('Failed to parse gas limit:', error);
    return undefined;
  }
}

/**
 * Decode contract method and arguments from call data
 * Requires ABI to properly decode
 */
export function decodeContractCall(callData: string, abi?: any): {
  selector: string;
  method?: string;
  args?: any[];
} | null {
  try {
    // Extract selector (first 4 bytes / 8 hex chars after 0x)
    const cleanData = callData.startsWith('0x') ? callData.slice(2) : callData;
    const selector = '0x' + cleanData.slice(0, 8);

    if (!abi) {
      return { selector };
    }

    // Find matching message in ABI
    const messages = abi.spec?.messages || [];
    const message = messages.find((m: any) => m.selector === selector);

    if (!message) {
      return { selector };
    }

    // For full decoding, would need proper ABI decoder
    // For now, return method name if found
    return {
      selector,
      method: message.label,
      args: message.args?.map((arg: any) => arg.label), // Just return arg names for now
    };
  } catch (error) {
    console.error('Failed to decode contract call:', error);
    return null;
  }
}

/**
 * Format gas limit for display
 */
export function formatGasLimit(gasLimit?: { refTime: string; proofSize: string }): string {
  if (!gasLimit) return 'N/A';

  const refTime = BigInt(gasLimit.refTime);
  const proofSize = BigInt(gasLimit.proofSize);

  // Format with units
  const refTimeStr = refTime > 1_000_000_000n
    ? `${(Number(refTime) / 1_000_000_000).toFixed(2)}B`
    : refTime.toString();

  const proofSizeStr = proofSize > 1_000n
    ? `${(Number(proofSize) / 1_000).toFixed(2)}KB`
    : `${proofSize}B`;

  return `${refTimeStr} refTime, ${proofSizeStr} proof`;
}

/**
 * Estimate storage deposit in GLIN
 */
export function estimateStorageDepositGLIN(storageDepositLimit: string | null): string {
  if (!storageDepositLimit || storageDepositLimit === 'null') {
    return 'Unlimited';
  }

  try {
    const planck = BigInt(storageDepositLimit);
    const glin = Number(planck) / 1e18;
    return `${glin.toFixed(4)} tGLIN`;
  } catch {
    return 'N/A';
  }
}

/**
 * Get contract transaction warning level
 */
export function getContractWarningLevel(tx: ContractTransaction): 'low' | 'medium' | 'high' {
  // High risk: Contract deployment or unlimited storage
  if (tx.type === 'CONTRACT_DEPLOY') {
    return 'high';
  }

  if (tx.storageDepositLimit === null || tx.storageDepositLimit === 'null') {
    return 'high';
  }

  // Medium risk: Contract call with value transfer
  if (tx.type === 'CONTRACT_CALL' && tx.value && BigInt(tx.value) > 0n) {
    return 'medium';
  }

  // Low risk: Read-only or minimal value
  return 'low';
}

/**
 * Get warning message for contract transaction
 */
export function getContractWarningMessage(tx: ContractTransaction): string {
  switch (tx.type) {
    case 'CONTRACT_DEPLOY':
      return '⚠️ You are deploying a new smart contract. This will consume storage deposit and cannot be undone. Verify the contract code and constructor arguments.';

    case 'CONTRACT_CALL':
      if (tx.value && BigInt(tx.value) > 0n) {
        return '⚠️ You are calling a contract and sending tGLIN. Ensure you trust this contract and verify the method being called.';
      }
      return 'ℹ️ You are calling a smart contract method. Verify the contract address and method parameters.';

    case 'CONTRACT_UPLOAD_CODE':
      return 'ℹ️ You are uploading contract code to the blockchain. This code can be instantiated later.';

    default:
      return '⚠️ You are about to send tGLIN. Verify the recipient address.';
  }
}
