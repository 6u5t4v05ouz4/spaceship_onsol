# ⚔️ PvE vs PvP Modes

Describe as diferenças fundamentais entre os dois modos de jogo suportados pelo ATLAS.

---

## 🎮 Comparação Geral

| Aspecto | PvE | PvP |
|---------|-----|-----|
| **Universo** | Instanciado por jogador | Compartilhado globalmente |
| **Persistência** | Local (seed + progresso pessoal) | Global (servidor único) |
| **Descoberta** | Individual | Coletiva |
| **Sincronização** | Entre sessões | Real-time entre jogadores |
| **Interação** | Isolada | Compartilhada e competitiva |
| **Contenção** | Sem restrições | Primeiro vem, primeiro serve |
| **Jogadores** | 1 por instância | Múltiplos por chunk |

---

## 🏜️ Modo PvE (Exploração Pessoal)

### Características Principais

**Universo Instanciado**
- Cada jogador tem sua própria cópia do universo
- Chunks são isolados por jogador
- Sem sincronização real-time com outros jogadores

**Persistência Pessoal**
- Modificações afetam apenas o jogador
- Estado persiste entre sessões
- Histórico de descobertas pessoal

**Exploração Livre**
- Sem contenção de recursos
- Sem competição
- Foco em exploração e progresso individual

### Exemplo de Fluxo

```
[Sessão 1 - Jogador A]
Chunk (5, 3): Encontra 12 asteroides

[Sessão 2 - Jogador A]
Chunk (5, 3): Ainda tem os mesmos 12 asteroides
(alguns já minerados na sessão anterior)

[Sempre - Jogador B]
Chunk (5, 3): Sua instância pessoal com 12 asteroides diferentes
(mesmo seed, mas não interage com jogador A)
```

### Estrutura de Dados

```js
// Chunk pessoal para cada jogador
{
  player_id: 'player_A',
  chunk_id: '5,3',
  seed: '5,3_v1',
  discovered_at: '2025-10-18T10:00:00Z',
  state: {
    asteroids: [
      { id: 'ast_0', resources: 85 },  // Intacto
      { id: 'ast_1', resources: 0 },   // Minerado
      // ... mais asteroides
    ]
  }
}
```

### API Endpoints

```js
// PvE: Obter chunk pessoal
GET /api/chunks/pve/{chunkX}/{chunkY}
Header: Authorization: Bearer {userToken}

// PvE: Salvar mudanças pessoais
POST /api/chunks/pve/{chunkX}/{chunkY}/changes
Body: { action: 'mine', asteroid_id: 'ast_0' }
```

---

## 🌍 Modo PvP (Competição Global)

### Características Principais

**Universo Compartilhado**
- Um único universo para todos os jogadores
- Chunks são compartilhados globalmente
- Múltiplos jogadores no mesmo chunk simultaneamente

**Persistência Global**
- Modificações afetam todos
- Estado persiste para o mundo inteiro
- Descobertas são compartilhadas

**Competição por Recursos**
- Contentção: "Primeiro vem, primeiro serve"
- Interações PvP diretas
- Mercado de recursos compartilhado

### Exemplo de Fluxo

```
[Tempo 1 - Jogador A entra no Chunk (5, 3)]
12 asteroides visíveis, todos intactos

[Tempo 2 - Jogador A começa a minerar asteroide #1]
Asteroide #1 fica "bloqueado" para Jogador B

[Tempo 3 - Jogador B entra no mesmo Chunk (5, 3)]
Vê 11 asteroides (1 está sendo minerado por A)

[Tempo 4 - Jogador A termina mineração do asteroide #1]
Asteroide #1 desaparece (destruído/consumido)
Jogador B agora vê 10 asteroides

[Tempo 5 - Se ambos acessarem depois]
Ambos verão 10 asteroides (estado persistente)
```

### Estrutura de Dados

