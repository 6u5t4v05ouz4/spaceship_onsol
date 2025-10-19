# 🪐 Geração Procedural

Descreve como o conteúdo de um chunk é gerado de forma determinística usando seeds.

---

## ✅ Propriedades da Geração

### Determinística

Mesmo chunk, visitado múltiplas vezes, sempre gera o mesmo conteúdo.

```js
// Chunk (12, -8) sempre terá:
// - 8 asteroides grandes
// - 1 planeta
// - 2 NPCs piratas
// (etc)
```

### Versionável

É possível evoluir o algoritmo mantendo compatibilidade:

```js
// v1: seed = "12,-8"
// v2: seed = "12,-8_v2"
// v3: seed = "12,-8_v3"
```

### Escalável

Sem limite teórico de chunks diferentes, cada um com seu conteúdo único.

---

## 🎲 Algoritmo Base

### 1. Inicializar RNG com Seed

```js
const seed = `${chunkX},${chunkY}`;
const rng = new Phaser.Math.RandomDataGenerator([seed]);
```

### 2. Gerar Entidades

```js
function generateChunk(scene, chunkX, chunkY) {
  const seed = `${chunkX},${chunkY}`;
  const rng = new Phaser.Math.RandomDataGenerator([seed]);
  const group = scene.add.group();

  // Asteroides
  const asteroidCount = rng.between(5, 15);
  for (let i = 0; i < asteroidCount; i++) {
    const x = chunkX * CHUNK_SIZE + rng.between(0, CHUNK_SIZE);
    const y = chunkY * CHUNK_SIZE + rng.between(0, CHUNK_SIZE);
    const size = rng.pick(['small', 'medium', 'large']);
    
    const asteroid = scene.add.sprite(x, y, 'asteroid');
    asteroid.setData('size', size);
    group.add(asteroid);
  }

  return group;
}
```

---

## 🌌 Tabela de Conteúdo Procedural

| Entidade | Chance | Qntd Min | Qntd Máx | Descrição |
|----------|--------|----------|----------|-----------|
| **Asteroide Pequeno** | 100% | 3 | 8 | Recurso comum |
| **Asteroide Médio** | 100% | 2 | 5 | Recurso intermediário |
| **Asteroide Grande** | 80% | 0 | 3 | Recurso raro |
| **Planeta** | 5% | 0 | 1 | Ponto de interesse |
| **Estação NPC** | 10% | 0 | 1 | Comércio/Missões |
| **Pirata NPC** | 15% | 0 | 2 | Combate |
| **Anomalia Espacial** | 3% | 0 | 1 | Evento especial |

---

## 🧮 Exemplos de Geração

### Chunk (0, 0) — Centro do Universo

```js
seed = "0,0"
rng.seed = hash("0,0")

Resultado:
- Asteroides: 7 (5 pequenos, 2 médios)
- Planetas: 0
- NPCs: 0
- Anomalias: 0

Descrição: Vazio e calmo
```

### Chunk (5, 3) — Zona de Asteroides

```js
seed = "5,3"
rng.seed = hash("5,3")

Resultado:
- Asteroides: 12 (3 pequenos, 4 médios, 5 grandes)
- Planetas: 0
- Estações NPC: 1
- Piratas: 2
- Anomalias: 0

Descrição: Campo de asteroides com presença NPC
```

### Chunk (-10, -10) — Zona Hostil

```js
seed = "-10,-10"
rng.seed = hash("-10,-10")

Resultado:
- Asteroides: 8 (2 pequenos, 3 médios, 3 grandes)
- Planetas: 1
- Estações NPC: 0
- Piratas: 2
- Anomalias: 1

Descrição: Zona perigosa com anomalia especial
```

---

## 🎯 Estratégias de Distribuição

### Densidade Regional

Regiões distantes do centro têm padrões diferentes:

```js
function getDensityMultiplier(chunkX, chunkY) {
  const distanceFromCenter = Math.sqrt(chunkX * chunkX + chunkY * chunkY);
  
  if (distanceFromCenter < 5) return 0.5;      // Centro: menos denso
  if (distanceFromCenter < 20) return 1.0;     // Mediano
  if (distanceFromCenter < 50) return 1.5;     // Denso
  return 2.0;                                  // Extremo: muito denso
}
```

### Biomas Procedurais

Criar "regiões temáticas" baseadas em padrões de seed:

```js
function getBiomeType(chunkX, chunkY) {
  const biomePattern = (chunkX ^ chunkY) % 5; // XOR para padrão 2D
  
  switch(biomePattern) {
    case 0: return 'asteroid_field';
    case 1: return 'void_space';
    case 2: return 'nebula_zone';
    case 3: return 'crystal_field';
    case 4: return 'wormhole_area';
  }
}
```

