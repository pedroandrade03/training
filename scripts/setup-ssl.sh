#!/bin/bash

# Script para configurar SSL com Let's Encrypt
# Execute este script antes de iniciar o docker compose pela primeira vez

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

# Remover containers órfãos (como postgres que foi removido)
echo "🧹 Removendo containers órfãos..."
docker compose down --remove-orphans 2>/dev/null || true

# Iniciar Nginx temporariamente
echo "📦 Iniciando Nginx temporariamente..."
docker compose up -d nginx

# Aguardar Nginx iniciar
echo "⏳ Aguardando Nginx iniciar..."
sleep 10

# Verificar se Nginx está rodando
if ! docker compose ps nginx | grep -q "Up"; then
    echo "❌ Erro: Nginx não está rodando. Verifique os logs:"
    docker compose logs nginx
    exit 1
fi

# Verificar se já existe certificado
if [ -d "certbot/conf/live/$DOMAIN" ]; then
    echo "⚠️  Certificado já existe em certbot/conf/live/$DOMAIN"
    echo "   Removendo certificado existente para obter um novo..."
    rm -rf certbot/conf/live/$DOMAIN
    rm -rf certbot/conf/archive/$DOMAIN
    rm -rf certbot/conf/renewal/$DOMAIN.conf
fi

# Obter certificado SSL
echo "🔐 Obtendo certificado SSL do Let's Encrypt..."
echo "⚠️  Certifique-se de que o DNS está apontando para este servidor!"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "IP_DO_SERVIDOR")
echo "   Domínio: $DOMAIN e www.$DOMAIN devem apontar para o IP: $SERVER_IP"
echo ""

# Testar acesso ao diretório de validação
echo "🔍 Testando acesso ao diretório de validação..."
TEST_FILE="test-$(date +%s).txt"
echo "test" > certbot/www/$TEST_FILE
sleep 3

if curl -s "http://$DOMAIN/.well-known/acme-challenge/$TEST_FILE" 2>/dev/null | grep -q "test"; then
    echo "✅ Diretório de validação está acessível"
    rm -f certbot/www/$TEST_FILE
else
    echo "⚠️  Aviso: Não foi possível acessar o diretório de validação"
    echo "   Isso pode indicar que o DNS não está configurado corretamente"
    echo "   Teste manualmente: curl http://$DOMAIN/.well-known/acme-challenge/$TEST_FILE"
    rm -f certbot/www/$TEST_FILE
fi

echo ""

# Obter certificado SSL
echo "📝 Executando certbot para obter certificado..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

if [ $? -eq 0 ]; then
    # Atualizar nginx.conf para usar SSL
    echo "🔄 Atualizando configuração do Nginx para usar SSL..."
    cp nginx/nginx-ssl.conf nginx/nginx.conf
    
    # Reiniciar Nginx com SSL
    echo "🔄 Reiniciando Nginx com SSL..."
    docker compose restart nginx
    
    # Aguardar Nginx reiniciar
    sleep 5
    
    echo "✅ SSL configurado com sucesso!"
    echo "🌐 Acesse: https://$DOMAIN"
else
    echo "❌ Erro ao obter certificado SSL"
    echo "Verifique se o DNS está configurado corretamente"
    echo "Mantendo configuração HTTP para tentar novamente depois"
    exit 1
fi
