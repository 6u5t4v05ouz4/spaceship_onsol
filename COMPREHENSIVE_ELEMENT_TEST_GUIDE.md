# 🌌 Guia de Teste Completo - Sistema Multiplayer de Elementos

## 📋 Visão Geral

Guia completo para testar o sistema expandido de elementos do mapa compartilhado com todos os tipos de recursos, planetas, NPCs e estações espaciais.

## 🎯 Objetivos do Teste

1. ✅ Verificar todos os 15+ tipos de recursos minerais
2. ✅ Confirmar geração de planetas visuais
3. ✅ Validar naves NPCs com comportamentos diferentes
4. ✅ Testar estações espaciais e serviços
5. ✅ Verificar sincronização multiplayer completa
6. ✅ Validar performance com todos os elementos

## 🔧 Preparação para Testes

### 1. Banco de Dados
```sql
-- Verificar novos campos
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'chunk_elements'
  AND column_name IN ('asset_variant_id', 'asset_frame', 'rarity_level');

-- Verificar diversidade de elementos
SELECT element_type, COUNT(*) as total
FROM chunk_elements
GROUP BY element_type
ORDER BY total DESC;

-- Verificar recursos específicos
SELECT element_type,
       data->>'resource_type' as resource_type,
       data->>'planet_type' as planet_type,
       rarity_level,
       COUNT(*) as total
FROM chunk_elements
WHERE element_type IN ('resource', 'planet', 'npc_trader', 'station_trading_post')
GROUP BY element_type, resource_type, planet_type, rarity_level;
```

### 2. Frontend
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Abrir em 2 navegadores diferentes
# Navegador 1: http://localhost:5173
# Navegador 2: http://localhost:5173 (modo anônimo)
```

## 🧪 Testes de Funcionalidade

### Teste 1: Diversidade de Recursos Minerais
**Objetivo:** Verificar todos os tipos de recursos do banco

**Passos:**
1. Faça login em ambos os navegadores
2. Entre no jogo e observe os elementos no chunk inicial
3. Use DevTools para inspecionar elementos
4. Mova para chunks distantes (>30, >30)

**Resultados Esperados:**
- **Metais:** Ferro (cinza), Cobre (marrom), Alumínio (prata), Titânio (cinza escuro), Platina (branco)
- **Combustíveis:** Hidrogênio (ciano), Deutério (azul claro), Antimatéria (magenta)
- **Oxigênio:** Oxigênio líquido (azul), Oxigênio comprimido (azul médio), Cristal de ar (azul claro)
- **Cristais Especiais:** Cristal de energia (dourado), Cristal de poder (amarelo)
- **Projéteis:** Mísseis básicos, guiados, energéticos, torpedos de plasma
- **Especiais:** Cristal espacial (roxo), Essência estelar (rosa), Fragmento de realidade (laranja)

### Teste 2: Geração de Planetas
**Objetivo:** Verificar planetas com diferentes tipos

**Passos:**
1. Explore diferentes chunks procurando elementos grandes
2. Planetas têm 5% de chance de spawn
3. Observe as cores e características visuais

**Resultados Esperados:**
- **Rochosos:** Tons marrom/tarra
- **Gelados:** Tons azul claro
- **Deserto:** Tons amarelados
- **Cristalinos:** Tons roxos/violetas
- **Gasosos:** Tons rosados/claros

### Teste 3: Naves NPCs por Tipo
**Objetivo:** Identificar diferentes comportamentos de NPCs

**Passos:**
1. Procure por naves menores no mapa
2. Observe as cores e formatas
3. Verifique textos flutuantes de comportamento

**Resultados Esperados:**
- **Comerciante (trader):** Verde, formato cargueiro, texto "peaceful"
- **Minerador (miner):** Dourado, formato industrial, texto "neutral"
- **Patrulha (patrol):** Vermelho, formato triangular, texto "hostile"
- **Catador (scavenger):** Cinza, formato irregular, texto "neutral"
- **Explorador (explorer):** Ciano, formato aerodinâmico, texto "friendly"

### Teste 4: Estações Espaciais
**Objetivo:** Testar pontos de interesse e serviços

**Passos:**
1. Procure por estruturas grandes no mapa
2. Observe textos flutuantes com tipo e serviços
3. Verifique diferentes formatos por tipo

**Resultados Esperados:**
- **Posto de Comércio:** Azul, formato quadrado, serviços: "buy • sell • repair"
- **Estação de Mineração:** Laranja, formato circular, serviços: "refine • store • launch"
- **Posto de Pesquisa:** Roxo, formato hexagonal, serviços: "upgrade • analyze • trade"
- **Base Militar:** Vermelho, formato quadrado grande, serviços: "repair • rearm • mission"
- **Estação de Reabastecimento:** Ciano, formato circular, serviços: "refuel • repair • trade"

### Teste 5: Sincronização Multiplayer Completa
**Objetivo:** Confirmar sincronia de todos os elementos

**Passos:**
1. Posicione ambos os jogadores no mesmo chunk
2. Compare visualmente todos os elementos
3. Verifique contadores e posições
4. Teste interação com diferentes tipos

**Resultados Esperados:**
- Mesmo número e tipo de todos os elementos
- Mesmas posições X/Y para todos os recursos
- Mesma aparência visual (cores, formas)
- Textos de NPCs e estações idênticos
- Movimentos suaves sincronizados

### Teste 6: Performance Composta
**Objetivo:** Medir impacto no FPS com todos os elementos

**Passos:**
1. Abra DevTools → Performance
2. Mova rapidamente entre chunks diversos
3. Observe carregamento de diferentes tipos
4. Teste com múltiplos players

**Resultados Esperados:**
- FPS estável (>30fps mínimo)
- Carregamento suave entre chunks
- Sem lag com múltiplos elementos visíveis
- Memória controlada

## 🔍 Logs para Monitorar

### Console Logs do Cliente
```javascript
// Logs de inicialização expandida
🎨 Inicializando Asset Manager...
🖼️ Inicializando Sprite Sheet Manager...
✅ Asset Manager inicializado com 16 sprite sheets

