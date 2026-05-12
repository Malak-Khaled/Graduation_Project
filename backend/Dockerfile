FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    libzip-dev zip unzip git nginx \
    && docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

RUN echo 'server { \
    listen 80; \
    root /var/www/html/public; \
    index index.php; \
    location / { try_files $uri $uri/ /index.php?$query_string; } \
    location ~ \.php$ { fastcgi_pass 127.0.0.1:9000; fastcgi_index index.php; include fastcgi_params; fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; } \
}' > /etc/nginx/sites-available/default

EXPOSE 80

CMD bash -c "php artisan migrate --force && php-fpm -D && nginx -g 'daemon off;'"