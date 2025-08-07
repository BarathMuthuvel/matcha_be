Backend:

allow ec2 instance public ip on mongo db server

sudo npm install -g pm2

pm2 start npm -- start

npm -> name
pm2 start npm --name "matchaBE" -- start

pm2 logs

pm2 flush npm

pm2 list

pm2 stop npm

pm2 delete npm

pm2 restart 0

Proxy Pass Setup

sudo nano /etc/nginx/sites-available/default

server_name 3.27.18.138;

    location /api/ {
        proxy_pass http://localhost:9999/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

sudo systemctl reload nginx

# Adding .env file to prod

Step-by-step:

comment -> sudo nano .env

Press Ctrl + O
➤ This means "Write Out" (save the file)

Press Enter
➤ Confirms the file name (should show .env by default)

Press Ctrl + X
➤ This exits the nano editor

# Sending Emails via ses

- create a iam user
- Give Access to AmazonSESFullAccess
- AmasonSES : create an identity
- verify your domain name
- verify an email address
- install aws sdk - v3
- setup sesClient
- get Access credientails ket form IAM security

# scheduling cron jobs in NodeJS

- Install node-corn
- cron expression syntax - crontab.guru
- schedule a job
- date-fns
- Send Email
- Explore Queue mechanism to send bulk emails - bee-queue , bullmq packages
- Amazon SES Bulk Emails
- Make sendEmail function dynamic



