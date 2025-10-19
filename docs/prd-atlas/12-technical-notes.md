# 📘 Notas Técnicas

Observações técnicas importantes, limitações e considerações para implementação.

---

## 🌐 Compatibilidade

### Phaser 3.x

O ATLAS é desenvolvido para **Phaser 3** (WebGL + Arcade Physics).

**Versões suportadas:**
- Phaser 3.50.0 ou superior
- Teste em Phaser 3.55+

**Incompatibilidades conhecidas:**
- Phaser 2.x: Sem suporte (arquitectura diferente)
- Phaser 4.0 (em beta): Aguardando release estável

### JavaScript Moderno

Usa features ES2020+:
- Spread operator (`...`)
- Template literals
- Arrow functions
- Async/await
- Map/Set

**Compatibilidade de browser:**
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Node.js (Headless Mode)

ATLAS pode rodar em Node.js para:
- Gerar chunks server-side
- Testes automatizados
- Simulações

```js
// Não usa window, document, ou canvas
// Puro JavaScript, math e lógica
const ProceduralChunkGenerator = require('./procedural-generator.js');
const chunk = ProceduralChunkGenerator.generateChunk(null, 5, 3);
```

---

## 🔢 Limitações Numéricas

### Coordenadas Absolutas

**Range seguro**: `-Number.MAX_SAFE_INTEGER` até `+Number.MAX_SAFE_INTEGER`

```js
Number.MAX_SAFE_INTEGER = 9007199254740991  // ~9 * 10^15

// Em pixels (com CHUNK_SIZE = 1000)
// Máximo em chunks: ~9 * 10^12 chunks
// Em distância: ~9 * 10^15 pixels (~9 * 10^12 km @ 1px/km)
```

**Implicação prática:**
- Suficiente para qualquer gameplay realista
- Universo vai desde -9*10^15 até +9*10^15 pixels

### Limite de Chunks Simultâneos

Com `ACTIVE_RADIUS = 2`:

```
Chunks carregados = (2*R + 1)² = (2*2 + 1)² = 25
```

Ajustar `ACTIVE_RADIUS`:
```js
// R=1: 9 chunks (early phase)
// R=2: 25 chunks (standard) ← RECOMENDADO
// R=3: 49 chunks (high-end devices)
// R=4: 81 chunks (extreme, não recomendado)
```

### Tamanho de Chunk

**1000x1000 pixels** é o sweet spot:

| Tamanho | Pós/Contras |
|---------|-----------|
| 500px | ✗ Muito pequeno, overhead de load |
| 1000px | ✓ Ótimo balanço |
| 2000px | ✗ Grande demais, pouca variedade |

---

## 🗄️ Persistência

### Banco de Dados

**Recomendação:** PostgreSQL 12+

```sql
-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- JSONB: efficient storage for procedural_data
-- UUID: UUIDs para players
-- BIGINT: coordenadas grandes
```

### Políticas de Retenção

Para games com muitos chunks:

```sql
-- Arquivar chunks não visitados há 6 meses
DELETE FROM chunks 
WHERE modified_at < NOW() - INTERVAL '6 months'
AND discovered_by IS NULL;

-- Compactar histórico de ações
DELETE FROM chunk_changes 
WHERE created_at < NOW() - INTERVAL '30 days'
AND archived = true;
```

### Escalabilidade de Dados

**Crescimento teórico:**

```
Chunks por mês: ~1000
Mudanças por chunk: ~50
Jogadores: ~1000

Total mensalmente:
- Chunks: 1000 registros
- Changes: 50,000 registros
- Storage: ~50 MB

Em 1 ano:
- ~600,000 chunks
- ~30 M mudanças
- ~600 MB
```

Para escalar:

1. **Sharding**: Dividir chunks por região geográfica
2. **Particionamento**: Particionar por data (mês)
3. **Archive**: Mover dados antigos para cold storage

---

## ⚡ Performance

### Targets de Performance

```
Operation          | Time Budget | Actual (target)
─────────────────────────────────────────────
Chunk generation   | 50ms        | 20-30ms
Chunk loading      | 100ms       | 50-70ms
Physics update     | 16ms        | 10-12ms (60 FPS)
Render             | 16ms        | 12-14ms (60 FPS)
```

### Memory Budget

```
Base Phaser        | 20 MB
Game assets        | 30 MB
Active chunks (25) | 25 * 2MB = 50 MB
─────────────────────
Total target       | < 100 MB
```

### Profiling

Use Chrome DevTools:

```js
// Performance markers
performance.mark('chunk-load-start');
loadChunk(chunkId);
performance.mark('chunk-load-end');
performance.measure('chunk-load', 'chunk-load-start', 'chunk-load-end');

// Resultados
console.log(performance.getEntriesByName('chunk-load'));
```

---

## 🔐 Segurança

### Validação Client-Side

Nunca confiar em dados do cliente:

```js
// ❌ NUNCA
async recordMining(asteroidId, resourcesCollected) {
  await server.recordMining(asteroidId, resourcesCollected);
}

// ✅ SEMPRE validar no servidor
async recordMining(asteroidId, durationMs) {
  const result = await server.recordMining(asteroidId, durationMs);
  // Servidor calcula resourcesCollected
  return result;
}
```

### RLS (Row Level Security)

