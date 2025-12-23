# Guia do Dashboard

## 📊 Funcionalidades

O dashboard fornece uma visão completa da progressão de carga de todos os usuários, incluindo:

1. **Ranking de Progressão**: Classificação baseada na soma dos recordes pessoais (PRs)
2. **Métricas Individuais**: Estatísticas pessoais de cada usuário
3. **Progressão por Exercício**: Detalhamento dos PRs por exercício

## 🚀 Como Aplicar a Migração

Para ativar o dashboard, você precisa aplicar a migração `009_add_dashboard_functions.sql`:

### Via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie o conteúdo de `supabase/migrations/009_add_dashboard_functions.sql`
4. Cole e execute no editor SQL

### Via Supabase CLI

```bash
supabase db push
```

## 📈 Métricas Calculadas

### Ranking de Progressão

- **Total de PRs**: Soma de todos os recordes pessoais (maior peso levantado em cada exercício)
- **Total de Exercícios com PR**: Quantidade de exercícios em que o usuário tem um recorde
- **Volume Total**: Soma de peso × repetições de todos os treinos
- **Volume Recente**: Volume dos últimos 30 dias

### Progressão por Exercício

- **PR por Exercício**: Maior peso levantado em cada exercício
- **Data do PR**: Quando o recorde foi estabelecido
- **Total de Treinos**: Quantidade de vezes que o exercício foi realizado
- **Último Treino**: Data do último registro

## 🎯 Como Usar

1. Acesse a aba **Dashboard** na navegação inferior
2. Veja suas estatísticas no topo da página
3. Role para baixo para ver o ranking completo
4. Veja sua progressão detalhada por exercício na seção inferior

## 🔒 Segurança

As funções RPC usam `SECURITY DEFINER` para calcular métricas de todos os usuários, mas os dados são filtrados por RLS (Row Level Security) para garantir que apenas dados apropriados sejam exibidos.

## 📱 Design Mobile-First

O dashboard foi projetado para ser totalmente responsivo e otimizado para dispositivos móveis, seguindo os mesmos princípios de UX do resto da aplicação.

