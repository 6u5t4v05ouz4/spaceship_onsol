# 🔮 Roadmap de Desenvolvimento

Fases de desenvolvimento e timeline estimada para implementar o sistema ATLAS.

---

## 📋 Fases Principais

### Fase 1: Estrutura e Geração Procedural

**Duração**: 2-3 semanas  
**Status**: 🟢 Em andamento

#### Objetivos
- ✅ Definir estrutura de chunk (1000x1000 px)
- ✅ Implementar sistema de seed determinístico
- ✅ Gerar asteroides proceduralmente
- ✅ Gerar planetas (5% chance)

#### Entregáveis
- `src/systems/atlas/chunk-generator.js`
- `src/systems/atlas/procedural-generator.js`
- Testes unitários de geração

#### Critérios de Aceitação
```
[ ] Chunks geridos com seed reprodutível
[ ] Diferentes seeds geram diferentes conteúdos
[ ] Geração completa em < 50ms
[ ] 100% cobertura de testes
```

---

### Fase 2: Carregamento Dinâmico e Streaming

**Duração**: 2 semanas  
**Status**: ⏳ Planejado

#### Objetivos
- Implementar carregamento/descarregamento dinâmico
- Sistema de raio ativo (ACTIVE_RADIUS = 2)
- Renderização em Phaser.js
- Sincronização de estado com servidor

#### Entregáveis
- `src/systems/atlas/atlas-manager.js`
- `src/systems/atlas/chunk-loader.js`
- Integração com Phaser SceneSpace

#### Critérios de Aceitação
```
[ ] 5x5 grid de chunks carregados ao redor do jogador
[ ] Chunks descarregados corretamente ao sair do raio
[ ] FPS > 50 com 25 chunks ativos
[ ] Sem memory leaks após 1 hora de gameplay
```

---

### Fase 3: Persistência de Estado e Sincronização PvP

**Duração**: 3 semanas  
**Status**: ⏳ Planejado

#### Objetivos
- Criar schema PostgreSQL (chunks, chunk_changes, etc)
- Implementar sincronização real-time via WebSocket
- Sistema de contenção de recursos (lock)
- RLS policies para segurança

#### Entregáveis
- `database-schema.sql`
- `src/api/chunks-routes.js` (backend)
- `src/systems/atlas/server-client.js` (frontend)
- WebSocket integration

#### Critérios de Aceitação
```
[ ] Chunks persistem no BD
[ ] 2+ jogadores sincronizam estado real-time
[ ] Contenção de recursos funciona (first come, first serve)
[ ] Latência < 100ms para ações
[ ] RLS policies testadas
```

---

### Fase 4: Otimizações (Culling, LOD, Prefetch)

**Duração**: 2 semanas  
**Status**: 🔜 Futuro

#### Objetivos
- Implementar culling (occluded objects)
- Sistema de LOD (4 níveis)
- Prefetching baseado em velocidade
- Monitoramento de performance

#### Entregáveis
- `src/systems/atlas/culling-manager.js`
- `src/systems/atlas/lod-manager.js`
- `src/systems/atlas/prefetch-manager.js`
- Performance dashboard

#### Critérios de Aceitação
```
[ ] Culling reduz processamento em 30%
[ ] LOD suporta 60+ chunks renderizados
[ ] Prefetch evita lag ao cruzar bordas
[ ] FPS > 55 em low-end devices
```

---

### Fase 5: Integração com Crafting e Eventos

**Duração**: 2 semanas  
**Status**: 🔜 Futuro

#### Objetivos
- Sistema de eventos (onChunkDiscovered, onChunkModified)
- Missões dinâmicas baseadas em chunks
- Integração com sistema de mineração
- Badges e achievements

#### Entregáveis
- `src/systems/atlas/event-manager.js`
- `src/systems/atlas/discovery-manager.js`
- Integração com MissionSystem
- UI de notificações

#### Critérios de Aceitação
```
[ ] Eventos disparam corretamente
[ ] Missões geradas baseado em dificuldade
[ ] Descobertas registram XP
[ ] Badges desbloqueados corretamente
```

---

### Fase 6: Web Workers e Otimizações Avançadas

**Duração**: 2 semanas  
**Status**: 🔜 Futuro

#### Objetivos
- Gerar chunks em Web Worker
- Compressão de dados (LZ4)
- Cache inteligente (LRU)
- Batching de operações BD

#### Entregáveis
- `src/systems/atlas/chunk-generator.worker.js`
- `src/systems/atlas/smart-cache.js`
- Compressão na API

