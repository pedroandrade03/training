# 🚀 Guia Passo a Passo: Configurar Supabase e Testar

Este guia vai te levar do zero até ter o app funcionando completamente!

---

## 📋 Passo 1: Criar Conta e Projeto no Supabase

### 1.1. Acesse o Supabase
- Vá para: **https://supabase.com**
- Clique em **"Start your project"** ou **"Sign in"**

### 1.2. Crie uma Conta (se necessário)
- Use GitHub, Google ou email
- A conta gratuita é suficiente para começar

### 1.3. Crie um Novo Projeto
1. Clique em **"New Project"**
2. Preencha:
   - **Name**: `gym-load-tracker` (ou qualquer nome)
   - **Database Password**: Crie uma senha forte (anote ela!)
   - **Region**: Escolha a mais próxima (ex: `South America (São Paulo)`)
3. Clique em **"Create new project"**
4. ⏳ Aguarde 2-3 minutos enquanto o projeto é criado

---

## 🔑 Passo 2: Obter as Credenciais

### 2.1. Acesse as Configurações do Projeto
1. No dashboard do Supabase, clique no ícone de **engrenagem (⚙️)** no menu lateral
2. Clique em **"API"** ou **"Settings" → "API"**

### 2.2. Copie as Credenciais
Você verá várias informações, mas você precisa de apenas duas:

1. **Project URL** (URL do Projeto)
   - Exemplo: `https://abcdefghijklmnop.supabase.co`
   - Copie essa URL completa
   - Está na seção "Project URL" ou "API URL"

2. **publishable** key ou **anon public** key (Chave Pública)
   - Pode aparecer como "publishable API key" ou "anon public"
   - É uma string longa começando com `eyJ...`
   - Copie essa chave completa
   - ⚠️ **NÃO use a "service_role" key** (ela é secreta!)

💡 **Dica**: Mantenha essas informações abertas, você vai precisar delas!

---

## 📝 Passo 3: Configurar Variáveis de Ambiente

### 3.1. Criar o arquivo `.env.local`

No terminal, na raiz do projeto (`training`), execute:

```bash
# Windows (PowerShell)
New-Item -ItemType File -Path .env.local

# Ou simplesmente crie o arquivo manualmente
```

### 3.2. Adicionar as Credenciais

Abra o arquivo `.env.local` e adicione (substitua pelos seus valores reais):

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-publishable-api-key-aqui
```

💡 **Onde encontrar:**
- **Project URL**: Na seção "Project URL" ou "API URL"
- **publishable key**: Na seção "Project API keys" → procure por "publishable" ou "anon public"

⚠️ **IMPORTANTE**: 
- Substitua `https://seu-projeto-id.supabase.co` pela sua URL real
- Substitua pela sua **publishable API key** (não use a service_role!)
- A chave deve começar com `eyJ...`
- Não use espaços ou aspas extras
- Não commite este arquivo no Git (já está no .gitignore)

---

## 🗄️ Passo 4: Configurar o Banco de Dados

### 4.1. Abrir o SQL Editor
1. No dashboard do Supabase, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New query"** (botão no canto superior direito)

### 4.2. Executar a Migration
1. Abra o arquivo `supabase/migrations/001_initial_schema.sql` no seu editor
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (ou pressione `Ctrl+Enter`)

✅ **Resultado esperado**: Você deve ver uma mensagem de sucesso e as tabelas serão criadas.

### 4.3. Verificar se Funcionou
1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver 3 tabelas:
   - ✅ `profiles`
   - ✅ `exercises`
   - ✅ `workout_logs`

Se todas aparecerem, está tudo certo! 🎉

---

## 🚀 Passo 5: Iniciar o App

### 5.1. Instalar Dependências (se ainda não fez)
```bash
npm install
```

### 5.2. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

### 5.3. Acessar o App
- Abra seu navegador em: **http://localhost:3000**
- Você deve ver a tela de login! 🎉

---

## 👤 Passo 6: Criar sua Primeira Conta

