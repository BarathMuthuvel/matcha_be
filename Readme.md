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

# Sending Emails via ses

- create a iam user
- Give Access to AmazonSESFullAccess
- AmasonSES : create an identity
- verify your domain name
- verify an email address
- install aws sdk - v3
- setup sesClient
- get Access credientails ket form IAM security

