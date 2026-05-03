# Use the official PHP image with FPM
FROM php:8.2-fpm

# Install system dependencies and PHP extensions needed for Laravel
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_mysql zip

# Install Composer globally
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy existing application directory contents
COPY . .

# Install PHP dependencies via Composer
RUN composer install --no-dev --optimize-autoloader

# Set permissions for Laravel storage and cache folders (optional but recommended)
RUN chown -R www-data:www-data storage bootstrap/cache

# Expose port 9000 (for PHP-FPM)
EXPOSE 9000

# Default command to run PHP-FPM
CMD ["php-fpm"]
