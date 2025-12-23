# Guia de Progressão e Gráficos

## 📊 Novas Funcionalidades

### 1. Ranking de Progressão
- **Baseado na evolução desde a primeira carga**: Calcula a porcentagem de melhoria desde o primeiro registro até o PR atual
- **Métricas**:
  - **Total de Progressão**: Soma das porcentagens de progressão de todos os exercícios
  - **Média de Progressão**: Média das porcentagens de progressão
  - **Exercícios com Progressão**: Quantidade de exercícios em que houve evolução
  - **Comparação**: Mostra peso inicial → peso atual (PR)

### 2. Gráfico de Área de Progressão
- **Visualização temporal**: Mostra a evolução das cargas ao longo do tempo
- **Filtro por exercício**: Permite visualizar todos os exercícios ou filtrar por um específico
- **Múltiplas linhas**: Cada exercício tem sua própria linha no gráfico
- **Tooltip interativo**: Mostra valores detalhados ao passar o mouse

## 🚀 Como Aplicar a Migração

Para ativar as novas funcionalidades, você precisa aplicar a migração `010_add_progression_ranking.sql`:

### Via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie o conteúdo de `supabase/migrations/010_add_progression_ranking.sql`
4. Cole e execute no editor SQL

### Via Supabase CLI

```bash
supabase db push
```

## 📈 Como Funciona

### Cálculo de Progressão

Para cada exercício de cada usuário:
1. Identifica a **primeira carga** registrada
2. Identifica o **PR atual** (maior peso levantado)
3. Calcula a **porcentagem de progressão**: `((PR - Primeira Carga) / Primeira Carga) × 100`

### Ranking

O ranking ordena os usuários por:
1. **Total de Progressão** (soma de todas as progressões)
2. **Média de Progressão** (em caso de empate)

### Gráfico de Progressão

O gráfico mostra:
- **Eixo X**: Datas dos treinos
- **Eixo Y**: Peso máximo levantado (kg)
- **Linhas**: Uma linha por exercício (quando "Todos os exercícios" está selecionado)
- **Área preenchida**: Visualização de área para facilitar a leitura

## 🎯 Como Usar

1. **Ranking de Progressão**:
   - Acesse a aba **Dashboard**
   - Role até a seção "Ranking de Progressão"
   - Veja sua posição e a evolução de outros usuários

2. **Gráfico de Progressão**:
   - Na mesma página, veja o gráfico no topo
   - Use o filtro para visualizar um exercício específico ou todos
   - Passe o mouse sobre os pontos para ver detalhes

## 🔒 Segurança

As funções RPC usam `SECURITY DEFINER` para calcular métricas, mas respeitam RLS (Row Level Security) para garantir que apenas dados apropriados sejam exibidos.

## 📱 Design Mobile-First

Todas as funcionalidades foram projetadas para serem totalmente responsivas e otimizadas para dispositivos móveis.

