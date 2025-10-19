# 🚀 Setup & Deployment Guide

Guia completo de setup local, deploy em produção e troubleshooting.

---

## 📋 Pre-Deployment Checklist

```
Infrastructure:
├─ [ ] Conta Railway criada
├─ [ ] Projeto Railway criado
├─ [ ] Redis (Railway ou externo)
├─ [ ] Supabase com RLS policies (ver 03-database-schema.md)
└─ [ ] Domínio configurado (opcional)

Código:
├─ [ ] .env.local criado
├─ [ ] package.json completo
├─ [ ] server.js testado localmente
├─ [ ] Redis connection testada
└─ [ ] Variáveis de ambiente verificadas

Database:
├─ [ ] Migrations aplicadas
├─ [ ] Índices criados (ver 03-database-schema.md)
├─ [ ] RLS policies ativas
└─ [ ] Connection pooling ativo
```

---

## 🏗️ Phase 1: Setup Local

### 1.1 Instalar Redis

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
redis-cli ping  # Deve retornar PONG
```

**Windows (Docker):**
```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
docker ps  # Verificar se está rodando
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
redis-cli ping
```

### 1.2 Setup Projeto Node.js

```bash
# 1. Criar estrutura
mkdir server && cd server

# 2. Inicializar
npm init -y

# 3. Instalar dependências (ver package.json em 08-folder-structure.md)
npm install express socket.io @supabase/supabase-js redis bull dotenv cors uuid pino pino-pretty
npm install -D nodemon eslint prettier jest

# 4. Criar .env.local
cat > .env.local << 'EOF'
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
EOF

# 5. Criar estrutura (ver 08-folder-structure.md)
mkdir -p config managers engines events middleware utils

# 6. Testar localmente
npm run dev
```

### 1.3 Testar Conexões

```bash
# Terminal 1: Servidor
npm run dev

# Terminal 2: Testar health check
curl http://localhost:3000/health

# Terminal 3: Testar Redis
redis-cli ping
```

---

## 🌐 Phase 2: Configurar Railway

### 2.1 Criar Conta e Projeto

```
1. Ir para railway.app
2. Sign up com GitHub
3. Criar novo projeto (New Project)
4. Selecionar "Deploy from GitHub"
```

### 2.2 Conectar Repositório

```
1. Autorizar Railway acessar GitHub
2. Selecionar repositório com seu servidor
3. Selecionar branch `main`
4. Railway detecta Node.js automaticamente
```

### 2.3 Adicionar Redis

```
1. Railway Dashboard → Project
2. "Add Service" ou "+" button
3. Selecionar "Redis"
4. Confirm
5. Esperar deploy (~2 min)
6. Copiar REDIS_URL da variável de ambiente
```

### 2.4 Configurar Variáveis de Ambiente

```
No Railway → Project → [server-name] → Variables

Adicionar:
SUPABASE_URL=${{ secret.SUPABASE_URL }}
SUPABASE_ANON_KEY=${{ secret.SUPABASE_ANON_KEY }}
SUPABASE_SERVICE_ROLE_KEY=${{ secret.SUPABASE_SERVICE_ROLE_KEY }}
REDIS_URL=${{ redis.REDIS_URL }}
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://seu-dominio.com
LOG_LEVEL=info
```

### 2.5 Health Check (Railway)

```
No Railway → [server-name] → Settings

Health Check:
- URL: /health
- Interval: 30s
- Timeout: 10s
```

---

## 🔄 Phase 3: Conectar ao GitHub

```bash
# 1. Inicializar Git (se não tiver)
git init
git add .
git commit -m "Initial server setup"

# 2. Conectar remoto
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main

# 3. Railway vai detectar automaticamente
# Deploy inicia em alguns segundos
```

---

## 📊 Phase 4: Monitoramento

### 4.1 Logger (Pino)

```js
// server/utils/logger.js (completo)
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'production' ? {} : {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

export default logger;
```

### 4.2 Metrics Endpoint

```js
// Em server.js
app.get('/metrics', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    playersOnline: cacheManager.getPlayersCount(),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version
  });
});
```

### 4.3 Visualizar Logs

```bash
# Localmente
npm run dev

# Production (Railway CLI)
railway logs --tail

# Métricas
curl https://seu-projeto.railway.app/metrics | jq

# Health
curl https://seu-projeto.railway.app/health
```

---

## 🔧 Phase 5: Troubleshooting

### Erro: "Redis connection refused"

```
Sintoma: ❌ Redis error: connect ECONNREFUSED

