#!/bin/bash

# Script para configurar SSL com Let's Encrypt
# Execute este script antes de iniciar o docker-compose pela primeira vez

DOMAIN="trainally.com.br"
EMAIL="pedroandrade202004@gmail.com"

echo "🚀 Configurando SSL para $DOMAIN"

# Criar diretórios para certificados
mkdir -p certbot/conf
mkdir -p certbot/www

# Fazer backup do nginx.conf original
if [ -f nginx/nginx.conf ]; then
    cp nginx/nginx.conf nginx/nginx.conf.backup
fi

# Substituir nginx.conf temporariamente pela versão HTTP
cp nginx/nginx-http.conf nginx/nginx.conf

# Iniciar Nginx temporariamente
echo "📦 Iniciando Nginx temporariamente..."
docker-compose up -d nginx

# Aguardar Nginx iniciar
sleep 5

# Obter certificado SSL
echo "🔐 Obtendo certificado SSL do Let's Encrypt..."
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

if [ $? -eq 0 ]; then
    # Restaurar nginx.conf completo (já está no repositório)
    if [ -f nginx/nginx.conf.backup ]; then
        cp nginx/nginx.conf.backup nginx/nginx.conf
        rm nginx/nginx.conf.backup
    fi
    
    # Reiniciar Nginx com SSL
    echo "🔄 Reiniciando Nginx com SSL..."
    docker-compose restart nginx
    
    echo "✅ SSL configurado com sucesso!"
    echo "🌐 Acesse: https://$DOMAIN"
else
    echo "❌ Erro ao obter certificado SSL"
    echo "Verifique se o DNS está configurado corretamente"
    exit 1
fi
