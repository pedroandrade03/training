#!/bin/bash

# Script para corrigir problemas com SSL
# Use este script se o setup-ssl.sh não funcionar

DOMAIN="trainally.com.br"

echo "🔧 Corrigindo configuração SSL para $DOMAIN"

# Parar todos os containers
echo "🛑 Parando containers..."
docker compose down --remove-orphans

# Limpar certificados existentes
echo "🧹 Limpando certificados existentes..."
rm -rf certbot/conf/live/$DOMAIN
rm -rf certbot/conf/archive/$DOMAIN
rm -rf certbot/conf/renewal/$DOMAIN.conf
rm -rf certbot/conf/accounts

# Garantir que os diretórios existem
mkdir -p certbot/conf
mkdir -p certbot/www

# Usar configuração HTTP temporária
cp nginx/nginx-http.conf nginx/nginx.conf

# Iniciar apenas Nginx
echo "📦 Iniciando Nginx..."
docker compose up -d nginx

# Aguardar
sleep 10

# Verificar se Nginx está servindo o diretório de validação
echo "🔍 Testando acesso ao diretório de validação..."
TEST_FILE="validation-test.txt"
echo "validation-test" > certbot/www/$TEST_FILE
sleep 3

# Testar via IP primeiro
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "185.169.252.100")
echo "   Testando via IP: $SERVER_IP"
IP_RESPONSE=$(curl -s "http://$SERVER_IP/.well-known/acme-challenge/$TEST_FILE" 2>/dev/null)
if echo "$IP_RESPONSE" | grep -q "validation-test"; then
    echo "✅ Diretório acessível via IP"
else
    echo "⚠️  Não acessível via IP. Verificando configuração do Nginx..."
    docker compose logs nginx | tail -20
fi

# Testar via domínio
echo "   Testando via domínio: $DOMAIN"
RESPONSE=$(curl -s "http://$DOMAIN/.well-known/acme-challenge/$TEST_FILE" 2>/dev/null)
if echo "$RESPONSE" | grep -q "validation-test"; then
    echo "✅ Diretório de validação está acessível via HTTP"
    rm -f certbot/www/$TEST_FILE
else
    echo "⚠️  Aviso: Não acessível via domínio (pode ser DNS ainda propagando)"
    echo "   Resposta: $RESPONSE"
    echo "   Continuando mesmo assim..."
    rm -f certbot/www/$TEST_FILE
fi

# Obter certificado
echo ""
echo "🔐 Obtendo certificado SSL..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email pedroandrade202004@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

if [ $? -eq 0 ]; then
    # Atualizar nginx.conf para usar SSL
    echo "🔄 Atualizando configuração do Nginx para usar SSL..."
    cp nginx/nginx-ssl.conf nginx/nginx.conf
    
    # Reiniciar Nginx
    docker compose restart nginx
    
    # Aguardar Nginx reiniciar
    sleep 5
    
    echo "✅ SSL configurado com sucesso!"
    echo "🌐 Acesse: https://$DOMAIN"
else
    echo "❌ Erro ao obter certificado"
    echo "Verifique os logs: docker compose logs certbot"
    echo "Mantendo configuração HTTP para tentar novamente depois"
    exit 1
fi