Solução:
1. Verificar REDIS_URL em Railway
2. Verificar se Redis está rodando localmente:
   redis-cli ping
3. Aumentar timeout em config/redis.js:
   socket: { 
     connectTimeout: 10000,
     reconnectStrategy: (retries) => retries > 10 ? Error('failed') : retries * 200
   }
```

### Erro: "Supabase not responding"

```
Sintoma: ❌ Failed to connect Supabase

Solução:
1. Verificar credenciais em Railway Variables
2. Testar conexão localmente:
   curl https://xxxxx.supabase.co
3. Verificar RLS policies (ver 03-database-schema.md)
4. Aumentar connection pool size
```

### Erro: "Out of memory"

```
Sintoma: ❌ JavaScript heap out of memory

Solução:
1. Implementar limite de cache:
   if (cacheManager.getPlayersCount() > 5000) {
     removeOldestInactivePlayer();
   }

2. Aumentar heap em Railway → Settings:
   NODE_OPTIONS=--max-old-space-size=512

3. Monitorar memory:
   const used = process.memoryUsage();
   if (used.heapUsed > used.heapTotal * 0.85) {
     logger.warn('Memory usage high!', used);
   }
```

### Erro: "Socket.io timeout"

```
Sintoma: Clientes desconectando frequentemente

Solução:
1. Aumentar timeout em server.js:
   io.engine.pingInterval = 25000;
   io.engine.pingTimeout = 60000;

2. Verificar CORS_ORIGIN está correto

3. Verificar firewall/proxy:
   railway logs --tail | grep "socket"
```

### Erro: "CORS error"

```
Sintoma: ❌ Access-Control-Allow-Origin denied

Solução:
1. Verificar CORS_ORIGIN em Railway:
   CORS_ORIGIN=https://seu-dominio.com

2. Verificar em server.js:
   cors: {
     origin: process.env.CORS_ORIGIN,
     methods: ['GET', 'POST'],
     credentials: true
   }

3. Cliente deve usar mesmo URL no CORS
```

---

## 🧪 Phase 6: Testes de Carga

### 6.1 Teste Local (100 jogadores)

```bash
# Instalar artillery
npm install -D artillery

# Criar teste.yml
cat > load-test.yml << 'EOF'
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "Health Check"
    flow:
      - get:
          url: "/health"
          think: 5

  - name: "Metrics"
    flow:
      - get:
          url: "/metrics"
          think: 5
EOF

# Rodar teste
npx artillery run load-test.yml
```

### 6.2 Socket.io Stress Test

```js
// test-load.js
import io from 'socket.io-client';

const PLAYERS = 100;
const SERVER_URL = 'http://localhost:3000';

async function simulate() {
  const sockets = [];
  
  for (let i = 0; i < PLAYERS; i++) {
    const socket = io(SERVER_URL);
    
    socket.on('connect', () => {
      console.log(`Player ${i} connected`);
      socket.emit('auth', { userId: `player_${i}`, token: 'test_token' });
    });
    
    socket.on('error', (err) => console.error(`Player ${i} error:`, err));
    
    sockets.push(socket);
  }
  
  // Mover players
  setInterval(() => {
    sockets.forEach((socket, i) => {
      socket.emit('player:move', { x: Math.random() * 1000, y: Math.random() * 1000 });
    });
  }, 1000);
}

simulate();
```

---

## 📈 Phase 7: Monitoramento em Produção

### 7.1 Verificar Status

```bash
# Health endpoint
curl https://seu-projeto.railway.app/health

# Exemplo de resposta:
{
  "status": "ok",
  "timestamp": 1728000000,
  "uptime": 3600
}
```

### 7.2 Monitorar Métricas

```bash
# Coletar métricas a cada 10s
watch -n 10 'curl -s https://seu-projeto.railway.app/metrics | jq'

# Esperar por:
{
  "playersOnline": 42,
  "memoryUsage": {
    "heapUsed": 52428800,
    "heapTotal": 104857600
  }
}
```

### 7.3 Ver Logs em Tempo Real

```bash
# Instalar Railway CLI
npm install -g railway

# Login
railway login

# Ver logs
railway logs --tail

