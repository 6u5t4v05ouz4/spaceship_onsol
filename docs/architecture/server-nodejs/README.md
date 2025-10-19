# 🚀 Node.js Real-time Server Architecture

Documentação completa do servidor Node.js para o ATLAS v2.0, responsável pela arbitragem em tempo real, sincronização de batalhas PvP e gerenciamento de zonas.

## 📑 Índice de Documentação

### Core Concepts
- [01 - Visão Geral](./01-overview.md) — Propósito e responsabilidades
- [02 - Sistema de Zonas](./02-zone-system.md) — Cálculo e arbitragem de zonas
- [03 - Schema do Banco](./03-database-schema.md) — Estrutura PostgreSQL completa

### Real-time Sync
- [04 - Fluxos de Sincronização](./04-sync-flows.md) — Chunk enter, Battle, Mining
- [05 - WebSocket Events](./05-websocket-events.md) — Eventos Client ↔ Server
- [06 - Demo Offline](./06-offline-demo.md) — Modo PvE local sem conexão

### Implementation & Integration
- [07 - Integração Supabase](./07-supabase-integration.md) — Client SDK + RLS
- [08 - Estrutura de Pastas](./08-folder-structure.md) — Organização do projeto
- [09 - Setup & Deployment](./09-setup-deployment.md) — Instalação e produção

---

## 🎯 Quick Start

1. **Entender a arquitetura**: Leia [01 - Visão Geral](./01-overview.md)
2. **Estudar zonas**: Veja [02 - Sistema de Zonas](./02-zone-system.md)
3. **Revisar fluxos**: Analise [04 - Fluxos de Sincronização](./04-sync-flows.md)
4. **Implementar**: Siga [08 - Estrutura de Pastas](./08-folder-structure.md)
5. **Deploy**: Consulte [09 - Setup & Deployment](./09-setup-deployment.md)

---

## 📊 Responsabilidades Principais

```
Cliente (Browser)
    ↓ [WebSocket]
    ↓
┌─────────────────────────────────┐
│   Node.js Server (Port 3000)    │
├─────────────────────────────────┤
│ 1. Arbitragem de Zona (PvE/PvP) │
│ 2. Sincronização de Batalhas    │
│ 3. Validação de Ações           │
│ 4. Carregamento de Chunks       │
│ 5. Sincronização de Posições    │
│ 6. Computação em Tempo Real     │
└─────────────────────────────────┘
    ↓ [REST SDK]
    ↓
Supabase (Persistência)
```

---

## 🏗️ Estrutura de Pastas

```
server/
├── server.js                (Express + Socket.io)
├── battle-engine.js         (Lógica de combate)
├── chunk-authority.js       (Arbitragem de zonas)
├── supabase-client.js       (Integração Supabase)
├── player-manager.js        (Estado em tempo real)
├── events/
│   ├── player-events.js
│   ├── battle-events.js
│   └── chunk-events.js
├── utils/
│   ├── distance-calculator.js
│   └── zone-calculator.js
├── middleware/
│   └── auth-middleware.js
├── package.json
└── .env
```

---

## 🔌 Fluxo de Dados

### Entrada: Cliente
```
Client → emit('chunk:enter', { chunkX, chunkY })
              ↓
         Node.js Server
              ↓
         Valida zona
              ↓
         Consulta Supabase
              ↓
         Gera ou carrega chunk
              ↓
Client ← emit('chunk:data', { asteroides, ... })
```

### Saída: Persistência
```
Server → Supabase SDK
            ↓
        RLS Validation
            ↓
        PostgreSQL UPDATE
            ↓
        Broadcast para próximos
```

---

## 📈 Estimativa de Implementação

| Sprint | Foco | Duração |
|--------|------|---------|
| 1 | Schema + Documentação | 1-2 sem |
| 2 | **Node.js Server** | 2 sem |
| 3 | Integração Cliente | 2 sem |
| 4 | Testes + Polish | 1-2 sem |

**Status Atual**: 🟢 Documentação completa, pronto para implementação

---

## 🚀 Próximos Passos

1. ✅ Ler documentação (todos os 9 arquivos)
2. ⏳ Criar schema Supabase (em `03-database-schema.md`)
3. ⏳ Setup Express + Socket.io (em `09-setup-deployment.md`)
4. ⏳ Implementar BattleEngine (em `04-sync-flows.md`)
5. ⏳ Integração com cliente

---

**Versão**: v2.0-alpha  
**Última atualização**: Outubro 2025  
**Status**: 📋 Planejamento → 🔨 Desenvolvimento