#### Critérios de Aceitação
```
[ ] Worker não bloqueia main thread
[ ] Compressão reduz bandwidth em 60%
[ ] Cache aumenta hit rate em 80%
[ ] Testes de stress (1000+ chunks)
```

---

## 📊 Timeline Estimada

```
Semanas        1-2        3-4        5-7        8-9       10-11      12-13
             ─────────────────────────────────────────────────────────────
             
Fase 1   ████████ CORE GERAÇÃO                                          
             Fase 2          ████████ STREAMING & PHASER                
                               Fase 3          ██████████ PERSISTÊNCIA
                                                   Fase 4       ████████ OTIMIZAÇÕES
                                                                   Fase 5      ████████ EVENTOS
                                                                              Fase 6 ████ WORKERS

Milestones:
├─ Semana 2: Alpha v0.1 (geração básica)
├─ Semana 4: Beta v0.2 (renderização)
├─ Semana 7: MVP v0.3 (sincronização)
├─ Semana 9: Release v1.0 (otimizações)
└─ Semana 13: Polish v1.1 (refinements)
```

---

## 🎯 Milestones

### Alpha v0.1.0 (Semana 2)
**Foco**: Viabilidade técnica

- [x] Geração procedural de chunks
- [x] Cálculo determinístico de seed
- [x] Estrutura básica de dados

**Demo**: Gerar e renderizar 1 chunk

### Beta v0.2.0 (Semana 4)
**Foco**: Gameplay básico

- [ ] Carregar/descarregar chunks dinamicamente
- [ ] Integração com Phaser.js
- [ ] Movimento do jogador em espaço infinito

**Demo**: Explorar 5x5 grid de chunks

### MVP v0.3.0 (Semana 7)
**Foco**: Pronto para produção

- [ ] Persistência em BD
- [ ] Sincronização real-time (PvP)
- [ ] Segurança (RLS, validação)

**Demo**: 2+ jogadores explorando juntos

### Release v1.0.0 (Semana 9)
**Foco**: Otimizações

- [ ] Culling e LOD
- [ ] Performance em device antigo
- [ ] Balanceamento

**Demo**: 60+ chunks renderizados, 60 FPS

### Polish v1.1.0 (Semana 13)
**Foco**: Refinamentos

- [ ] Web Workers
- [ ] Compressão de dados
- [ ] Cache inteligente

**Demo**: Stress test (1000+ chunks explorados)

---

## 🚧 Dependências Entre Fases

```
Fase 1 (Geração)
    ↓
Fase 2 (Streaming)
    ↓
Fase 3 (Persistência) ← Fase 2 precisa estar 80% pronto
    ↓
Fase 4 (Otimizações) ← Fase 3 precisa estar 100% pronto
    ↓
Fase 5 (Eventos)     ← Pode trabalhar em paralelo com Fase 4
    ↓
Fase 6 (Workers)     ← Depende de testes de performance (Fase 4)
```

---

## 📈 Métricas de Sucesso

### Performance
```
FPS: 55-60 (target)
Memory: < 100MB (target)
Load time: < 50ms por chunk
Unload time: < 20ms por chunk
```

### Funcionalidade
```
Chunks simultâneos: 25-50
Sincronização latência: < 100ms
Contenção de recursos: 100% acuracy
RLS segurança: 100% compliance
```

### Escala
```
Usuários simultâneos: 1000+
Chunks globais: 10000+
Modificações/segundo: 100+
Conexões DB: Pool de 20-50
```

---

## 🔄 Processso de Revisão

Cada fase segue:

1. **Planning** (1 dia)
   - Quebrar em tasks
   - Estimar esforço
   - Identificar riscos

2. **Implementation** (5-10 dias)
   - Code reviews
   - Testes contínuos
   - Performance checks

3. **Testing** (2-3 dias)
   - Testes unitários
   - Testes integração
   - Stress testing

4. **Polish** (1-2 dias)
   - Documentação
   - Otimizações menores
   - Prepare para next fase

---

## 🎓 Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------| ----------|
| Geração procedural lenta | Médio | Alto | Usar Web Worker |
| Sincronização out-of-sync | Médio | Alto | Sistema de versioning |
| Memory leak em chunks | Alto | Alto | Monitoring, testes |
| Query BD lenta com muitos chunks | Médio | Médio | Índices, particionamento |
| Sessão do jogador cair | Médio | Médio | Reconnection logic |

---

## 📞 Comunicação

- **Daily Standup**: Quarta-feira 10h
- **Sprint Review**: Sexta-feira 16h
- **Sprint Planning**: Terça-feira 14h
- **Communication channel**: Discord #atlas-dev
