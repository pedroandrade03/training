# Guia de Deploy com Docker

## 📋 Pré-requisitos

- Docker instalado
- Docker Compose instalado
- Arquivo `.env.local` configurado com as variáveis do Supabase

## 🚀 Deploy Local

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase (se estiver usando Supabase Cloud)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon

# PostgreSQL (se estiver usando PostgreSQL local)
POSTGRES_USER=trainally
POSTGRES_PASSWORD=trainally_password
POSTGRES_DB=trainally
```

### 2. Build e Iniciar

```bash
# Build e iniciar todos os serviços
docker compose up -d --build

# Ver logs
docker compose logs -f app

# Parar serviços
docker compose down

# Parar e remover volumes (apaga dados do PostgreSQL)
docker compose down -v
```

### 3. Aplicar Migrações (se usar PostgreSQL local)

Se estiver usando PostgreSQL local, você precisa aplicar as migrações:

```bash
# Entrar no container do PostgreSQL
docker compose exec postgres psql -U trainally -d trainally

# Ou usar o Supabase CLI se tiver configurado
supabase db push
```

## 🌐 Deploy em Produção

### Opção 1: Usando Supabase Cloud (Recomendado)

1. Configure o Supabase Cloud
2. Use apenas o serviço `app` no docker compose
3. Remova ou comente o serviço `postgres`

```yaml
# docker compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: trainally-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    env_file:
      - .env.local
    restart: unless-stopped
```

### Opção 2: Deploy em Servidor VPS

1. Clone o repositório no servidor
2. Configure o `.env.local`
3. Execute `docker compose up -d --build`
4. Configure um reverse proxy (Nginx) para apontar para `localhost:3000`

### Opção 3: Deploy em Plataformas Cloud

#### Vercel (Recomendado para Next.js)
- Conecte seu repositório GitHub
- Configure as variáveis de ambiente
- Deploy automático

#### Railway
- Conecte o repositório
- Configure variáveis de ambiente
- Railway detecta automaticamente o Dockerfile

#### DigitalOcean App Platform
- Conecte o repositório
- Configure variáveis de ambiente
- Use o Dockerfile para build

## 🔧 Comandos Úteis

```bash
# Rebuild após mudanças
docker compose up -d --build

# Ver logs em tempo real
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f app

# Parar serviços
docker compose stop

# Iniciar serviços
docker compose start

# Remover tudo (incluindo volumes)
docker compose down -v

# Executar comandos no container
docker compose exec app sh

# Ver status dos containers
docker compose ps
```

## 📝 Notas

- O Dockerfile usa `output: "standalone"` para otimizar o build
- O PostgreSQL é opcional se você estiver usando Supabase Cloud
- Certifique-se de que as variáveis de ambiente estão configuradas corretamente
- Para produção, considere usar um reverse proxy (Nginx) com SSL

## 🔒 Segurança

- Nunca commite o arquivo `.env.local`
- Use secrets management em produção
- Configure firewall para expor apenas a porta necessária
- Use HTTPS em produção (configure com Nginx ou similar)

