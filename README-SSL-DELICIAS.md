# Configuração SSL para deliciassonhosdemell.com.br

Este guia explica como configurar certificado SSL para o domínio `deliciassonhosdemell.com.br` que redireciona para a aplicação na porta 8085.

## 📋 Pré-requisitos

1. Domínio `deliciassonhosdemell.com.br` apontando para o IP do servidor
2. DNS configurado corretamente:
   ```
   A     deliciassonhosdemell.com.br        -> IP_DO_SERVIDOR
   A     www.deliciassonhosdemell.com.br    -> IP_DO_SERVIDOR
   ```
3. Aplicação rodando na porta 8085 do servidor
4. Nginx já configurado e rodando (via docker compose)

## 🚀 Passo a Passo

### 1. Verificar DNS

Certifique-se de que o DNS está apontando corretamente:

```bash
# Verificar DNS
nslookup deliciassonhosdemell.com.br
nslookup www.deliciassonhosdemell.com.br
```

### 2. Obter Certificado SSL

Execute o script para obter o certificado SSL:

```bash
./scripts/setup-ssl-delicias.sh
```

Este script irá:
- Verificar se o Nginx está rodando
- Testar o acesso ao diretório de validação
- Obter o certificado SSL do Let's Encrypt
- Fornecer instruções para os próximos passos

### 3. Atualizar Configuração do Nginx

Após obter o certificado, atualize a configuração do Nginx:

```bash
./scripts/update-nginx-delicias-ssl.sh
```

Ou manualmente:

1. Edite `nginx/nginx-ssl.conf`
2. Descomente as linhas do certificado SSL no bloco do `deliciassonhosdemell.com.br`:
   ```nginx
   ssl_certificate /etc/letsencrypt/live/deliciassonhosdemell.com.br/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/deliciassonhosdemell.com.br/privkey.pem;
   ```
3. Atualize o bloco HTTP para redirecionar para HTTPS
4. Copie para `nginx.conf`:
   ```bash
   cp nginx/nginx-ssl.conf nginx/nginx.conf
   ```
5. Reinicie o Nginx:
   ```bash
   docker compose restart nginx
   ```

### 4. Verificar Configuração

Teste se está funcionando:

```bash
# Verificar configuração do Nginx
docker compose exec nginx nginx -t

# Verificar certificados
docker compose exec certbot certbot certificates

# Testar acesso HTTPS
curl -I https://deliciassonhosdemell.com.br
```

## 🔄 Renovação Automática

O certificado SSL será renovado automaticamente pelo container `certbot` que roda a cada 12 horas. O Nginx é recarregado automaticamente após a renovação.

## ⚠️ Troubleshooting

### Erro: "Certificado não encontrado"
- Verifique se o certificado foi gerado: `ls -la certbot/conf/live/deliciassonhosdemell.com.br/`
- Execute novamente: `./scripts/setup-ssl-delicias.sh`

### Erro: "DNS não configurado"
- Verifique se o DNS está apontando corretamente
- Aguarde a propagação do DNS (pode levar até 24 horas)
- Teste: `nslookup deliciassonhosdemell.com.br`

### Erro: "Diretório de validação não acessível"
- Verifique se o Nginx está rodando: `docker compose ps nginx`
- Verifique os logs: `docker compose logs nginx`
- Certifique-se de que a porta 80 está aberta no firewall

### Aplicação na porta 8085 não responde
- Verifique se a aplicação está rodando: `netstat -tuln | grep 8085`
- No Linux, `host.docker.internal` pode não funcionar. Use o IP do host ou configure uma rede Docker compartilhada

## 📝 Notas

- O certificado SSL é válido por 90 dias e será renovado automaticamente
- O domínio `deliciassonhosdemell.com.br` redireciona para `http://host.docker.internal:8085`
- Se estiver usando Linux, pode ser necessário ajustar `host.docker.internal` para o IP do host