```js
// Chunk compartilhado global
{
  chunk_id: '5,3',
  seed: '5,3_v1',
  discovered_at: '2025-10-18T10:00:00Z',
  discovered_by: 'player_A',
  current_state: {
    asteroids: [
      { id: 'ast_0', resources: 0, mined_by: 'player_A', timestamp: '...' },
      { id: 'ast_1', resources: 85 },  // Intacto
      // ... mais asteroides
    ]
  },
  active_players: ['player_A', 'player_B'],
  modifications_log: [
    { action: 'mined', asteroid: 'ast_0', by: 'player_A', at: '...' },
    // ... histórico completo
  ]
}
```

### API Endpoints

```js
// PvP: Obter chunk compartilhado
GET /api/chunks/pvp/{chunkX}/{chunkY}

// PvP: Registrar ação (mineração, etc)
POST /api/chunks/pvp/{chunkX}/{chunkY}/actions
Body: { action: 'mine', asteroid_id: 'ast_0', player_id: '...' }

// PvP: Obter jogadores no chunk
GET /api/chunks/pvp/{chunkX}/{chunkY}/players

// PvP: Sincronizar estado em tempo real (WebSocket)
socket.on('chunk:state_updated', (data) => { ... })
```

---

## 🔄 Sincronização

### PvE: Entre Sessões

```js
// Carregamento
sessionStart() {
  const lastState = await server.getPlayerChunkState(playerId, chunkId);
  restoreChunkState(lastState);  // Restaurar estado anterior
}

// Salvamento
sessionEnd() {
  const currentState = getCurrentChunkState();
  await server.savePlayerChunkState(playerId, chunkId, currentState);
}
```

### PvP: Real-Time

```js
// Entrada
onChunkEnter(chunkId) {
  socket.join(`chunk:${chunkId}`);
  socket.emit('player:joined', { chunkId, playerId });
}

// Ação
onPlayerAction(action) {
  socket.to(`chunk:${chunkId}`).emit('action:occurred', action);
}

// Sincronização periódica (heartbeat)
setInterval(() => {
  socket.to(`chunk:${chunkId}`).emit('chunk:state', getChunkState());
}, 1000);
```

---

## 📊 Implicações de Design

### PvE Beneficia

✅ **Exploração Tranquila**
- Sem pressão competitiva
- Foco em descoberta e progressão

✅ **Progresso Garantido**
- Recursos sempre disponíveis
- Sem contenção

✅ **Single-Player Experience**
- Compatível com offline (após sincronização inicial)

### PvP Beneficia

✅ **Dinâmica Social**
- Encontrar outros jogadores
- Colaboração ou competição

✅ **Economia Emergente**
- Contenção cria valor
- Mercado de recursos dinâmico

✅ **Experiência Compartilhada**
- Todos descobrem juntos
- Histór compartilhado

---

## 🔧 Migração e Switches

### Permitir Escolha

Um jogador pode escolher o modo:

```js
// No perfil do jogador
{
  user_id: 'player_A',
  preferred_mode: 'pve',  // ou 'pvp'
  discovered_chunks_pve: [],
  discovered_chunks_pvp: []
}
```

### Converção de Modo

Se um jogador muda de PvE para PvP:

```js
// PvE → PvP
// Seed dos chunks pessoais são "exportadas" para o novo universo PvP
// Progresso pessoal não transfere
// Começa do zero no novo modo

async function switchMode(playerId, newMode) {
  // Backup do modo anterior
  await backup.save(playerId, currentMode);
  
  // Limpar dados do novo modo (ou recarregar existentes)
  player.current_mode = newMode;
  
  // Reset de descobertas no novo modo
  if (newMode === 'pvp' && !hasPlayedPvP) {
    player.discovered_chunks_pvp = [];
  }
}
```

---

## 💡 Seleção de Modo

Recomendações:

- **Escolha PvE se**: Você quer exploração tranquila, single-player focus
- **Escolha PvP se**: Você quer competição, economia dinâmica, experiência social

Ambos compartilham:
- Mesmo engine de geração procedural
- Mesma interface de jogo
- Mesmos objetivos (mineração, exploração, crafting)

Diferem em:
- Escopo (instância vs global)
- Sincronização (entre sessões vs real-time)
- Contenção (sem vs com)

