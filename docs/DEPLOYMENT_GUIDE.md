# 🚀 Production Deployment Guide - Ubuntu VPS

## Prerequisites

- Ubuntu 20.04+ VPS
- Root or sudo access
- Domain name (optional but recommended)

---

## Step 1: System Update & Basic Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ufw fail2ban
```

---

## Step 2: Create Deployment User

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG sudo deploy
sudo su - deploy
```

---

## Step 3: Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

---

## Step 4: Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'CHANGE_THIS_PASSWORD';"
sudo -u postgres createdb markano
```

---

## Step 5: Install PM2

```bash
sudo npm install -g pm2
pm2 startup systemd -u deploy --hp /home/deploy
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
```

---

## Step 6: Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Step 7: Setup Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

---

## Step 8: Clone & Setup Application

```bash
cd /home/deploy
git clone YOUR_REPO_URL markano-app
cd markano-app
npm install --production
npm run build
```

---

## Step 9: Environment Configuration

```bash
cd /home/deploy/markano-app
nano .env.production
```

Add:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:CHANGE_THIS_PASSWORD@localhost:5432/markano
MINIO_ENDPOINT=http://127.0.0.1:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your_minio_secret
MINIO_BUCKET=markano
MINIO_PUBLIC_URL=http://YOUR_VPS_IP:9000/markano
WHATSAPP_API_URL=http://168.231.85.21:3001
WHATSAPP_API_KEY=22be2f43c50646609c064aecfc1a4bff
```

```bash
chmod 600 .env.production
```

---

## Step 10: Run Database Migrations

```bash
cd /home/deploy/markano-app
export $(cat .env.production | xargs)
node scripts/run-migration.js scripts/001_create_tables.sql
node scripts/run-migration.js scripts/002_seed_initial_data.sql
node scripts/run-migration.js scripts/003-create-user-permissions.sql
node scripts/run-migration.js scripts/004-create-forum-tables.sql
node scripts/run-migration.js scripts/005-video-class-access.sql
node scripts/run-migration.js scripts/006-ecommerce-wizard-tables.sql
node scripts/run-migration.js scripts/036-live-coding-challenges.sql
node scripts/run-migration.js scripts/045-gamified-learning-path-schema.sql
node scripts/run-migration.js scripts/047-create-payment-table.sql
node scripts/run-migration.js scripts/050-create-temporary-activities-table.sql
```

---

## Step 11: Configure PM2

```bash
cd /home/deploy/markano-app
pm2 start npm --name "markano-app" -- start
pm2 save
pm2 list
pm2 logs markano-app
```

---

## Step 12: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/markano
```

Add:

```nginx
upstream markano_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

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

    # Static files caching
    location /_next/static {
        proxy_pass http://markano_backend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/markano /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 13: SSL with Let's Encrypt (Optional but Recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN
sudo certbot renew --dry-run
```

---

## Step 14: PostgreSQL Security

```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Uncomment/modify:

```
listen_addresses = 'localhost'
max_connections = 100
shared_buffers = 256MB
```

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Ensure:

```
local   all             postgres                                peer
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
```

```bash
sudo systemctl restart postgresql
```

---

## Step 15: Fail2Ban Configuration

```bash
sudo nano /etc/fail2ban/jail.local
```

Add:

```ini
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
```

```bash
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

---

## Step 16: System Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## Step 17: Create Deployment Script

```bash
cd /home/deploy/markano-app
nano deploy.sh
```

Add:

```bash
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
```

```bash
chmod +x deploy.sh
```

---

## Step 18: Health Check Script

```bash
cd /home/deploy/markano-app
nano health-check.sh
```

Add:

```bash
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/dashboard/stats)
if [ $response -eq 200 ]; then
    echo "✅ Application is healthy"
    exit 0
else
    echo "❌ Application health check failed: $response"
    pm2 restart markano-app
    exit 1
fi
```

```bash
chmod +x health-check.sh
```

Add to crontab:

```bash
crontab -e
```

Add:

```
*/5 * * * * /home/deploy/markano-app/health-check.sh >> /home/deploy/health-check.log 2>&1
```

---

## Step 19: Backup Script

```bash
cd /home/deploy
nano backup.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
sudo -u postgres pg_dump markano > $BACKUP_DIR/db_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /home/deploy/markano-app

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "✅ Backup completed: $DATE"
```

```bash
chmod +x backup.sh
```

Add to crontab:

```
0 2 * * * /home/deploy/backup.sh >> /home/deploy/backup.log 2>&1
```

---

## Step 20: Final Security Hardening

```bash
# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Set up automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Remove unnecessary packages
sudo apt autoremove -y
```

---

## Useful Commands

### PM2 Commands

```bash
pm2 list
pm2 logs markano-app
pm2 restart markano-app
pm2 stop markano-app
pm2 delete markano-app
pm2 monit
pm2 save
```

### Nginx Commands

```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
```

### PostgreSQL Commands

```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
sudo -u postgres psql -d markano
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top

# Check logs
sudo journalctl -u nginx -f
sudo journalctl -u postgresql -f
pm2 logs markano-app
```

---

## Troubleshooting

### Application not starting

```bash
pm2 logs markano-app
cd /home/deploy/markano-app
node --version
npm --version
```

### Database connection issues

```bash
sudo -u postgres psql -c "\l"
sudo -u postgres psql -d markano -c "SELECT 1;"
```

### Nginx 502 error

```bash
sudo nginx -t
pm2 list
curl http://localhost:3000
```

### Port already in use

```bash
sudo lsof -i :3000
sudo netstat -tulpn | grep 3000
```

---

## Production Checklist

- [ ] Node.js 20.x installed
- [ ] PostgreSQL installed and secured
- [ ] PM2 configured with auto-start
- [ ] Nginx configured as reverse proxy
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Firewall configured (UFW)
- [ ] Fail2Ban configured
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Application builds successfully
- [ ] Health check script configured
- [ ] Backup script configured
- [ ] Log rotation configured
- [ ] Security headers configured
- [ ] Root login disabled
- [ ] Automatic updates enabled

---

**Deployment Complete!** 🎉
