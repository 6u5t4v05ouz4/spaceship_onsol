# 🏗️ ATLAS Architecture v2.0
## Supabase + Node.js Real-time Server

---

## 📋 Sumário Executivo

A **arquitetura v2.0** unifica os modos PvE e PvP em um **único mapa infinito com zonas de segurança progressiva**. O sistema usa:

- **Supabase**: Persistência de dados, autenticação e state global
- **Node.js Server**: Arbitragem em tempo real, sincronização de batalhas PvP
- **Cliente**: WebSocket para real-time, REST para persistência
- **Demo Offline**: PvE local sem conexão (sem salvar dados)

---

## 🌍 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                         │
├──────────────────────────┬──────────────────────────────────────┤
│   Website (SPA)          │    Jogo (Phaser.js)                  │
│  ├─ Login/Auth           │  ├─ Offline PvE Demo (local)        │
│  ├─ Perfil               │  ├─ WebSocket → Node.js             │
│  ├─ Inventário           │  └─ Fetch → Supabase                │
│  ├─ Stats                │     (persistência)                   │
│  └─ Marketplace          │                                      │
└──────────────────────────┴──────────────────────────────────────┘
         │ [REST API]               │ [WebSocket + REST]
         │                          │
         ↓                          ↓
┌────────────────────┐      ┌──────────────────────────┐
│   Supabase         │      │   Node.js Server         │
├────────────────────┤      ├──────────────────────────┤
│ • Auth (PostgreSQL)│◄─────┤ • Lê/Escreve via SDK    │
│ • User Profiles    │      │   (credenciais do user) │
│ • Inventory        │      │                          │
│ • Chunks State     │      │ • Battle Engine (PvP)   │
│ • Chunk Changes    │      │ • Real-time Sync        │
│ • Discoveries      │      │ • Chunk Generation      │
│ • Battle Logs      │      │ • Position Sync         │
│ • Zone Flags       │      │ • Zone Arbitration      │
│ • Player Stats     │      │ • Streaming Control     │
└────────────────────┘      └──────────────────────────┘
```

---

## 🌐 Fluxo de Dados

### Persistência (Supabase)
```
Game Client
    ↓
[REST Fetch] ← Ler/Escrever com credenciais do jogador
    ↓
Supabase (via Row Level Security)
    ↓
PostgreSQL
```

**Exemplo:**
```js
// Cliente lê dados do jogador
const { data: player } = await supabase
  .from('players')
  .select('*')
  .eq('id', currentUserId)
  .single();

// Node.js também lê (usando service role key ou user token)
const player = await supabaseClient
  .from('players')
  .select('*')
  .eq('id', userId);
```

### Tempo Real (Node.js + WebSocket)
```
Game Client ←→ WebSocket ←→ Node.js Server
                                ↓
                          Supabase (write)
                                ↓
                          PostgreSQL
```

**Exemplo:**
```js
// Cliente move
socket.emit('player:move', { x: 100, y: 200 });

// Node.js arbitra e persiste
io.on('player:move', async (data) => {
  await supabase.from('players')
    .update({ x: data.x, y: data.y })
    .eq('id', socket.user.id);
  
  // Broadcast para próximos
  io.emit('player:moved', { player: socket.user.id, ...data });
});
```

---

## 🗺️ Sistema de Zonas

### Definição de Zonas

As zonas são determinadas pela **distância do centro (0, 0)** durante a **geração do chunk**.

```
┌─────────────────────────────────────────────────────┐
│           Mapa Infinito (Único)                     │
│                                                     │
│          Zona Segura (0-3 chunks)                  │
│         ┌─────────────────────┐                    │
│         │                     │                    │
│         │   (0, 0) Centro     │                    │
│         │    🛡️ Safe Zone     │                    │
│         │                     │                    │
│         └─────────────────────┘                    │
│                                                     │
│         Zona Transição (3-10 chunks)               │
│     ┌───────────────────────────────────┐          │
│     │   PvE forte + risco PvP           │          │
│     │   Recompensas: 1.5x               │          │
│     └───────────────────────────────────┘          │
│                                                     │
│         Zona Hostil (10+ chunks)                   │
│  ┌──────────────────────────────────────────┐      │
│  │   PvP liberado, mobs agressivos         │      │
│  │   Recompensas: 3.0x                    │      │
│  └──────────────────────────────────────────┘      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Cálculo da Zona

