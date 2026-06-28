
set -e

php artisan config:clear || true
php artisan route:clear || true
php artisan cache:clear || true

timeout -t 30 php artisan migrate --force || echo "Migration step failed, timed out, or had nothing to do; continuing startup."

exec /start.sh