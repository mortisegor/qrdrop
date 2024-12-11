#!/bin/bash

# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем необходимые пакеты
apt install -y docker.io docker-compose certbot nginx

# Останавливаем nginx для получения сертификата
systemctl stop nginx

# Получаем SSL сертификат
certbot certonly --standalone -d qrdrop.pro --agree-tos --email your@email.com -n

# Создаем сеть Docker
docker network create app_network

# Запускаем приложение
docker-compose up -d

# Настраиваем автоматическое обновление сертификатов
cat > /etc/cron.d/certbot-renew << EOF
0 0 1 * * root certbot renew --quiet && docker-compose restart app
EOF

# Настраиваем firewall
ufw allow 80
ufw allow 443 