```js
class ChunkAuthority {
  determineSafety(chunkX, chunkY) {
    // Distância Euclidiana do centro
    const distance = Math.sqrt(chunkX ** 2 + chunkY ** 2);
    
    if (distance < 3) {
      return {
        type: 'safe',
        pvpAllowed: false,
        lootMultiplier: 1.0,
        difficulty: 1
      };
    }
    
    if (distance < 10) {
      return {
        type: 'transition',
        pvpAllowed: false,  // PvP ainda bloqueado
        lootMultiplier: 1.5,
        difficulty: Math.floor(distance / 3)
      };
    }
    
    return {
      type: 'hostile',
      pvpAllowed: true,     // PvP liberado
      lootMultiplier: 3.0,
      difficulty: Math.min(10, Math.floor(distance / 3))
    };
  }
}
```

### Biomas e Arquivo

Os biomas são definidos pelos **nomes dos arquivos PNG**:

```
public/static/biomes/
├── bioma_safe_zone_0035.png      (Zona segura)
├── bioma_safe_zone_0042.png
├── bioma_transition_5335.png     (Zona transição)
├── bioma_transition_5444.png
├── bioma_hostile_8123.png        (Zona hostil)
└── bioma_hostile_9999.png
```

**Correspondência:**
- Chunk em distância < 3 → carrega `bioma_safe_zone_*.png`
- Chunk em distância 3-10 → carrega `bioma_transition_*.png`
- Chunk em distância 10+ → carrega `bioma_hostile_*.png`

---

## 💾 Schema do Banco de Dados

### Tabela: `chunks`

```sql
CREATE TABLE chunks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chunk_x INT NOT NULL,
  chunk_y INT NOT NULL,
  seed VARCHAR(64) NOT NULL,
  zone_type VARCHAR(20) NOT NULL CHECK (zone_type IN ('safe', 'transition', 'hostile')),
  biome_file VARCHAR(255),  -- "bioma_hostile_8123.png"
  distance_from_origin FLOAT NOT NULL,
  base_difficulty INT NOT NULL,
  loot_multiplier FLOAT NOT NULL,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  discovered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  procedural_data JSONB,
  current_state JSONB,
  game_mode VARCHAR(10) CHECK (game_mode IN ('pve', 'pvp', 'mixed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(chunk_x, chunk_y),
  UNIQUE(seed)
);

CREATE INDEX idx_chunks_zone_type ON chunks(zone_type);
CREATE INDEX idx_chunks_distance ON chunks(distance_from_origin);
CREATE INDEX idx_chunks_coords ON chunks(chunk_x, chunk_y);
CREATE INDEX idx_chunks_discovered_at ON chunks(discovered_at DESC);
```

### Tabela: `chunk_changes`

```sql
CREATE TABLE chunk_changes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chunk_id BIGINT NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  object_id VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL,  -- 'mine', 'destroy', 'build'
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  change_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (chunk_id) REFERENCES chunks(id)
);

CREATE INDEX idx_chunk_changes_chunk_id ON chunk_changes(chunk_id);
CREATE INDEX idx_chunk_changes_player_id ON chunk_changes(player_id);
CREATE INDEX idx_chunk_changes_created_at ON chunk_changes(created_at DESC);
```

