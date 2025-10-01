# Store Submission Checklist - GLIN Wallet

## Pre-Submission Requirements

### Code Quality
- [ ] All TypeScript compilation errors resolved
- [ ] ESLint passes with no errors
- [ ] All tests passing (`pnpm test`)
- [ ] No console.log() statements in production code
- [ ] No TODOs or FIXMEs in critical paths
- [ ] Code reviewed and approved
- [ ] Version number updated in manifest.json
- [ ] Changelog updated

### Build & Package
- [ ] Clean build successful (`pnpm build`)
- [ ] Extension loads in Chrome without errors
- [ ] Extension loads in Firefox without errors
- [ ] No broken UI elements
- [ ] All images/icons loading correctly
- [ ] Bundle size optimized (< 2MB total)
- [ ] Source maps generated (for review)

### Security
- [ ] Security audit completed (see SECURITY.md)
- [ ] No hardcoded secrets or API keys
- [ ] Encryption working correctly
- [ ] Password validation enforced
- [ ] XSS vulnerabilities addressed
- [ ] CSP headers configured
- [ ] Permissions minimal and justified
- [ ] Privacy policy reviewed

### Legal & Documentation
- [ ] LICENSE file present (Apache 2.0)
- [ ] Privacy policy created
- [ ] Terms of service created (if needed)
- [ ] README.md updated
- [ ] SECURITY.md reviewed
- [ ] Copyright notices added
- [ ] Open source repo public
- [ ] Contributing guidelines present

## Chrome Web Store Submission

### Account Setup
- [ ] Google Developer account created ($5 one-time fee)
- [ ] Payment method added
- [ ] Two-factor authentication enabled
- [ ] Publisher verified (optional, for trusted badge)

### Extension Package
- [ ] Built extension in `apps/extension/dist/`
- [ ] manifest.json validated
- [ ] Version number correct (0.1.0)
- [ ] All required files included
- [ ] No unnecessary files (node_modules, .git, etc.)
- [ ] ZIP file created: `glin-wallet-chrome-v0.1.0.zip`
- [ ] ZIP file size < 100MB

### Store Listing - Basic Info
- [ ] Extension name: "GLIN Wallet"
- [ ] Short description written (< 132 chars)
- [ ] Detailed description written (< 16,000 chars)
- [ ] Category selected: Productivity
- [ ] Language: English (primary)

### Store Listing - Media
- [ ] 5 screenshots captured (1280x800)
- [ ] Screenshots annotated and polished
- [ ] Small promo tile created (440x280)
- [ ] Large promo tile created (920x680) - optional
- [ ] Extension icons verified (16, 32, 48, 128px)
- [ ] All images optimized (< 1MB each)

### Store Listing - Details
- [ ] Privacy policy URL added
- [ ] Support email: support@glin.ai
- [ ] Website: https://glin.ai
- [ ] Permissions justified in description
- [ ] Single purpose clearly stated
- [ ] No misleading claims

### Privacy & Permissions
- [ ] Privacy policy hosted publicly
- [ ] Data handling disclosed (we collect nothing)
- [ ] Permissions listed:
  - [ ] storage (encrypted wallet data)
  - [ ] alarms (scheduled tasks)
  - [ ] notifications (transaction alerts)
  - [ ] host_permissions (GLIN RPC nodes)
- [ ] Each permission justified in submission

### Distribution
- [ ] Visibility: Public
- [ ] Pricing: Free
- [ ] Countries: All countries
- [ ] Chrome Web Store only (initially)

### Developer Contact
- [ ] Email: dev@glin.ai
- [ ] Support URL: https://glin.ai/support
- [ ] Terms of service: https://glin.ai/terms

### Final Upload
- [ ] ZIP file uploaded
- [ ] No errors in automated scan
- [ ] "Submit for Review" clicked
- [ ] Submission confirmation received
- [ ] Item ID saved for tracking

## Firefox Add-ons Submission

### Account Setup
- [ ] Mozilla Add-on Developer account created
- [ ] Email verified
- [ ] Two-factor authentication enabled (recommended)
- [ ] Developer agreement accepted

### Extension Package
- [ ] Built extension in `apps/extension/dist/`
- [ ] manifest.json includes Firefox-specific fields
- [ ] `browser_specific_settings.gecko.id` added
- [ ] Tested in Firefox 109+
- [ ] ZIP file created: `glin-wallet-firefox-v0.1.0.zip`

### Store Listing - Basic Info
- [ ] Add-on name: "GLIN Wallet"
- [ ] Add-on slug: glin-wallet
- [ ] Summary written
- [ ] Description written
- [ ] Categories selected: Other, Productivity

### Store Listing - Media
- [ ] 3-5 screenshots uploaded
- [ ] Icon uploaded (64x64 or 128x128)
- [ ] Screenshots have captions

