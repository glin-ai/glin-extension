# GLIN Wallet Extension

Official browser wallet for the [GLIN AI Training Network](https://glin.ai).

## Features

- 🔐 Secure key management with encrypted storage
- 💰 Send and receive tGLIN tokens
- 🌐 Connect to GLIN dapps with window.glin provider
- 🤖 Provider dashboard for AI training participants
- 🏆 Testnet points tracking
- 📊 Real-time task notifications

## Installation

### From Chrome Web Store (Coming Soon)
1. Visit [Chrome Web Store link]
2. Click "Add to Chrome"
3. Create or import your wallet

### From Source (Developers)
```bash
# Clone the repository
git clone https://github.com/glin-ai/glin-extension.git
cd glin-extension

# Install dependencies
pnpm install

# Build the extension
pnpm build

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the "apps/extension/dist" folder
```

## Development

```bash
# Install dependencies
pnpm install

# Start development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate test coverage
pnpm test:coverage

# Package for store submission
pnpm package
```

## Architecture

This is a monorepo using pnpm workspaces:

```
glin-extension/
├── packages/
│   ├── extension-base/      # Core wallet logic
│   ├── extension-ui/        # React UI components
│   ├── extension-inject/    # Content script provider
│   └── shared/              # Shared utilities
└── apps/
    └── extension/           # Browser extension build
```

## Security

- **Private keys never leave your device**
- **Encrypted with password using TweetNaCl**
- **No telemetry or tracking**
- **Open source and auditable**

### Reporting Security Issues

Please report security vulnerabilities to security@glin.ai

## For Dapp Developers

### window.glin Provider API

```typescript
// Request connection
const accounts = await window.glin.enable()

// Sign message
const signature = await window.glin.signMessage("Hello GLIN!")

// Authenticate with backend
const auth = await window.glin.authenticateWithBackend()

// Listen to events
window.glin.on('accountsChanged', (accounts) => {
  console.log('Accounts changed:', accounts)
})
```

See [Developer Documentation](./docs/DEVELOPER.md) for full API reference.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

Apache 2.0 - see [LICENSE](./LICENSE) for details.

## Links

- **Website**: https://glin.ai
- **Documentation**: https://docs.glin.ai
- **Discord**: https://discord.gg/glin-ai
- **Twitter**: https://twitter.com/glin_ai
- **GitHub**: https://github.com/glin-ai

## Disclaimer

This is testnet software. tGLIN tokens have no monetary value. Always verify transactions before signing.
