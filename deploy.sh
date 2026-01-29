#!/bin/bash
set -e

echo "🚀 Starting deployment..."

cd /home/deploy/markano-app

echo "📥 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
npm install --production

echo "🏗️ Building application..."
npm run build

echo "🔄 Restarting application..."
pm2 restart markano-app

echo "✅ Deployment complete!"
pm2 logs markano-app --lines 20
