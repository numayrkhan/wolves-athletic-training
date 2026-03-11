# Deployment on Ubuntu Server with Nginx

## Goal

This document explains how Wolves Athletic Training is deployed on a self-hosted Ubuntu server using Nginx as a reverse proxy and Docker for PostgreSQL.

---

## Server Summary

Example production stack:

- Ubuntu Server LTS
- Nginx
- Node.js backend
- PM2
- Docker
- PostgreSQL container
- Domain + TLS

---

## Directory Layout

Recommended production directories:

```text
/srv/web/
  current/
  releases/
  static/
  env/

/var/lib/postgresql/
/var/log/
```

1. Install base packages

sudo apt update
sudo apt install -y nginx git curl docker.io docker-compose-plugin

sudo useradd -m -s /bin/bash -d /home/web web
sudo usermod -aG sudo web
sudo chown -R web:web /srv/web
sudo chown -R web:web /var/lib/postgresql
sudo chown -R web:web /var/log

2. Configure the database

Use the provided compose file in docker/compose.yaml:

docker compose -f docker/compose.yaml up -d

The app expects PostgreSQL on host port 5433.

3. Configure environment files

Create secure environment files outside the repo if desired.

Example:

sudo mkdir -p /srv/web/env
sudo nano /srv/web/env/server.env
sudo chmod 600 /srv/web/env/server.env 4. Deploy the app

Clone the repo and install dependencies:

git clone <repo-url> /srv/web/current
cd /srv/web/current
npm install
npm install --prefix client
npm install --prefix server

Build frontend:

cd client
npm run build

Run Prisma migrations:

cd ../server
npx prisma generate
npx prisma migrate deploy 5. Start the API with PM2
cd /srv/web/current/server
pm2 start server.js --name wolves-api
pm2 save
pm2 startup 6. Configure Nginx

Copy the example config:

sudo cp nginx/wolves.conf.example /etc/nginx/sites-available/wolves
sudo ln -s /etc/nginx/sites-available/wolves /etc/nginx/sites-enabled/wolves
sudo nginx -t
sudo systemctl reload nginx 7. Add TLS

Use certbot to provision certificates:

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d wolfathletictraining.com -d www.wolfathletictraining.com 8. Firewall

Allow:

SSH

HTTP

HTTPS

sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable 9. Router / DNS

reserve a static DHCP lease on the router

forward ports 80 and 443 to the server

point domain DNS A record to public IP

10. Ongoing operations

rotate logs

monitor disk usage

renew TLS certificates

back up PostgreSQL regularly

restart PM2 after code changes
