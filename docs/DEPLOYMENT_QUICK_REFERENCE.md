# 🚀 Deployment Quick Reference

## Initial Server Setup

```bash
# Run automated setup
sudo ./setup-server.sh

# Or manual setup
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib nginx
sudo npm install -g pm2
```

## Application Deployment

```bash
# Clone repository
cd /home/deploy
git clone YOUR_REPO_URL markano-app
cd markano-app

# Install and build
npm install --production
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
```

## Database Setup

```bash
# Create database
sudo -u postgres createdb markano

# Set password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'YOUR_PASSWORD';"

# Run migrations
export $(cat .env.production | xargs)
node scripts/run-migration.js scripts/001_create_tables.sql
# ... run all migrations
```

## Nginx Configuration

```bash
# Copy template
sudo cp nginx.conf.template /etc/nginx/sites-available/markano
sudo nano /etc/nginx/sites-available/markano  # Edit domain/IP

# Enable site
sudo ln -s /etc/nginx/sites-available/markano /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Certificate

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN
```

## Daily Operations

```bash
# Deploy updates
./deploy.sh

# Check status
pm2 list
pm2 logs markano-app

# Restart
pm2 restart markano-app

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# Database
sudo -u postgres psql -d markano
```

## Monitoring

```bash
# PM2 monitoring
pm2 monit
pm2 logs markano-app --lines 50

# System resources
htop
df -h
free -h

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

```bash
# Check if app is running
pm2 list
curl http://localhost:3000

# Check database
sudo -u postgres psql -d markano -c "SELECT 1;"

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check firewall
sudo ufw status

# Check ports
sudo lsof -i :3000
sudo netstat -tulpn | grep 3000
```

## Backup

```bash
# Database backup
sudo -u postgres pg_dump markano > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf app_backup_$(date +%Y%m%d).tar.gz /home/deploy/markano-app
```

## Security

```bash
# Firewall status
sudo ufw status

# Fail2Ban status
sudo fail2ban-client status

# Check security logs
pm2 logs markano-app | grep -i error
sudo journalctl -u nginx -f
```
