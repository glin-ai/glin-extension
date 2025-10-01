# GLIN Wallet Extension - Testing Checklist

## Manual Testing Guide

### Prerequisites
- [ ] Chrome/Brave browser installed
- [ ] Firefox browser installed (for cross-browser testing)
- [ ] Extension built (`pnpm build`)

## Installation Testing

### Chrome/Brave
- [ ] Navigate to `chrome://extensions/`
- [ ] Enable "Developer mode"
- [ ] Click "Load unpacked"
- [ ] Select `apps/extension/dist` folder
- [ ] Verify extension icon appears in toolbar
- [ ] Check no console errors

### Firefox
- [ ] Navigate to `about:debugging#/runtime/this-firefox`
- [ ] Click "Load Temporary Add-on"
- [ ] Select `manifest.json` from `apps/extension/dist`
- [ ] Verify extension icon appears
- [ ] Check no console errors

## Onboarding Flow

### Create New Wallet
- [ ] Click extension icon
- [ ] Click "Create New Wallet"
- [ ] Enter wallet name (test special characters)
- [ ] Enter password (test validation: min 8 chars, uppercase, lowercase, number)
- [ ] Confirm password (test mismatch scenario)
- [ ] Click "Create Wallet"
- [ ] Verify 12-word mnemonic is displayed
- [ ] Copy mnemonic to clipboard
- [ ] Click "I have saved my recovery phrase"
- [ ] Verify navigation to dashboard

### Import Existing Wallet
- [ ] Click "Import Existing Wallet"
- [ ] Enter wallet name
- [ ] Enter valid 12-word mnemonic
- [ ] Enter password
- [ ] Confirm password
- [ ] Click "Import Wallet"
- [ ] Verify successful import
- [ ] Verify navigation to dashboard

### Unlock Wallet
- [ ] Lock wallet from dashboard
- [ ] Reopen extension
- [ ] Verify unlock screen appears
- [ ] Enter incorrect password (test error)
- [ ] Enter correct password
- [ ] Verify unlock successful

## Dashboard Testing

### Balance Display
- [ ] Verify wallet address is displayed
- [ ] Verify balance shows (mock or real testnet)
- [ ] Verify USD value shows
- [ ] Verify account name is displayed

### Send Transaction
- [ ] Click "Send" button
- [ ] Enter valid recipient address
- [ ] Enter amount (test max amount)
- [ ] Verify fee estimation
- [ ] Click "Send"
- [ ] Verify transaction confirmation
- [ ] Check transaction appears in history

### Receive
- [ ] Click "Receive" button
- [ ] Verify address is displayed
- [ ] Test copy to clipboard
- [ ] Verify QR code placeholder

### Account Management
- [ ] Click account selector dropdown
- [ ] Click "Manage Accounts"
- [ ] Create new account
- [ ] Switch between accounts
- [ ] Rename account
- [ ] Export account private key (verify security warning)

## Dapp Integration

### Connection Request
- [ ] Visit test dapp
- [ ] Trigger connection request
- [ ] Verify connection popup appears
- [ ] Check requested permissions
- [ ] Test "Reject" button
- [ ] Test "Connect" button
- [ ] Verify connection successful

### Sign Message
- [ ] Trigger message signing from dapp
- [ ] Verify message content displayed
- [ ] Test "Reject" button
- [ ] Test "Sign" button
- [ ] Verify signature returned

### Sign Transaction
- [ ] Trigger transaction from dapp
- [ ] Verify transaction details
- [ ] Check gas/fee estimation
- [ ] Test "Reject" button
- [ ] Test "Approve" button
- [ ] Verify transaction broadcast

### Connected Sites
- [ ] Navigate to Settings
- [ ] Click "Connected Sites"
- [ ] Verify connected dapps listed
- [ ] Disconnect individual site
- [ ] Disconnect all sites
- [ ] Verify disconnection successful

## Provider Features

### Provider Dashboard
- [ ] Click "Provider Dashboard"
- [ ] Verify status badge (active/idle/offline)
- [ ] Check earnings display
- [ ] Check task statistics
- [ ] Navigate to task list
- [ ] Navigate to testnet points

