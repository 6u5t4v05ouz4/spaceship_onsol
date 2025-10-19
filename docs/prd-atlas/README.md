# 📜 ATLAS — Procedural Real-time Dynamic Atlas System

Sistema de gerenciamento de universo infinito para o jogo espacial top-down desenvolvido em **Phaser.js**, com suporte a **PvE e PvP**.

## 📑 Índice de Documentação

### Core Concepts
- [01 - Visão Geral](./01-overview.md) — Propósito e objetivos principais
- [02 - Estrutura Espacial](./02-spatial-structure.md) — Conceitos fundamentais (chunks, seeds, coordenadas)
- [03 - Chunk Streaming](./03-chunk-streaming.md) — Lógica de divisão e carregamento dinâmico

### Systems
- [04 - Geração Procedural](./04-procedural-generation.md) — Sistema determinístico de conteúdo
- [05 - Persistência & Sincronização](./05-persistence-sync.md) — Armazenamento e sincronização multijogador
- [06 - PvE vs PvP Modes](./06-pve-pvp-modes.md) — Diferenças entre modos de jogo

### Implementation
- [07 - Eventos & Descoberta](./07-events-discovery.md) — Sistema de eventos e notificações
- [08 - Banco de Dados](./08-database-indices.md) — Schema e índices recomendados
- [09 - Integração Phaser.js](./09-phaser-integration.md) — Pipeline de implementação

### Planning & Optimization
- [10 - Otimizações Futuras](./10-optimizations.md) — Culling, LOD, WebWorkers, Prefetching
- [11 - Roadmap](./11-roadmap.md) — Fases de desenvolvimento
- [12 - Notas Técnicas](./12-technical-notes.md) — Compatibilidade e limitações

---

## 🎯 Quick Start

1. Leia [01 - Visão Geral](./01-overview.md) para entender o propósito
2. Estude [02 - Estrutura Espacial](./02-spatial-structure.md) para conceitos
3. Analise [03 - Chunk Streaming](./03-chunk-streaming.md) para lógica base
4. Implemente conforme [09 - Integração Phaser.js](./09-phaser-integration.md)

---

## 📡 Licenciamento e Versionamento

- **Módulo:** ATLAS  
- **Repositório:** `/src/systems/atlas/`  
- **Arquivo principal:** `atlas-manager.js`  
- **Versão inicial:** `v0.1.0-alpha`