// Logs de chunk com todos os elementos
📦 Chunk data recebido: {chunk: {...}, asteroids: [...], crystals: [...],
                          resources: [...], planets: [...], npcs: [...], stations: [...]}
📊 Recursos no chunk: 5
📊 Planetas no chunk: 1
📊 NPCs no chunk: 2
📊 Estações no chunk: 1

// Logs de spawn específicos
⛏️ Processando recursos minerais do chunk...
✅ Elemento spawnado: resource (123.45, 678.90) - iron
🪐 Processando planetas do chunk...
✅ Elemento spawnado: planet (345.67, 234.56) - rocky
🚀 Processando NPCs do chunk...
✅ NPC spawnado: trader (456.78, 345.67)
🏭 Processando estações espaciais do chunk...
✅ Estação spawnada: trading_post (567.89, 456.78)
```

### Console Logs do Servidor
```javascript
// Logs de geração expandida
✅ Gerados 8 elementos diversos para chunk (0, 0)
✅ Gerados 6 elementos (rare) para chunk (15, 20)
✅ Gerados 4 elementos (legendary) para chunk (45, 50)

// Logs de multiplayer específicos
📍 Player Player1 entrando no chunk (15, 20)
📦 Chunk (15, 20) enviado: 4 asteroides, 2 cristais, 3 recursos,
                      1 planeta, 2 npcs, 1 estação, 1 players
```

## 🐛 Troubleshooting

### Problema: Recursos não aparecem
**Sintomas:** Apenas asteroides/cristais visíveis
**Causas Possíveis:**
- AssetManager não mapeando tipo 'resource'
- Sprite sheets não carregados
- Geração no banco falhando

**Soluções:**
```javascript
// Verificar mapeamento no AssetManager
console.log('Asset para resource:',
  assetManager.getAssetForElement('resource', {resource_type: 'iron'}, 0));

// Verificar elementos no banco
SELECT element_type, data->>'resource_type'
FROM chunk_elements
WHERE element_type = 'resource';
```

### Problema: NPCs/Estações sem textos
**Sintomas:** Elementos aparecem mas sem informações flutuantes
**Causas Possíveis:**
- spawnNPC/spawnSpaceStation não chamados
- Erro na criação de textos
- Z-index incorreto

**Soluções:**
```javascript
// Verificar se os métodos são chamados
console.log(' NPCs no chunk:', data.npcs?.length || 0);
console.log(' Estações no chunk:', data.stations?.length || 0);

// Verificar depth dos textos
npcText.setDepth(1000);
stationText.setDepth(1000);
```

### Problema: Performance ruim
**Sintomas:** FPS baixo, lag ao mover
**Causas Possíveis:**
- Muitos textos sendo atualizados
- Assets não sendo descarregados
- Memory leak em elementos

**Soluções:**
```javascript
// Verificar estatísticas
const stats = multiplayerManager.assetManager.getStats();
console.log('Stats:', stats);

// Limitar atualização de texto
if (Math.random() < 0.1) { // Atualizar 10% das vezes
  // atualizar texto
}
```

## 📊 Critérios de Sucesso

### Funcionalidade
- [ ] Todos os 15+ tipos de recursos gerados
- [ ] Planetas aparecem com 5% de chance
- [ ] 5 tipos de NPCs funcionando
- [ ] 5 tipos de estações visíveis
- [ ] Sincronização multiplayer perfeita

### Visual
- [ ] Variação de cores por tipo/raridade
- [ ] Textos informativos flutuantes
- [ ] Formas distintas por tipo
- [ ] Efeitos visuais adequados
- [ ] Interface limpa e legível

### Técnico
- [ ] Performance >30fps estável
- [ ] Memória controlada (<200MB)
- [ ] Logs informativos completos
- [ ] Tratamento de erros robusto
- [ ] Código modular e extensível

## 🚀 Próximos Passos

1. **Implementar interação** com NPCs e estações
2. **Adicionar sistema de mineração** para recursos
3. **Implementar missões** geradas por estações
4. **Adicionar combate** com NPCs hostis
5. **Criar sistema de comércio** entre estações
6. **Implementar exploração** planetária

---

**Status Final:** ✅ **Sistema Completo Implementado**
**Teste Recomendado:** Teste completo com 2 jogadores explorando diferentes distâncias
**Próximo Foco:** Interação com elementos e gameplay mechanics