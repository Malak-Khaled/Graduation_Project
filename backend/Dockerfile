FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    libzip-dev zip unzip git nginx \
    && docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

RUN rm /etc/nginx/sites-enabled/default

RUN echo 'server {\n\
    listen 80;\n\
    root /var/www/html/public;\n\
    index index.php index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.php?$query_string;\n\
    }\n\
    location ~ \\.php$ {\n\
        fastcgi_pass 127.0.0.1:9000;\n\
        fastcgi_index index.php;\n\
        include fastcgi_params;\n\
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n\
    }\n\
}' > /etc/nginx/sites-available/laravel.conf

RUN ln -s /etc/nginx/sites-available/laravel.conf /etc/nginx/sites-enabled/

EXPOSE 80

CMD bash -c "php artisan migrate --force && php-fpm -D && nginx -g 'daemon off;'"