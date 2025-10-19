# 🧱 Estrutura Espacial

Define os conceitos fundamentais que sustentam o sistema de universo infinito.

---

## 📍 Coordenadas e Posicionamento

### Coordenadas Absolutas (x, y)

- Posição global no universo (em pixels)
- Alcance teórico: `-Number.MAX_SAFE_INTEGER` até `+Number.MAX_SAFE_INTEGER`
- Referência: origem `(0, 0)` no centro do universo

Exemplo:
```
Posição do jogador: x = 12340, y = -7890
```

---

## 🧩 Conceito de Chunk

Um **chunk** é uma região quadrada fixa que contém entidades e eventos proceduralmente gerados.

| Propriedade | Valor |
|-------------|-------|
| Tamanho | 1000x1000 pixels (ajustável) |
| Conteúdo | Asteroides, planetas, NPCs, recursos |
| Estado | Persistente no servidor |
| Ciclo | Lazy-loaded sob demanda |

### Coordenadas de Chunk

Cálculo a partir de uma posição absoluta:

```js
CHUNK_SIZE = 1000; // pixels

chunkX = Math.floor(x / CHUNK_SIZE);
chunkY = Math.floor(y / CHUNK_SIZE);
```

Exemplo:
```
Jogador em (12340, -7890)
→ chunkX = Math.floor(12340 / 1000) = 12
→ chunkY = Math.floor(-7890 / 1000) = -8
→ Chunk ID: "12,-8"
```

### Mapeamento Reverso

Para obter a posição local dentro de um chunk:

```js
localX = x % CHUNK_SIZE;
localY = y % CHUNK_SIZE;
```

---

## 🌱 Seed Procedural

Um **seed** é um valor determinístico derivado das coordenadas do chunk que define o conteúdo procedural.

### Geração de Seed

```js
const seed = `${chunkX},${chunkY}`;
// Exemplo: seed = "12,-8"
```

### Propriedades

- **Determinístico**: Mesmo chunk sempre gera o mesmo conteúdo
- **Simples**: Baseado apenas em coordenadas
- **Hash-compatível**: Pode ser convertido para número
- **Versionável**: Fácil adicionar versão (ex: "seed_v2")

### Garantias

✅ Visitando chunk `(12, -8)` 10 vezes → sempre o mesmo resultado  
✅ Dois jogadores no chunk `(12, -8)` → veem o mesmo ambiente  
✅ Sem necessidade armazenar conteúdo procedural, apenas descrevê-lo  

---

## 👁️ Região Ativa e Carregamento

### Região Ativa

Conjunto de chunks carregados próximos ao jogador, em um raio configurável.

```js
ACTIVE_RADIUS = 2; // chunks

// Chunks ativos ao redor do jogador
chunkX ± ACTIVE_RADIUS
chunkY ± ACTIVE_RADIUS
```

Exemplo com `ACTIVE_RADIUS = 2`:
```
Se jogador está em chunk (12, -8), carrega:
(10,-10), (11,-10), (12,-10), (13,-10), (14,-10)
(10, -9), (11, -9), (12, -9), (13, -9), (14, -9)
(10, -8), (11, -8), (12, -8), (13, -8), (14, -8)
(10, -7), (11, -7), (12, -7), (13, -7), (14, -7)
(10, -6), (11, -6), (12, -6), (13, -6), (14, -6)

Total: 25 chunks = 5x5 grid
```

### Cálculo de Carga de Memória

```
Chunks carregados = (2 * ACTIVE_RADIUS + 1)²
= (2 * 2 + 1)²
= 5²
= 25 chunks
```

---

## 💾 Região Persistente

Chunks descobertos e armazenados no servidor, mesmo que descarregados do cliente.

| Estado | Descrição |
|--------|-----------|
| **Undiscovered** | Nunca visitado por nenhum jogador |
| **Discovered** | Primeiro acesso: seed e metadata salvas |
| **Modified** | Alterações registradas (mineração, construção) |
| **Persisted** | Estado completo sincronizado no servidor |

---

## 📋 Sumário da Estrutura

```
Universo Infinito (potencialmente infinito)
    ↓
Chunks (1000x1000 px cada)
    ↓
Coordenadas Absolutas (x, y em pixels)
    ↓
Seed Procedural (determinístico por chunk)
    ↓
Entidades Geradas (asteroides, planetas, NPCs)
    ↓
Estado Persistente (servidor)
```
