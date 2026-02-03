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
sudo apt install -y chromium-browser xvfb ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

# 4. Install PM2 (Process Manager)
echo "Installing PM2..."
sudo npm install -g pm2

# 5. Install Project Dependencies
echo "Installing Bot Dependencies..."
npm install

# 6. Create Swap File (Virtual RAM) - Crucial for 1GB RAM VPS
echo "Configuring Swap Space..."
# Check if swap exists to avoid duplicates
if [ ! -f /swapfile ]; then
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ 4GB Swap created."
else
    echo "ℹ️ Swap file already exists."
fi

echo "✅ Setup Complete. Run 'pm2 start \"xvfb-run --auto-servernum --server-args=\\\"-screen 0 1280x960x24\\\" node index.js\" --name bot' to start."
