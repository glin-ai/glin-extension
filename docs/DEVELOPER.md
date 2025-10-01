# Developer Documentation

## window.glin Provider API

The GLIN Wallet extension injects a `window.glin` provider that dapps can use to interact with the wallet.

### Detection

```typescript
// Check if GLIN Wallet is installed
if (window.glin) {
  console.log('GLIN Wallet detected!', window.glin.version);
}

// Or listen for initialization
window.addEventListener('glin#initialized', (event) => {
  console.log('GLIN Wallet initialized', event.detail.version);
});
```

### Connection

```typescript
// Request connection
try {
  const accounts = await window.glin.enable();
  console.log('Connected accounts:', accounts);
} catch (error) {
  console.error('User rejected connection');
}

// Get accounts (returns empty array if not connected)
const accounts = await window.glin.getAccounts();

// Check connection status
const isConnected = window.glin.isConnected();
```

### Signing

```typescript
// Sign a message
const result = await window.glin.signMessage('Hello GLIN!');
console.log('Signature:', result.signature);
console.log('Public Key:', result.publicKey);

// Sign raw data
const rawResult = await window.glin.signRaw('0x1234...');
```

### Backend Authentication

```typescript
// Authenticate with GLIN backend
// This performs the full nonce + signature flow
const auth = await window.glin.authenticateWithBackend();

console.log('Access Token:', auth.accessToken);
console.log('Refresh Token:', auth.refreshToken);
console.log('User:', auth.user);

// Use the access token for API calls
fetch('https://api.glin.ai/v1/tasks', {
  headers: {
    'Authorization': `Bearer ${auth.accessToken}`
  }
});
```

### Provider Features (GLIN-Specific)

```typescript
// Get provider status
const status = await window.glin.provider.getStatus();
console.log('Status:', status.status); // 'active' | 'idle' | 'offline'
console.log('Active Tasks:', status.tasks.active);
console.log('Total Earnings:', status.earnings.total);

// Get available tasks
const tasks = await window.glin.provider.getTasks();
tasks.forEach(task => {
  console.log(`Task: ${task.title} - ${task.reward} tGLIN`);
});

// Accept a task
await window.glin.provider.acceptTask(taskId);
```

### Events

```typescript
// Listen for account changes
window.glin.on('accountsChanged', (accounts) => {
  console.log('Accounts changed:', accounts);
  // Update UI with new accounts
});

// Listen for chain changes
window.glin.on('chainChanged', (chainId) => {
  console.log('Chain changed:', chainId);
  // Reload page or update UI
});

// Listen for disconnection
window.glin.on('disconnect', () => {
  console.log('Wallet disconnected');
  // Show connect button
});

// Remove listener
const handler = (accounts) => console.log(accounts);
window.glin.on('accountsChanged', handler);
window.glin.removeListener('accountsChanged', handler);
```

## TypeScript Support

```typescript
// Add to your tsconfig.json
{
  "compilerOptions": {
    "types": ["@glin-extension/extension-inject"]
  }
}

// Use in your code
import type { GlinProvider } from '@glin-extension/extension-inject';

declare global {
  interface Window {
    glin?: GlinProvider;
  }
}

// Now TypeScript knows about window.glin
const provider: GlinProvider | undefined = window.glin;
```

## Example: Complete Integration

```typescript
import { useEffect, useState } from 'react';

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    if (!window.glin) {
      alert('Please install GLIN Wallet');
      return;
    }

    // Listen for account changes
    window.glin.on('accountsChanged', handleAccountsChanged);
    window.glin.on('disconnect', handleDisconnect);

    // Check if already connected
    window.glin.getAccounts().then(accounts => {
      if (accounts.length > 0) {
        setAccount(accounts[0].address);
      }
    });

    return () => {
      window.glin?.removeListener('accountsChanged', handleAccountsChanged);
      window.glin?.removeListener('disconnect', handleDisconnect);
    };
  }, []);

  const handleAccountsChanged = (accounts: any[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0].address);
    } else {
      setAccount(null);
    }
  };

  const handleDisconnect = () => {
    setAccount(null);
    setBalance('0');
  };

  const connect = async () => {
    try {
      const accounts = await window.glin!.enable();
      setAccount(accounts[0].address);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const authenticateBackend = async () => {
    try {
      const auth = await window.glin!.authenticateWithBackend();
      console.log('Authenticated!', auth.user);
      // Store tokens and use for API calls
      localStorage.setItem('accessToken', auth.accessToken);
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  return (
    <div>
      <h1>GLIN Dapp</h1>
      {account ? (
        <>
          <p>Connected: {account}</p>
          <p>Balance: {balance} tGLIN</p>
          <button onClick={authenticateBackend}>
            Authenticate with Backend
          </button>
        </>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

## Security Best Practices

### For Dapp Developers

1. **Always validate user signatures** - Don't trust client-side data
2. **Use HTTPS** - Protect user data in transit
3. **Request minimal permissions** - Only ask for what you need
4. **Handle disconnections gracefully** - Users can disconnect at any time
5. **Clear error messages** - Help users understand what went wrong

### For Extension Integration

1. **Check for provider** - Always verify `window.glin` exists
2. **Handle rejections** - Users may reject connection/signing requests
3. **Timeout requests** - Don't wait forever for user response
4. **Store tokens securely** - Use appropriate storage mechanisms
5. **Refresh tokens** - Handle token expiration gracefully

## Common Issues

### Provider not detected

```typescript
// Wait for provider to be injected
const waitForGlin = () => new Promise((resolve) => {
  if (window.glin) {
    resolve(window.glin);
  } else {
    window.addEventListener('glin#initialized', () => {
      resolve(window.glin);
    }, { once: true });
  }
});

await waitForGlin();
```

### User rejected request

```typescript
try {
  await window.glin.enable();
} catch (error) {
  if (error.message.includes('rejected')) {
    alert('Please approve the connection request');
  }
}
```

## Support

- GitHub Issues: https://github.com/glin-ai/glin-extension/issues
- Discord: https://discord.gg/glin-ai
- Docs: https://docs.glin.ai
