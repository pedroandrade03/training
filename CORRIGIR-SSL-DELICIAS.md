# Como Corrigir o Erro SSL para deliciassonhosdemell.com.br

## Problema

O erro `SSL: no alternative certificate subject name matches target host name` ocorre porque o Nginx está usando o certificado do `trainally.com.br` para responder requisições HTTPS do `deliciassonhosdemell.com.br`.

## Solução

### Passo 1: Verificar se o certificado existe

```bash
# Verificar se o certificado foi gerado
ls -la certbot/conf/live/deliciassonhosdemell.com.br/

# Ou verificar todos os certificados
docker compose exec certbot certbot certificates
```

### Passo 2: Se o certificado NÃO existe, obter o certificado

```bash
# Executar o script para obter o certificado
chmod +x scripts/setup-ssl-delicias.sh
./scripts/setup-ssl-delicias.sh
```

### Passo 3: Se o certificado JÁ existe, descomentar o bloco SSL

Edite o arquivo `nginx/nginx-ssl.conf` e descomente o bloco SSL para `deliciassonhosdemell.com.br`:

1. Encontre o bloco que começa com `# Bloco SSL para deliciassonhosdemell.com.br`
2. Descomente todas as linhas do bloco (remova o `#` do início de cada linha)
3. Certifique-se de que as linhas do certificado estão descomentadas:
   ```nginx
   ssl_certificate /etc/letsencrypt/live/deliciassonhosdemell.com.br/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/deliciassonhosdemell.com.br/privkey.pem;
   ```

### Passo 4: Atualizar o bloco HTTP para redirecionar para HTTPS

No bloco HTTP (porta 80) do `deliciassonhosdemell.com.br`, comente o `proxy_pass` e descomente o redirecionamento:

```nginx
# Redireciona HTTP para HTTPS
location / {
    return 301 https://$server_name$request_uri;
}

# Proxy HTTP (comentado - usando HTTPS)
# location / {
#     set $backend "http://host.docker.internal:8085";
#     proxy_pass $backend;
#     ...
# }
```

### Passo 5: Copiar e reiniciar

```bash
# Copiar nginx-ssl.conf para nginx.conf
cp nginx/nginx-ssl.conf nginx/nginx.conf

# Reiniciar Nginx
docker compose restart nginx

# Verificar se está funcionando
docker compose logs nginx
docker compose exec nginx nginx -t
```

### Passo 6: Testar

```bash
# Testar HTTPS
curl -I https://deliciassonhosdemell.com.br

# Deve retornar HTTP 200 ou 301, sem erros de certificado
```

## Script Automático

Criei um script que faz tudo automaticamente (se o certificado já existir):

```bash
chmod +x scripts/check-and-fix-ssl-delicias.sh
./scripts/check-and-fix-ssl-delicias.sh
```

Este script:
- Verifica se o certificado existe
- Descomenta o bloco SSL
- Atualiza o redirecionamento HTTP → HTTPS
- Reinicia o Nginx

