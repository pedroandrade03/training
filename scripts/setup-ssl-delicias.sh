#!/bin/bash

# Script para configurar SSL com Let's Encrypt para deliciassonhosdemell.com.br
# Execute este script para obter certificado SSL para o segundo domínio

DOMAIN="deliciassonhosdemell.com.br"
EMAIL="pedroandrade202004@gmail.com"

echo "🚀 Configurando SSL para $DOMAIN"

# Criar diretórios para certificados (se não existirem)
mkdir -p certbot/conf
mkdir -p certbot/www

# Verificar se Nginx está rodando
if ! docker compose ps nginx | grep -q "Up"; then
    echo "❌ Erro: Nginx não está rodando. Inicie primeiro: docker compose up -d nginx"
    exit 1
fi

# Verificar se já existe certificado
if [ -d "certbot/conf/live/$DOMAIN" ]; then
    echo "⚠️  Certificado já existe em certbot/conf/live/$DOMAIN"
    read -p "   Deseja remover e obter um novo? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "   Removendo certificado existente..."
        rm -rf certbot/conf/live/$DOMAIN
        rm -rf certbot/conf/archive/$DOMAIN
        rm -rf certbot/conf/renewal/$DOMAIN.conf
    else
        echo "   Mantendo certificado existente. Saindo..."
        exit 0
    fi
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
echo "   Isso pode levar alguns minutos..."

# Obter certificado novo
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --non-interactive \
  -d $DOMAIN \
  -d www.$DOMAIN

CERTBOT_EXIT_CODE=$?

if [ $CERTBOT_EXIT_CODE -eq 0 ]; then
    echo "✅ Certificado SSL obtido com sucesso!"
    echo ""
    echo "📝 Próximos passos:"
    echo "   1. Descomente o bloco SSL para $DOMAIN em nginx/nginx-ssl.conf"
    echo "   2. Copie nginx/nginx-ssl.conf para nginx/nginx.conf"
    echo "   3. Reinicie o Nginx: docker compose restart nginx"
    echo ""
    echo "🌐 Após configurar, acesse: https://$DOMAIN"
else
    echo "❌ Erro ao obter certificado SSL"
    echo "Verifique se o DNS está configurado corretamente"
    echo "Verifique os logs: docker compose logs certbot"
    exit 1
fi

