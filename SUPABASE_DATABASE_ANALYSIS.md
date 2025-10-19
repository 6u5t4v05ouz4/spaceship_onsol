# 📊 Análise Completa do Banco de Dados Supabase

**Projeto:** spaceshiponsol  
**Data:** 2025-10-19  
**Total de Tabelas:** 24 tabelas no schema `public`

---

## 🎯 **Tabelas Principais do Sistema**

### 1. **user_profiles** ✅ (Tabela Principal de Usuários)
- **Linhas:** 1 usuário
- **RLS:** Ativado ✅
- **Descrição:** Perfis unificados de usuários (Google OAuth + Solana Wallet)

**Colunas:**
- `id` (uuid, PK)
- `google_email` (text, unique) - Email do Google OAuth
- `wallet_address` (text, unique) - Endereço da carteira Solana
- `display_name` (text) - Nome de exibição
- `avatar_url` (text) - URL do avatar
- `ship_type` (text, default: 'default_idle') ✨ **NOVO**
- `ship_rarity` (text, default: 'Comum') ✨ **NOVO**
- `created_at`, `updated_at`

**Foreign Keys:** 16 relacionamentos (é a tabela central do sistema)

---

### 2. **game_sessions** (Sessões Ativas de Jogo)
- **Linhas:** 0
- **RLS:** Ativado ✅
- **Descrição:** Gerencia sessões de jogo com estado atual do jogador

**Colunas Principais:**
- `session_token` (text, unique) - Token único da sessão
- `user_id` → `user_profiles.id`
- `selected_ship_nft_mint` (text) - NFT da nave selecionada
- `game_mode` (pve/pvp)
- Estado atual: `current_fuel`, `current_oxygen`, `current_shield`, `current_cargo_weight`
- Localização: `current_location_x`, `current_location_y`

---

### 3. **player_stats** (Estatísticas do Jogador)
- **Linhas:** 1
- **RLS:** Ativado ✅
- **Descrição:** Estatísticas gerais acumuladas

**Métricas:**
- `total_play_time_seconds`
- `sessions_count`
- `planets_discovered`
- `total_resources_mined` (jsonb)
- `total_tokens_earned`
- `battles_won`, `total_battles`
- `total_items_crafted`
- `distance_traveled`

---

### 4. **player_wallet** (Carteira de Tokens)
- **Linhas:** 1
- **RLS:** Ativado ✅
- **Descrição:** Saldo atual de tokens do jogador

**Colunas:**
- `user_id` (unique) → `user_profiles.id`
- `space_tokens` (integer, default: 0) - Moeda do jogo
- `sol_tokens` (numeric, default: 0) - SOL da blockchain
- `updated_at`

---

## 🚀 **Sistema de Naves**

### 5. **ship_nfts** (NFTs de Naves)
- **Linhas:** 0
- **RLS:** Desativado ❌
- **Descrição:** NFTs de naves coletadas pelos jogadores

**Atributos da Nave:**
- `mint_address` (unique) - Endereço do NFT
- `owner_wallet` - Dono atual
- `rarity` - Comum, Incomum, Raro, Épico, Lendário
- Stats: `speed`, `cargo_capacity`, `max_fuel`, `max_oxygen`, `max_shield`
- `verified` (boolean) - NFT verificado

**Validações:**
- Speed: 100-500
- Cargo: 50-200
- Fuel/Oxygen: 100-300
- Shield: 100-500

---

## 👥 **Sistema de Tripulação**

### 6. **crew_members** (Tipos de Tripulantes)
- **Linhas:** 0
- **RLS:** Desativado ❌
- **Descrição:** Tripulantes disponíveis para contratação

**Especializações:**
- Piloto, Engenheiro, Navegador, Médico, Mercador

**Bônus:**
- `speed_bonus`, `cargo_bonus`, `fuel_efficiency_bonus`
- `oxygen_efficiency_bonus`, `shield_bonus`
- `mining_bonus`, `combat_bonus`
- `hire_cost_tokens`

### 7. **player_crew** (Tripulantes Contratados)
- **Linhas:** 0
- **RLS:** Ativado ✅
- **Descrição:** Tripulantes ativos do jogador

---

## 📦 **Sistema de Recursos e Inventário**

### 8. **resource_types** (Tipos de Recursos)
- **Linhas:** 0
- **RLS:** Desativado ❌