### Tabela: `players`

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  health INT DEFAULT 100,
  max_health INT DEFAULT 100,
  current_chunk VARCHAR(50),
  position_x FLOAT,
  position_y FLOAT,
  inventory JSONB DEFAULT '{}',
  resources INT DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  last_attack_time TIMESTAMP WITH TIME ZONE,
  death_count INT DEFAULT 0,
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_current_chunk ON players(current_chunk);
CREATE INDEX idx_players_is_online ON players(is_online);
```

### Tabela: `battle_logs`

```sql
CREATE TABLE battle_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chunk_id BIGINT NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  attacker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  defender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  damage_dealt INT,
  damage_taken INT,
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  loot_multiplier FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_battle_logs_chunk_id ON battle_logs(chunk_id);
CREATE INDEX idx_battle_logs_attacker_id ON battle_logs(attacker_id);
CREATE INDEX idx_battle_logs_created_at ON battle_logs(created_at DESC);
```

---

## 🎮 Fluxos de Sincronização

### Fluxo 1: Jogador Entra em Novo Chunk

```
1. Cliente calcula chunk: chunkX = Math.floor(playerX / 1000)
   ↓
2. Cliente emite: socket.emit('chunk:enter', { chunkX, chunkY })
   ↓
3. Node.js Server recebe
   ├─ Determina zona: ChunkAuthority.determineSafety(x, y)
   ├─ Consulta Supabase: chunks WHERE chunk_x=x AND chunk_y=y
   └─ Se novo → gera proceduralmente e persiste
   ↓
4. Retorna chunk data (asteroides, NPCs, recursos)
   ↓
5. Cliente renderiza e cria raio ativo (25 chunks)
   ↓
6. WebSocket conecta para sincronização real-time
```

**Código Client:**
```js
async onChunkEnter(chunkX, chunkY) {
  // Emitir para servidor
  this.socket.emit('chunk:enter', { chunkX, chunkY });
  
  // Servidor vai responder com chunk data
  this.socket.on('chunk:data', async (data) => {
    // Renderizar chunk
    this.renderChunk(data);
    
    // Persistir entrada local
    localStorage.setItem(`chunk_${chunkX}_${chunkY}`, JSON.stringify(data));
  });
}
```

**Código Server:**
```js
io.on('chunk:enter', async (data, callback) => {
  const { chunkX, chunkY } = data;
  const userId = socket.user.id;
  
  // Determinar zona
  const zone = chunkAuthority.determineSafety(chunkX, chunkY);
  
  // Buscar chunk no Supabase
  let chunk = await supabase
    .from('chunks')
    .select('*')
    .eq('chunk_x', chunkX)
    .eq('chunk_y', chunkY)
    .single();
  
  if (!chunk.data) {
    // Gerar novo chunk
    const generated = ProceduralChunkGenerator.generateChunk(null, chunkX, chunkY);
    
    chunk = await supabase.from('chunks').insert({
      chunk_x: chunkX,
      chunk_y: chunkY,
      seed: `${chunkX},${chunkY}`,
      zone_type: zone.type,
      loot_multiplier: zone.lootMultiplier,
      discovered_by: userId,
      biome_file: selectBiomeFile(zone.type),
      distance_from_origin: zone.distance,
      procedural_data: generated
    }).select().single();
  }
  
  // Retornar ao cliente
  callback({ success: true, chunk: chunk.data });
  
  // Notificar outros jogadores no chunk
  socket.broadcast.emit('player:entered_chunk', {
    player: userId,
    chunk: `${chunkX},${chunkY}`
  });
});
```

### Fluxo 2: Ataque PvP em Zona Hostil

```
1. Jogador A quer atacar Jogador B (ambos no chunk hostil)
   ↓
2. Client A emite: socket.emit('battle:attack', { target: 'B', damage: 50 })
   ↓
3. Node.js Server arbitra:
   ├─ Valida zona: hostile? ✅
   ├─ Valida distância: próximos? ✅
   ├─ Valida health de B: > 0? ✅
   └─ Calcula dano real com armadura
   ↓
4. Persiste em Supabase:
   ├─ Atualiza players[B].health
   ├─ Insere em battle_logs
   └─ Calcula loot_multiplier (3.0x)
   ↓
