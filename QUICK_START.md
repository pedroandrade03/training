# ⚡ Quick Start - Configuração Rápida

## 🎯 Resumo em 5 Passos

### 1️⃣ Criar Projeto no Supabase
- Acesse: https://supabase.com
- Crie um projeto (gratuito)
- Anote: **URL** e **publishable API key** (ou "anon public" key)

### 2️⃣ Criar arquivo `.env.local`
Execute no terminal:
```bash
# Windows PowerShell
.\setup-env.ps1

# Ou crie manualmente:
# Crie um arquivo .env.local com:
NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-publishable-api-key-aqui
```

### 3️⃣ Executar Migration SQL
- No Supabase Dashboard → **SQL Editor**
- Copie e cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
- Clique em **Run**

### 4️⃣ Iniciar o App
```bash
npm run dev
```

### 5️⃣ Criar Conta e Tornar-se Admin
- Acesse: http://localhost:3000
- Crie uma conta
- No Supabase Dashboard → **Table Editor** → `profiles`
- Altere `is_admin` para `true` no seu usuário
- Faça logout e login novamente

## ✅ Pronto para usar!

📖 **Guia completo**: Veja `GUIA_CONFIGURACAO.md` para instruções detalhadas