**Categorias:**
- Metal, Combustível, Oxigênio, Projétil, Especial, Tripulante, Equipamento

**Raridades:**
- Comum, Incomum, Raro, Épico, Lendário, Mítico

### 9. **player_inventory** (Inventário do Jogador)
- **Linhas:** 0
- **RLS:** Ativado ✅
- **Descrição:** Recursos possuídos pelo jogador

---

## ⚙️ **Sistema de Equipamentos**

### 10. **equipment_types** (Tipos de Equipamentos)
- **Linhas:** 0
- **RLS:** Desativado ❌

**Categorias:**
- Arma, Escudo, Motor, Sensor, Carga, Sobrevivência

**Modificadores:**
- Speed, Cargo, Fuel/Oxygen efficiency
- Shield, Mining efficiency, Combat damage

### 11. **player_equipment** (Equipamentos do Jogador)
- **Linhas:** 0
- **RLS:** Ativado ✅
- **Campos:** `equipped` (boolean) - Se está equipado

---

## 🌍 **Sistema de Exploração**

### 12. **discovered_planets** (Planetas Descobertos)
- **Linhas:** 0
- **RLS:** Desativado ❌

**Tipos de Planeta:**
- Rochoso, Gasoso, Gelado, Deserto, Tóxico, Cristalino

**Dados:**
- `coordinate_x`, `coordinate_y`
- `available_resources` (jsonb)
- `mining_difficulty` (1-10)
- `discovered_by` → `user_profiles.id`

### 13. **mining_sessions** (Sessões de Mineração)
- **Linhas:** 0
- **RLS:** Ativado ✅

**Dados da Sessão:**
- `resources_mined` (jsonb)
- `total_weight_mined`
- `tokens_earned`
- `mining_efficiency`
- `is_pvp_session` (boolean)

---

## ⚔️ **Sistema PvP**

### 14. **pvp_battles** (Combates PvP)
- **Linhas:** 0
- **RLS:** Ativado ✅

**Participantes:**
- `attacker_id`, `defender_id`, `winner_id` → `user_profiles.id`
- `planet_id` → `discovered_planets.id`

**Resultados:**
- `battle_result` - attacker_win, defender_win, draw, abandoned
- `contested_resources`, `resources_won` (jsonb)
- `tokens_won`
- Dano: `attacker_damage_dealt`, `defender_damage_dealt`
- `attacker_ship_destroyed`, `defender_ship_destroyed`

### 15. **pvp_rankings** (Rankings PvP)
- **Linhas:** 0
- **RLS:** Ativado ✅

**Estatísticas:**
- `battles_won`, `battles_lost`, `battles_draw`
- `total_damage_dealt`, `total_damage_taken`
- `current_rank`, `current_rating`, `highest_rating`
- `season_id`

---

## 🔨 **Sistema de Craft**

### 16. **craft_recipes** (Receitas de Craft)
- **Linhas:** 0
- **RLS:** Desativado ❌

**Dados da Receita:**
- `result_item_type`, `result_item_id`, `result_quantity`
- `required_resources` (jsonb)
- `required_equipment` (jsonb)
- `required_tokens`
- `difficulty_level` (1-10)
- `craft_time_seconds`

### 17. **craft_sessions** (Sessões de Craft)
- **Linhas:** 0
- **RLS:** Ativado ✅

**Status:**
- in_progress, completed, failed, cancelled

**Dados:**
- `items_created` (jsonb)
- `resources_consumed` (jsonb)
- `success` (boolean)

---

## 🏆 **Sistema de Conquistas**

### 18. **achievements** (Conquistas Disponíveis)
- **Linhas:** 0
- **RLS:** Desativado ❌

**Categorias:**
- Exploração, Mineração, Combate, Craft, Social, Economia

**Recompensas:**
- `reward_tokens`
- `reward_resources` (jsonb)
- `is_hidden` (boolean) - Conquista secreta

### 19. **player_achievements** (Conquistas Desbloqueadas)
- **Linhas:** 0
- **RLS:** Ativado ✅

---

## 💰 **Sistema de Economia**

### 20. **token_transactions** (Transações de Tokens)
- **Linhas:** 0
- **RLS:** Desativado ❌

**Tipos de Transação:**
- earn, spend, convert, royalty

**Dados:**
- `amount`, `currency` (SPACE/SOL)
- `description`, `source`
- `metadata` (jsonb)
- `blockchain_tx_hash` - Hash da transação on-chain
- `blockchain_confirmed` (boolean)

