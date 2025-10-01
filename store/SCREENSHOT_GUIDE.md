# Screenshot & Asset Guide for Store Submission

## Chrome Web Store Requirements

### Screenshots (Required: 1-5 screenshots)
- **Size**: 1280x800 or 640x400 pixels
- **Format**: PNG or JPEG
- **Max file size**: 1MB each
- **Recommended**: 5 screenshots showing key features

### Small Promo Tile (Optional but Recommended)
- **Size**: 440x280 pixels
- **Format**: PNG or JPEG
- **Purpose**: Featured in Chrome Web Store

### Large Promo Tile (Optional)
- **Size**: 920x680 pixels
- **Format**: PNG or JPEG
- **Purpose**: Enhanced store listing

### Marquee Promo Tile (Optional)
- **Size**: 1400x560 pixels
- **Format**: PNG or JPEG
- **Purpose**: Store homepage features

### Extension Icon (Already in manifest)
- **Sizes**: 16x16, 32x32, 48x48, 128x128 pixels
- **Format**: PNG with transparency
- **Location**: `apps/extension/public/icons/`

## Firefox Add-ons Requirements

### Screenshots (Required: At least 1)
- **Max dimensions**: 5000x5000 pixels
- **Format**: PNG or JPEG
- **Recommended**: 3-5 screenshots

### Extension Icon (Required)
- **Sizes**: 48x48, 96x96 pixels (for hi-DPI displays)
- **Format**: PNG or SVG
- **Same files can be reused from Chrome**

## Screenshot Content Plan

### Screenshot 1: Welcome & Onboarding
**Title**: "Welcome to GLIN Wallet"
- Show the Welcome screen
- Highlight "Create Wallet" and "Import Wallet" buttons
- Clean, inviting first impression
- Caption: "Get started with GLIN Wallet in seconds"

### Screenshot 2: Dashboard
**Title**: "Manage Your GLIN Tokens"
- Display wallet dashboard with balance
- Show Send/Receive buttons
- Include mock activity history
- Provider Dashboard button visible
- Caption: "View balance, send, receive, and track transactions"

### Screenshot 3: Send Transaction
**Title**: "Send GLIN Tokens Easily"
- Show the Send transaction screen
- Include recipient address, amount fields
- Display fee estimation
- Caption: "Fast and secure transactions with clear fee estimates"

### Screenshot 4: Dapp Integration
**Title**: "Connect to Decentralized Apps"
- Show connection request popup
- Display dapp information
- Highlight permission controls
- Caption: "Safe dapp integration with full control"

### Screenshot 5: Provider Features
**Title**: "Earn as an AI Training Provider"
- Show Provider Dashboard
- Display earnings, tasks, and points
- Highlight the ecosystem
- Caption: "Participate in AI training and earn rewards"

## How to Capture Screenshots

### Using Chrome DevTools
1. Open extension popup
2. Right-click → Inspect
3. Set device toolbar to responsive
4. Set width to 400px, height to 600px
5. Press F12 → Three dots → Capture screenshot

### Manual Capture
1. Open extension
2. Use OS screenshot tool:
   - **Windows**: Win + Shift + S
   - **Mac**: Cmd + Shift + 4
   - **Linux**: Use Screenshot/GNOME Screenshot
3. Crop to exact size in image editor

### Recommended Tools
- **Figma**: Design polished screenshots with annotations
- **Photoshop/GIMP**: Professional editing
- **Canva**: Quick designs with templates
- **Shotsnapp**: Add device frames

## Screenshot Enhancement Tips

