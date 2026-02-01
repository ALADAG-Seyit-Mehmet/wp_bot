FROM node:18-slim

# Install dependencies for Puppeteer (Chrome)
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxbk-common0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Set env var so Puppeteer knows where Chromium is (optional, usually it downloads its own local rev)
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
#     PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Run with PM2 (We will install PM2 inside the container or run via node)
# Simple approach: just node
CMD [ "node", "index.js" ]
