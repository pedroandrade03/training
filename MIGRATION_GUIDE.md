# Guia de Migração - Novas Funcionalidades

## 🎯 Novas Funcionalidades Implementadas

### 1. Filtro por Categoria de Exercício
- **Categorias disponíveis**: Push, Pull, Legs, Upper, Lower
- Filtro na tela inicial (Treino) para facilitar a busca
- Badge visual mostrando a categoria de cada exercício

### 2. Sistema de Múltiplas Séries com Flag de Ajuda
- Registro de múltiplas séries por treino
- Cada série pode ter:
  - Peso (kg)
  - Repetições
  - Flag "Teve ajuda/spotter"
- Histórico mostra todas as séries de forma organizada

---

## 📋 Passos para Aplicar as Mudanças

### 1. Executar a Nova Migration SQL

No Supabase Dashboard:
1. Vá para **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `supabase/migrations/002_add_categories_and_sets.sql`
4. Execute a query (Run)

Isso irá:
- Adicionar coluna `category` na tabela `exercises`
- Criar tabela `workout_sets` para armazenar múltiplas séries
- Configurar Row Level Security (RLS) para a nova tabela

### 2. Atualizar Exercícios Existentes (Opcional)

Se você já tem exercícios cadastrados, pode atualizar suas categorias:

```sql
-- Exemplo: Atualizar categorias de alguns exercícios
UPDATE exercises SET category = 'push' WHERE name ILIKE '%supino%';
UPDATE exercises SET category = 'pull' WHERE name ILIKE '%remada%';
UPDATE exercises SET category = 'legs' WHERE name ILIKE '%agachamento%';
```

### 3. Reiniciar o Servidor

```bash
npm run dev
```

---

## 🎨 Como Usar

### Criar Exercício com Categoria

1. Vá para a aba **Admin**
2. Clique em **Novo Exercício**
3. Preencha:
   - Nome do exercício
   - Repetições sugeridas (ex: `2x5-9`)
   - **Categoria** (selecione Push, Pull, Legs, Upper ou Lower)
4. Clique em **Criar**

### Registrar Múltiplas Séries

1. Na aba **Treino**, clique em **Registrar** em um exercício
2. Preencha a primeira série:
   - Peso (kg)
   - Repetições
   - Marque "Teve ajuda/spotter" se necessário
3. Clique em **Adicionar Série** para mais séries
4. Preencha todas as séries realizadas
5. Clique em **Salvar Treino**

**Exemplo**: Se o exercício sugere `2x5-9`:
- Série 1: 50kg, 9 reps, sem ajuda
- Série 2: 46.5kg, 6 reps, com ajuda ✓

### Filtrar por Categoria

1. Na aba **Treino**, use os botões de filtro no topo
2. Clique em **Push**, **Pull**, **Legs**, **Upper** ou **Lower**
3. Clique em **Todos** para ver todos os exercícios

---

## 📊 Estrutura de Dados

### Tabela `exercises` (atualizada)
- `category` (TEXT, nullable): Categoria do exercício

### Nova Tabela `workout_sets`
- `id` (UUID): ID único
- `workout_log_id` (UUID): Referência ao workout_log
- `set_number` (INTEGER): Número da série (1, 2, 3...)
- `weight` (DECIMAL): Peso em kg
- `reps` (INTEGER): Número de repetições
- `assisted` (BOOLEAN): Se teve ajuda/spotter
- `created_at` (TIMESTAMP): Data de criação

---

## 🔄 Compatibilidade

- **Registros antigos**: Continuam funcionando normalmente
- **Novos registros**: Usam o sistema de múltiplas séries
- **PR (Recorde Pessoal)**: Calcula corretamente tanto de registros antigos quanto novos

---

## 💡 Dicas

1. **Categorias**: Use categorias consistentes para facilitar a organização
2. **Múltiplas Séries**: Registre todas as séries do treino para ter um histórico completo
3. **Flag de Ajuda**: Use quando precisar de spotter ou ajuda para completar a série
4. **Histórico**: Visualize todas as séries organizadas por data no histórico

---

## 🐛 Troubleshooting

### Erro: "relation workout_sets does not exist"
- Execute a migration SQL `002_add_categories_and_sets.sql`

### Categorias não aparecem
- Verifique se a coluna `category` foi adicionada na tabela `exercises`
- Atualize os exercícios existentes com categorias

### Séries não são salvas
- Verifique se a tabela `workout_sets` foi criada
- Verifique as políticas RLS da tabela

