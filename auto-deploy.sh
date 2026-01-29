#!/usr/bin/expect -f

set timeout 300
set server "168.231.85.21"
set user "root"
set password "Abdi@@953651"

spawn ssh $user@$server

expect {
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    "password:" {
        send "$password\r"
    }
}

expect "# "

# Step 2: System Update
send "apt update && apt upgrade -y\r"
expect "# "
send "apt install -y curl wget git build-essential ufw fail2ban\r"
expect "# "

# Step 3: Create Deploy User
send "adduser --disabled-password --gecos \"\" deploy\r"
expect {
    "New password:" { send "\r" }
    "Retype new password:" { send "\r" }
    "# " { }
}
expect "# "
send "usermod -aG sudo deploy\r"
expect "# "
send "echo \"deploy ALL=(ALL) NOPASSWD:ALL\" >> /etc/sudoers\r"
expect "# "

# Step 4: Install Node.js 20
send "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -\r"
expect "# "
send "apt install -y nodejs\r"
expect "# "
send "node --version\r"
expect "# "
send "npm --version\r"
expect "# "

# Step 5: Install PostgreSQL
send "apt install -y postgresql postgresql-contrib\r"
expect "# "
send "systemctl start postgresql\r"
expect "# "
send "systemctl enable postgresql\r"
expect "# "

# Step 6: Configure PostgreSQL
send "sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'Markano@2024Secure';\"\r"
expect "# "
send "sudo -u postgres createdb markano\r"
expect "# "
send "sudo -u postgres psql -c \"CREATE USER markano_user WITH PASSWORD 'Markano@2024Secure';\"\r"
expect "# "
send "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE markano TO markano_user;\"\r"
expect "# "
send "sudo -u postgres psql -c \"ALTER DATABASE markano OWNER TO markano_user;\"\r"
expect "# "

# Step 7: Configure PostgreSQL Access
send "echo \"host    markano    markano_user    127.0.0.1/32    md5\" >> /etc/postgresql/*/main/pg_hba.conf\r"
expect "# "
send "sed -i \"s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/\" /etc/postgresql/*/main/postgresql.conf\r"
expect "# "
send "systemctl restart postgresql\r"
expect "# "

# Step 8: Install PM2
send "npm install -g pm2\r"
expect "# "
send "sudo -u deploy pm2 startup systemd -u deploy --hp /home/deploy\r"
expect "# "

# Step 9: Install Nginx
send "apt install -y nginx\r"
expect "# "
send "systemctl start nginx\r"
expect "# "
send "systemctl enable nginx\r"
expect "# "

# Step 10: Configure Firewall
send "ufw default deny incoming\r"
expect "# "
send "ufw default allow outgoing\r"
expect "# "
send "ufw allow ssh\r"
expect "# "
send "ufw allow 80/tcp\r"
expect "# "
send "ufw allow 443/tcp\r"
expect "# "
send "ufw --force enable\r"
expect "# "
send "ufw status\r"
expect "# "

# Step 11: Switch to Deploy User and Clone
send "su - deploy -c 'cd /home/deploy && git clone https://github.com/abdirisak009/markanoLst.git markano-app || true'\r"
expect "# "

# Step 15: Create Environment File
send "su - deploy -c 'cd /home/deploy/markano-app && cat > .env.production << \"ENVEOF\"\r"
send "NODE_ENV=production\r"
send "PORT=3000\r"
send "DATABASE_URL=postgresql://markano_user:Markano@2024Secure@localhost:5432/markano\r"
send "R2_ACCESS_KEY_ID=84900d87c757552746d56725a7c3090c\r"
send "R2_SECRET_ACCESS_KEY=YOUR_R2_SECRET_KEY\r"
send "R2_BUCKET_NAME=markano\r"
send "R2_ENDPOINT=https://3d1b18c2d945425cecef4f47bedb43c6.r2.cloudflarestorage.com\r"
send "R2_PUBLIC_URL=https://pub-59e08c1a67df410f99a38170fbd4a247.r2.dev\r"
send "WHATSAPP_API_URL=http://168.231.85.21:3000\r"
send "WHATSAPP_API_KEY=f12a05a88b6243349220b03951b0fb5c\r"
send "ENVEOF\r"
send "'\r"
expect "# "

send "su - deploy -c 'cd /home/deploy/markano-app && chmod 600 .env.production'\r"
expect "# "

# Step 16: Install Dependencies
send "su - deploy -c 'cd /home/deploy/markano-app && npm install --production'\r"
expect "# "

# Step 17: Build Application
send "su - deploy -c 'cd /home/deploy/markano-app && export \$(cat .env.production | xargs) && npm run build'\r"
expect "# "

