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
sleep 2

RESPONSE=$(curl -s "http://$DOMAIN/.well-known/acme-challenge/$TEST_FILE" 2>/dev/null)
if echo "$RESPONSE" | grep -q "validation-test"; then
    echo "✅ Diretório de validação está acessível via HTTP"
    rm -f certbot/www/$TEST_FILE
else
    echo "❌ ERRO: Diretório de validação NÃO está acessível"
    echo "   Resposta recebida: $RESPONSE"
    echo "   Verifique:"
    echo "   1. DNS está apontando para este servidor?"
    echo "   2. Porta 80 está aberta no firewall?"
    echo "   3. Nginx está rodando? (docker compose ps nginx)"
    rm -f certbot/www/$TEST_FILE
    exit 1
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
    # Restaurar configuração completa do Nginx
    if [ -f nginx/nginx.conf.backup ]; then
        cp nginx/nginx.conf.backup nginx/nginx.conf
    else
        # Se não houver backup, usar a configuração completa do repositório
        echo "⚠️  Backup não encontrado, usando configuração do repositório"
    fi
    
    # Reiniciar Nginx
    docker compose restart nginx
    
    echo "✅ SSL configurado com sucesso!"
    echo "🌐 Acesse: https://$DOMAIN"
else
    echo "❌ Erro ao obter certificado"
    echo "Verifique os logs: docker compose logs certbot"
    exit 1
fi

