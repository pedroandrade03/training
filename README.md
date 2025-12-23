# Gym Load Tracker

Um Web App mobile-first para acompanhamento de progressão de carga na academia, desenvolvido com Next.js 14, Tailwind CSS, shadcn/ui e Supabase.

## 🚀 Funcionalidades

- **Sistema de Autenticação**: Login e registro com Supabase Auth
- **Dois Níveis de Acesso**:
  - **Aluno**: Visualiza treinos, registra cargas e vê histórico
  - **Admin**: Gerencia exercícios (criar, editar, excluir)
- **Registro Rápido**: Drawer mobile para registro rápido de peso e repetições
- **Recorde Pessoal (PR)**: Exibição automática do maior peso registrado por exercício
- **Histórico**: Visualização de todos os registros organizados por data
- **Design Mobile-First**: Interface otimizada para dispositivos móveis com Bottom Navigation Bar

## 📋 Pré-requisitos

- Node.js 20.9.0 ou superior
- Conta no Supabase (gratuita)
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd training
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env.local` na raiz do projeto
   - Adicione suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Configure o banco de dados no Supabase:
   - Acesse o SQL Editor no Supabase Dashboard
   - Execute o script SQL localizado em `supabase/migrations/001_initial_schema.sql`
   - Isso criará as tabelas necessárias e as políticas de segurança (RLS)

5. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse [http://localhost:3000](http://localhost:3000)

## 🗄️ Estrutura do Banco de Dados

O banco de dados possui três tabelas principais:

- **profiles**: Perfis de usuários com flag `is_admin`
- **exercises**: Exercícios disponíveis com nome e repetições sugeridas
- **workout_logs**: Registros de treino (peso, repetições, data)

Todas as tabelas possuem Row Level Security (RLS) configurado para garantir segurança dos dados.

## 👤 Criando um Usuário Admin

Para criar um usuário administrador, você precisa:

1. Criar uma conta normalmente através da interface de registro
2. No Supabase Dashboard, vá para a tabela `profiles`
3. Encontre o usuário e altere o campo `is_admin` para `true`

## 📱 Tecnologias Utilizadas

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização utilitária
- **shadcn/ui**: Componentes UI acessíveis
- **Supabase**: Backend (PostgreSQL + Auth)
- **TanStack Query**: Gerenciamento de estado do servidor
- **Lucide React**: Ícones
- **Vaul**: Drawer mobile
- **date-fns**: Formatação de datas

## 🎨 Design

- **Dark Mode**: Interface em modo escuro por padrão
- **Mobile-First**: Layout otimizado para telas móveis
- **Touch-Friendly**: Botões com tamanho mínimo de 44x44px
- **Viewport Meta**: Bloqueia zoom acidental em inputs (iOS)

## 📝 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria build de produção
- `npm run start`: Inicia o servidor de produção
- `npm run lint`: Executa o linter

## 🔒 Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Autenticação gerenciada pelo Supabase Auth
- Middleware protege rotas autenticadas
- Políticas de acesso diferenciadas para Admin e Aluno

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.
