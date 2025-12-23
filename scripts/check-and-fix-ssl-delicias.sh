#!/bin/bash

# Script para verificar e corrigir SSL para deliciassonhosdemell.com.br

DOMAIN="deliciassonhosdemell.com.br"

echo "🔍 Verificando certificado SSL para $DOMAIN..."

# Verificar se o certificado existe
if [ -d "certbot/conf/live/$DOMAIN" ]; then
    echo "✅ Certificado encontrado em certbot/conf/live/$DOMAIN"
    
    # Verificar se os arquivos existem
    if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ] && [ -f "certbot/conf/live/$DOMAIN/privkey.pem" ]; then
        echo "✅ Arquivos de certificado encontrados"
        
        # Verificar se o bloco SSL está descomentado no nginx-ssl.conf
        if grep -q "^server {" nginx/nginx-ssl.conf && grep -A 5 "server_name deliciassonhosdemell.com.br" nginx/nginx-ssl.conf | grep -q "listen 443"; then
            echo "✅ Bloco SSL já está descomentado"
        else
            echo "⚠️  Bloco SSL está comentado. Descomentando..."
            
            # Descomentar o bloco SSL
            sed -i.bak '/# Bloco SSL para deliciassonhosdemell.com.br/,/# }/ {
                s/^#     listen/listen/
                s/^#     server_name/server_name/
                s/^#     # Certificados SSL/# Certificados SSL/
                s/^#     ssl_certificate/    ssl_certificate/
                s/^#     ssl_certificate_key/    ssl_certificate_key/
                s/^#     # Configurações SSL/# Configurações SSL/
                s/^#     ssl_protocols/    ssl_protocols/
                s/^#     ssl_ciphers/    ssl_ciphers/
                s/^#     ssl_prefer_server_ciphers/    ssl_prefer_server_ciphers/
                s/^#     ssl_session_cache/    ssl_session_cache/
                s/^#     ssl_session_timeout/    ssl_session_timeout/
                s/^#     # Headers de segurança/# Headers de segurança/
                s/^#     add_header/    add_header/
                s/^#     # Tamanho máximo/# Tamanho máximo/
                s/^#     client_max_body_size/    client_max_body_size/
                s/^#     # Timeouts/# Timeouts/
                s/^#     proxy_connect_timeout/    proxy_connect_timeout/
                s/^#     proxy_send_timeout/    proxy_send_timeout/
                s/^#     proxy_read_timeout/    proxy_read_timeout/
                s/^#     # Resolver/# Resolver/
                s/^#     resolver/    resolver/
                s/^#     resolver_timeout/    resolver_timeout/
                s/^#     # Proxy para aplicação/# Proxy para aplicação/
                s/^#     location \/ {/    location \/ {/
                s/^#         set \$backend/        set \$backend/
                s/^#         proxy_pass/        proxy_pass/
                s/^#         proxy_http_version/        proxy_http_version/
                s/^#         proxy_set_header/        proxy_set_header/
                s/^#         proxy_cache_bypass/        proxy_cache_bypass/
                s/^#     }/    }/
                s/^#     # Gzip compression/# Gzip compression/
                s/^#     gzip/    gzip/
                s/^#     gzip_vary/    gzip_vary/
                s/^#     gzip_min_length/    gzip_min_length/
                s/^#     gzip_types/    gzip_types/
                s/^# }/}/
            }' nginx/nginx-ssl.conf
            
            # Remover linhas que começam com # mas não são comentários reais
            sed -i.bak2 '/^# server {/,/^# }/ {
                s/^# server {/server {/
                s/^# }/}/
            }' nginx/nginx-ssl.conf
            
            echo "✅ Bloco SSL descomentado"
        fi
        
        # Atualizar bloco HTTP para redirecionar para HTTPS
        echo "🔄 Atualizando bloco HTTP para redirecionar para HTTPS..."
        sed -i.bak3 '/server_name deliciassonhosdemell.com.br www.deliciassonhosdemell.com.br;/,/location \/ {/ {
            /location \/ {/,/proxy_cache_bypass/ {
                s|^    location / {|    # Redireciona HTTP para HTTPS\n    location / {\n        return 301 https://$server_name$request_uri;\n    }\n\n    # Proxy HTTP (comentado - usando HTTPS)\n    # location / {|
                s|^        set \$backend|#        set \$backend|
                s|^        proxy_pass|#        proxy_pass|
                s|^        proxy_|#        proxy_|
                s|^        proxy_cache|#        proxy_cache|
            }
        }' nginx/nginx-ssl.conf
        
        # Copiar para nginx.conf
        echo "📋 Copiando nginx-ssl.conf para nginx.conf..."
        cp nginx/nginx-ssl.conf nginx/nginx.conf
        
        # Reiniciar Nginx
        echo "🔄 Reiniciando Nginx..."
        docker compose restart nginx
        
        sleep 5
        
        # Verificar se está funcionando
        if docker compose ps nginx | grep -q "Up"; then
            echo "✅ Nginx reiniciado com sucesso!"
            echo "🌐 Teste: curl -I https://$DOMAIN"
        else
            echo "❌ Erro ao reiniciar Nginx. Verifique os logs:"
            docker compose logs nginx | tail -20
            exit 1
        fi
    else
        echo "❌ Arquivos de certificado não encontrados"
        echo "   Execute: ./scripts/setup-ssl-delicias.sh"
        exit 1
    fi
else
    echo "❌ Certificado não encontrado"
    echo "   Execute: ./scripts/setup-ssl-delicias.sh para obter o certificado"
    exit 1
fi