Implementar RLS em todas as tabelas:

```sql
ALTER TABLE player_chunk_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY player_isolation ON player_chunk_state
  FOR ALL
  USING (player_id = auth.uid());
```

### Rate Limiting

Proteger API contra abuse:

```js
// 10 ações por segundo por jogador
const limiter = rateLimit({
  windowMs: 1000,
  max: 10,
  keyGenerator: (req) => req.user.id
});

app.post('/chunks/:id/actions', limiter, handleChunkAction);
```

---

## 🧪 Testes

### Testes Unitários

```bash
npm test -- src/systems/atlas/
```

Coverage target: **90%+**

```js
describe('ProceduralChunkGenerator', () => {
  test('generates deterministic chunks', () => {
    const chunk1 = ProceduralChunkGenerator.generateChunk(null, 0, 0);
    const chunk2 = ProceduralChunkGenerator.generateChunk(null, 0, 0);
    expect(chunk1.entities.length).toBe(chunk2.entities.length);
  });
});
```

### Testes de Integração

```bash
npm run test:integration
```

- 2+ jogadores sincronizam
- Chunks persistem
- RLS funciona

### Testes de Stress

```bash
npm run test:stress -- --chunks 1000 --players 100
```

- 1000+ chunks
- 100 jogadores simultâneos
- Medir latência e memory

### Testes de Compatibilidade

```bash
npm run test:compat -- --browsers "chrome,firefox,safari"
```

---

## 📚 Documentação

### Convenção de Nomes

```js
// Chunks
const chunkId = "12,-7";        // Format: "x,y"
const CHUNK_SIZE = 1000;         // Constante UPPER_CASE

// Entidades
const asteroidId = "ast_12_-7_0"; // Formato: "type_chunkx_chunky_idx"
const planetId = "planet_A";      // Nomes descritivos

// Métodos
const onChunkEnter = () => {};    // camelCase, verbos no presente
const getActiveChunks = () => {}; // Getter prefix
```

### Comentários

```js
// ❌ Ruim
const x = Math.floor(playerX / 1000);

// ✅ Bom
// Calcular coordenada do chunk a partir da posição absoluta
const chunkX = Math.floor(playerX / CHUNK_SIZE);

// ✅ Ótimo - comentário sobre o porquê
// Usando Math.floor em vez de bitwise shift (~) para legibilidade
// mesmo que performance seja similar
const chunkX = Math.floor(playerX / CHUNK_SIZE);
```

---

## 🐛 Debug e Troubleshooting

### Enable Debug Logging

```js
// No código
localStorage.setItem('debug-atlas', 'true');

// Ou via console
globalThis.ATLAS_DEBUG = true;

// Logs aparecerão com prefix [ATLAS]
console.log('[ATLAS]', 'Loading chunk', chunkId);
```

### Verificar Estado de Chunks

```js
// Console DevTools
window.atlas.loadedChunks  // Ver chunks carregados
window.atlas.eventManager.events  // Ver event listeners
performance.memory  // Memory usage
```

### Problemas Comuns

#### Chunks não carregam
```
1. Verificar conexão servidor
2. Verificar console para erros
3. Verificar RLS policies
```

#### Memory leak
```
1. Verificar unloadChunk() está destruindo sprites
2. Verificar event listeners estão sendo removidos
3. Usar Chrome DevTools heap snapshot
```

#### Lag ao cruzar chunks
```
1. Usar prefetching
2. Reduzir ACTIVE_RADIUS
3. Usar LOD para chunks distantes
```

---

## 📖 Versionamento

### Versão do Sistema ATLAS

**Formato**: `MAJOR.MINOR.PATCH-PHASE`

- `v0.1.0-alpha`: Prototipo
- `v0.2.0-beta`: Funcional
- `v1.0.0`: Release
- `v1.1.0`: Otimizações

### Versionamento de Seed

Para manter compatibilidade ao evoluir:

```js
const SEED_VERSION = 1;
const seed = `${chunkX},${chunkY}_v${SEED_VERSION}`;

// Ao mudar algoritmo:
const SEED_VERSION = 2;
// Chunks antigos mantêm v1, novos usam v2
```

---

## 🌍 Deployment

### Ambiente de Desenvolvimento

```bash
ATLAS_ENVIRONMENT=dev
CHUNK_SIZE=1000
ACTIVE_RADIUS=2
DEBUG=true
```

### Ambiente de Produção

```bash
ATLAS_ENVIRONMENT=prod
CHUNK_SIZE=1000
ACTIVE_RADIUS=2
DEBUG=false
COMPRESSION=lz4
CACHE_STRATEGY=lru
```

### CI/CD Checklist

```
[ ] Testes passam (100% passing)
[ ] Coverage >= 90%
[ ] Sem memory leaks
[ ] Performance targets atingidos
[ ] Security scan passed
[ ] Deployment script OK
```

---

## 📞 Suporte e Comunidade

### Reportar Bugs

GitHub Issues:
```
Title: [ATLAS] Brief description
Labels: bug, performance/feature/security
```

### Propor Features

GitHub Discussions:
```
Category: Ideas
Title: [FEATURE] New feature proposal
```

### Comunicação

- **Discord**: #atlas-dev
- **Email**: atlas@example.com
- **Issues**: GitHub ATLAS project

