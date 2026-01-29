#!/usr/bin/expect -f

set timeout 15
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

send "cat > /etc/nginx/sites-available/markano << 'NGINXEOF'\nupstream markano_backend {\n    server 127.0.0.1:3000;\n    keepalive 64;\n}\n\nserver {\n    listen 80;\n    server_name 168.231.85.21;\n\n    add_header X-Frame-Options \"SAMEORIGIN\" always;\n    add_header X-Content-Type-Options \"nosniff\" always;\n    add_header X-XSS-Protection \"1; mode=block\" always;\n    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\n\n    gzip on;\n    gzip_vary on;\n    gzip_min_length 1024;\n    gzip_types text/plain text/css text/xml application/javascript application/json application/xml+rss text/javascript;\n    gzip_comp_level 6;\n\n    client_max_body_size 10M;\n\n    proxy_http_version 1.1;\n    proxy_set_header Upgrade \$http_upgrade;\n    proxy_set_header Connection 'upgrade';\n    proxy_set_header Host \$host;\n    proxy_set_header X-Real-IP \$remote_addr;\n    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n    proxy_set_header X-Forwarded-Proto \$scheme;\n    proxy_cache_bypass \$http_upgrade;\n    proxy_buffering off;\n    proxy_read_timeout 300s;\n    proxy_connect_timeout 75s;\n\n    location / {\n        proxy_pass http://markano_backend;\n        proxy_redirect off;\n        proxy_set_header Host \$host;\n        proxy_set_header X-Real-IP \$remote_addr;\n        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto \$scheme;\n    }\n}\nNGINXEOF\n\r"

expect "# "

send "nginx -t\r"
expect "# "

send "systemctl reload nginx\r"
expect "# "

send "exit\r"
expect eof
