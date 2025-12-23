# Configuração Nginx para TRAINALLY.COM.BR

## 📋 Pré-requisitos

1. Domínio `trainally.com.br` apontando para o IP do servidor
2. Portas 80 e 443 abertas no firewall
3. Docker e Docker Compose instalados

## 🚀 Configuração Passo a Passo

### 1. Configurar DNS

Certifique-se de que os seguintes registros DNS estão configurados:

```
A     trainally.com.br        -> IP_DO_SERVIDOR
A     www.trainally.com.br    -> IP_DO_SERVIDOR
```

### 2. Configurar Firewall

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. Obter Certificado SSL

#### Opção A: Script Automático (Recomendado)

```bash
# Edite o script e altere o email
nano scripts/setup-ssl.sh

# Execute o script
chmod +x scripts/setup-ssl.sh
./scripts/setup-ssl.sh
```

#### Opção B: Manual

```bash
# 1. Criar diretórios
mkdir -p certbot/conf certbot/www

# 2. Usar nginx-http.conf temporariamente
cp nginx/nginx-http.conf nginx/nginx.conf

# 3. Iniciar Nginx
docker compose up -d nginx

# 4. Obter certificado
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email seu-email@exemplo.com \
  --agree-tos \
  --no-eff-email \
  -d trainally.com.br \
  -d www.trainally.com.br

# 5. Restaurar nginx.conf completo
cp nginx/nginx.conf nginx/nginx.conf
docker compose restart nginx
```

### 4. Iniciar Aplicação

```bash
# Iniciar todos os serviços
docker compose up -d

# Verificar logs
docker compose logs -f nginx
docker compose logs -f app
```

### 5. Verificar Configuração

```bash
# Testar configuração do Nginx
docker compose exec nginx nginx -t

# Verificar certificados
docker compose exec certbot certbot certificates
```

## 🔄 Renovação Automática de Certificados

O certificado SSL é renovado automaticamente pelo container `certbot` que roda a cada 12 horas. O Nginx é recarregado automaticamente após a renovação.

Para renovar manualmente:

```bash
docker compose exec certbot certbot renew
docker compose exec nginx nginx -s reload
```

## 🔧 Configurações Avançadas

### Ajustar Timeouts

Edite `nginx/nginx.conf` e ajuste os valores:

```nginx
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

### Aumentar Tamanho de Upload

```nginx
client_max_body_size 10M;  # Ajuste conforme necessário
```

### Adicionar Rate Limiting

Adicione no `nginx.conf`:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location / {
    limit_req zone=api burst=20 nodelay;
    # ... resto da configuração
}
```

## 🐛 Troubleshooting

### Certificado não é obtido

1. Verifique se o DNS está apontando corretamente:
   ```bash
   dig trainally.com.br
   ```

2. Verifique se as portas 80 e 443 estão abertas:
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

3. Verifique logs do certbot:
   ```bash
   docker compose logs certbot
   ```

### Nginx não inicia

1. Verifique a sintaxe:
   ```bash
   docker compose exec nginx nginx -t
   ```

2. Verifique logs:
   ```bash
   docker compose logs nginx
   ```

### Aplicação não responde

1. Verifique se o container da app está rodando:
   ```bash
   docker compose ps
   ```

2. Teste a conexão interna:
   ```bash
   docker compose exec nginx wget -O- http://app:3000
   ```

## 📝 Notas Importantes

- O certificado SSL expira a cada 90 dias, mas é renovado automaticamente
- Certifique-se de que o email no certbot está correto para receber avisos
- Faça backup dos certificados em `certbot/conf/`
- O Nginx recarrega automaticamente após renovação de certificados

## 🔒 Segurança

- Headers de segurança já estão configurados
- SSL/TLS está configurado com versões modernas
- HSTS está habilitado
- Rate limiting pode ser adicionado conforme necessário

