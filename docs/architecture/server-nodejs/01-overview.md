# 🎯 Visão Geral do Servidor Node.js

## Propósito

O servidor Node.js é o **árbitro central** do ATLAS v2.0, responsável por:

1. **Arbitragem em Tempo Real** — Determinar se ações são válidas
2. **Sincronização de Batalhas** — Coordenar combates PvP
3. **Controle de Zonas** — Validar PvE/PvP por distância
4. **Geração de Chunks** — Gerar proceduralmente com seeds determinísticas
5. **Sincronização de Estado** — Manter consistency entre jogadores

---

## 📊 Arquitetura de Camadas

```
┌──────────────────────────────┐
│   WebSocket Layer            │
│  (Socket.io Events)          │
└──────────────────────────────┘
           ↓
┌──────────────────────────────┐
│   Business Logic Layer       │
│  • BattleEngine              │
│  • ChunkAuthority            │
│  • PlayerManager             │
└──────────────────────────────┘
           ↓
┌──────────────────────────────┐
│   Persistence Layer          │
│  (Supabase SDK)              │
└──────────────────────────────┘
           ↓
┌──────────────────────────────┐
│   Database (PostgreSQL)      │
│  (Supabase Backend)          │
└──────────────────────────────┘
```

---

## 🚀 Responsabilidades Principais

### 1. Arbitragem de Zona

Determina se uma ação é permitida baseado na distância do centro (0, 0):

```js
class ChunkAuthority {
  determineSafety(chunkX, chunkY) {
    const distance = Math.sqrt(chunkX ** 2 + chunkY ** 2);
    
    if (distance < 3) return 'safe';        // PvP bloqueado
    if (distance < 10) return 'transition'; // PvP bloqueado
    return 'hostile';                        // PvP liberado
  }
}
```

**Exemplo:**
- Zona Segura (distância < 3): sem PvP
- Zona Transição (3-10): PvE forte, recompensas 1.5x
- Zona Hostil (10+): PvP liberado, recompensas 3.0x

### 2. Sincronização de Batalhas

Valida e arbitra ataques entre jogadores:

```js
battle:attack
  ├─ Validar zona: hostile?
  ├─ Validar distância: próximos?
  ├─ Validar HP: defender vivo?
  ├─ Calcular dano (com armadura)
  ├─ Persistir em Supabase
  └─ Broadcast resultado
```

### 3. Validação de Ações

Todas as ações passam por validação server-side:

```
Client emite ação
    ↓
Server valida
    ├─ Autoridade (zona)
    ├─ Estado (HP, resources)
    ├─ Timing (cooldown)
    └─ Distância (proximidade)
    ↓
Se válido → Persistir
Se inválido → Rejeitar
```

### 4. Carregamento de Chunks

Gerencia geração e carregamento de chunks:

```js
chunk:enter
  ├─ Calcular zona
  ├─ Consultar Supabase
  ├─ Se novo → gerar proceduralmente
  ├─ Se existente → carregar estado
  └─ Retornar ao cliente
```

### 5. Sincronização de Posições

Mantém posições atualizadas em tempo real:

```js
player:move
  ├─ Validar novo chunk
  ├─ Atualizar posição
  ├─ Broadcast para próximos
  └─ Notificar entradas/saídas
```

---

## 🔌 Stack Tecnológico

| Layer | Tecnologia | Responsabilidade |
|-------|-----------|-----------------|
| **Runtime** | Node.js 18+ | Execução |
| **Framework** | Express.js | Routing |
| **Real-time** | Socket.io | WebSocket |
| **Database** | PostgreSQL | Storage |
| **Backend** | Supabase | BaaS |
| **SDK** | @supabase/supabase-js | Client |

---

## 📊 Fluxo de Requisição

```
1. Cliente conecta
   ├─ socket.on('connect')
   └─ emit('auth', { userId, token })

2. Servidor autentica
   ├─ Validar JWT
   ├─ Carregar dados do jogador
   └─ Registrar na memória (playersOnline)

3. Cliente entra em chunk
   ├─ socket.emit('chunk:enter', { chunkX, chunkY })
   └─ Servidor recebe

4. Servidor processa
   ├─ ChunkAuthority.determineSafety(x, y)
   ├─ Supabase.getChunk(x, y)
   └─ Se novo → gera proceduralmente

5. Servidor retorna
   ├─ socket.emit('chunk:data', chunkData)
   └─ Cliente renderiza

6. Ações em tempo real
   ├─ player:move
   ├─ mining:start
   ├─ battle:attack
   └─ Todas validadas e persistidas
```

---

## 💾 Estado em Memória

O servidor mantém cache em memória para **performance real-time**:

```js
// playersOnline.js
const playersOnline = new Map();

// Exemplo
playersOnline.set('player_uuid', {
  id: 'player_uuid',
  username: 'PlayerA',
  chunk: '10,-5',
  x: 10500,
  y: -5300,
  health: 85,
  inventory: { armor: 2 },
  lastAction: Date.now()
});
```

**Quando sincronizar com Supabase:**
- ✅ Mudanças de health
- ✅ Recursos coletados
- ✅ Morte (health = 0)
- ❌ Posição (apenas cache)
- ❌ Chunk atual (apenas cache)

---

## 🔐 Segurança

### Autenticação
- JWT validado ao conectar
- Session token armazenado em memória
- Timeout após 30 min inativo

### Autorização (RLS)
- Supabase RLS policies garantem isolamento
- Server usa credenciais do usuário
- Operações respeitam Row Level Security

### Validação
- Todas as ações passam por server-side validation
- Nenhum cliente pode modificar outra conta
- Distância e zona validadas antes de aceitar

---

## 📈 Escalabilidade

### Limites Atuais
- ~100-500 jogadores simultâneos por servidor
- ~25 chunks carregados por jogador
- ~1000 operações/segundo

### Para escalar
1. **Sharding**: Dividir por zona geográfica
2. **Load Balancing**: Múltiplos servidores com Redis
3. **Caching**: Redis para cache distribuído
4. **Database**: Replicação Supabase

---

## 🎯 Fluxo Típico de Sessão

```
[1] Conexão
    Client conecta via WebSocket
    ↓
[2] Autenticação
    Server valida JWT
    Registra em playersOnline
    ↓
[3] Carregamento de Zona
    Client move para novo chunk
    Server determina zona (safe/transition/hostile)
    ↓
[4] Gameplay
    Client realiza ações (mine, move, attack)
    Server valida e arbitra
    Supabase persiste
    ↓
[5] Sincronização com Próximos
    Broadcast de eventos
    Atualização de posições
    ↓
[6] Desconexão
    Client desconecta
    Server remove de playersOnline
    Supabase sincroniza estado final
```

---

## 📚 Conceitos-chave

### Chunk
- Região 1000x1000 px
- Coordenadas: (chunkX, chunkY)
- Determinístico: seed = `${chunkX},${chunkY}`

### Zona
- Calculada pela distância do centro (0, 0)
- 3 tipos: safe, transition, hostile
- Determina loot multiplier e PvP allowance

### Arbitragem
- Servidor é a fonte de verdade
- Cliente envía intenção, server valida
- Supabase persiste resultado

### Real-time
- WebSocket para eventos instantâneos
- Broadcast para próximos jogadores
- Cache local em memória para performance

---

**Próxima Leitura**: [02 - Sistema de Zonas](./02-zone-system.md)
