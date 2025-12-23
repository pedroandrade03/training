# Guia de Atribuição de Exercícios

## 🎯 Nova Funcionalidade

Agora você pode atribuir exercícios para usuários específicos! Quando criar ou editar um exercício, você pode selecionar para quais usuários ele estará disponível.

## 📋 Como Funciona

### Para Administradores

1. **Criar Exercício com Atribuição:**
   - Vá para a aba **Admin**
   - Clique em **Novo Exercício**
   - Preencha os dados do exercício
   - Na seção **"Atribuir para"**, selecione os usuários desejados
   - Se deixar vazio, o exercício ficará disponível para **todos os usuários**

2. **Editar Atribuições:**
   - Clique no botão de **Editar** em um exercício
   - Modifique a lista de usuários atribuídos
   - Salve as alterações

### Para Alunos

- Alunos **só veem** exercícios que:
  - Não têm atribuições (disponíveis para todos)
  - Estão atribuídos especificamente para eles

- Alunos **não veem** exercícios atribuídos para outros usuários

## 🔧 Configuração

### 1. Executar a Migration SQL

No Supabase Dashboard:
1. Vá para **SQL Editor**
2. Execute o arquivo `supabase/migrations/003_add_exercise_assignments.sql`

Isso criará:
- Tabela `exercise_assignments` para relacionar exercícios e usuários
- Políticas de segurança (RLS) adequadas

### 2. Reiniciar o Servidor

```bash
npm run dev
```

## 💡 Casos de Uso

### Exemplo 1: Exercício para Todos
- Crie o exercício sem selecionar nenhum usuário
- Todos os alunos poderão ver e usar o exercício

### Exemplo 2: Exercício Personalizado
- Crie o exercício selecionando usuários específicos
- Apenas esses usuários verão o exercício na lista

### Exemplo 3: Treino Individualizado
- Crie diferentes exercícios para diferentes alunos
- Cada aluno verá apenas seus exercícios atribuídos

## 📊 Estrutura de Dados

### Nova Tabela `exercise_assignments`
- `id` (UUID): ID único
- `exercise_id` (UUID): Referência ao exercício
- `user_id` (UUID): Referência ao usuário
- `assigned_by` (UUID): Quem atribuiu (admin)
- `created_at` (TIMESTAMP): Data de criação

## 🔒 Segurança

- **Admins**: Podem ver e gerenciar todas as atribuições
- **Alunos**: Só veem exercícios atribuídos para eles ou sem atribuições
- **RLS**: Políticas de segurança garantem que cada usuário só vê o que deve ver

## 🎨 Interface

### No Formulário de Exercício
- Lista de checkboxes com todos os usuários
- Indicação de quantos usuários estão selecionados
- Se nenhum for selecionado, o exercício fica disponível para todos

### Na Lista de Exercícios (Admin)
- Mostra para quem cada exercício está atribuído
- Indica "Disponível para todos" se não houver atribuições

## ⚠️ Importante

- **Exercícios existentes**: Continuam disponíveis para todos até serem editados
- **Atribuições múltiplas**: Um exercício pode ser atribuído para vários usuários
- **Sem atribuições = Para todos**: Se não selecionar ninguém, todos veem