---

## 📝 **Sistema de Logs**

### 21. **player_action_logs** (Logs de Ações)
- **Linhas:** 0
- **RLS:** Ativado ✅

**Dados de Auditoria:**
- `action_type`, `action_data` (jsonb)
- `ip_address`, `user_agent`
- `location_data` (jsonb)

### 22. **system_logs** (Logs do Sistema)
- **Linhas:** 0
- **RLS:** Desativado ❌

**Níveis:**
- DEBUG, INFO, WARN, ERROR, FATAL

---

## 🗄️ **Tabelas Legacy (Antigas)**

### 23. **profiles** (Perfis Antigos)
- **Linhas:** 1
- **RLS:** Desativado ❌
- **Relacionamento:** `auth.users.id`
- **Status:** ⚠️ Tabela antiga, usar `user_profiles` no lugar

### 24. **game_data** (Dados de Jogo Antigos)
- **Linhas:** 1
- **RLS:** Desativado ❌
- **Status:** ⚠️ Tabela antiga, usar `player_stats` no lugar

### 25. **inventory** (Inventário Antigo)
- **Linhas:** 3
- **RLS:** Desativado ❌
- **Status:** ⚠️ Tabela antiga, usar `player_inventory` no lugar

### 26. **nft_ships** (Naves NFT Antigas)
- **Linhas:** 0
- **RLS:** Desativado ❌
- **Status:** ⚠️ Tabela antiga, usar `ship_nfts` no lugar

---

## 🔐 **Resumo de Segurança (RLS)**

### ✅ **Com RLS Ativado (Seguro):**
1. user_profiles
2. game_sessions
3. player_crew
4. player_inventory
5. player_equipment
6. mining_sessions
7. pvp_battles
8. pvp_rankings
9. craft_sessions
10. player_achievements
11. player_wallet
12. player_stats
13. player_action_logs

### ❌ **Sem RLS (Público/Admin):**
1. ship_nfts
2. crew_members
3. resource_types
4. equipment_types
5. discovered_planets
6. craft_recipes
7. achievements
8. token_transactions
9. system_logs
10. profiles (legacy)
11. game_data (legacy)
12. inventory (legacy)
13. nft_ships (legacy)

---

## 📊 **Estatísticas do Banco**

- **Total de Tabelas:** 26
- **Tabelas Ativas:** 22 (novas)
- **Tabelas Legacy:** 4 (antigas, deprecadas)
- **Tabelas com RLS:** 13 (50%)
- **Usuários Cadastrados:** 1
- **Carteiras Criadas:** 1
- **Stats Registrados:** 1

---

## 🎯 **Recomendações**

### ✅ **Implementado:**
1. ✅ Colunas `ship_type` e `ship_rarity` adicionadas em `user_profiles`
2. ✅ Índice criado para performance
3. ✅ Usuário existente atualizado com nave padrão

### 📋 **Próximos Passos:**

1. **Ativar RLS nas tabelas públicas sensíveis:**
   - `ship_nfts` (dados de NFTs dos usuários)
   - `discovered_planets` (planetas descobertos)

2. **Popular tabelas de referência:**
   - `resource_types` - Adicionar tipos de recursos
   - `equipment_types` - Adicionar equipamentos
   - `crew_members` - Adicionar tripulantes
   - `achievements` - Adicionar conquistas
   - `craft_recipes` - Adicionar receitas

3. **Migrar dados legacy:**
   - Mover dados de `profiles` → `user_profiles`
   - Mover dados de `game_data` → `player_stats`
   - Mover dados de `inventory` → `player_inventory`
   - Deletar tabelas antigas após migração

4. **Criar políticas RLS:**
   - Definir quem pode ler/escrever em cada tabela
   - Proteger dados sensíveis dos usuários

---

## 🔗 **Relacionamentos Principais**

```
user_profiles (Central)
├── game_sessions
├── player_stats
├── player_wallet
├── player_inventory
├── player_equipment
├── player_crew
├── player_achievements
├── mining_sessions
├── pvp_battles (attacker, defender, winner)
├── pvp_rankings
├── craft_sessions
├── discovered_planets (discovered_by)
├── token_transactions
└── player_action_logs
```

---

**📌 Nota:** Este banco está bem estruturado para um jogo Web3 completo com economia de tokens, NFTs, PvP, crafting e exploração espacial!