### Best Practices
✅ Use clean, representative data
✅ Highlight key features with arrows/annotations
✅ Use consistent styling across all screenshots
✅ Show real use cases
✅ Include GLIN branding colors (#6366f1)

❌ Don't use lorem ipsum or placeholder text
❌ Avoid cluttered interfaces
❌ No personal/sensitive information
❌ No copyrighted content

### Adding Annotations
1. **Use Figma/Canva** to add:
   - Highlight boxes
   - Arrow indicators
   - Feature callouts
   - Descriptive text

2. **Colors to use**:
   - Primary: #6366f1 (GLIN purple)
   - Accent: #8b5cf6
   - Success: #10b981
   - Background: #0f172a

### Mock Data Guidelines
- **Wallet Name**: "My GLIN Wallet" or "Main Account"
- **Balance**: "1,234.56 tGLIN" (testnet) or "1,234.56 GLIN" (mainnet)
- **Address**: `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY` (example Substrate address)
- **Transaction amounts**: Realistic values (10, 50, 100, 250 tGLIN)

## Promotional Images

### Small Promo Tile (440x280)
```
┌─────────────────────────────┐
│    [GLIN Logo]              │
│                             │
│    GLIN Wallet              │
│    Secure. Open. Simple.    │
│                             │
│    [Download Now Button]    │
└─────────────────────────────┘
```

### Large Promo Tile (920x680)
```
┌───────────────────────────────────────┐
│  [Screenshot]      [GLIN Logo]        │
│   Dashboard         GLIN Wallet       │
│   with Balance                        │
│                    Official wallet    │
│  [Screenshot]      for the GLIN       │
│   Provider          AI Training       │
│   Features          Network           │
│                                       │
│          [Key Features List]          │
│   🔐 Secure  💰 Easy  🎯 Rewarding   │
└───────────────────────────────────────┘
```

## Asset Checklist

### Before Submission
- [ ] 5 screenshots captured (1280x800)
- [ ] Screenshots annotated and polished
- [ ] Small promo tile created (440x280)
- [ ] Large promo tile created (920x680) - optional
- [ ] All icons verified (16, 32, 48, 128px)
- [ ] Firefox screenshots prepared
- [ ] All assets under size limits
- [ ] Brand consistency checked
- [ ] No sensitive data in screenshots
- [ ] Clean mock data used

### File Naming Convention
```
chrome-screenshot-1-welcome.png
chrome-screenshot-2-dashboard.png
chrome-screenshot-3-send.png
chrome-screenshot-4-dapp.png
chrome-screenshot-5-provider.png
chrome-promo-small.png
chrome-promo-large.png
firefox-screenshot-1.png
firefox-screenshot-2.png
firefox-screenshot-3.png
```

## Video/GIF (Optional)

### Chrome Web Store
- Short video (max 30 seconds) showing key features
- Upload to YouTube and link in listing
- Not required but helpful

### Firefox
- Can include a short GIF in description
- Max 5MB, animated PNG or GIF format

## Store Listing Content

### Category
- **Primary**: Productivity
- **Secondary**: Shopping (for token transactions)

### Tags/Keywords
```
wallet, cryptocurrency, blockchain, GLIN, AI training,
decentralized, Web3, dapp, testnet, tokens, secure wallet,
browser wallet, extension wallet, crypto wallet
```

### Language
- **Primary**: English
- **Future**: Spanish, French, German, Chinese, Japanese

## Quality Checklist

Before finalizing assets:
- [ ] All screenshots show current version UI
- [ ] No broken layouts or visual bugs
- [ ] Consistent branding across all assets
- [ ] High resolution and crisp quality
- [ ] Proper file formats (PNG for screenshots)
- [ ] File sizes optimized (< 1MB each)
- [ ] Screenshots tell a coherent story
- [ ] Captions are clear and compelling
- [ ] Privacy-friendly (no real addresses/data)

## Storage Location

Save all final assets in:
```
/store/assets/
├── chrome/
│   ├── screenshots/
│   │   ├── 1-welcome.png
│   │   ├── 2-dashboard.png
│   │   ├── 3-send.png
│   │   ├── 4-dapp.png
│   │   └── 5-provider.png
│   ├── promo-small.png
│   └── promo-large.png
└── firefox/
    ├── screenshots/
    │   ├── 1-welcome.png
    │   ├── 2-dashboard.png
    │   └── 3-provider.png
    └── icon-96.png
```

## Next Steps

1. Build extension: `pnpm build`
2. Load extension locally
3. Capture screenshots following guide
4. Edit and annotate in Figma/Photoshop
5. Create promo tiles
6. Review for quality
7. Upload to stores

---

**Need Help?**
- Figma templates: community.figma.com
- Icon generators: realfavicongenerator.net
- Mockup tools: smartmockups.com
