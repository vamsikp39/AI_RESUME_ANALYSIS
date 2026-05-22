#!/bin/bash
# Move to the project root directory
cd "$(dirname "$0")"

# Print premium launch banner
clear
echo -e "\033[1;35m========================================================\033[0m"
echo -e "\033[1;36m  🚀 LAUNCHING RESUMEAI LOCAL DEVELOPMENT SERVER  \033[0m"
echo -e "\033[1;35m========================================================\033[0m"
echo ""

# Verify node modules and install if missing
if [ ! -d "node_modules" ]; then
  echo "📦 Installing project dependencies..."
  npm install
else
  echo "✓ Dependencies verified."
fi

echo ""
echo "🚀 Booting local dev server..."
echo "--------------------------------------------------------"
npm run dev
