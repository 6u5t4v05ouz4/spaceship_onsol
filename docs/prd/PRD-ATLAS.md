# 📜 PRD-ATLAS.md
### *Procedural Real-time Dynamic Atlas System — Phaser.js Game Universe*

---

## 🧭 1. Visão Geral

**ATLAS** é o sistema de gerenciamento de universo infinito para o jogo espacial top-down desenvolvido em **Phaser.js**, com suporte a **PvE e PvP**.  
Seu propósito é oferecer um **mundo contínuo, explorável, procedural e persistente**, onde os jogadores podem descobrir, explorar, modificar e compartilhar o mesmo espaço sideral sem limitação física de mapa.

---

## 🌌 2. Objetivos Principais

- Implementar **mundo infinito** baseado em **chunks dinâmicos** (streaming sob demanda).  
- Permitir **exploração procedural determinística** (mesmo chunk = mesmo resultado).  
- Garantir **persistência e sincronização** entre jogadores (PvP) e sessões (PvE).  
- Oferecer **otimização de memória** através de *load/unload* dinâmico de chunks.  
- Integrar **eventos de descoberta, mineração, crafting e combate espacial**.

---

## 🧱 3. Conceito de Estrutura Espacial

| Termo | Descrição |
|-------|------------|
| **Coordenadas Absolutas (x, y)** | Posição global no universo (em pixels). |
| **Chunk** | Região quadrada fixa (ex: 1000x1000 px) que contém entidades e eventos. |
| **Seed** | Valor determinístico derivado das coordenadas do chunk (`hash(x,y)`) que define o conteúdo procedural. |
| **Região Ativa** | Conjunto de chunks carregados próximos ao jogador. |
| **Região Persistente** | Chunks descobertos e armazenados no servidor/banco. |

---

## 🧮 4. Lógica de Chunk Streaming

### 4.1 Divisão Espacial

```js
CHUNK_SIZE = 1000; // pixels
chunkX = Math.floor(x / CHUNK_SIZE);
chunkY = Math.floor(y / CHUNK_SIZE);
```

### 4.2 Ciclo de Vida de um Chunk

| Estado | Ação | Descrição |
|--------|------|-----------|
| `Undiscovered` | Lazy-load | Chunk ainda não visitado por nenhum jogador. |
| `Discovered` | Procedural seed gerada e salva. | Primeiro jogador cria o estado base. |
| `Active` | Renderizado no cliente. | Jogadores presentes no chunk. |
| `Persisted` | Estado armazenado no servidor. | Alterações registradas (PvP/PvE). |

### 4.3 Atualização Dinâmica

- O sistema mantém um **raio de chunks ativos** em torno do jogador (`R = 1~2`).  
- Chunks fora desse raio são **descarregados da memória** (limpeza gráfica e física).  
- Cada frame, o jogo verifica:

```js
updateChunks(player.x, player.y, scene)
```

---

## 🪐 5. Geração Procedural

### 5.1 Determinística

```js
seed = `${chunkX},${chunkY}`;
rng = new Phaser.Math.RandomDataGenerator([seed]);
```

### 5.2 Conteúdo do Chunk

- Asteroides (quantidade aleatória)
- Planetas (chance de 5%)
- Naves NPC (eventos ou piratas)
- Recursos minerais
- Fenômenos espaciais raros (opcional)

### 5.3 Função de Geração (pseudo)

```js
function generateChunk(scene, chunkX, chunkY) {
  const seed = `${chunkX},${chunkY}`;
  const rng = new Phaser.Math.RandomDataGenerator([seed]);
  const group = scene.add.group();

  for (let i = 0; i < 10; i++) {
    const x = chunkX * CHUNK_SIZE + rng.between(0, CHUNK_SIZE);
    const y = chunkY * CHUNK_SIZE + rng.between(0, CHUNK_SIZE);
    const asteroid = scene.add.sprite(x, y, 'asteroid');
    group.add(asteroid);
  }

  return group;
}
```

---

## 🔁 6. Persistência e Sincronização

### 6.1 Estrutura de Dados no Servidor

