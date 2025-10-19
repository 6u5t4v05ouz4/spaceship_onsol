# 🗺️ Sistema de Zonas

Define como as zonas são calculadas, qual tipo de loot é retornado, e como o PvP é arbitrado.

---

## 📍 Definição de Zonas

As zonas são definidas pela **distância Euclidiana do centro (0, 0)**, onde o jogador começa.

### Três Tipos de Zona

```
┌─────────────────────────────────────────┐
│           Mapa Infinito                 │
│                                         │
│     ZONA SEGURA (dist < 3 chunks)      │
│    ┌───────────────────────────┐       │
│    │                           │       │
│    │  Center (0, 0)            │       │
│    │  🛡️ PvP: Bloqueado        │       │
│    │  Loot: 1.0x              │       │
│    │  Difficulty: 1           │       │
│    │                           │       │
│    └───────────────────────────┘       │
│                                         │
│   ZONA TRANSIÇÃO (dist 3-10 chunks)    │
│  ┌────────────────────────────────┐    │
│  │  PvE forte + risco de PvP      │    │
│  │  🛡️ PvP: Bloqueado (por agora) │    │
│  │  Loot: 1.5x                    │    │
│  │  Difficulty: 2-4               │    │
│  └────────────────────────────────┘    │
│                                         │
│  ZONA HOSTIL (dist 10+ chunks)         │
│ ┌──────────────────────────────────┐   │
│ │  ⚔️ PvP: LIBERADO                │   │
│ │  Mobs: Agressivos                │   │
│ │  Loot: 3.0x                      │   │
│ │  Difficulty: 5-10                │   │
│ └──────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🧮 Cálculo da Zona

### Fórmula de Distância

```js
const distance = Math.sqrt(chunkX ** 2 + chunkY ** 2);
```

### Determinação

```js
class ZoneCalculator {
  static getZone(chunkX, chunkY) {
    const distance = Math.sqrt(chunkX ** 2 + chunkY ** 2);

    if (distance < 3) {
      return {
        type: 'safe',
        distance: distance,
        lootMultiplier: 1.0,
        pvpAllowed: false,
        difficulty: 1,
        biomeType: 'bioma_safe_zone'
      };
    }

    if (distance < 10) {
      return {
        type: 'transition',
        distance: distance,
        lootMultiplier: 1.5,
        pvpAllowed: false,
        difficulty: Math.floor(distance / 2.5),
        biomeType: 'bioma_transition'
      };
    }

    return {
      type: 'hostile',
      distance: distance,
      lootMultiplier: 3.0,
      pvpAllowed: true,
      difficulty: Math.min(10, Math.floor(distance / 3)),
      biomeType: 'bioma_hostile'
    };
  }
}
```

---

## 📊 Tabela de Zonas

| Distância | Tipo | PvP | Loot | Difficulty | Bioma |
|-----------|------|-----|------|-----------|-------|
| < 3 | Segura | ❌ | 1.0x | 1 | safe_zone |
| 3-10 | Transição | ❌ | 1.5x | 2-4 | transition |
| 10+ | Hostil | ✅ | 3.0x | 5-10 | hostile |

---

## 🧭 Exemplos de Coordenadas

### Chunk (0, 0) - Centro Absoluto
```js
distance = √(0² + 0²) = 0
Tipo: SAFE
PvP: Bloqueado
Loot: 1.0x
```

### Chunk (2, 0) - Perto do Centro
```js
distance = √(2² + 0²) = 2.0
Tipo: SAFE
PvP: Bloqueado
Loot: 1.0x
```

### Chunk (3, 0) - Início da Transição
```js
distance = √(3² + 0²) = 3.0
Tipo: TRANSITION
PvP: Bloqueado
Loot: 1.5x
Difficulty: 1
```

### Chunk (5, 5) - Transição Média
```js
distance = √(5² + 5²) = √50 ≈ 7.07
Tipo: TRANSITION
PvP: Bloqueado
Loot: 1.5x
Difficulty: 2
```

### Chunk (10, 0) - Início da Zona Hostil
```js
distance = √(10² + 0²) = 10.0
Tipo: HOSTILE
PvP: LIBERADO ✅
Loot: 3.0x
Difficulty: 3
```

### Chunk (15, 15) - Profundidade Hostil
```js
distance = √(15² + 15²) = √450 ≈ 21.2
Tipo: HOSTILE
PvP: LIBERADO ✅
Loot: 3.0x
Difficulty: 7
```

---

## ⚔️ Arbitragem de PvP

### Verificação de Zona

Antes de permitir ataque, o servidor valida:

```js
async validatePvPAttack(attackerId, defenderId, chunkId) {
  // 1. Obter chunk
  const chunk = await supabase
    .from('chunks')
    .select('zone_type')
    .eq('id', chunkId)
    .single();

  // 2. Verificar se é zona hostil
  if (chunk.data.zone_type !== 'hostile') {
    return { allowed: false, reason: 'PvP not allowed in this zone' };
  }

  // 3. Verificar distância
  const attacker = playersOnline.get(attackerId);
  const defender = playersOnline.get(defenderId);

  const distance = Phaser.Math.Distance.Between(
    attacker.x, attacker.y,
    defender.x, defender.y
  );

  if (distance > 500) { // 500px = max range
    return { allowed: false, reason: 'Target too far' };
  }

  // 4. Verificar HP
  if (defender.health <= 0) {
    return { allowed: false, reason: 'Target already dead' };
  }

  return { allowed: true };
}
```

---

## 💰 Cálculo de Loot

O loot é multiplicado pela zona:

```js
function calculateLoot(baseResources, zoneType) {
  const multipliers = {
    safe: 1.0,
    transition: 1.5,
    hostile: 3.0
  };

  return Math.floor(baseResources * multipliers[zoneType]);
}

