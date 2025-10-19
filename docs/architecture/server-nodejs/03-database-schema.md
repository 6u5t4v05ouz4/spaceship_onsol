# 💾 Database Schema & Índices

Setup completo de database, RLS policies e índices para produção.

---

## 📊 Phase 1: RLS Policies (Supabase)

Row Level Security garante que cada usuário só acesse seus dados.

### 1.1 Habilitar RLS

```sql
-- Habilitar em todas as tabelas críticas
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunk_changes ENABLE ROW LEVEL SECURITY;
```

### 1.2 Policies para Tabela `players`

```sql
-- Usuários veem seus próprios dados
CREATE POLICY "Users can view own data"
ON players FOR SELECT
USING (auth.uid() = id);

-- Usuários atualizam seus próprios dados
CREATE POLICY "Users can update own data"
ON players FOR UPDATE
USING (auth.uid() = id);

-- Apenas admin/server pode inserir
CREATE POLICY "Admin can insert players"
ON players FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

### 1.3 Policies para Tabela `chunks`

```sql
-- Chunks são públicos para leitura
CREATE POLICY "Chunks are public"
ON chunks FOR SELECT
USING (true);

-- Apenas server pode inserir/atualizar chunks
CREATE POLICY "Server manages chunks"
ON chunks FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
```

### 1.4 Policies para Tabela `battle_logs`

```sql
-- Ambos combatentes podem ler o log
CREATE POLICY "Players can view own battles"
ON battle_logs FOR SELECT
USING (
  auth.uid() = attacker_id OR 
  auth.uid() = defender_id
);

-- Apenas server registra batalhas
CREATE POLICY "Server logs battles"
ON battle_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');
```

### 1.5 Policies para Tabela `chunk_changes`

```sql
-- Público pode ler (alterações de chunks)
CREATE POLICY "Changes are public"
ON chunk_changes FOR SELECT
USING (true);

-- Apenas server registra mudanças
CREATE POLICY "Server records changes"
ON chunk_changes FOR INSERT
WITH CHECK (auth.role() = 'service_role');
```

---

## 🔌 Phase 2: Connection Pooling

Otimizar conexões com banco de dados.

### 2.1 Ativar no Supabase

```
1. Ir para Supabase Dashboard
2. Selecionar projeto
3. Database → Connection Pooling
4. Ativar (ON)
5. Mode: Transaction (recomendado para Node.js)
6. Max pool size: 30
```

### 2.2 Configuração Recomendada

```
Connection Pooling Settings:
├─ Mode: Transaction
├─ Pool Size: 30
├─ Max Client Lifetime: 600s
├─ Session Idle Timeout: 300s
└─ Template DB: postgres
```

### 2.3 URL com Connection Pooling

```
Supabase fornece 2 URLs:

1. URL Padrão (sem pooling):
   postgresql://user:pass@db.supabase.co:5432/postgres

2. URL com Pooling (use esta):
   postgresql://user:pass@db.supabase.co:6543/postgres
   └─ Porta 6543 = conexão via pooler
```

---

## 📇 Phase 3: Índices Essenciais

Criar índices para queries rápidas.

### 3.1 Índices na Tabela `players`

```sql
-- Buscar jogadores por chunk (para broadcast)
CREATE INDEX idx_players_chunk ON players(current_chunk);

-- Filtrar jogadores online
CREATE INDEX idx_players_online ON players(is_online);

-- Ordenar por experiência (rankings)
CREATE INDEX idx_players_experience ON players(experience DESC);

-- Buscar por username
CREATE INDEX idx_players_username ON players(username);

-- Buscar por data de login
CREATE INDEX idx_players_last_login ON players(last_login DESC);
```

### 3.2 Índices na Tabela `chunks`

```sql
-- Buscar chunk por coordenadas (query mais comum)
CREATE INDEX idx_chunks_coords ON chunks(chunk_x, chunk_y);

-- Filtrar por tipo de zona
CREATE INDEX idx_chunks_zone ON chunks(zone_type);

-- Ordenar por distância
CREATE INDEX idx_chunks_distance ON chunks(distance_from_origin);

-- Chunks descobertos recentemente
CREATE INDEX idx_chunks_discovered ON chunks(discovered_at DESC);
```

### 3.3 Índices na Tabela `battle_logs`

```sql
-- Buscar batalhas de um chunk
CREATE INDEX idx_battle_chunk ON battle_logs(chunk_id);

-- Batalhas recentes
CREATE INDEX idx_battle_created ON battle_logs(created_at DESC);