# Step 18: Configure PM2
send "su - deploy -c 'cd /home/deploy/markano-app && pm2 start npm --name \"markano-app\" -- start'\r"
expect "# "
send "su - deploy -c 'pm2 save'\r"
expect "# "
send "su - deploy -c 'pm2 startup'\r"
expect "# "

# Step 19: Configure Nginx
send "cat > /etc/nginx/sites-available/markano << 'NGINXEOF'\r"
send "upstream markano_backend {\r"
send "    server 127.0.0.1:3000;\r"
send "    keepalive 64;\r"
send "}\r"
send "\r"
send "server {\r"
send "    listen 80;\r"
send "    server_name 168.231.85.21;\r"
send "\r"
send "    add_header X-Frame-Options \"SAMEORIGIN\" always;\r"
send "    add_header X-Content-Type-Options \"nosniff\" always;\r"
send "    add_header X-XSS-Protection \"1; mode=block\" always;\r"
send "    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\r"
send "\r"
send "    gzip on;\r"
send "    gzip_vary on;\r"
send "    gzip_min_length 1024;\r"
send "    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;\r"
send "\r"
send "    client_max_body_size 10M;\r"
send "\r"
send "    proxy_http_version 1.1;\r"
send "    proxy_set_header Upgrade \$http_upgrade;\r"
send "    proxy_set_header Connection 'upgrade';\r"
send "    proxy_set_header Host \$host;\r"
send "    proxy_set_header X-Real-IP \$remote_addr;\r"
send "    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\r"
send "    proxy_set_header X-Forwarded-Proto \$scheme;\r"
send "    proxy_cache_bypass \$http_upgrade;\r"
send "\r"
send "    location / {\r"
send "        proxy_pass http://markano_backend;\r"
send "        proxy_redirect off;\r"
send "    }\r"
send "\r"
send "    location /_next/static {\r"
send "        proxy_pass http://markano_backend;\r"
send "        proxy_cache_valid 200 60m;\r"
send "        add_header Cache-Control \"public, immutable\";\r"
send "    }\r"
send "}\r"
send "NGINXEOF\r"
expect "# "

send "ln -sf /etc/nginx/sites-available/markano /etc/nginx/sites-enabled/\r"
expect "# "
send "rm -f /etc/nginx/sites-enabled/default\r"
expect "# "
send "nginx -t\r"
expect "# "
send "systemctl reload nginx\r"
expect "# "

# Step 20: Configure Fail2Ban
send "cat > /etc/fail2ban/jail.local << 'FAIL2BANEOF'\r"
send "[DEFAULT]\r"
send "bantime = 3600\r"
send "findtime = 600\r"
send "maxretry = 5\r"
send "\r"
send "[sshd]\r"
send "enabled = true\r"
send "port = ssh\r"
send "logpath = %(sshd_log)s\r"
send "backend = %(sshd_backend)s\r"
send "\r"
send "[nginx-http-auth]\r"
send "enabled = true\r"
send "port = http,https\r"
send "logpath = /var/log/nginx/error.log\r"
send "FAIL2BANEOF\r"
expect "# "

send "systemctl restart fail2ban\r"
expect "# "

# Step 22: Setup Log Rotation
send "su - deploy -c 'pm2 install pm2-logrotate'\r"
expect "# "
send "su - deploy -c 'pm2 set pm2-logrotate:max_size 10M'\r"
expect "# "
send "su - deploy -c 'pm2 set pm2-logrotate:retain 7'\r"
expect "# "
send "su - deploy -c 'pm2 set pm2-logrotate:compress true'\r"
expect "# "
send "su - deploy -c 'pm2 save'\r"
expect "# "

# Step 23: Create Deployment Script
send "su - deploy -c 'cat > /home/deploy/markano-app/deploy.sh << \"DEPLOYEOF\"\r"
send "#!/bin/bash\r"
send "set -e\r"
send "cd /home/deploy/markano-app\r"
send "git pull origin main\r"
send "npm install --production\r"
send "export \$(cat .env.production | xargs)\r"
send "npm run build\r"
send "pm2 restart markano-app\r"
send "pm2 logs markano-app --lines 20\r"
send "DEPLOYEOF\r"
send "'\r"
expect "# "

send "su - deploy -c 'chmod +x /home/deploy/markano-app/deploy.sh'\r"
expect "# "

# Step 24: Final Verification
send "su - deploy -c 'pm2 status'\r"
expect "# "
send "systemctl status nginx\r"
expect "# "
send "systemctl status postgresql\r"
expect "# "
send "curl -I http://168.231.85.21\r"
expect "# "

# Step 25: Security Hardening
send "sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config\r"
expect "# "
send "systemctl restart sshd\r"
expect "# "
send "apt install -y unattended-upgrades\r"
expect "# "

send "echo 'Deployment Complete!'\r"
expect "# "

interact
