# Contributing to GLIN Wallet Extension

Thank you for your interest in contributing to GLIN Wallet! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/glin-ai/glin-extension.git
cd glin-extension

# Install dependencies
pnpm install

# Start development mode
pnpm dev

# Build for production
pnpm build
```

### Load Extension in Chrome

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `apps/extension/dist` folder

## Project Structure

```
glin-extension/
├── packages/
│   ├── extension-base/      # Core wallet logic
│   ├── extension-ui/        # React UI components
│   ├── extension-inject/    # window.glin provider
│   └── shared/              # Shared utilities
└── apps/
    └── extension/           # Browser extension build
```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run `pnpm lint` before committing
- Run `pnpm format` to auto-format code

### Commits

- Use conventional commits format:
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation changes
  - `refactor:` code refactoring
  - `test:` adding tests
  - `chore:` maintenance tasks

Example:
```
feat: add hardware wallet support
fix: resolve balance display issue
docs: update API documentation
```

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Commit your changes
6. Push to your fork
7. Open a Pull Request

### PR Guidelines

- Keep PRs focused and small
- Include a clear description
- Link related issues
- Add screenshots for UI changes
- Ensure tests pass
- Update documentation if needed

## Security

- Never commit private keys or sensitive data
- Report security vulnerabilities to security@glin.ai
- Do not open public issues for security bugs

## Testing

```bash
# Run tests
pnpm test

# Run specific package tests
pnpm --filter extension-base test
```

## Building

```bash
# Build all packages
pnpm build:all

# Build specific package
pnpm --filter extension build
```

## Questions?

- Discord: https://discord.gg/glin-ai
- GitHub Discussions: https://github.com/glin-ai/glin-extension/discussions

## License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.
