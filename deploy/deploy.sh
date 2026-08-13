#!/usr/bin/env bash
set -euo pipefail

app_dir=/srv/tyler-site/app
export SITE_DB_PATH=/srv/tyler-site/data/site.db

install -d -m 0750 /srv/tyler-site/data /srv/tyler-site/media
cd "$app_dir"
git fetch origin master
git reset --hard origin/master
npm ci
npm run db:migrate
npm run build
sudo systemctl restart tyler-site.service

curl --fail --silent --show-error --retry 10 --retry-delay 1 http://127.0.0.1:4321/api/health >/dev/null
echo "Deployment successful: $(git rev-parse --short HEAD)"
