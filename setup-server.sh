#!/bin/bash
set -e

echo "🚀 Markano Production Server Setup"
echo "===================================="

# System Update
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ufw fail2ban

# Create deploy user
echo "👤 Creating deploy user..."
if ! id "deploy" &>/dev/null; then
    sudo adduser --disabled-password --gecos "" deploy
    sudo usermod -aG sudo deploy
fi

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install PostgreSQL
echo "🗄️ Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    echo "⚠️  IMPORTANT: Set PostgreSQL password manually:"
    echo "   sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'YOUR_PASSWORD';\""
    echo "   sudo -u postgres createdb markano"
fi

# Install PM2
echo "⚙️ Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
fi

# Install Nginx
echo "🌐 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# Setup Firewall
echo "🔥 Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Setup Fail2Ban
echo "🛡️ Configuring Fail2Ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

echo "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository: git clone YOUR_REPO /home/deploy/markano-app"
echo "2. Configure .env.production file"
echo "3. Run database migrations"
echo "4. Build and start with PM2"
echo "5. Configure Nginx (see nginx.conf.template)"
