# 🚀 Space Crypto Miner - Real-time Server

Servidor Node.js para o ATLAS v2.0 - Sistema de arbitragem em tempo real, sincronização de batalhas PvP e gerenciamento de zonas.

## 📊 Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis (opcional)

## 🏗️ Estrutura

```
server/
├── server.js              # Entry point
├── config/
│   └── supabase.js       # Supabase clients
├── managers/             # Estado e cache
├── engines/              # Lógica de negócio
├── events/               # WebSocket handlers
├── middleware/           # Auth e validação
└── utils/                # Utilitários
```

## 🚀 Quick Start

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
PORT=3000
```

### 3. Iniciar servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

### 4. Testar

```bash
# Health check
curl http://localhost:3000/health

# Métricas
curl http://localhost:3000/metrics
```

## 📡 WebSocket Events

### Cliente → Servidor

- `auth` - Autenticação inicial
- `chunk:enter` - Entrar em novo chunk
- `player:move` - Atualizar posição
- `mining:complete` - Completar mineração
- `battle:attack` - Atacar outro jogador

### Servidor → Cliente

- `auth:success` / `auth:error`
- `chunk:data` - Dados do chunk
- `player:moved` - Outro jogador se moveu
- `battle:hit` - Recebeu dano
- `battle:death` - Morreu

## 🔐 Autenticação

O servidor valida JWT tokens do Supabase:

```js
socket.emit('auth', { token: 'supabase_jwt_token' });
```

## 📈 Status Atual

- ✅ Setup básico completo
- ✅ Health check funcionando
- ⏳ Cache Manager (próximo)
- ⏳ Zone Calculator (próximo)
- ⏳ Battle Engine (próximo)

## 📚 Documentação Completa

Ver `docs/architecture/server-nodejs/` para documentação detalhada.

## 🐛 Troubleshooting

### Erro: "Supabase connection failed"

- Verifique se `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão corretos
- Verifique se a tabela `player_state` existe no Supabase

### Erro: "Port already in use"

- Mude a porta em `.env.local`: `PORT=3001`
- Ou mate o processo: `lsof -ti:3000 | xargs kill`

## 📝 Logs

Logs são exibidos no console com cores (desenvolvimento) ou em JSON (produção).

Níveis:
- `debug` - Detalhes de debug
- `info` - Informações gerais
- `warn` - Avisos
- `error` - Erros

Configure via `LOG_LEVEL` no `.env.local`.

---

**Versão**: 1.0.0  
**Status**: 🟡 Em desenvolvimento