5. Broadcast resultado:
   ├─ Player A: "+50 damage dealt"
   └─ Player B: "-50 health, 50 remaining"
```

**Código Server:**
```js
io.on('battle:attack', async (data, callback) => {
  const attackerId = socket.user.id;
  const { targetId, damage, chunkId } = data;
  
  // 1. Validar zona
  const chunk = await supabase
    .from('chunks')
    .select('zone_type')
    .eq('id', chunkId)
    .single();
  
  if (chunk.data.zone_type !== 'hostile') {
    return callback({ error: 'PvP not allowed in this zone' });
  }
  
  // 2. Validar proximidade (em chunk.js implementar espacial)
  const attacker = playersOnline.get(attackerId);
  const defender = playersOnline.get(targetId);
  
  const distance = Phaser.Math.Distance.Between(
    attacker.x, attacker.y,
    defender.x, defender.y
  );
  
  if (distance > 500) {
    return callback({ error: 'Target too far' });
  }
  
  // 3. Validar HP defender
  if (defender.health <= 0) {
    return callback({ error: 'Target already dead' });
  }
  
  // 4. Calcular dano com armadura
  const armor = defender.inventory.armor || 0;
  const realDamage = Math.max(1, damage - armor * 0.5);
  const newHealth = defender.health - realDamage;
  
  // 5. Persistir
  await supabase.from('players')
    .update({ health: newHealth })
    .eq('id', targetId);
  
  await supabase.from('battle_logs').insert({
    chunk_id: chunkId,
    attacker_id: attackerId,
    defender_id: targetId,
    damage_dealt: realDamage,
    winner_id: newHealth <= 0 ? attackerId : null,
    loot_multiplier: 3.0
  });
  
  // 6. Broadcast
  const result = {
    attacker: attackerId,
    defender: targetId,
    damage: realDamage,
    defenderHealth: newHealth,
    isDead: newHealth <= 0
  };
  
  io.to(chunkId).emit('battle:hit', result);
  callback({ success: true, ...result });
});
```

### Fluxo 3: Mineração em Zona Segura

```
1. Jogador A começa mineração em asteroid
   ↓
2. Client emite: socket.emit('mining:start', { asteroidId, duration: 5000 })
   ↓
3. Node.js Server:
   ├─ Registra lock no asteroid por 5s
   ├─ Broadcasts para outros não minerarem
   └─ Aguarda completion ou timeout
   ↓
4. Client emite ao final: socket.emit('mining:complete', { asteroidId })
   ↓
5. Server persiste:
   ├─ Calcula recursos = (base * lootMultiplier)
   ├─ Atualiza players[A].resources
   └─ Remove lock
   ↓
6. Retorna ao jogador:
   "+45 resources (1.0x multiplier)"
```

---

## 🔌 WebSocket Events

### Client → Server

| Evento | Dados | Resposta |
|--------|-------|----------|
| `auth` | `{ userId, token }` | ✅ / ❌ |
| `chunk:enter` | `{ chunkX, chunkY }` | `chunk:data` |
| `player:move` | `{ x, y }` | `player:moved` |
| `mining:start` | `{ asteroidId }` | `mining:locked` |
| `mining:complete` | `{ asteroidId }` | `mining:success` |
| `battle:attack` | `{ targetId, damage }` | `battle:hit` |

### Server → Client

| Evento | Dados | Descrição |
|--------|-------|-----------|
| `chunk:data` | `{ asteroides, npcs, ... }` | Chunk carregado |
| `player:moved` | `{ playerId, x, y }` | Outro jogador se moveu |
| `player:entered_chunk` | `{ playerId, chunk }` | Outro jogador entrou |
| `mining:locked` | `{ asteroidId, player }` | Asteroide travado |
| `battle:hit` | `{ attacker, defender, damage }` | Ataque conectado |
| `player:died` | `{ playerId, killer }` | Morte confirmada |

---

## 📱 Demo Offline PvE

Modo demo para jogar **sem conexão**, gerando chunks localmente:

```js
// src/game-only.js
class OfflinePvEScene extends Phaser.Scene {
  create() {
    this.isOffline = true;
    this.supabase = null;
    this.socket = null;
    
    // Atlas local (sem persistência)
    this.atlas = new AtlasManager(this, null, null);
    this.atlas.offlineMode = true;
  }