// Exemplo
calculateLoot(50, 'safe');       // 50
calculateLoot(50, 'transition'); // 75
calculateLoot(50, 'hostile');    // 150
```

---

## 🎯 Progressão de Dificuldade

Conforme o jogador se afasta, a dificuldade aumenta:

```js
function getDifficulty(distance) {
  if (distance < 3) return 1;     // Trivial
  if (distance < 10) {
    return Math.floor(distance / 2.5); // 1-4
  }
  return Math.min(10, Math.floor(distance / 3)); // 5-10
}

// Exemplos
getDifficulty(0);   // 1
getDifficulty(2);   // 1
getDifficulty(5);   // 2
getDifficulty(10);  // 3
getDifficulty(20);  // 6
getDifficulty(30);  // 10 (max)
```

---

## 🌋 Seleção de Bioma

O bioma **visual** é escolhido aleatoriamente pelo algoritmo procedural, mas a **zona (safe/hostile)** é determinada por:

1. **Distância do centro (0, 0)** — Calcula zona (safe/transition/hostile)
2. **Probabilidade por coordenada** — Hash da coordenada determina chance de ser hostil mesmo na transição

### Algoritmo

```js
class BiomeSelector {
  static selectBiome(chunkX, chunkY) {
    const distance = Math.sqrt(chunkX ** 2 + chunkY ** 2);
    
    // Determinar zone_type por distância
    let zoneType = this.getZoneByDistance(distance);
    
    // Mas aplicar probabilidade de hostilidade baseada na coordenada
    zoneType = this.applyCoordinateProbability(chunkX, chunkY, zoneType, distance);
    
    // Selecionar sprite aleatório (independente da zona)
    const spriteVariant = this.getRandomSpriteVariant();
    
    return {
      zoneType,           // safe, transition, ou hostile
      spriteVariant,      // número aleatório (0-999)
      biomeVisuals: this.generateBiomeVisuals(chunkX, chunkY)
    };
  }

  static getZoneByDistance(distance) {
    if (distance < 3) return 'safe';
    if (distance < 10) return 'transition';
    return 'hostile';
  }

  static applyCoordinateProbability(chunkX, chunkY, baseZone, distance) {
    // Criar um hash determinístico das coordenadas
    const seed = `${chunkX},${chunkY}`;
    const hash = this.simpleHash(seed);
    const probability = hash % 100; // 0-99
    
    // Transição: 30% chance de ser hostil mesmo em transição
    if (baseZone === 'transition' && probability < 30) {
      return 'hostile';
    }
    
    // Safe raramente vira hostile (5% chance extremamente rara)
    if (baseZone === 'safe' && probability < 5) {
      return 'transition';
    }
    
    return baseZone;
  }

  static simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  static getRandomSpriteVariant() {
    // Retorna um número aleatório para o sprite
    return Math.floor(Math.random() * 1000);
  }

  static generateBiomeVisuals(chunkX, chunkY) {
    // O Phaser renderiza sprites aleatoriamente
    // Isso é apenas um identificador
    return {
      spriteId: `chunk_${chunkX}_${chunkY}`,
      seed: `${chunkX},${chunkY}`,
      variant: Math.random()
    };
  }
}
```

### Exemplo: Variação com Mesma Distância

```
Chunk (5, 0) - distance = 5.0 (Transição)
├─ Hash: 12345
├─ Probability: 45%
├─ Zone: transition (não passou no 30%)
├─ Sprite: random_642 ← renderiza sprite aleatório
└─ Visual: Varia cada reload

