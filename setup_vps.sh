#!/bin/bash

# 1. Update System
echo "Updating System..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (v18)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Libraries for Puppeteer (Chrome)
echo "Installing Chromium Dependencies..."
sudo apt install -y chromium-browser ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

# 4. Install PM2 (Process Manager)
echo "Installing PM2..."
sudo npm install -g pm2

# 5. Install Project Dependencies
echo "Installing Bot Dependencies..."
npm install

echo "✅ Setup Complete. Run 'pm2 start index.js --name bot' to start."
