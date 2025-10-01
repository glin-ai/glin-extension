# Firefox Add-ons Submission Guide - GLIN Wallet

## Manifest V3 Compatibility

GLIN Wallet is built with Chrome Manifest V3, which is also supported by Firefox (v109+).

### Compatibility Notes
- ✅ Service workers supported
- ✅ chrome.* APIs supported (Firefox provides compatibility)
- ✅ Content scripts supported
- ✅ Storage APIs supported
- ⚠️ Some APIs may need polyfills

## Pre-Submission Checklist

### Technical Requirements
- [ ] Firefox 109+ compatibility tested
- [ ] All chrome.* APIs work or have polyfills
- [ ] Extension tested in Firefox Developer Edition
- [ ] No Firefox-specific errors in console
- [ ] manifest.json passes AMO validator

### Account Setup
- [ ] Create Mozilla Add-on Developer account
- [ ] Verify email address
- [ ] Set up two-factor authentication (recommended)
- [ ] Read Mozilla Add-on Policies

## Firefox-Specific manifest.json

### Required Changes
```json
{
  "manifest_version": 3,
  "name": "GLIN Wallet",
  "version": "0.1.0",
  "description": "Official wallet for the GLIN AI Training Network",

  // Firefox-specific (optional but recommended)
  "browser_specific_settings": {
    "gecko": {
      "id": "glin-wallet@glin.ai",
      "strict_min_version": "109.0"
    }
  },

  "background": {
    "service_worker": "background.js",
    "type": "module"
  },

  // Firefox may need "browser_style": false
  "action": {
    "default_popup": "popup.html",
    "browser_style": false
  }
}
```

### Build for Firefox
```bash
# Build extension
pnpm build

# Copy and modify manifest for Firefox
cp apps/extension/dist/manifest.json apps/extension/dist/manifest-firefox.json

# Add Firefox-specific fields to manifest-firefox.json
# (Can be automated in build script)
```

## Submission Process

### Step 1: Prepare Package
```bash
# Build extension
pnpm build

# Create Firefox-specific zip
cd apps/extension/dist
zip -r ../../../glin-wallet-firefox-v0.1.0.zip . -x "*.DS_Store" "*.git*"
```

### Step 2: Submit to AMO

1. **Go to**: https://addons.mozilla.org/developers/
2. **Click**: "Submit a New Add-on"
3. **Choose**: "On this site" (listed on AMO)
4. **Upload**: `glin-wallet-firefox-v0.1.0.zip`
5. **Select**: Distribution platform

### Step 3: Add-on Details

#### Basic Information
- **Name**: GLIN Wallet
- **Add-on URL**: `glin-wallet` (slug)
- **Summary**: Official wallet for the GLIN AI Training Network. Secure, open-source, and built for decentralized AI.
- **Categories**:
  - Primary: Other
  - Secondary: Shopping & Productivity

#### Description (Detailed)
```
[Use same description as Chrome Web Store, adapted for Firefox users]

GLIN Wallet is the official browser extension wallet for the GLIN AI Training Network...

[Include all key features, security info, etc.]
```

#### Support Information
- **Support Email**: support@glin.ai
- **Support Website**: https://glin.ai/support
- **Privacy Policy**: https://glin.ai/privacy (or link to GitHub)

#### Version Notes
```
Version 0.1.0 (Initial Release)

✨ New Features:
- Create and import GLIN wallets
- Send and receive GLIN tokens
- Multiple account management
- Dapp integration with Web3 compatibility
- Provider dashboard for AI training tasks
- Testnet points and earnings tracking
- Network switching (testnet/mainnet)
- Dark/light theme support

🔐 Security:
- AES-256-GCM encryption
- Non-custodial design
- No data collection
- Open source (Apache 2.0)

📝 Note: This is a testnet release. Use with testnet tokens only.
```

### Step 4: Technical Details

#### Manifest Version
- **Select**: Manifest V3

#### Firefox Versions
- **Minimum**: 109.0
- **Maximum**: * (no maximum)

#### Platforms
- [x] Windows
- [x] macOS
- [x] Linux
- [x] Android (if mobile support added)

#### Categories and Tags
```
Categories:
- Other (primary)
- Productivity
- Shopping

Tags:
wallet, cryptocurrency, blockchain, glin, ai, training,
web3, dapp, decentralized, tokens, substrate, polkadot
```

### Step 5: Media

#### Screenshots (3-5 recommended)
- Upload same screenshots as Chrome
- **Format**: PNG or JPEG
- **Max size**: No strict limit, but keep reasonable (< 2MB each)
- **Captions**: Add descriptive captions for each

#### Icon
- **Size**: 64x64 or 128x128 pixels
- **Format**: PNG with transparency
- **Source**: Use existing icon from `public/icons/icon-128.png`

### Step 6: License and Privacy

#### License
- **Select**: "Apache License 2.0"
- **Source Code**: https://github.com/glin-ai/glin-extension
- **License Text**: Link to LICENSE file in repo

#### Privacy Policy
- **URL**: Link to PRIVACY_POLICY.md
- **Hosted at**: https://glin.ai/privacy or GitHub

#### Data Collection
- [x] This add-on does not collect any data

### Step 7: Review Information

