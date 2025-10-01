# Privacy Policy - GLIN Wallet Browser Extension

**Last Updated: October 1, 2024**
**Version: 1.0**

## Introduction

GLIN Wallet ("we," "our," or "the extension") is committed to protecting your privacy. This Privacy Policy explains how GLIN Wallet handles information when you use our browser extension.

## Our Privacy Commitment

**GLIN Wallet does NOT collect, store, transmit, or share any personal data.**

We believe in user privacy and have designed GLIN Wallet to be completely private. All your wallet data stays on your device, and we have no access to it.

## Data We Do NOT Collect

- ❌ Personal information (name, email, phone, address)
- ❌ Wallet addresses
- ❌ Private keys or seed phrases
- ❌ Transaction history
- ❌ Browsing history
- ❌ IP addresses
- ❌ Device information
- ❌ Usage analytics
- ❌ Crash reports
- ❌ Any other personal data

## Data Stored Locally

GLIN Wallet stores the following data **locally on your device only**:

### Encrypted Wallet Data (IndexedDB)
- Encrypted seed phrase (AES-256-GCM encryption)
- Wallet metadata (name, creation date)
- Account information (addresses, names)
- **Storage Location**: Browser's IndexedDB
- **Encryption**: Yes, with your password
- **Transmitted**: Never

### User Preferences (chrome.storage.local)
- Selected theme (dark/light)
- Selected network (testnet/mainnet)
- **Storage Location**: Browser's local storage
- **Encryption**: No (non-sensitive data)
- **Transmitted**: Never

### Connected Dapps (chrome.storage.local)
- List of connected websites
- Connection timestamps
- **Storage Location**: Browser's local storage
- **Encryption**: No (non-sensitive data)
- **Transmitted**: Never

## How Your Data is Protected

### Encryption
- All sensitive data is encrypted using AES-256-GCM
- Encryption keys are derived from your password using PBKDF2 (100,000 iterations)
- Private keys are derived on-demand and never stored

### Isolation
- Each browser profile has its own isolated wallet data
- Incognito/private mode uses separate storage
- Extension cannot access other extensions' data

### Access Control
- Only you have access to your wallet (via password)
- No remote access or backdoors
- No way for us to recover your password or seed phrase

## Third-Party Services

GLIN Wallet connects to the following services:

### GLIN RPC Nodes
- **Purpose**: Blockchain interaction (balance, transactions)
- **Data Sent**: Wallet addresses (public), transaction data
- **Data Received**: Blockchain state, transaction status
- **Hosts**:
  - https://glin.ai/*
  - https://glin-rpc-production.up.railway.app/*

**Note**: RPC connections are necessary for blockchain functionality. Only public blockchain data is transmitted. Private keys never leave your device.

## Browser Permissions

### Required Permissions

1. **storage**
   - **Purpose**: Store encrypted wallet data locally
   - **Scope**: Local device only
   - **Privacy Impact**: None (data never leaves device)

2. **alarms**
   - **Purpose**: Scheduled tasks (auto-lock, notifications)
   - **Scope**: Local extension only
   - **Privacy Impact**: None

3. **notifications**
   - **Purpose**: Transaction confirmations, alerts
   - **Scope**: Local device only
   - **Privacy Impact**: None (displayed locally)

4. **host_permissions** (https://*.glin.ai/*, https://glin-rpc-production.up.railway.app/*)
   - **Purpose**: Connect to GLIN blockchain
   - **Scope**: Specific domains only
   - **Privacy Impact**: Minimal (public blockchain data only)

### Optional Permissions
GLIN Wallet does not request any optional permissions.

## Open Source Transparency

GLIN Wallet is fully open source:
- **Source Code**: https://github.com/glin-ai/glin-extension
- **License**: Apache 2.0
- **Auditability**: Anyone can review the code
- **Reproducible Builds**: Coming soon

We encourage security researchers and the community to audit our code and verify our privacy claims.

## Children's Privacy

GLIN Wallet does not knowingly collect data from anyone, including children under 13. Since we don't collect any data at all, GLIN Wallet can be used by users of all ages, subject to parental guidance for cryptocurrency usage.

## Data Retention

Since GLIN Wallet does not collect any data, there is no data retention policy needed. All data stored locally on your device is retained until you:
- Uninstall the extension
- Clear browser data
- Manually delete wallet data

## Your Rights

Since we don't collect your data, typical GDPR/CCPA rights (access, deletion, portability) are not applicable. However:

- ✅ You have full control over your local wallet data
- ✅ You can export your seed phrase anytime
- ✅ You can delete your wallet anytime
- ✅ You can disconnect from dapps anytime

## Security Practices

- 🔐 AES-256-GCM encryption for sensitive data
- 🔑 PBKDF2 key derivation (100k iterations)
- 🚫 No plaintext storage of private keys
- 🔒 Password-protected access
- 📝 Regular security audits
- 🐛 Responsible vulnerability disclosure

## Changes to This Policy

We may update this Privacy Policy occasionally. Changes will be reflected in:
- Updated "Last Updated" date
- New version number
- Extension update changelog

Continued use after policy changes constitutes acceptance.

## International Users

GLIN Wallet's privacy approach complies with:
- 🇪🇺 **GDPR** (European Union)
- 🇺🇸 **CCPA** (California, USA)
- 🌍 **Other privacy regulations** (global)

Since we don't collect data, compliance is inherent.

## Contact Us

For privacy-related questions:
- **Email**: privacy@glin.ai
- **GitHub**: https://github.com/glin-ai/glin-extension/issues
- **Security**: security@glin.ai (for security concerns)

## Disclaimer

GLIN Wallet is a non-custodial wallet. You are solely responsible for:
- Protecting your password
- Securing your seed phrase
- Managing your private keys
- Your cryptocurrency transactions

We cannot recover your wallet if you lose your password or seed phrase.

## Legal Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- Mozilla Add-on Policies
- Applicable privacy laws and regulations

---

**Summary**: GLIN Wallet is privacy-first. We collect nothing, store everything locally and encrypted, and give you full control over your data.

*For questions or concerns, contact us at privacy@glin.ai*
