#!/bin/bash

# Создаем директорию для сертификатов, если её нет
mkdir -p ./certificates

# Генерируем приватный ключ и самоподписанный сертификат
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./certificates/localhost-key.pem \
  -out ./certificates/localhost.pem \
  -subj "/C=US/ST=Local/L=Local/O=Local/CN=localhost" \
  -addext "subjectAltName = DNS:localhost"

echo "SSL сертификаты созданы в директории ./certificates/" 