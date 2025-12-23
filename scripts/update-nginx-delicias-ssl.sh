#!/bin/bash

# Script para atualizar nginx.conf com SSL para deliciassonhosdemell.com.br
# Execute este script APÓS obter o certificado SSL usando setup-ssl-delicias.sh

DOMAIN="deliciassonhosdemell.com.br"

echo "🔄 Atualizando configuração do Nginx para usar SSL em $DOMAIN"

# Verificar se o certificado existe
if [ ! -d "certbot/conf/live/$DOMAIN" ]; then
    echo "❌ Erro: Certificado SSL não encontrado em certbot/conf/live/$DOMAIN"
    echo "   Execute primeiro: ./scripts/setup-ssl-delicias.sh"
    exit 1
fi

# Verificar se nginx-ssl.conf existe
if [ ! -f "nginx/nginx-ssl.conf" ]; then
    echo "❌ Erro: nginx/nginx-ssl.conf não encontrado"
    exit 1
fi

# Fazer backup do nginx.conf atual
if [ -f "nginx/nginx.conf" ]; then
    cp nginx/nginx.conf nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup criado: nginx/nginx.conf.backup.*"
fi

# Atualizar nginx-ssl.conf para descomentar o bloco SSL
echo "📝 Atualizando nginx-ssl.conf..."

# Descomentar as linhas do certificado SSL no bloco do deliciassonhosdemell.com.br
sed -i.bak 's|# ssl_certificate /etc/letsencrypt/live/deliciassonhosdemell.com.br/fullchain.pem;|ssl_certificate /etc/letsencrypt/live/deliciassonhosdemell.com.br/fullchain.pem;|g' nginx/nginx-ssl.conf
sed -i.bak 's|# ssl_certificate_key /etc/letsencrypt/live/deliciassonhosdemell.com.br/privkey.pem;|ssl_certificate_key /etc/letsencrypt/live/deliciassonhosdemell.com.br/privkey.pem;|g' nginx/nginx-ssl.conf

# Atualizar o bloco HTTP para redirecionar para HTTPS
sed -i.bak '/server_name deliciassonhosdemell.com.br www.deliciassonhosdemell.com.br;/,/location \/ {/ {
    /location \/ {/,/proxy_cache_bypass/ {
        s|^    location / {|    # Redireciona HTTP para HTTPS\n    location / {\n        return 301 https://$server_name$request_uri;\n    }\n\n    # Proxy HTTP (comentado - usando HTTPS)\n    # location / {|
        s|^        proxy_pass|#        proxy_pass|
        s|^        proxy_|#        proxy_|
        s|^        proxy_cache|#        proxy_cache|
    }
}' nginx/nginx-ssl.conf

# Copiar nginx-ssl.conf para nginx.conf
cp nginx/nginx-ssl.conf nginx/nginx.conf

echo "✅ Configuração atualizada!"

# Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
docker compose restart nginx

# Aguardar Nginx reiniciar
sleep 5

# Verificar se Nginx está rodando
if docker compose ps nginx | grep -q "Up"; then
    echo "✅ Nginx reiniciado com sucesso!"
    echo "🌐 Acesse: https://$DOMAIN"
else
    echo "❌ Erro ao reiniciar Nginx. Verifique os logs:"
    docker compose logs nginx | tail -20
    exit 1
fi

