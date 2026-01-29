#!/usr/bin/expect -f

set timeout 30
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

# Create .env.production file
send "su - deploy -c 'cd /home/deploy/markano-app && echo \"NODE_ENV=production\" > .env.production'\r"
expect "# "

send "su - deploy -c 'cd /home/deploy/markano-app && echo \"PORT=3000\" >> .env.production'\r"
expect "# "

send "su - deploy -c 'cd /home/deploy/markano-app && echo \"DATABASE_URL=postgresql://markano_user:Markano@2024Secure@localhost:5432/markano\" >> .env.production'\r"
expect "# "

send "su - deploy -c 'cd /home/deploy/markano-app && echo \"R2_ACCESS_KEY_ID=84900d87c757552746d56725a7c3090c\" >> .env.production'\r"
expect "# "

send "su - deploy -c 'cd /home/deploy/markano-app && echo \"R2_SECRET_ACCESS_KEY=YOUR_R2_SECRET_KEY\" >> .env.production'\r"
expect "# "

send "su - deploy -c 'cd /home/deploy/markano-app && echo \"R2_BUCKET_NAME=markano\" >> .env.production'\r"
expect "# "

send "su - deploy -c 'cd /home/deploy/markano-app && echo \"R2_ENDPOINT=https://3d1b18c2d945425cecef4f47bedb43c6.r2.cloudflarestorage.com\" >> .env.production'\r"
expect "# "

send "su - deploy -c 'cd /home/deploy/markano-app && echo \"R2_PUBLIC_URL=https://pub-59e08c1a67df410f99a38170fbd4a247.r2.dev\" >> .env.production'\r"
expect "# "

send "su - deploy -c 'cd /home/deploy/markano-app && echo \"WHATSAPP_API_URL=http://168.231.85.21:3001\" >> .env.production'\r"
expect "# "

send "su - deploy -c 'cd /home/deploy/markano-app && echo \"WHATSAPP_API_KEY=22be2f43c50646609c064aecfc1a4bff\" >> .env.production'\r"
expect "# "

send "su - deploy -c 'cd /home/deploy/markano-app && chmod 600 .env.production'\r"
expect "# "

send "exit\r"
expect eof