Chunk (5, 1) - distance ≈ 5.1 (Transição)
├─ Hash: 12456
├─ Probability: 56%
├─ Zone: HOSTILE ✅ (passou no 30%)
├─ Sprite: random_821 ← renderiza sprite aleatório
└─ Visual: Diferente de (5, 0)

Chunk (5, 2) - distance ≈ 5.4 (Transição)
├─ Hash: 12567
├─ Probability: 67%
├─ Zone: HOSTILE ✅ (passou no 30%)
├─ Sprite: random_333
└─ Visual: Sempre aleatório
```

### Fluxo Visual

```
┌─────────────────────────────────────────────────┐
│ Zona Transição (dist 3-10)                      │
│                                                 │
│  70% Safe visually           30% Hostile visual │
│  ┌──────────────────┐       ┌─────────────────┐│
│  │ 🏞️ Verde, calmo  │       │ 🌋 Vermelho,    ││
│  │ Sprite aleatório │       │    ominoso      ││
│  │ (grass, forest)  │       │ Sprite aleatório││
│  │ var_452          │       │ (lava, rocks)   ││
│  │                  │       │ var_789         ││
│  └──────────────────┘       └─────────────────┘│
│                                                 │
│ Ambos têm PvP bloqueado, mas visual varia      │
│ Ambos retornam loot 1.5x                       │
└─────────────────────────────────────────────────┘
```

### Pseudocódigo Simples

```js
// Versão simplificada para clareza
function determineZone(chunkX, chunkY) {
  const distance = Math.sqrt(chunkX ** 2 + chunkY ** 2);
  const hash = (chunkX * 73856093 ^ chunkY * 19349663) % 100;
  
  // Base zone by distance
  if (distance < 3) {
    return 'safe';
  }
  
  if (distance < 10) {
    // Transição: 30% chance de ser hostil
    return hash < 30 ? 'hostile' : 'transition';
  }
  
  return 'hostile';
}

// Exemplos
determineZone(5, 0);  // hash=45 → transition
determineZone(5, 1);  // hash=56 → transition
determineZone(5, 2);  // hash=67 → transition
// Resultado real varia baseado no hash real
```

### Garantias

✅ **Determinístico**: Mesma coordenada sempre retorna mesma zona  
✅ **Distribuído**: ~30% de hostil em transição (esperado)  
✅ **Visual aleatório**: Sprites mudam com RNG procedural  
✅ **Desconhecido**: Jogador não sabe zona até entrar (suspense!)

---

## 📊 Matriz de Validação

Antes de aceitar qualquer ação, o servidor valida a zona:

```
┌─────────────────────────────────────────────────────┐
│ Zona      │ Mining │ Building │ PvE │ PvP │ Loot  │
├─────────────────────────────────────────────────────┤
│ Safe      │   ✅   │    ✅    │ ✅  │  ❌ │ 1.0x  │
│ Transition│   ✅   │    ✅    │ ✅  │  ❌ │ 1.5x  │
│ Hostile   │   ✅   │    ❌    │ ✅  │  ✅ │ 3.0x  │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Validação

```
Client emite ação
    ↓
Server recebe
    ├─ Obter chunk_id
    ├─ Consultar zone_type
    ├─ Match com ZoneValidator
    └─ Retornar resultado
    ↓
Se permitido → Persistir
Se bloqueado → Rejeitar com motivo
```

---

## 📏 Limite de Zona

Para evitar exploração, há um máximo de distância teórica:

```js
const MAX_DISTANCE = 100; // chunks
const MAX_DIFFICULTY = 10; // capped

// Se jogador vai muito longe
if (distance > MAX_DISTANCE) {
  // Ainda pode ir, mas difficulty fica capped em 10
  difficulty = 10;
  lootMultiplier = 3.0;
}
```

---

## 🎯 Progressão Recomendada

Para jogadores novatos explorar gradualmente:

```
Week 1: Safe zone (dist < 3)
  ├─ Familiar com mecânicas
  ├─ Sem risco
  └─ Loot: 1.0x

Week 2-3: Transition zone (dist 3-10)
  ├─ Mais desafio
  ├─ Mobs mais fortes
  └─ Loot: 1.5x

Week 4+: Hostile zone (dist 10+)
  ├─ PvP liberado
  ├─ Alto risco/recompensa
  └─ Loot: 3.0x
```

---

**Próxima Leitura**: [03 - Schema do Banco](./03-database-schema.md)
