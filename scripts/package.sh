#!/bin/bash
# Package GLIN Wallet Extension for Store Submission

set -e  # Exit on error

VERSION=$(node -p "require('./apps/extension/manifest.json').version")
DIST_DIR="apps/extension/dist"
PACKAGE_DIR="packages-release"

echo "📦 Packaging GLIN Wallet v${VERSION}"
echo "================================"

# Clean previous packages
echo "🧹 Cleaning previous packages..."
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

# Build extension
echo "🔨 Building extension..."
pnpm build

# Verify dist directory exists
if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Error: $DIST_DIR not found. Build failed?"
  exit 1
fi

# Create Chrome package
echo "📦 Creating Chrome package..."
cd "$DIST_DIR"
zip -r "../../../$PACKAGE_DIR/glin-wallet-chrome-v${VERSION}.zip" . \
  -x "*.DS_Store" \
  -x "*.git*" \
  -x "*.env*" \
  -x "*node_modules*" \
  -x "*package-lock.json" \
  -x "*yarn.lock" \
  -x "*pnpm-lock.yaml"

cd - > /dev/null

# Create Firefox package (same as Chrome for now)
echo "🦊 Creating Firefox package..."
cp "$PACKAGE_DIR/glin-wallet-chrome-v${VERSION}.zip" \
   "$PACKAGE_DIR/glin-wallet-firefox-v${VERSION}.zip"

# Create source code archive
echo "📝 Creating source code archive..."
git archive --format=zip --output="$PACKAGE_DIR/glin-wallet-source-v${VERSION}.zip" HEAD

# Calculate package sizes
echo ""
echo "📊 Package Information:"
echo "======================"
ls -lh "$PACKAGE_DIR" | awk '{print $9, "-", $5}'

# Verify packages
echo ""
echo "✅ Verification:"
echo "==============="

CHROME_ZIP="$PACKAGE_DIR/glin-wallet-chrome-v${VERSION}.zip"
FIREFOX_ZIP="$PACKAGE_DIR/glin-wallet-firefox-v${VERSION}.zip"
SOURCE_ZIP="$PACKAGE_DIR/glin-wallet-source-v${VERSION}.zip"

if [ -f "$CHROME_ZIP" ]; then
  echo "✓ Chrome package created: $(du -h "$CHROME_ZIP" | cut -f1)"
else
  echo "✗ Chrome package missing"
  exit 1
fi

if [ -f "$FIREFOX_ZIP" ]; then
  echo "✓ Firefox package created: $(du -h "$FIREFOX_ZIP" | cut -f1)"
else
  echo "✗ Firefox package missing"
  exit 1
fi

if [ -f "$SOURCE_ZIP" ]; then
  echo "✓ Source package created: $(du -h "$SOURCE_ZIP" | cut -f1)"
else
  echo "✗ Source package missing"
  exit 1
fi

# List contents of Chrome package
echo ""
echo "📂 Chrome Package Contents:"
echo "=========================="
unzip -l "$CHROME_ZIP" | head -20

echo ""
echo "✨ Packaging complete!"
echo ""
echo "📦 Packages ready for submission:"
echo "  - Chrome: $CHROME_ZIP"
echo "  - Firefox: $FIREFOX_ZIP"
echo "  - Source: $SOURCE_ZIP"
echo ""
echo "Next steps:"
echo "1. Test packages manually in browsers"
echo "2. Review store/SUBMISSION_CHECKLIST.md"
echo "3. Submit to Chrome Web Store"
echo "4. Submit to Firefox Add-ons (AMO)"
echo ""
echo "🚀 Good luck with your submission!"