### Task List
- [ ] View available tasks
- [ ] View active tasks
- [ ] View completed tasks
- [ ] Accept a task
- [ ] Verify task status updates

### Testnet Points
- [ ] Verify total points display
- [ ] Check rank display
- [ ] View recent activity
- [ ] Click "View Leaderboard"

## Settings Testing

### Network Switcher
- [ ] Navigate to Settings
- [ ] Click "Network"
- [ ] Switch to Mainnet
- [ ] Verify warning for testnet users
- [ ] Switch back to Testnet
- [ ] Verify wallet reconnects

### Backup Wallet
- [ ] Navigate to Settings
- [ ] Click "Backup Wallet"
- [ ] Enter password
- [ ] Verify mnemonic displayed
- [ ] Test copy to clipboard
- [ ] Check security warnings
- [ ] Confirm backup saved

### Change Password
- [ ] Navigate to Settings
- [ ] Click "Change Password"
- [ ] Enter current password
- [ ] Enter new password (test validation)
- [ ] Confirm new password
- [ ] Submit
- [ ] Verify password changed
- [ ] Test unlock with new password

### Theme Selector
- [ ] Navigate to Settings
- [ ] Click "Theme"
- [ ] Switch to Light theme
- [ ] Verify UI updates (when implemented)
- [ ] Switch back to Dark theme
- [ ] Verify preference persists

## Security Testing

### Password Security
- [ ] Test password requirements on all forms
- [ ] Verify password masking works
- [ ] Test "forgot password" scenarios
- [ ] Verify auto-lock after timeout (if implemented)

### Data Privacy
- [ ] Verify no sensitive data in console
- [ ] Check no mnemonic logged
- [ ] Verify encrypted storage (inspect IndexedDB)
- [ ] Test incognito/private mode compatibility

### XSS/Injection
- [ ] Test special characters in inputs
- [ ] Test SQL injection patterns (if any DB queries)
- [ ] Test XSS in text fields
- [ ] Test malicious addresses

## Performance Testing

### Load Times
- [ ] Measure extension popup load time
- [ ] Test with slow network
- [ ] Test with many accounts
- [ ] Test with transaction history

### Memory Usage
- [ ] Check extension memory in Task Manager
- [ ] Test for memory leaks (open/close multiple times)
- [ ] Monitor background script resource usage

## Cross-Browser Testing

### Chrome
- [ ] All core functionality works
- [ ] No browser-specific errors
- [ ] Extension permissions work

### Firefox
- [ ] All core functionality works
- [ ] manifest.json compatible
- [ ] Extension permissions work

### Brave
- [ ] All core functionality works
- [ ] Shields compatibility
- [ ] No conflicts with built-in wallet

## Error Handling

### Network Errors
- [ ] Test offline mode
- [ ] Test RPC endpoint down
- [ ] Test slow connection
- [ ] Verify error messages are user-friendly

### Invalid Inputs
- [ ] Test invalid addresses
- [ ] Test invalid amounts
- [ ] Test empty forms
- [ ] Test boundary values

### Edge Cases
- [ ] Test with 0 balance
- [ ] Test with very large balances
- [ ] Test rapid clicking
- [ ] Test simultaneous requests

## Upgrade Testing

### Extension Update
- [ ] Install v0.1.0
- [ ] Create wallet
- [ ] Update to v0.2.0
- [ ] Verify wallet persists
- [ ] Verify no data loss

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Test Enter/Space on buttons
- [ ] Test Escape to close modals
- [ ] Verify focus indicators

### Screen Readers
- [ ] Test with NVDA/JAWS (Windows)
- [ ] Test with VoiceOver (Mac)
- [ ] Verify all labels are read
- [ ] Check ARIA attributes

## Final Checks

### Before Submission
- [ ] All tests passing (`pnpm test`)
- [ ] No console errors
- [ ] No TODOs in production code
- [ ] Version number updated
- [ ] Screenshots captured
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] README updated

### Post-Submission
- [ ] Monitor user feedback
- [ ] Track error reports
- [ ] Check analytics (if implemented)
- [ ] Plan hotfix if needed
