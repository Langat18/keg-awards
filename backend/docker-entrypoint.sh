#!/bin/sh
set -e

(
  sleep 5
  php artisan config:clear 2>/dev/null || true
  php artisan route:clear 2>/dev/null || true
  php artisan cache:clear 2>/dev/null || true
  php artisan migrate --force 2>&1 || echo "Migration step failed or had nothing to do."
) &

exec /start.sh