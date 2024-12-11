#!/bin/bash

# Создаем директорию для сертификатов
mkdir -p certs

# Генерируем сертификат
openssl req -x509 -out certs/localhost.crt -keyout certs/localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost,IP:192.168.1.102\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

# Делаем скрипт исполняемым
chmod +x scripts/generate-cert.sh 