### 6.1. Registrar-se
1. Na tela de login, clique em **"Não tem uma conta? Criar conta"**
2. Preencha:
   - **Email**: Seu email (ex: `teste@email.com`)
   - **Senha**: Mínimo 6 caracteres
3. Clique em **"Criar Conta"**

### 6.2. Verificar Email (Opcional)
- O Supabase pode enviar um email de confirmação
- Se aparecer, verifique seu email e clique no link
- Se não aparecer, pode continuar mesmo assim (em desenvolvimento)

### 6.3. Fazer Login
1. Após criar a conta, faça login com email e senha
2. Você será redirecionado para a página **"Meus Treinos"**

---

## 🔧 Passo 7: Tornar-se Administrador

Para poder criar e gerenciar exercícios, você precisa ser admin:

### 7.1. Acessar a Tabela Profiles
1. No Supabase Dashboard, vá em **"Table Editor"**
2. Clique na tabela **`profiles`**

### 7.2. Editar seu Perfil
1. Encontre a linha com seu email
2. Clique na célula da coluna **`is_admin`**
3. Altere de `false` para `true`
4. Pressione `Enter` ou clique em **"Save"**

### 7.3. Verificar no App
1. Volte para o app (http://localhost:3000)
2. Faça logout e login novamente (para atualizar a sessão)
3. Agora você deve ver a aba **"Admin"** na barra de navegação inferior! 👑

---

## ✅ Passo 8: Testar Todas as Funcionalidades

### 8.1. Criar Exercícios (Admin)
1. Vá para a aba **"Admin"**
2. Clique em **"Novo Exercício"**
3. Preencha:
   - **Nome**: `Supino Reto`
   - **Repetições Sugeridas**: `3x10`
4. Clique em **"Criar"**
5. Repita para criar mais exercícios (ex: `Agachamento`, `Remada`)

### 8.2. Registrar Treino (Aluno)
1. Vá para a aba **"Treino"**
2. Você verá os exercícios criados
3. Clique em **"Registrar"** em um exercício
4. Preencha:
   - **Peso**: `50.5` (kg)
   - **Repetições**: `10`
5. Clique em **"Salvar"**
6. O **PR (Recorde Pessoal)** será atualizado automaticamente!

### 8.3. Ver Histórico
1. Vá para a aba **"Histórico"**
2. Você verá todos os seus registros organizados por data

### 8.4. Ver Perfil
1. Vá para a aba **"Perfil"**
2. Veja suas informações e opção de logout

---

## 🐛 Troubleshooting (Solução de Problemas)

### ❌ Erro: "Invalid API key"
**Solução**: Verifique se copiou a chave completa no `.env.local` e reinicie o servidor (`npm run dev`)

### ❌ Erro: "relation does not exist"
**Solução**: Execute novamente a migration SQL no Supabase

### ❌ Erro: "new row violates row-level security policy"
**Solução**: 
- Verifique se está logado
- Certifique-se de que executou a migration completa
- Tente fazer logout e login novamente

### ❌ Não consigo criar exercícios
**Solução**: 
- Verifique se `is_admin = true` na tabela `profiles`
- Faça logout e login novamente

### ❌ O servidor não inicia
**Solução**: 
- Verifique se o arquivo `.env.local` existe
- Verifique se as variáveis estão corretas (sem espaços extras)
- Tente deletar `node_modules` e executar `npm install` novamente

---

## 🎉 Pronto!

Agora você tem tudo configurado e funcionando! 

### Próximos Passos Sugeridos:
1. ✅ Criar mais exercícios
2. ✅ Registrar vários treinos
3. ✅ Testar em um dispositivo móvel (abrir no celular)
4. ✅ Criar mais contas de usuário para testar
5. ✅ Explorar as funcionalidades de admin

### Dicas:
- 📱 O app é otimizado para mobile - teste no celular!
- 🔄 O PR (Recorde Pessoal) é calculado automaticamente
- 👥 Cada usuário vê apenas seus próprios registros
- 🔒 Apenas admins podem criar/editar exercícios

**Divirta-se testando! 💪**

