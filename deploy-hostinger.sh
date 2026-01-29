#!/bin/bash
set -e

echo "🚀 Starting Hostinger VPS Deployment..."

# Step 1: System Update
echo "📦 Updating system..."
apt update && apt upgrade -y
apt install -y curl wget git build-essential ufw fail2ban

# Step 2: Create Deploy User
echo "👤 Creating deploy user..."
adduser --disabled-password --gecos "" deploy || true
usermod -aG sudo deploy
echo "deploy ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Step 3: Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version

# Step 4: Install PostgreSQL
echo "🗄️ Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Step 5: Configure PostgreSQL
echo "⚙️ Configuring PostgreSQL..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'Markano@2024Secure';" || true
sudo -u postgres createdb markano || true
sudo -u postgres psql -c "CREATE USER markano_user WITH PASSWORD 'Markano@2024Secure';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE markano TO markano_user;" || true
sudo -u postgres psql -c "ALTER DATABASE markano OWNER TO markano_user;" || true

# Step 6: Configure PostgreSQL Access
echo "🔐 Configuring PostgreSQL access..."
echo "host    markano    markano_user    127.0.0.1/32    md5" >> /etc/postgresql/*/main/pg_hba.conf
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf
systemctl restart postgresql

# Step 7: Install PM2
echo "⚙️ Installing PM2..."
npm install -g pm2
sudo -u deploy pm2 startup systemd -u deploy --hp /home/deploy || true

# Step 8: Install Nginx
echo "🌐 Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Step 9: Configure Firewall
echo "🔥 Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Step 10: Setup as deploy user
echo "👤 Switching to deploy user..."
sudo -u deploy bash << 'DEPLOY_SCRIPT'
cd /home/deploy

# Step 11: Clone Repository (UPDATE THIS URL)
echo "📥 Cloning repository..."
if [ ! -d "markano-app" ]; then
    git clone https://github.com/YOUR_REPO_URL.git markano-app
fi
cd markano-app

# Step 12: Create Environment File
echo "📝 Creating environment file..."
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://markano_user:Markano@2024Secure@localhost:5432/markano
R2_ACCESS_KEY_ID=84900d87c757552746d56725a7c3090c
R2_SECRET_ACCESS_KEY=YOUR_R2_SECRET_KEY
R2_BUCKET_NAME=markano
R2_ENDPOINT=https://3d1b18c2d945425cecef4f47bedb43c6.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-59e08c1a67df410f99a38170fbd4a247.r2.dev
WHATSAPP_API_URL=http://168.231.85.21:3001
WHATSAPP_API_KEY=22be2f43c50646609c064aecfc1a4bff
EOF
chmod 600 .env.production

# Step 13: Install Dependencies
echo "📦 Installing dependencies..."
npm install --production

# Step 14: Build Application
echo "🏗️ Building application..."
export $(cat .env.production | xargs)
npm run build

# Step 15: Start with PM2
echo "🚀 Starting with PM2..."
pm2 start npm --name "markano-app" -- start
pm2 save
pm2 list

DEPLOY_SCRIPT

# Step 16: Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/markano << 'EOF'
upstream markano_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name 168.231.85.21;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    client_max_body_size 10M;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    location / {
        proxy_pass http://markano_backend;
        proxy_redirect off;
    }

    location /_next/static {
        proxy_pass http://markano_backend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/markano /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Step 17: Configure Fail2Ban
echo "🛡️ Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
EOF

systemctl restart fail2ban

# Step 18: Setup Log Rotation
echo "📋 Setting up log rotation..."
sudo -u deploy pm2 install pm2-logrotate
sudo -u deploy pm2 set pm2-logrotate:max_size 10M
sudo -u deploy pm2 set pm2-logrotate:retain 7
sudo -u deploy pm2 set pm2-logrotate:compress true
sudo -u deploy pm2 save

# Step 19: Create Deployment Script
echo "📝 Creating deployment script..."
cat > /home/deploy/markano-app/deploy.sh << 'DEPLOY_SCRIPT_EOF'
#!/bin/bash
set -e
cd /home/deploy/markano-app
git pull origin main
npm install --production
export $(cat .env.production | xargs)
npm run build
pm2 restart markano-app
pm2 logs markano-app --lines 20
DEPLOY_SCRIPT_EOF

chmod +x /home/deploy/markano-app/deploy.sh

# Step 20: Security Hardening
echo "🔒 Security hardening..."
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config || true
systemctl restart sshd || true
apt install -y unattended-upgrades

echo "✅ Deployment complete!"
echo "🌐 Application should be accessible at: http://168.231.85.21"
echo ""
echo "Next steps:"
echo "1. Import database from Neon (see HOSTINGER_DEPLOYMENT.md Step 13-14)"
echo "2. Update R2_SECRET_ACCESS_KEY in .env.production"
echo "3. Update git repository URL in deploy.sh"
echo "4. Verify: curl http://168.231.85.21"