---

## 💾 Integração com Persistência

### Armazenamento de Seed

```json
{
  "chunk_id": "5,3",
  "seed": "5,3",
  "generated_at": "2025-10-18T21:00:00Z",
  "procedural_data": {
    "biome": "asteroid_field",
    "density": 1.0,
    "rng_state": "hash_of_state"
  },
  "modifications": [
    { "object_id": "ast_5_3_0", "action": "destroyed", "by_player": "player_123" }
  ]
}
```

### Transição: Procedural → Persistente

1. Jogador entra chunk novo (undiscovered)
2. Sistema gera conteúdo proceduralmente
3. Servidor persiste seed + metadata
4. Mudanças (destruições, construções) sobrescrevem originais
5. Próximos acessos: restauram base + mudanças

---

## 🔄 Versionamento de Seed

### Garantir Compatibilidade

Se o algoritmo evoluir:

```js
const SEED_VERSION = 2;
const seed = `${chunkX},${chunkY}_v${SEED_VERSION}`;
```

### Migração de Chunks

Chunks antigos podem ser:
- Mantidos com versão antiga (compatibilidade)
- Migrados gradualmente para nova versão
- Regenerados com opção de reset

---

## ⚙️ Pseudo-Código Completo

```js
class ProceduralChunkGenerator {
  static CHUNK_SIZE = 1000;
  static SEED_VERSION = 1;
  
  static generateChunk(scene, chunkX, chunkY) {
    const seed = `${chunkX},${chunkY}_v${this.SEED_VERSION}`;
    const rng = new Phaser.Math.RandomDataGenerator([seed]);
    
    const chunkData = {
      id: `${chunkX},${chunkY}`,
      seed: seed,
      entities: [],
      metadata: {
        biome: this.getBiome(chunkX, chunkY, rng),
        density: this.getDensity(chunkX, chunkY),
        difficulty: this.getDifficulty(chunkX, chunkY)
      }
    };
    
    // Gerar asteroides
    const asteroidCount = rng.between(5, 15);
    for (let i = 0; i < asteroidCount; i++) {
      const x = chunkX * this.CHUNK_SIZE + rng.between(0, this.CHUNK_SIZE);
      const y = chunkY * this.CHUNK_SIZE + rng.between(0, this.CHUNK_SIZE);
      const size = rng.pick(['small', 'medium', 'large']);
      const resources = rng.between(10, 100);
      
      chunkData.entities.push({
        type: 'asteroid',
        position: { x, y },
        size: size,
        resources: resources
      });
    }
    
    // Gerar planetas (5% chance)
    if (rng.frac() < 0.05) {
      const x = chunkX * this.CHUNK_SIZE + rng.between(0, this.CHUNK_SIZE);
      const y = chunkY * this.CHUNK_SIZE + rng.between(0, this.CHUNK_SIZE);
      
      chunkData.entities.push({
        type: 'planet',
        position: { x, y },
        name: this.generatePlanetName(rng)
      });
    }
    
    // Gerar NPCs
    if (rng.frac() < 0.10) {
      const x = chunkX * this.CHUNK_SIZE + rng.between(0, this.CHUNK_SIZE);
      const y = chunkY * this.CHUNK_SIZE + rng.between(0, this.CHUNK_SIZE);
      
      chunkData.entities.push({
        type: 'npc_station',
        position: { x, y },
        faction: rng.pick(['traders', 'miners', 'explorers'])
      });
    }
    
    return chunkData;
  }
  
  static getBiome(chunkX, chunkY, rng) {
    const pattern = (chunkX ^ chunkY) % 5;
    const biomes = ['field', 'void', 'nebula', 'crystal', 'wormhole'];
    return biomes[pattern];
  }
  
  static getDensity(chunkX, chunkY) {
    const distance = Math.sqrt(chunkX * chunkX + chunkY * chunkY);
    if (distance < 5) return 0.5;
    if (distance < 20) return 1.0;
    if (distance < 50) return 1.5;
    return 2.0;
  }
  
  static getDifficulty(chunkX, chunkY) {
    const distance = Math.sqrt(chunkX * chunkX + chunkY * chunkY);
    return Math.min(5, Math.floor(distance / 10));
  }
  
  static generatePlanetName(rng) {
    const prefixes = ['Terra', 'Alpha', 'Beta', 'Sigma'];
    const suffixes = ['Prime', 'Nova', 'Minor', 'Major'];
    return `${rng.pick(prefixes)}-${rng.pick(suffixes)}`;
  }
}
```
