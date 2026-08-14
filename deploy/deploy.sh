#!/usr/bin/env bash
set -euo pipefail

app_dir=/srv/tyler-site/app
export SITE_DB_PATH=/srv/tyler-site/data/site.db

install -d -m 0750 /srv/tyler-site/data
install -d -m 0755 /srv/tyler-site/media
chmod 0755 /srv/tyler-site
cd "$app_dir"
git fetch origin master
git reset --hard origin/master
npm ci
npm run db:migrate
npm run build
sudo systemctl restart tyler-site.service

for attempt in $(seq 1 20); do
  if curl --fail --silent --show-error http://127.0.0.1:4321/api/health >/dev/null; then
    echo "Health check passed on attempt $attempt"
    echo "Deployment successful: $(git rev-parse --short HEAD)"
    exit 0
  fi
  sleep 1
done

echo "Health check failed after 20 attempts" >&2
exit 1