```json
{
  "chunk_12_-7": {
    "seed": "12,-7",
    "discoveredAt": "2025-10-18T21:00:00Z",
    "objects": [
      { "id": "ast_1", "type": "asteroid", "x": 12230, "y": -7050, "state": "intact" },
      { "id": "planet_A", "type": "planet", "x": 12500, "y": -7500 }
    ],
    "changes": {
      "ast_1": "destroyed",
      "station_2": "built_by_PlayerA"
    }
  }
}
```

### 6.2 Regras de Sincronização

- Ao entrar em um chunk:
  - Servidor verifica se já existe persistência.
  - Se não, gera proceduralmente e registra como descoberto.
- Mudanças (mineração, destruição, construções) são gravadas e replicadas via WebSocket.
- Estado sincronizado em tempo real para todos os jogadores no mesmo chunk.

---

## ⚔️ 7. PvE e PvP Modes

| Aspecto | PvE | PvP |
|----------|-----|-----|
| Universo | Instanciado por jogador | Compartilhado globalmente |
| Persistência | Local (seed + progresso pessoal) | Global (servidor único) |
| Descoberta | Individual | Coletiva |
| Sincronização | Local | Multijogador via servidor |
| Interação | Isolada | Compartilhada e competitiva |

---

## 🧠 8. Eventos e Descoberta

### Eventos possíveis ao entrar num chunk

- `onChunkDiscovered` → primeira visita (PvE ou global PvP)
- `onChunkEnter` → jogador entra no setor
- `onChunkExit` → jogador sai do setor
- `onChunkModified` → mineração, combate, construção

Esses eventos podem disparar:

- Notificações
- Log de exploração
- Geração de recompensas
- Missões dinâmicas

---

## 💾 9. Banco de Dados e Índices

### Tabelas Sugeridas

| Tabela | Campos Principais |
|--------|--------------------|
| `chunks` | `id`, `seed`, `discovered_at`, `owner`, `data` (JSONB) |
| `chunk_changes` | `chunk_id`, `object_id`, `state`, `updated_at` |
| `players` | `id`, `current_chunk`, `coords`, `inventory` |

---

## ⚙️ 10. Integração com Phaser.js

### Cenas envolvidas

- `SceneSpace` → controle de câmera e player.  
- `SceneAtlas` → gerenciamento de chunks e entidades.  
- `SceneUI` → mapa e indicadores.

### Pipeline principal

```js
update(time, delta) {
  player.update();
  atlas.updateChunks(player.x, player.y, this);
}
```

---

## 🧩 11. Otimizações Futuras

- **Culling**: Desativar objetos fora da área visível (`camera.worldView`).  
- **Level of Detail (LOD)**: chunks distantes renderizados como pontos no minimapa.  
- **Multithread (WebWorker)**: geração procedural paralela.  
- **Prefetching**: carregar antecipadamente os próximos chunks com base na direção de movimento.

---

## 🔮 12. Roadmap de Desenvolvimento

| Fase | Entrega | Status |
|------|----------|--------|
| Fase 1 | Estrutura de chunk + seed procedural | 🟢 Em andamento |
| Fase 2 | Sistema de descoberta e cache local | ⏳ Planejado |
| Fase 3 | Persistência de estado e sincronização (PvP) | ⏳ Planejado |
| Fase 4 | Otimizações (culling, LOD, prefetch) | 🔜 |
| Fase 5 | Integração com crafting e eventos espaciais | 🔜 |

---

## 📡 13. Observações Técnicas

- Universo potencialmente infinito, limitado apenas por `Number.MAX_SAFE_INTEGER`.  
- Seeds determinísticas garantem consistência sem armazenamento excessivo.  
- Compatível com Phaser 3 (WebGL + Arcade Physics).  
- Design compatível com execução em Node.js (modo headless).

---

## 📘 14. Licenciamento e Versionamento

- **Módulo:** ATLAS  
- **Repositório:** `/src/systems/atlas/`  
- **Arquivo principal:** `atlas-manager.js`  
- **Versão inicial:** `v0.1.0-alpha`
