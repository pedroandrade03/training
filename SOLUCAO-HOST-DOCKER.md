# Solução para host.docker.internal no Linux

## Problema

O Nginx não conseguia resolver `host.docker.internal` no Linux, mesmo com `extra_hosts` configurado no `docker-compose.yml`.

## Solução Aplicada

Foi adicionado um `resolver` no Nginx que usa o DNS interno do Docker (`127.0.0.11`) para resolver `host.docker.internal` dinamicamente.

### Configuração Adicionada

```nginx
resolver 127.0.0.11 valid=30s;
resolver_timeout 5s;

location / {
    set $backend "http://host.docker.internal:8085";
    proxy_pass $backend;
    ...
}
```

### Por que funciona?

1. `127.0.0.11` é o DNS interno do Docker que resolve nomes de hosts configurados via `extra_hosts`
2. Usar uma variável (`$backend`) com `proxy_pass` força o Nginx a resolver o hostname dinamicamente em cada requisição
3. `valid=30s` cacheia a resolução por 30 segundos para melhor performance

## Arquivos Atualizados

- `nginx/nginx.conf` - Configuração HTTP
- `nginx/nginx-ssl.conf` - Configuração SSL (bloco comentado)

## Próximos Passos

1. Copiar a configuração corrigida:
   ```bash
   cp nginx/nginx.conf nginx/nginx.conf.backup  # Backup
   # O arquivo já está corrigido
   ```

2. Reiniciar o Nginx:
   ```bash
   docker compose restart nginx
   ```

3. Verificar se está funcionando:
   ```bash
   docker compose logs nginx
   docker compose exec nginx nginx -t
   ```

## Alternativa (se ainda não funcionar)

Se ainda houver problemas, você pode usar o IP do gateway do Docker diretamente:

```nginx
# Descobrir o IP do gateway
docker network inspect trainally-network | grep Gateway

# Usar no nginx.conf
proxy_pass http://172.17.0.1:8085;  # Substitua pelo IP real
```

Mas a solução com `resolver` é mais robusta e funciona automaticamente.

