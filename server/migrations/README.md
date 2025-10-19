# 📊 Database Migrations

Migrations SQL para o banco de dados Supabase.

## 🚀 Como Aplicar

### Opção 1: Supabase Dashboard (Recomendado)

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Copie e cole o conteúdo de `001_initial_schema.sql`
5. Clique em **Run**
6. Verifique se não há erros

### Opção 2: CLI do Supabase

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Link com projeto
supabase link --project-ref your-project-ref

# Aplicar migration
supabase db push
```

### Opção 3: psql (Avançado)

```bash
# Conectar ao banco
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Executar migration
\i 001_initial_schema.sql
```

## 📋 Migrations Disponíveis

| # | Nome | Descrição | Status |
|---|------|-----------|--------|
| 001 | initial_schema.sql | Schema inicial completo | ✅ Pronto |

## 🔍 Verificar Instalação

Após aplicar a migration, execute no SQL Editor:

```sql
-- Listar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Deve retornar:
-- battle_log
-- chunk_asteroids
-- chunk_changes
-- chunks
-- player_inventory
-- player_state

-- Verificar RLS ativado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Todos devem ter rowsecurity = true
```

## 📊 Tabelas Criadas

### 1. `player_state`
- Estado em tempo real dos jogadores
- Posição (x, y, current_chunk)
- Stats (health, energy, resources)
- Inventory básico (armor, weapon_damage)

### 2. `chunks`
- Chunks gerados proceduralmente
- Zona (safe/transition/hostile)
- Seed determinística
- Metadata de descoberta

### 3. `chunk_asteroids`
- Asteroides dentro de cada chunk
- Recursos e tipo
- Status de depleção

### 4. `battle_log`
- Histórico de combates PvP
- Attacker/Defender
- Dano e resultado

### 5. `player_inventory`
- Inventário de itens
- Quantidade e raridade
- Itens equipados

### 6. `chunk_changes`
- Auditoria de mudanças em chunks
- Opcional para tracking

## 🔐 RLS Policies

Todas as tabelas têm Row Level Security habilitado:

- ✅ **player_state**: Usuários veem apenas seus dados
- ✅ **chunks**: Público para leitura, server para escrita
- ✅ **chunk_asteroids**: Público para leitura, server para escrita
- ✅ **battle_log**: Combatentes veem seus logs
- ✅ **player_inventory**: Usuários veem apenas seu inventário
- ✅ **chunk_changes**: Público para leitura, server para escrita

## 🐛 Troubleshooting

### Erro: "relation already exists"

Algumas tabelas já existem. Opções:
1. Dropar tabelas antigas: `DROP TABLE table_name CASCADE;`
2. Modificar migration para `CREATE TABLE IF NOT EXISTS`

### Erro: "permission denied"

Você precisa ser owner do database ou ter role `service_role`.

### Erro: "auth.users does not exist"

O schema `auth` é gerenciado pelo Supabase. Certifique-se de estar executando no projeto correto.

## 📝 Próximas Migrations

Futuras migrations devem seguir o padrão:

```
002_add_npc_system.sql
003_add_quests.sql
004_add_guilds.sql
```

Sempre incremente o número e use nomes descritivos.

---

**Status**: ✅ Migration 001 pronta para aplicação  
**Última atualização**: 2025-10-19