### Technical Details
- [ ] Manifest V3 selected
- [ ] Minimum Firefox version: 109.0
- [ ] Platforms: Windows, macOS, Linux
- [ ] License: Apache 2.0
- [ ] Source code URL: GitHub link

### Privacy & Data
- [ ] Privacy policy URL added
- [ ] "Does not collect data" selected
- [ ] Source code public and accessible

### Review Information
- [ ] Testing instructions provided
- [ ] Reviewer notes written
- [ ] Any build tools or dependencies listed
- [ ] Source code matches build confirmed

### Distribution
- [ ] Listed on AMO (public)
- [ ] Auto-updates enabled
- [ ] All platforms selected

### Final Upload
- [ ] ZIP file uploaded
- [ ] Automated validation passed
- [ ] "Submit for Review" clicked
- [ ] Submission ID saved
- [ ] Monitor review status

## Post-Submission

### Chrome Web Store
- [ ] Monitor review status (1-3 business days typically)
- [ ] Respond to any review requests
- [ ] Check for rejection or approval email
- [ ] Once approved: Test installation from store
- [ ] Once approved: Announce launch

### Firefox Add-ons
- [ ] Monitor review status (1-10 business days)
- [ ] Respond to reviewer questions
- [ ] Check for approval email
- [ ] Once approved: Test installation from AMO
- [ ] Once approved: Announce launch

### Launch Preparation
- [ ] Social media posts drafted
- [ ] Blog post written
- [ ] Email announcement prepared
- [ ] Community notified (Discord, Reddit, etc.)
- [ ] Documentation updated with install links
- [ ] Support channels ready

## Ongoing Maintenance

### Version Updates
- [ ] Create update process documentation
- [ ] Plan release schedule (monthly/quarterly)
- [ ] Set up CI/CD for builds
- [ ] Monitor user feedback
- [ ] Track crash reports (if implemented)

### Support
- [ ] Monitor store reviews
- [ ] Respond to user questions
- [ ] Track GitHub issues
- [ ] Provide timely updates
- [ ] Maintain FAQ

### Marketing
- [ ] Share on social media
- [ ] Write blog posts
- [ ] Create video tutorials
- [ ] Submit to product directories
- [ ] Engage with crypto community

## Quality Gates

### Must Pass Before Submission
1. ✅ All tests passing
2. ✅ No console errors
3. ✅ Works in both Chrome and Firefox
4. ✅ Privacy policy public
5. ✅ Security audit completed
6. ✅ Open source repo public

### Recommended Before Submission
1. ⭐ External security audit
2. ⭐ Beta testing with users
3. ⭐ Bug bounty program
4. ⭐ Press coverage
5. ⭐ Community feedback

## Red Flags to Avoid

### Chrome Web Store Violations
- ❌ Misleading functionality
- ❌ Excessive permissions
- ❌ Data collection without disclosure
- ❌ Malicious code
- ❌ Copyright infringement
- ❌ Deceptive installation tactics

### Firefox Violations
- ❌ Requesting unnecessary permissions
- ❌ Obfuscated code (without source)
- ❌ Undisclosed data collection
- ❌ Malware or harmful code
- ❌ Policy violations

## Timeline Estimate

### Chrome Web Store
- **Submission**: 1 hour
- **Automated review**: Minutes
- **Manual review**: 1-3 business days
- **Total**: ~3 days from submission to live

### Firefox Add-ons
- **Submission**: 1 hour
- **Automated review**: Minutes
- **Manual review**: 1-10 business days
- **Total**: ~5 days from submission to live

### Combined Launch
- **Week 1**: Prepare all materials
- **Week 2**: Submit to both stores
- **Week 3**: Address review feedback
- **Week 4**: Launch and announce

## Emergency Contacts

### If Rejected
- **Chrome**: Appeal through developer dashboard
- **Firefox**: Email: amo-editors@mozilla.org
- **Legal issues**: legal@glin.ai
- **Security issues**: security@glin.ai

### If Issues Post-Launch
- **Critical bug**: Release hotfix immediately
- **Security vulnerability**: Follow incident response plan
- **User complaints**: Respond within 24 hours
- **Store violations**: Address immediately

## Success Criteria

### Metrics to Track
- [ ] Installation count
- [ ] Active users (DAU/MAU)
- [ ] User ratings (target: > 4.0 stars)
- [ ] Review sentiment (positive/negative ratio)
- [ ] Support ticket volume
- [ ] Crash/error rates

### Goals
- **Week 1**: 100 installations
- **Month 1**: 1,000 active users
- **Month 3**: 10,000 active users
- **Year 1**: 100,000 active users

---

## Final Check

Before clicking "Submit":

1. [ ] I have tested the extension thoroughly
2. [ ] I have reviewed all submitted materials
3. [ ] I have double-checked for sensitive data
4. [ ] I have read the store policies
5. [ ] I am confident this submission will pass review
6. [ ] I have a plan for post-launch support

**Ready? Let's ship it! 🚀**

---

*Last updated: 2024-10-01*
*Version: 1.0*