-- Histórico de um jogador
CREATE INDEX idx_battle_attacker ON battle_logs(attacker_id, created_at DESC);
CREATE INDEX idx_battle_defender ON battle_logs(defender_id, created_at DESC);
```

### 3.4 Índices na Tabela `chunk_changes`

```sql
-- Alterações recentes de um chunk
CREATE INDEX idx_changes_chunk ON chunk_changes(chunk_id, created_at DESC);

-- Histórico de um objeto
CREATE INDEX idx_changes_object ON chunk_changes(chunk_id, object_id);
```

---

## ✅ Phase 4: Verificação

### 4.1 Testar RLS Policies

```sql
-- Conectar como usuário comum
SET ROLE authenticated;
SET app.current_user_id = 'user-uuid';

-- Isso deve retornar apenas dados do usuário
SELECT * FROM players;

-- Isso deve retornar error (acesso negado)
SELECT * FROM players WHERE id != 'user-uuid';
```

### 4.2 Testar Connection Pooling

```bash
# Verificar se conexões estão sendo pooladas
psql -h db.supabase.co -p 6543 -U postgres -d postgres

# Ver número de conexões ativas
SELECT count(*) FROM pg_stat_activity;
```

### 4.3 Verificar Índices Criados

```sql
-- Listar todos os índices
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;

-- Verificar índices não utilizados
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## 🔍 Phase 5: Monitoramento de Performance

### 5.1 Queries Lentas

```sql
-- Ativar log de queries lentas
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 segundo

-- Aplicar
SELECT pg_reload_conf();

-- Ver queries lentas
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### 5.2 Uso de Índices

```sql
-- Verificar índices não utilizados
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 
ORDER BY indexrelname;

-- Índices com maior overhead
SELECT schemaname, tablename, indexname, idx_blks_read, idx_blks_hit
FROM pg_stat_user_indexes
ORDER BY (idx_blks_read + idx_blks_hit) DESC
LIMIT 10;
```

---

## 🚨 Phase 6: Troubleshooting

### Problema: RLS policy bloqueando tudo

```
Sintoma: "permission denied for schema public"

Solução:
1. Verificar role do user:
   SELECT current_role;

2. Grant permissões:
   GRANT USAGE ON SCHEMA public TO authenticated;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
```

### Problema: Conexões esgotadas

```
Sintoma: "sorry, too many clients already"

Solução:
1. Aumentar max connections em Supabase
2. Implementar connection retry no Node.js
3. Usar connection pooling (PgBouncer)
```

### Problema: Índices não sendo usados

```
Sintoma: Queries lentas mesmo com índices

Solução:
1. Executar ANALYZE:
   ANALYZE;

2. Verificar plano de execução:
   EXPLAIN ANALYZE SELECT ...;

3. Recriar índice:
   DROP INDEX idx_name;
   CREATE INDEX idx_name ON table(column);
```

---

## 📊 Query Otimizadas para Node.js

### Fetch de Jogadores no Chunk

```js
// ❌ Lento: sem índice
const { data } = await supabase
  .from('players')
  .select('*')
  .eq('current_chunk', '10,5');

// ✅ Rápido: com índice idx_players_chunk
// Usar select mínimo necessário
const { data } = await supabase
  .from('players')
  .select('id, username, x, y, health')
  .eq('current_chunk', '10,5');
```

### Fetch de Chunks por Distância

```js
// ✅ Otimizado: usa índice idx_chunks_distance
const { data } = await supabase
  .from('chunks')
  .select('id, zone_type, biome_file')
  .lt('distance_from_origin', 100)
  .order('distance_from_origin', { ascending: true })
  .limit(50);
```

### Histórico de Batalhas

```js
// ✅ Otimizado: usa índice idx_battle_attacker
const { data } = await supabase
  .from('battle_logs')
  .select('*')
  .eq('attacker_id', userId)
  .order('created_at', { ascending: false })
  .limit(20);
```

---

## 🔐 Segurança Final

```sql
-- Desabilitar privilégios desnecessários
REVOKE ALL ON DATABASE postgres FROM public;
REVOKE ALL ON SCHEMA public FROM public;

-- Apenas authenticated pode usar
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE 
ON ALL TABLES IN SCHEMA public 
TO authenticated;

-- Server role para operações críticas
GRANT ALL PRIVILEGES 
ON ALL TABLES IN SCHEMA public 
TO service_role;
```

---

**Próxima Leitura**: [08 - Estrutura de Pastas](./08-folder-structure.md)
