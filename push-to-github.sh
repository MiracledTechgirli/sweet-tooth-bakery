#!/bin/bash
# Run this script from /home/techgirli/Music/store-website to push to GitHub
set -e

REMOTE="git@github.com:Techgirli/sweet-tooth-bakery.git"

echo "🔧 Initialising git repository..."
git init

echo "📦 Creating .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
.env
*.log
.DS_Store
EOF

echo "🔗 Setting remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE"

echo "➕ Staging all files..."
git add .

echo "💬 Creating commit..."
git commit -m "🍰 Update Sweet Tooth Bakery website" || true

echo "🚀 Pushing to GitHub (main branch)..."
git push -u origin main 2>/dev/null || git push -u origin master

echo ""
echo "✅ Done! Your code is now on GitHub:"
echo "   https://github.com/Techgirli/sweet-tooth-bakery"
