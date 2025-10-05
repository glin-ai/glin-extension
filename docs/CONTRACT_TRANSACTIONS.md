# Contract Transaction Support

The GLIN Extension now supports signing smart contract transactions with proper detection, decoding, and display.

## Features

### 1. **Automatic Detection**
The extension automatically detects contract-related transactions:
- Contract calls (`contracts.call`)
- Contract deployment (`contracts.instantiate`, `contracts.instantiateWithCode`)
- Code upload (`contracts.uploadCode`)

### 2. **Detailed Transaction Display**
When signing a contract transaction, users see:
- Transaction type (Call/Deploy/Upload)
- Contract address (for calls)
- Value being sent
- Gas limit (refTime and proofSize)
- Storage deposit limit
- Call data/selector
- Warning level (low/medium/high risk)

### 3. **Risk-Based Warnings**
- **High Risk**: Contract deployment, unlimited storage deposit
- **Medium Risk**: Contract calls with value transfer
- **Low Risk**: Read-only calls or minimal value

## For dApp Developers

### Detecting Transaction Types

```typescript
import { detectTransactionType } from '@glin-extension/extension-ui/utils/contractDetection';

// Check if transaction is contract-related
const txInfo = detectTransactionType(extrinsic);

if (txInfo.type === 'CONTRACT_CALL') {
  console.log('Contract address:', txInfo.contractAddress);
  console.log('Call data:', txInfo.data);
}
```

### Decoding Contract Calls

```typescript
import { decodeContractCall } from '@glin-extension/extension-ui/utils/contractDetection';

// Decode with ABI
const decoded = decodeContractCall(callData, contractAbi);
console.log('Method:', decoded?.method);
console.log('Selector:', decoded?.selector);
```

### Using the SignContractTransaction Component

```tsx
import { SignContractTransaction } from '@glin-extension/extension-ui';
import { detectTransactionType } from '@glin-extension/extension-ui/utils/contractDetection';

function MyApp() {
  const contractTx = detectTransactionType(extrinsic);

  if (contractTx.type !== 'REGULAR') {
    return (
      <SignContractTransaction
        origin={origin}
        appName={appName}
        contractTx={contractTx}
        account={account}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    );
  }

  // Fall back to regular transaction signing
  return <SignTransaction ... />;
}
```

## Transaction Flow

### 1. Contract Call
```
dApp → Extension: contracts.call(dest, value, gas, storage, data)
       ↓
Extension: Detect contract call
       ↓
Extension: Display contract address, method, gas
       ↓
User: Approve with password
       ↓
Extension: Sign and broadcast
```

### 2. Contract Deployment
```
dApp → Extension: contracts.instantiate(value, gas, storage, codeHash, data, salt)
       ↓
Extension: Detect deployment
       ↓
Extension: Warn about storage deposit
       ↓
User: Approve with password
       ↓
Extension: Sign and broadcast
```

## Utility Functions

### `detectTransactionType(extrinsic)`
Returns transaction type and parsed arguments.

**Returns:**
```typescript
{
  type: 'CONTRACT_CALL' | 'CONTRACT_DEPLOY' | 'CONTRACT_UPLOAD_CODE' | 'REGULAR',
  section: string,
  method: string,
  args: any[],
  // Contract-specific fields
  contractAddress?: string,
  value?: string,
  gasLimit?: { refTime: string, proofSize: string },
  storageDepositLimit?: string | null,
  data?: string,
  codeHash?: string,
  salt?: string
}
```

### `formatGasLimit(gasLimit)`
Formats gas limit for human-readable display.

**Example:**
```typescript
formatGasLimit({ refTime: '3000000000000', proofSize: '500000' })
// Returns: "3.00B refTime, 500.00KB proof"
```

### `estimateStorageDepositGLIN(limit)`
Converts storage deposit from planck to GLIN.

**Example:**
```typescript
estimateStorageDepositGLIN('1000000000000000000')
// Returns: "1.0000 tGLIN"

estimateStorageDepositGLIN(null)
// Returns: "Unlimited"
```

### `getContractWarningLevel(tx)`
Determines risk level based on transaction type.

**Returns:** `'low' | 'medium' | 'high'`

### `getContractWarningMessage(tx)`
Returns appropriate warning message for transaction type.

## Integration Example

### Complete Flow
```typescript
// In your dApp
import { web3FromAddress } from '@polkadot/extension-dapp';
import { Contract } from '@glin-ai/sdk';

async function callContract() {
  // Create contract instance
  const contract = new Contract(api, contractAddress, abi, signer);

  // Call contract method - extension will detect this
  const result = await contract.tx.transfer(recipient, amount);

  // Extension flow:
  // 1. Detects contracts.call extrinsic
  // 2. Shows SignContractTransaction UI
  // 3. Displays contract address, gas, value
  // 4. User approves
  // 5. Transaction signed and sent

  console.log('Transaction hash:', result.txHash);
}
```

## Testing

To test contract transaction signing:

1. Deploy a test contract using the explorer
2. Use the contract interaction UI to call a method
3. The extension will show the SignContractTransaction UI
4. Verify all details are displayed correctly
5. Approve and check transaction success

## Supported Transaction Types

| Type | Section | Method | Detection | Display |
|------|---------|--------|-----------|---------|
| Contract Call | `contracts` | `call` | ✅ | ✅ |
| Contract Deploy | `contracts` | `instantiate` | ✅ | ✅ |
| Contract Deploy (with code) | `contracts` | `instantiateWithCode` | ✅ | ✅ |
| Upload Code | `contracts` | `uploadCode` | ✅ | ✅ |
| Regular Transfer | `balances` | `transfer` | ✅ | ✅ |

## Future Enhancements

- [ ] Full ABI-based call data decoding
- [ ] Contract ABI caching
- [ ] Gas estimation from extension
- [ ] Contract event parsing
- [ ] Multi-contract call detection
