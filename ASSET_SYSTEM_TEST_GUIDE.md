# 🧪 Asset System Test Guide

## 📋 Visão Geral

Guia completo para testar o sistema de assets visuais para elementos do mapa compartilhado.

## 🎯 Objetivos do Teste

1. ✅ Verificar carregamento de assets baseado em distância
2. ✅ Confirmar sincronização de elementos entre jogadores
3. ✅ Validar variação visual por raridade
4. ✅ Testar performance de preload
5. ✅ Verificar efeitos visuais e interatividade

## 🔧 Preparação para Testes

### 1. Banco de Dados
```sql
-- Verificar se as novas colunas foram criadas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'chunk_elements'
  AND column_name IN ('asset_variant_id', 'asset_frame', 'rarity_level');

-- Verificar elementos existentes
SELECT element_type, rarity_level, COUNT(*)
FROM chunk_elements
GROUP BY element_type, rarity_level;
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

### Teste 1: Geração Procedural de Assets
**Objetivo:** Verificar que elementos diferentes são gerados baseados na distância

**Passos:**
1. Faça login em ambos os navegadores
2. Entre no jogo em ambos
3. Observe os elementos no chunk inicial (0,0)
4. Mova para chunks distantes (>30, >30)
5. Compare a aparência dos elementos

**Resultados Esperados:**
- **Chunks (0-10):** Asteroides cinza comuns, cristais cian básicos
- **Chunks (11-30):** Asteroides marrons raros, cristais magenta energéticos
- **Chunks (>30):** Asteroides dourados lendários, cristais amarelos quânticos

### Teste 2: Sincronização Multiplayer
**Objetivo:** Confirmar que ambos os jogadores veem os mesmos elementos

**Passos:**
1. Posicione ambos os jogadores no mesmo chunk
2. Compare os elementos visuais
3. Mova para outro chunk juntos
4. Verifique se os elementos são idênticos

**Resultados Esperados:**
- Mesmo número de asteroides/cristais
- Mesmas posições X/Y
- Mesma aparência visual (cor, forma)
- Mesmos efeitos de brilho/animação

### Teste 3: Sistema de Preload
**Objetivo:** Testar carregamento inteligente de assets

**Passos:**
1. Abra DevTools em ambos os navegadores
2. Vá para aba Network
3. Mova rapidamente entre chunks
4. Observe os padrões de carregamento

**Resultados Esperados:**
- Assets de chunks adjacentes carregados previamente
- Sem delay ao entrar em chunks já preparados
- Descarregamento de chunks distantes

### Teste 4: Interatividade dos Elementos
**Objetivo:** Testar cliques e interações

**Passos:**
1. Clique em asteroides diferentes
2. Clique em cristais
3. Observe efeitos visuais
4. Verifique console para logs

**Resultados Esperados:**
- Logs de clique no console
- Feedback visual ao clicar
- Cristais com efeito de pulse/brilho
- Asteroides com cursor interativo

### Teste 5: Performance
**Objetivo:** Medir impacto no FPS

**Passos:**
1. Abra DevTools → Performance
2. Grave enquanto navega pelo mapa
3. Verifique uso de memória e CPU
4. Teste com múltiplos chunks carregados

**Resultados Esperados:**
- FPS estável (60fps ideal)
- Memory usage controlado
- Sem lag ao trocar de chunks

## 🔍 Logs para Monitorar

### Console Logs do Cliente
```javascript
// Logs de inicialização
🌐 Inicializando Multiplayer Manager...
🎨 Inicializando Asset Manager...
🖼️ Inicializando Sprite Sheet Manager...
✅ Asset Manager inicializado

// Logs de chunks
📦 Chunk data recebido: {chunk: {...}, asteroids: [...], crystals: [...]}
🌑 Processando asteroides do chunk...
💎 Processando cristais do chunk...
✅ Elemento spawnado: asteroid (123.45, 678.90)
✅ Elemento spawnado: crystal (234.56, 789.01)

// Logs de sincronização
👤 Player entrou: Player2
📊 Total de outros players após processamento: 1
📊 Total de elementos visíveis: 8
```

### Console Logs do Servidor
```javascript
// Logs de geração de elementos
✅ Gerados 5 elementos (common) para chunk (0, 0)
✅ Gerados 4 elementos (rare) para chunk (15, 20)
✅ Gerados 6 elementos (legendary) para chunk (45, 50)

// Logs de multiplayer
🔐 Player autenticado: Player1
📍 Player Player1 entrando no chunk (15, 20)
📦 Chunk (15, 20) enviado: 4 asteroides, 2 cristais, 1 players
```

## 🐛 Troubleshooting

### Problema: Elementos não aparecem
**Sintomas:** Chunk vazio, sem asteroids/cristais
**Causas Possíveis:**
- Sprite sheets não carregados
- Erro na geração procedural
- Problema de posição Z-index

**Soluções:**
```javascript
// Verificar se texturas existem
console.log('Texturas disponíveis:', scene.textures.getTextureKeys());

// Verificar elementos recebidos
console.log('Dados do chunk:', chunkData);
```

### Problema: Elementos diferentes entre jogadores
**Sintomas:** Jogadores veem elementos diferentes no mesmo chunk
**Causas Possíveis:**
- Seeds diferentes na geração
- Cache desatualizado
- Problema de sincronização

**Soluções:**
```sql
-- Verificar elementos no banco
SELECT * FROM chunk_elements WHERE chunk_x = 0 AND chunk_y = 0;

-- Limpar cache se necessário
DELETE FROM chunk_elements WHERE chunk_x = 0 AND chunk_y = 0;
```

### Problema: Performance ruim
**Sintomas:** FPS baixo, lag ao mover
**Causas Possíveis:**
- Muitos elementos renderizados
- Memory leak
- Assets não sendo descarregados

**Soluções:**
```javascript
// Verificar estatísticas
const stats = multiplayerManager.assetManager.getStats();
console.log('Stats:', stats);

// Forçar cleanup
multiplayerManager.assetManager.cleanup();
```

## 📊 Critérios de Sucesso

### Funcionalidade
- [ ] Elementos gerados baseados em distância
- [ ] Sincronização perfeita entre jogadores
- [ ] Preload inteligente funcionando
- [ ] Intatividade responsiva
- [ ] Performance aceitável (60fps)

### Visual
- [ ] Variação de cores por raridade
- [ ] Efeitos de brilho em cristais
- [ ] Animações suaves
- [ ] Efeitos de destruição
- [ ] Feedback visual adequado

### Técnico
- [ ] Sem memory leaks
- [ ] Cache eficiente
- [ ] Logs informativos
- [ ] Tratamento de erros
- [ ] Código limpo e modular

## 🚀 Próximos Passos

1. **Automatizar testes** com Cypress/Playwright
2. **Adicionar métricas** de performance
3. **Implementar mais tipos** de elementos
4. **Otimizar ainda mais** o sistema de preload
5. **Adicionar efeitos** sonoros

---

**Status Final:** ✅ **Sistema de Assets Implementado**
**Teste Recomendado:** Teste completo com 2 jogadores em diferentes distâncias
**Próximo Foco:** Otimização de performance e novos tipos de elementos