  async loadChunk(chunkX, chunkY) {
    // Gerar proceduralmente localmente
    const zone = this.getZone(chunkX, chunkY);
    const chunk = ProceduralChunkGenerator.generateChunk(
      this, chunkX, chunkY
    );
    
    // Aplicar zona (apenas para visual)
    chunk.zone = zone;
    
    return chunk;
  }

  update() {
    // Sem sincronização WebSocket
    // Sem persistência Supabase
    // Apenas gameplay local
  }
}
```

**Limitações:**
- ❌ Sem salvamento de progresso
- ❌ Sem outros jogadores
- ❌ Sem PvP
- ✅ Exploração livre
- ✅ Mineração offline

---

## 🚀 Integração com Supabase

### Client: Ler Dados do Jogador

```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Autenticar
const { data: { user } } = await supabase.auth.getUser();

// Ler dados do jogador (com RLS)
const { data: player } = await supabase
  .from('players')
  .select('*')
  .eq('id', user.id)
  .single();

// Ler chunks descobertos
const { data: discoveries } = await supabase
  .from('player_discoveries')
  .select('*')
  .eq('player_id', user.id)
  .order('discovered_at', { ascending: false });
```

### Server: Usar Credenciais do Usuário

```js
// server/supabase-client.js
const { createClient } = require('@supabase/supabase-js');

class SupabaseClientManager {
  constructor() {
    this.adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY  // Write: admin operations
    );
  }

  getUserClient(userToken) {
    // Criar cliente específico do usuário
    return createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    ).auth.setSession({
      access_token: userToken,
      refresh_token: null
    });
  }

  async updatePlayerHealth(userId, userToken, newHealth) {
    const userClient = this.getUserClient(userToken);
    
    // RLS vai bloquear se não for o usuário autêntico
    return userClient
      .from('players')
      .update({ health: newHealth })
      .eq('id', userId);
  }
}

module.exports = SupabaseClientManager;
```

### Row Level Security (RLS)

```sql
-- Apenas o usuário pode acessar seus dados
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON players
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON players
  FOR UPDATE
  USING (auth.uid() = id);

-- Chunks são públicos para leitura
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chunks are public" ON chunks
  FOR SELECT
  USING (true);

-- Battles: apenas leitura para ambos os combatentes
ALTER TABLE battle_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own battles" ON battle_logs
  FOR SELECT
  USING (
    auth.uid() = attacker_id OR 
    auth.uid() = defender_id
  );
```

---

## 📊 Estrutura de Pastas

```
SPACE_CRYPTO_MINER/
│
├── server/                                    ← NOVO
│   ├── server.js                             (Express + Socket.io)
│   ├── battle-engine.js                      (Lógica de combate)
│   ├── chunk-authority.js                    (Arbitragem de zonas)
│   ├── supabase-client.js                    (Integração Supabase)
│   ├── player-manager.js                     (Estado em tempo real)
│   ├── events/
│   │   ├── player-events.js
│   │   ├── battle-events.js
│   │   └── chunk-events.js
│   ├── utils/
│   │   ├── distance-calculator.js
│   │   └── zone-calculator.js
│   ├── middleware/
│   │   └── auth-middleware.js
│   ├── package.json
│   └── .env
│
├── src/
│   ├── systems/atlas/
│   │   ├── atlas-manager.js                  (REFATORADO)
│   │   ├── chunk-authority.js                (Client-side helper)
│   │   ├── procedural-generator.js
│   │   ├── offline-manager.js                (NOVO)
│   │   └── sync-manager.js                   (NOVO)
│   │
│   ├── game-only.js                          (REFATORADO)
│   ├── main.js                               (REFATORADO)
│   └── config/
│       ├── supabase.js                       (NOVO)
│       └── websocket.js                      (NOVO)
│
├── docs/
│   ├── ARCHITECTURE-V2.md                    (este arquivo)
│   ├── DEPLOYMENT.md                         (NOVO)
│   ├── API.md                                (NOVO)
│   └── prd-atlas/
│       ├── 13-architecture-diagram.md        (NOVO)
│       ├── 06-pve-pvp-modes.md               (ATUALIZADO)
│       └── ...
│
├── public/static/biomes/                     (NOVO)
│   ├── bioma_safe_zone_0035.png
│   ├── bioma_transition_5335.png
│   └── bioma_hostile_8123.png
│
└── database/
    └── migrations/
        ├── add_zone_flags.sql                (NOVO)
        └── add_biome_files.sql               (NOVO)
