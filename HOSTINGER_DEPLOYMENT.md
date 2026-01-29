# Hostinger VPS Deployment - Step by Step Commands

## Step 1: SSH Connection

```bash
ssh root@168.231.85.21
# Password: Abdi@@953651
```

## Step 2: System Update

```bash
apt update && apt upgrade -y
apt install -y curl wget git build-essential ufw fail2ban
```

## Step 3: Create Deploy User

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
echo "deploy ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
```

## Step 4: Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version
```

## Step 5: Install PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

## Step 6: Configure PostgreSQL

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'Markano@2024Secure';"
sudo -u postgres createdb markano
sudo -u postgres psql -c "CREATE USER markano_user WITH PASSWORD 'Markano@2024Secure';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE markano TO markano_user;"
sudo -u postgres psql -c "ALTER DATABASE markano OWNER TO markano_user;"
```

## Step 7: Configure PostgreSQL Access

```bash
echo "host    markano    markano_user    127.0.0.1/32    md5" >> /etc/postgresql/*/main/pg_hba.conf
echo "listen_addresses = 'localhost'" >> /etc/postgresql/*/main/postgresql.conf
systemctl restart postgresql
```

## Step 8: Install PM2

```bash
npm install -g pm2
pm2 startup systemd -u deploy --hp /home/deploy
```

## Step 9: Install Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

## Step 10: Configure Firewall

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

## Step 11: Switch to Deploy User

```bash
su - deploy
```

## Step 12: Clone Repository

```bash
cd /home/deploy
git clone https://github.com/YOUR_REPO_URL.git markano-app
cd markano-app
```

## Step 13: Export Database from Neon

```bash
# On your local machine, export from Neon:
# PGPASSWORD='npg_mkD2UWqOehp6' pg_dump -h ep-lingering-sky-adpr789e-pooler.c-2.us-east-1.aws.neon.tech -U neondb_owner -d neondb --no-owner --no-acl > neon_backup.sql

# Then upload to server:
# scp neon_backup.sql root@168.231.85.21:/tmp/
```

## Step 14: Import Database to VPS

```bash
# Back on VPS as root:
sudo -u postgres psql -d markano < /tmp/neon_backup.sql
sudo -u postgres psql -d markano -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO markano_user;"
sudo -u postgres psql -d markano -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO markano_user;"
```

## Step 15: Create Environment File

```bash
su - deploy
cd /home/deploy/markano-app
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://markano_user:Markano@2024Secure@localhost:5432/markano
MINIO_ENDPOINT=http://127.0.0.1:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=YOUR_MINIO_SECRET_KEY
MINIO_BUCKET=markano
MINIO_PUBLIC_URL=http://YOUR_VPS_IP:9000/markano
WHATSAPP_API_URL=http://168.231.85.21:3001
WHATSAPP_API_KEY=22be2f43c50646609c064aecfc1a4bff
EOF
chmod 600 .env.production
```

## Step 16: Install Dependencies

```bash
cd /home/deploy/markano-app
npm install --production
```

## Step 17: Build Application

```bash
export $(cat .env.production | xargs)
npm run build
```

## Step 18: Configure PM2

```bash
cd /home/deploy/markano-app
pm2 start npm --name "markano-app" -- start
pm2 save
pm2 startup
pm2 list
```

## Step 19: Configure Nginx

```bash
cat > /tmp/markano-nginx.conf << 'EOF'
upstream markano_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name 168.231.85.21;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Client body size
    client_max_body_size 10M;

    # Proxy settings
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

sudo cp /tmp/markano-nginx.conf /etc/nginx/sites-available/markano
sudo ln -s /etc/nginx/sites-available/markano /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## Step 20: Configure Fail2Ban

```bash
cat > /tmp/jail.local << 'EOF'
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

sudo cp /tmp/jail.local /etc/fail2ban/jail.local
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

## Step 21: Verify Application

```bash
pm2 logs markano-app --lines 20
curl http://localhost:3000
curl http://168.231.85.21
```

## Step 22: Setup Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 save
```

## Step 23: Create Deployment Script

```bash
cat > /home/deploy/markano-app/deploy.sh << 'EOF'
#!/bin/bash
set -e
cd /home/deploy/markano-app
git pull origin main
npm install --production
export $(cat .env.production | xargs)
npm run build
pm2 restart markano-app
pm2 logs markano-app --lines 20
EOF

chmod +x /home/deploy/markano-app/deploy.sh
```

## Step 24: Final Verification

```bash
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql
curl -I http://168.231.85.21
```

## Step 25: Security Hardening

```bash
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
sudo apt install -y unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "false";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades
```

## Deployment Complete

Application should be accessible at: http://168.231.85.21
