FROM tangramor/nginx-php8-fpm:php8.4.12_withoutNodejs

ENV WEBROOT=/var/www/html/public
ENV CREATE_LARAVEL_STORAGE=1
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --optimize-autoloader

COPY . .

RUN composer dump-autoload --optimize \
    && php artisan storage:link || true \
    && chown -Rf nginx:nginx /var/www/html \
    && chmod -R ug+rwx storage bootstrap/cache

CMD ["/start.sh"]