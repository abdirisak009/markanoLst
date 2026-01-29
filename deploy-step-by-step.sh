#!/usr/bin/expect -f

set timeout 600
set server "168.231.85.21"
set user "root"
set password "Abdi@@953651"

spawn ssh -o StrictHostKeyChecking=no $user@$server

expect {
    "password:" {
        send "$password\r"
    }
}

expect "# "

# Step 2: System Update
puts "\n=== Step 2: System Update ==="
send "apt update && apt upgrade -y\r"
expect "# "

send "apt install -y curl wget git build-essential ufw fail2ban\r"
expect "# "

# Step 3: Create Deploy User
puts "\n=== Step 3: Create Deploy User ==="
send "adduser --disabled-password --gecos \"\" deploy\r"
expect {
    "New password:" { send "\r"; exp_continue }
    "Retype new password:" { send "\r"; exp_continue }
    "# " { }
}
expect "# "

send "usermod -aG sudo deploy\r"
expect "# "
send "echo \"deploy ALL=(ALL) NOPASSWD:ALL\" >> /etc/sudoers\r"
expect "# "

# Step 4: Install Node.js 20
puts "\n=== Step 4: Install Node.js 20 ==="
send "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -\r"
expect "# "

send "apt install -y nodejs\r"
expect "# "
send "node --version\r"
expect "# "
send "npm --version\r"
expect "# "

# Step 5: Install PostgreSQL
puts "\n=== Step 5: Install PostgreSQL ==="
send "apt install -y postgresql postgresql-contrib\r"
expect "# "
send "systemctl start postgresql\r"
expect "# "
send "systemctl enable postgresql\r"
expect "# "

# Step 6: Configure PostgreSQL
puts "\n=== Step 6: Configure PostgreSQL ==="
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
puts "\n=== Step 7: Configure PostgreSQL Access ==="
send "echo \"host    markano    markano_user    127.0.0.1/32    md5\" >> /etc/postgresql/*/main/pg_hba.conf\r"
expect "# "

send "sed -i \"s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/\" /etc/postgresql/*/main/postgresql.conf\r"
expect "# "

send "systemctl restart postgresql\r"
expect "# "

# Step 8: Install PM2
puts "\n=== Step 8: Install PM2 ==="
send "npm install -g pm2\r"
expect "# "

send "sudo -u deploy pm2 startup systemd -u deploy --hp /home/deploy\r"
expect "# "

# Step 9: Install Nginx
puts "\n=== Step 9: Install Nginx ==="
send "apt install -y nginx\r"
expect "# "
send "systemctl start nginx\r"
expect "# "
send "systemctl enable nginx\r"
expect "# "

# Step 10: Configure Firewall
puts "\n=== Step 10: Configure Firewall ==="
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

# Step 11: Clone Repository
puts "\n=== Step 11: Clone Repository ==="
send "su - deploy -c 'cd /home/deploy && git clone https://github.com/abdirisak009/markanoLst.git markano-app'\r"
expect "# "

# Step 15: Create Environment File
puts "\n=== Step 15: Create Environment File ==="
send "su - deploy -c 'cd /home/deploy/markano-app && cat > .env.production << \"ENVEOF\"\nNODE_ENV=production\nPORT=3000\nDATABASE_URL=postgresql://markano_user:Markano@2024Secure@localhost:5432/markano\nR2_ACCESS_KEY_ID=84900d87c757552746d56725a7c3090c\nR2_SECRET_ACCESS_KEY=YOUR_R2_SECRET_KEY\nR2_BUCKET_NAME=markano\nR2_ENDPOINT=https://3d1b18c2d945425cecef4f47bedb43c6.r2.cloudflarestorage.com\nR2_PUBLIC_URL=https://pub-59e08c1a67df410f99a38170fbd4a247.r2.dev\nWHATSAPP_API_URL=http://168.231.85.21:3001\nWHATSAPP_API_KEY=22be2f43c50646609c064aecfc1a4bff\nENVEOF\n'\r"
expect "# "

send "su - deploy -c 'cd /home/deploy/markano-app && chmod 600 .env.production'\r"
expect "# "

# Step 16: Install Dependencies
puts "\n=== Step 16: Install Dependencies ==="
send "su - deploy -c 'cd /home/deploy/markano-app && npm install --production'\r"
expect "# "

# Step 17: Build Application
puts "\n=== Step 17: Build Application ==="
send "su - deploy -c 'cd /home/deploy/markano-app && export \$(cat .env.production | xargs) && npm run build'\r"
expect "# "

# Step 18: Start with PM2
puts "\n=== Step 18: Start with PM2 ==="
send "su - deploy -c 'cd /home/deploy/markano-app && pm2 start npm --name \"markano-app\" -- start'\r"
expect "# "

send "su - deploy -c 'pm2 save'\r"
expect "# "

# Step 19: Configure Nginx
puts "\n=== Step 19: Configure Nginx ==="
send "cat > /etc/nginx/sites-available/markano << 'NGINXEOF'\nupstream markano_backend {\n    server 127.0.0.1:3000;\n    keepalive 64;\n}\n\nserver {\n    listen 80;\n    server_name 168.231.85.21;\n\n    add_header X-Frame-Options \"SAMEORIGIN\" always;\n    add_header X-Content-Type-Options \"nosniff\" always;\n    add_header X-XSS-Protection \"1; mode=block\" always;\n    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\n\n    gzip on;\n    gzip_vary on;\n    gzip_min_length 1024;\n    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;\n\n    client_max_body_size 10M;\n\n    proxy_http_version 1.1;\n    proxy_set_header Upgrade \$http_upgrade;\n    proxy_set_header Connection 'upgrade';\n    proxy_set_header Host \$host;\n    proxy_set_header X-Real-IP \$remote_addr;\n    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n    proxy_set_header X-Forwarded-Proto \$scheme;\n    proxy_cache_bypass \$http_upgrade;\n\n    location / {\n        proxy_pass http://markano_backend;\n        proxy_redirect off;\n    }\n\n    location /_next/static {\n        proxy_pass http://markano_backend;\n        proxy_cache_valid 200 60m;\n        add_header Cache-Control \"public, immutable\";\n    }\n}\nNGINXEOF\n\r"
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
puts "\n=== Step 20: Configure Fail2Ban ==="
send "cat > /etc/fail2ban/jail.local << 'FAIL2BANEOF'\n[DEFAULT]\nbantime = 3600\nfindtime = 600\nmaxretry = 5\n\n[sshd]\nenabled = true\nport = ssh\nlogpath = %(sshd_log)s\nbackend = %(sshd_backend)s\n\n[nginx-http-auth]\nenabled = true\nport = http,https\nlogpath = /var/log/nginx/error.log\nFAIL2BANEOF\n\r"
expect "# "

send "systemctl restart fail2ban\r"
expect "# "

# Step 22: Setup Log Rotation
puts "\n=== Step 22: Setup Log Rotation ==="
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

# Step 24: Final Verification
puts "\n=== Step 24: Final Verification ==="
send "su - deploy -c 'pm2 status'\r"
expect "# "

send "systemctl status nginx --no-pager\r"
expect "# "

send "systemctl status postgresql --no-pager\r"
expect "# "

send "curl -I http://168.231.85.21\r"
expect "# "

puts "\n=== Deployment Complete! ==="
puts "Application should be accessible at: http://168.231.85.21"

send "exit\r"
expect eof
