# Configuração do Supabase

## Passos para Configurar o Banco de Dados

1. **Criar um projeto no Supabase**
   - Acesse [https://supabase.com](https://supabase.com)
   - Crie uma conta (se ainda não tiver)
   - Crie um novo projeto
   - Anote a URL do projeto e a chave anônima (anon key)

2. **Configurar Variáveis de Ambiente**
   - Crie um arquivo `.env.local` na raiz do projeto
   - Adicione as seguintes variáveis:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-publishable-api-key-aqui
   ```
   
   💡 **Onde encontrar no Supabase:**
   - Settings → API → **Project URL** (copie a URL completa)
   - Settings → API → **Project API keys** → procure por **"publishable"** ou **"anon public"**
   - ⚠️ **NÃO use a "service_role" key** - ela é secreta e não deve ser exposta!

3. **Executar a Migration SQL**
   - No Supabase Dashboard, vá para "SQL Editor"
   - Clique em "New Query"
   - Copie e cole o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`
   - Execute a query (Run)
   - Verifique se as tabelas foram criadas corretamente:
     - `profiles`
     - `exercises`
     - `workout_logs`

4. **Verificar Row Level Security (RLS)**
   - As políticas RLS já estão incluídas na migration
   - Elas garantem que:
     - Usuários só vejam seus próprios perfis e logs
     - Todos podem ver exercícios
     - Apenas admins podem criar/editar/excluir exercícios

5. **Criar um Usuário Admin (Opcional)**
   - Registre-se normalmente através da interface do app
   - No Supabase Dashboard, vá para a tabela `profiles`
   - Encontre seu usuário pelo email
   - Edite o campo `is_admin` e altere para `true`
   - Salve as alterações

## Estrutura das Tabelas

### profiles
- `id` (UUID, PK, FK para auth.users)
- `email` (TEXT)
- `name` (TEXT)
- `avatar_url` (TEXT, nullable)
- `is_admin` (BOOLEAN, default: false)
- `created_at` (TIMESTAMP)

### exercises
- `id` (UUID, PK)
- `name` (TEXT, NOT NULL)
- `suggested_reps` (TEXT, NOT NULL)
- `created_by` (UUID, FK para auth.users, nullable)
- `created_at` (TIMESTAMP)

### workout_logs
- `id` (UUID, PK)
- `user_id` (UUID, FK para auth.users)
- `exercise_id` (UUID, FK para exercises)
- `weight` (DECIMAL(10,2), NOT NULL)
- `reps` (INTEGER, NOT NULL)
- `logged_at` (TIMESTAMP)

## Troubleshooting

### Erro: "relation does not exist"
- Certifique-se de que executou a migration SQL completa
- Verifique se está conectado ao projeto correto no Supabase

### Erro: "new row violates row-level security policy"
- Verifique se as políticas RLS estão ativas
- Certifique-se de que o usuário está autenticado

### Usuário não consegue criar exercícios
- Verifique se o campo `is_admin` está como `true` na tabela `profiles`
- Certifique-se de que o usuário está logado