#### Testing Instructions
```
Testing GLIN Wallet:

1. INSTALLATION:
   - Install extension in Firefox
   - Click extension icon in toolbar

2. CREATE WALLET:
   - Click "Create New Wallet"
   - Enter name: "Test Wallet"
   - Enter password: "TestPass123" (meets requirements)
   - Confirm password
   - Save 12-word recovery phrase (shown on next screen)
   - Click "I have saved my recovery phrase"

3. DASHBOARD:
   - Verify wallet name and address displayed
   - Check balance shows "0 tGLIN"
   - Note: Balance requires testnet connection

4. SEND/RECEIVE:
   - Click "Send" - form appears
   - Click "Receive" - address and QR displayed

5. SETTINGS:
   - Click gear icon → Settings
   - Test network switcher (testnet/mainnet)
   - Test theme switcher (dark/light)
   - Test backup wallet (requires password)

6. PROVIDER FEATURES:
   - From dashboard, click "Provider Dashboard"
   - View earnings, tasks, and points
   - Mock data displayed (no backend connection needed for review)

Notes for Reviewers:
- Testnet RPC may be unreachable (mock data will display)
- No external API calls during initial setup
- All wallet data stored locally in IndexedDB
- Open DevTools to verify no errors
- Check: no data sent to external servers during basic usage
```

#### Reviewer Notes
```
Dear Mozilla Reviewers,

GLIN Wallet is a cryptocurrency wallet for the GLIN blockchain (Substrate-based).

Key Points:
1. Fully open source: https://github.com/glin-ai/glin-extension
2. No data collection - everything stored locally
3. Connects to GLIN RPC nodes (glin.ai and railway.app) for blockchain state
4. Uses standard Web3 patterns for dapp integration
5. Built with React, TypeScript, and Polkadot.js

Security:
- AES-256 encryption for seed phrases
- Non-custodial (users control keys)
- No remote code execution
- CSP headers in place

Testing:
- Can be fully tested offline (mock data)
- Real blockchain connection optional
- No registration or account required

Source code matches this build (reproducible build planned).

Thank you for your review!
```

### Step 8: Submission

#### Review Options
- **Select**: "I have read and agree to the Review Policies"
- **Select**: "I have tested this add-on with the latest version of Firefox"
- **Submit**: Click "Submit Version"

## After Submission

### Automated Review
- Add-on is scanned automatically
- Common issues flagged immediately
- Fix and resubmit if needed

### Manual Review
- Firefox reviewers test the add-on
- Timeline: 1-10 business days typically
- May request changes or clarifications

### Possible Issues and Fixes

#### Issue: "Uses eval() or similar"
- **Fix**: Ensure no eval, Function(), or dangerous code
- Check dependencies for violations

#### Issue: "Minified code without source maps"
- **Fix**: Include source maps in build
- Or provide unminified version for review

#### Issue: "Requests broad permissions"
- **Fix**: Justify all permissions in reviewer notes
- Use minimal permissions

#### Issue: "External scripts loaded"
- **Fix**: Bundle all scripts, no CDN loading
- Polkadot.js should be bundled

## Distribution Options

### Listed on AMO (Recommended)
- **Visibility**: Public, searchable on addons.mozilla.org
- **Updates**: Automatic for users
- **Trust**: Official Mozilla distribution

### Self-Distributed
- **Control**: Full control over distribution
- **Updates**: Manual user updates
- **Use Case**: Enterprise or beta testing

### Unlisted
- **Visibility**: Not searchable, direct link only
- **Updates**: Automatic for users with link
- **Use Case**: Soft launch, limited audience

## Post-Approval

### Monitor Reviews
- Respond to user reviews
- Address issues and bugs
- Update regularly

### Push Updates
1. Build new version
2. Update manifest version
3. Submit update to AMO
4. Provide changelog

### Analytics (Optional)
- Firefox does not provide built-in analytics
- Can use own analytics (with user consent)
- GLIN Wallet: No analytics for privacy

## Firefox-Specific Testing

### Test Environments
- [ ] Firefox Stable (latest)
- [ ] Firefox ESR (Extended Support Release)
- [ ] Firefox Developer Edition
- [ ] Firefox Nightly

### Test Platforms
- [ ] Windows 10/11
- [ ] macOS (Intel & Apple Silicon)
- [ ] Linux (Ubuntu, Fedora)

### Test Features
- [ ] Background service worker
- [ ] Popup UI
- [ ] Content scripts injection
- [ ] Storage (IndexedDB, chrome.storage)
- [ ] Network requests (WebSocket)
- [ ] Notifications

## Differences from Chrome

### API Compatibility
- `chrome.*` → Firefox provides compatibility layer
- Some APIs may have slight differences
- Test thoroughly in Firefox

### Manifest Differences
```json
// Chrome
"background": {
  "service_worker": "background.js"
}

// Firefox (same, but may need additional fields)
"background": {
  "service_worker": "background.js",
  "type": "module"  // Firefox may require this
}
```

### Build Differences
```bash
# Chrome build
pnpm build

# Firefox build (if needed)
pnpm build:firefox  # Create this script if significant differences
```

## Support Resources

### Mozilla Resources
- **Developer Hub**: https://extensionworkshop.com/
- **Manifest V3**: https://blog.mozilla.org/addons/2022/06/08/manifest-v3-firefox/
- **API Docs**: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions

### GLIN Resources
- **GitHub**: https://github.com/glin-ai/glin-extension
- **Docs**: https://docs.glin.ai
- **Support**: support@glin.ai

---

**Ready to Submit?**

1. ✅ Build extension: `pnpm build`
2. ✅ Test in Firefox
3. ✅ Create zip package
4. ✅ Prepare screenshots
5. ✅ Write submission details
6. ✅ Submit to AMO
7. ✅ Monitor review status

Good luck! 🦊