# Filtrar por error
railway logs --tail | grep -i error
```

---

## 🚀 Phase 8: Deploy Final

### 8.1 Checklist Final

```
Antes de ir para produção:
├─ [ ] Testes locais passando
├─ [ ] Health check respondendo
├─ [ ] Metrics disponíveis
├─ [ ] Logs configurados
├─ [ ] Redis conectando
├─ [ ] Supabase respondendo
├─ [ ] RLS policies ativas (ver 03-database-schema.md)
├─ [ ] Índices criados (ver 03-database-schema.md)
├─ [ ] CORS configurado corretamente
├─ [ ] Variáveis de ambiente no Railway
├─ [ ] Domínio/URL configurada
└─ [ ] Backups automáticos habilitados
```

### 8.2 Deploy Steps

```
1. Railway Dashboard
2. Selecionar seu projeto
3. Selecionar [server]
4. Clicar "Deploy"
5. Esperar ~3-5 minutos
6. Verificar logs:
   railway logs --tail
7. Testar endpoints:
   curl https://seu-projeto.railway.app/health
```

### 8.3 Pós-Deploy

```bash
# 1. Verificar saúde
curl https://seu-projeto.railway.app/health

# 2. Verificar métricas
curl https://seu-projeto.railway.app/metrics | jq

# 3. Ver logs de erro
railway logs --tail | grep -i error

# 4. Conectar cliente (atualizar CORS_ORIGIN)
# client → wsURL = "https://seu-projeto.railway.app"
```

---

## 🔐 Phase 9: Segurança

### 9.1 Secrets no Railway

```
Nunca commitar segredos! Use Railway Secrets:

1. Railway → Project → [server] → Variables
2. Adicionar como "Secret":
   - SUPABASE_SERVICE_ROLE_KEY
   - Qualquer outro token sensível
3. Railway cifrará automaticamente
```

### 9.2 HTTPS Obrigatório

```js
// Em server.js, redirecionar HTTP → HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(303, `https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 9.3 Rate Limiting

```js
// Instalar express-rate-limit
npm install express-rate-limit

// Em server.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requests por IP
});

app.use(limiter);
```

---

## 📊 Performance Benchmarks

### Expected Targets

```
Métricas esperadas (100-500 jogadores):
├─ Latência P2P: 50-150ms
├─ CPU: 30-50%
├─ Memory: 200-400MB
├─ Supabase requests: 10-20 req/s
└─ Jogadores simultâneos: 100-500
```

### Monitorar Regularmente

```bash
# CPU/Memory (Railway)
railway status

# Requests/s (Supabase)
SELECT COUNT(*) FROM pg_stat_statements;

# Players online
curl https://seu-projeto.railway.app/metrics | jq '.playersOnline'
```

---

## 🔄 Phase 10: Scaling (Futuro)

### 10.1 Múltiplas Instâncias (Railway)

```
1. Railway Dashboard → Project → [server]
2. Settings → "Disk Auto-scaling" → ON
3. Settings → "Memory Auto-scaling" → ON
4. Railway balanceia automaticamente
```

### 10.2 Redis Cluster

```
Para 1000+ jogadores:
1. Usar Railway Redis com persistência
2. Implementar Redis Sentinel
3. Backup automático via Supabase
```

### 10.3 Load Balancer

```
Nginx + Railway:
1. Deploy Nginx no Railway
2. Redirecionar tráfego para múltiplas instâncias
3. Sticky sessions para Socket.io
4. Rate limit no Nginx
```

---

## ✅ Deployment Checklist Final

```
Infraestrutura:
├─ [ ] Railway projeto criado
├─ [ ] Redis deployado
├─ [ ] Supabase conectado
├─ [ ] Health check OK
└─ [ ] Logs streaming

Código:
├─ [ ] server.js testado
├─ [ ] .env.production correto
├─ [ ] package.json atualizado
├─ [ ] Não há secrets no repo
└─ [ ] Testes de carga OK

Database:
├─ [ ] Migrations aplicadas
├─ [ ] Índices criados
├─ [ ] RLS policies ativas
├─ [ ] Connection pooling ON
└─ [ ] Backups configurados

Monitoramento:
├─ [ ] Logs em tempo real
├─ [ ] Métricas disponíveis
├─ [ ] Alertas configurados (opcional)
└─ [ ] Dashboard criado
```

---

## 📚 Documentação Relacionada

- [03 - Database Schema & Índices](./03-database-schema.md) — RLS, pooling, índices
- [08 - Folder Structure](./08-folder-structure.md) — Estrutura de arquivos
- [02 - Zone System](./02-zone-system.md) — Lógica de zonas

---

**Versão**: v1.0  
**Atualizado**: Outubro 2025  
**Status**: 🟢 Pronto para Produção