```

---

## 🔧 Setup e Deployment

### Setup Local

```bash
# 1. Clonar repositório
git clone ...
cd SPACE_CRYPTO_MINER

# 2. Setup Supabase
supabase start

# 3. Aplicar migrations
supabase migration up

# 4. Instalar dependências (server)
cd server
npm install

# 5. Configurar .env
cp .env.example .env
# SUPABASE_URL=...
# SUPABASE_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# 6. Iniciar server
npm start

# 7. Em outro terminal, iniciar client
cd ..
npm run dev
```

### Environment Variables

```bash
# .env (server)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NODE_ENV=development
PORT=3000

CORS_ORIGIN=http://localhost:5173
```

```bash
# .env.local (client)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_WEBSOCKET_URL=http://localhost:3000
```

---

## 📈 Estimativa de Implementação

| Sprint | Objetivo | Duração | Status |
|--------|----------|---------|--------|
| 1 | Schema + Documentação | 1-2 sem | 🟢 Pronto |
| 2 | Node.js Server (Battle Engine) | 2 sem | ⏳ Próximo |
| 3 | Integração Cliente + WebSocket | 2 sem | ⏳ Próximo |
| 4 | Demo Offline + Testes | 1-2 sem | ⏳ Próximo |
| **Total** | **v2.0 Release** | **6-8 sem** | |

---

## ✅ Checklist de Implementação

### Sprint 1: Schema + Docs
- [ ] Criar tabelas: `chunks`, `chunk_changes`, `players`, `battle_logs`
- [ ] Implementar RLS policies
- [ ] Atualizar documento `06-pve-pvp-modes.md`
- [ ] Criar `13-architecture-diagram.md`
- [ ] Definir biomas por arquivo

### Sprint 2: Node.js Server
- [ ] Setup Express + Socket.io
- [ ] Implementar `BattleEngine`
- [ ] Implementar `ChunkAuthority`
- [ ] Criar `SupabaseClientManager`
- [ ] Adicionar auth middleware (JWT)
- [ ] Testes unitários

### Sprint 3: Integração Cliente
- [ ] Atualizar `atlas-manager.js`
- [ ] Conectar WebSocket
- [ ] Implementar sincronização real-time
- [ ] Adicionar listeners de eventos
- [ ] Testes de sincronização

### Sprint 4: Polish
- [ ] Demo offline completa
- [ ] Documentação API
- [ ] Guia de deployment
- [ ] Stress testing (100+ jogadores)
- [ ] Security audit

---

## 🎯 Próximos Passos

1. **Revisar** este documento com o time
2. **Criar** o schema PostgreSQL em Supabase
3. **Clonar** este documento em `docs/ARCHITECTURE-V2.md`
4. **Iniciar** Sprint 1 com schema + biomas

---

## 📚 Referências

- **Supabase Docs**: https://supabase.com/docs
- **Socket.io**: https://socket.io/docs
- **PostgreSQL RLS**: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **Phaser.js**: https://phaser.io/docs

---

**Versão**: v2.0-alpha  
**Data**: Outubro 2025  
**Autor**: Squad ATLAS  
**Status**: 📋 Planejamento

