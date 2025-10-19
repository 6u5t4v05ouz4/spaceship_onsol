# 🔗 Supabase Integration & Authentication

Integração completa do Node.js Server com Supabase: autenticação, RLS, SDK usage e best practices.

---

## 📋 Visão Geral

```
┌───────────────────────────────────────────────────────┐
│                   Cliente (Browser)                   │
├───────────────────────────────────────────────────────┤
│ 1. Autentica no Supabase (website)                    │
│ 2. Recebe JWT token                                   │
│ 3. Conecta ao Node.js via WebSocket + JWT            │
│ 4. Node.js valida JWT e acessa Supabase              │
│ 5. Supabase valida RLS policies                       │
│ 6. Dados retornam filtrados por row-level security   │
└───────────────────────────────────────────────────────┘
```

---

## 🔐 Phase 1: JWT Authentication

### 1.1 Token de Supabase

O Cliente recebe um JWT do Supabase após autenticação:

```json
{
  "aud": "authenticated",
  "exp": 1728087600,
  "iat": 1728000600,
  "iss": "https://xxxxx.supabase.co/auth/v1",
  "sub": "user-uuid-123",
  "email": "user@example.com",
  "email_verified": true,
  "phone_verified": false,
  "app_metadata": {
    "provider": "email",
    "providers": ["email"]
  },
  "user_metadata": {
    "username": "player_name"
  },
  "role": "authenticated",
  "aal": "aal1",
  "amr": [{ "method": "password", "timestamp": 1728000600 }],
  "session_id": "session-uuid-123"
}
```

### 1.2 Validação JWT no Node.js

```js
// server/middleware/auth-middleware.js
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const SECRET = process.env.SUPABASE_JWT_SECRET || 'super-secret-key';

export async function validateJWT(token) {
  try {
    // 1. Verificar formato
    if (!token || !token.startsWith('Bearer ')) {
      throw new Error('Invalid token format');
    }
    
    // 2. Extrair token sem "Bearer "
    const actualToken = token.slice(7);
    
    // 3. Verificar assinatura
    const decoded = jwt.verify(actualToken, SECRET, {
      algorithms: ['HS256'],
      audience: 'authenticated'
    });
    
    // 4. Validar claims
    if (!decoded.sub || !decoded.email) {
      throw new Error('Invalid token claims');
    }
    
    // 5. Retornar usuário
    return {
      id: decoded.sub,
      email: decoded.email,
      username: decoded.user_metadata?.username,
      role: decoded.role,
      sessionId: decoded.session_id
    };
    
  } catch (err) {
    logger.error('JWT validation failed', err.message);
    throw new Error('Unauthorized: Invalid token');
  }
}

export function authMiddleware(socket, next) {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication required'));
  }
  
  try {
    const user = validateJWT(`Bearer ${token}`);
    socket.user = user;
    socket.userId = user.id;
    next();
  } catch (err) {
    next(err);
  }
}
```

### 1.3 Socket.io + JWT

```js
// server/server.js
import { Server } from 'socket.io';
import { authMiddleware } from './middleware/auth-middleware.js';

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Aplicar middleware de auth antes de qualquer evento
io.use(authMiddleware);

io.on('connection', (socket) => {
  logger.info(`Authenticated user connected: ${socket.userId}`);
  
  // Socket agora tem user autenticado
  socket.on('chunk:enter', async (data) => {
    // socket.userId já está disponível!
    handleChunkEnter(socket, data, io);
  });
});
```

---

## 📊 Phase 2: Supabase SDK Integration

### 2.1 Inicializar Clients

```js
// server/config/supabase.js
import { createClient } from '@supabase/supabase-js';

// Client com credenciais do usuário
export function createUserClient(accessToken) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );
}

// Client admin (acesso total, sem RLS)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Client anônimo (apenas dados públicos)
export const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
```

### 2.2 Usar em Eventos

```js
// server/events/chunk-events.js
export async function handleChunkEnter(socket, data, io) {
  try {
    const { chunkX, chunkY } = data;
    
    // 1. Criar cliente com credenciais do usuário
    const userClient = createUserClient(socket.user.token);
    
    // 2. Buscar chunk (com RLS aplicado)
    const { data: chunk, error } = await userClient
      .from('chunks')
      .select('*')
      .eq('chunk_x', chunkX)
      .eq('chunk_y', chunkY)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Chunk não encontrado - gerar novo
        const newChunk = await generateChunk(chunkX, chunkY);
        
        // Admin client para inserir
        await supabaseAdmin
          .from('chunks')
          .insert(newChunk);
      } else {
        throw error;
      }
    }
    
    // 3. Enviar dados para cliente
    socket.emit('chunk:data', chunk);
    
  } catch (err) {
    logger.error('Chunk enter error', err);
    socket.emit('error', { message: err.message });
  }
}
```

---

## 🔐 Phase 3: Row Level Security (RLS)

### 3.1 Policies de Players

```sql
-- 1. Usuários veem seus próprios dados
CREATE POLICY "Users can view own data"
ON players FOR SELECT
USING (auth.uid() = id);

-- 2. Usuários atualizam seus próprios dados
CREATE POLICY "Users can update own data"
ON players FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Apenas servidor (service role) pode inserir
CREATE POLICY "Server can insert players"
ON players FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- 4. Apenas servidor deleta
CREATE POLICY "Server can delete players"
ON players FOR DELETE
USING (auth.role() = 'service_role');
```

### 3.2 Policies de Chunks

```sql
-- 1. Chunks são públicos (leitura)
CREATE POLICY "Chunks are public"
ON chunks FOR SELECT
USING (true);

-- 2. Apenas servidor modifica chunks
CREATE POLICY "Server manages chunks"
ON chunks FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Server updates chunks"
ON chunks FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
```

### 3.3 Policies de Battle Logs

```sql
-- 1. Combatentes podem ver seu próprio log
CREATE POLICY "Players can view own battles"
ON battle_logs FOR SELECT
USING (
  auth.uid() = attacker_id OR 
  auth.uid() = defender_id
);

-- 2. Apenas servidor registra batalhas
CREATE POLICY "Server logs battles"
ON battle_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');
```

### 3.4 Testando RLS

```sql
-- Conectar como usuário específico
SET app.current_user = 'user-uuid-123';

-- Isso deve retornar dados do usuário
SELECT * FROM players WHERE id = 'user-uuid-123';

-- Isso deve retornar error (access denied)
SELECT * FROM players WHERE id != 'user-uuid-123';

-- Reset
RESET app.current_user;
```

---

## 💾 Phase 4: Query Patterns

### 4.1 Inserir Dados

```js
// ✅ Forma correta (com user client)
const { data, error } = await userClient
  .from('players')
  .insert([{
    id: socket.userId,
    username: 'PlayerName',
    health: 100,
    resources: 0,
    created_at: new Date()
  }]);

// ❌ Evitar (sem validação)
await supabaseAdmin
  .from('players')
  .insert([{ id: 'other-user-id' }]); // RLS violation!
```

### 4.2 Atualizar Dados

```js
// ✅ Forma correta (RLS protege)
const { data, error } = await userClient
  .from('players')
  .update({ health: 50 })
  .eq('id', socket.userId); // RLS: só pode atualizar seu próprio

// ❌ Evitar
const { data, error } = await userClient
  .from('players')
  .update({ health: 50 })
  .eq('id', 'other-user-id'); // RLS: retorna vazio
```

### 4.3 Ler Dados com Relacionamentos

```js
// Chunks com seus objetos (JSONB)
const { data: chunks, error } = await userClient
  .from('chunks')
  .select('*, current_state:current_state(*)') // Expandir JSONB
  .eq('chunk_x', 10)
  .eq('chunk_y', -5);

// Players com histórico de batalhas
const { data: battles, error } = await userClient
  .from('battle_logs')
  .select('*, attacker:attacker_id(*), defender:defender_id(*)')
  .or(`attacker_id.eq.${socket.userId}, defender_id.eq.${socket.userId}`)
  .order('created_at', { ascending: false })
  .limit(50);
```

### 4.4 Real-time Subscriptions

```js
// Inscrever-se a mudanças de jogador
userClient
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'players',
    filter: `id=eq.${socket.userId}`
  }, (payload) => {
    logger.info('Player updated:', payload.new);
  })
  .subscribe();

// Ao desconectar, limpar subscrição
socket.on('disconnect', () => {
  userClient.removeAllChannels();
});
```

---

## 🔄 Phase 5: Auth Flow Completo

### 5.1 Cliente: Login & Obter Token

```js
// client/auth.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function login(email, password) {
  // 1. Autenticar com Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  
  // 2. Obter token
  const accessToken = data.session.access_token;
  
  // 3. Conectar ao Node.js com token
  const socket = io(SERVER_URL, {
    auth: {
      token: accessToken
    }
  });
  
  return { socket, user: data.user };
}
```

### 5.2 Servidor: Validar & Usar

```js
// server/middleware/auth-middleware.js
export function authMiddleware(socket, next) {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication required'));
  }
  
  try {
    // 1. Validar JWT (assinatura + expiração)
    const user = validateJWT(token);
    
    // 2. Armazenar no socket
    socket.user = user;
    socket.userId = user.id;
    socket.userToken = token;
    
    // 3. Permitir conexão
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
}

io.use(authMiddleware);

io.on('connection', (socket) => {
  // Socket agora tem user autenticado
  socket.on('chunk:enter', async (data) => {
    const userClient = createUserClient(socket.userToken);
    const { data: chunk } = await userClient
      .from('chunks')
      .select('*')
      .single();
  });
});
```

---

## 🔑 Phase 6: Token Management

### 6.1 Atualizar Token Expirado

```js
// server/utils/token-refresh.js
export async function refreshTokenIfNeeded(user, supabaseClient) {
  const now = Math.floor(Date.now() / 1000);
  const expirationBuffer = 60; // 1 minuto antes de expirar
  
  // Se token vai expirar em menos de 1 minuto
  if (user.exp - now < expirationBuffer) {
    // Usar refresh token para obter novo access token
    const { data, error } = await supabaseClient.auth.refreshSession();
    
    if (error) throw new Error('Token refresh failed');
    
    return data.session.access_token;
  }
  
  return null; // Token ainda válido
}
```

### 6.2 Usar em Eventos

```js
// server/events/player-events.js
export async function handleMove(socket, data, io) {
  try {
    // 1. Verificar se token precisa ser renovado
    const newToken = await refreshTokenIfNeeded(socket.user, supabaseAdmin);
    if (newToken) {
      socket.userToken = newToken;
      socket.user.exp = getTokenExpiration(newToken);
    }
    
    // 2. Usar cliente com token atual
    const userClient = createUserClient(socket.userToken);
    
    // 3. Atualizar posição
    await userClient
      .from('players')
      .update({ x: data.x, y: data.y })
      .eq('id', socket.userId);
    
  } catch (err) {
    logger.error('Move error', err);
  }
}
```

---

## 📈 Phase 7: Performance Optimization

### 7.1 Batching Queries

```js
// ❌ Lento: 100 queries separadas
for (const playerId of playerIds) {
  await userClient.from('players').select('*').eq('id', playerId);
}

// ✅ Rápido: 1 query para todos
const { data: players } = await supabaseAdmin
  .from('players')
  .select('*')
  .in('id', playerIds);
```

### 7.2 Select Seletivo (não pegar todos os campos)

```js
// ❌ Transfere muitos dados
await userClient.from('players').select('*');

// ✅ Pega só o necessário
await userClient.from('players').select('id, health, resources');
```

### 7.3 Filtros no Backend

```js
// ❌ Trazer 10000 registros e filtrar localmente
const allChunks = await userClient.from('chunks').select('*');
const hostileChunks = allChunks.filter(c => c.zone_type === 'hostile');

// ✅ Filtrar no banco
const { data: hostileChunks } = await userClient
  .from('chunks')
  .select('*')
  .eq('zone_type', 'hostile')
  .limit(100);
```

### 7.4 Paginação

```js
// Buscar primeira página
const pageSize = 50;
let page = 0;

const { data: players, count } = await userClient
  .from('players')
  .select('*', { count: 'exact' })
  .range(page * pageSize, (page + 1) * pageSize - 1);

const totalPages = Math.ceil(count / pageSize);
```

---

## 🚨 Phase 8: Error Handling

### 8.1 Tratamento de Erros Comuns

```js
// server/utils/error-handler.js
export function handleSupabaseError(error, context = '') {
  if (error.code === 'PGRST116') {
    // Not found
    return { status: 404, message: 'Resource not found' };
  }
  
  if (error.code === 'PGRST301') {
    // Multiple rows returned (expecting one)
    return { status: 400, message: 'Data integrity error' };
  }
  
  if (error.code === 'PGRST204') {
    // No rows returned
    return { status: 404, message: 'Not found' };
  }
  
  if (error.message.includes('permission denied')) {
    // RLS violation
    return { status: 403, message: 'Access denied' };
  }
  
  if (error.message.includes('duplicate key')) {
    // Unique constraint violation
    return { status: 409, message: 'Already exists' };
  }
  
  logger.error(`Supabase error in ${context}:`, error);
  return { status: 500, message: 'Internal server error' };
}
```

### 8.2 Usar em Eventos

```js
export async function handleChunkEnter(socket, data, io) {
  try {
    const userClient = createUserClient(socket.userToken);
    
    const { data: chunk, error } = await userClient
      .from('chunks')
      .select('*')
      .eq('chunk_x', data.chunkX)
      .eq('chunk_y', data.chunkY)
      .single();
    
    if (error) {
      const errorResponse = handleSupabaseError(error, 'chunk:enter');
      return socket.emit('error', errorResponse);
    }
    
    socket.emit('chunk:data', chunk);
    
  } catch (err) {
    socket.emit('error', { status: 500, message: 'Server error' });
  }
}
```

---

## 📋 Best Practices

```
✅ FAZER:
├─ Validar JWT na conexão
├─ Usar user client com token do usuário
├─ Deixar RLS filtrar dados
├─ Selecionar apenas campos necessários
├─ Batchear queries
├─ Tratar erros gracefully
├─ Renovar tokens expirados
└─ Logar operações sensíveis

❌ EVITAR:
├─ Usar service_role onde não precisa
├─ Confiar apenas em validação do cliente
├─ Trazer dados desnecessários
├─ Fazer queries em loop
├─ Ignorar erros do Supabase
├─ Deixar tokens expirados
└─ Logar dados sensíveis (senhas, tokens)
```

---

## 📊 Checklist de Integração

```
Backend Setup:
├─ [ ] createClient com ANON_KEY
├─ [ ] createClient com SERVICE_ROLE_KEY
├─ [ ] validateJWT implementado
├─ [ ] authMiddleware aplicado
└─ [ ] Error handling configurado

Database Setup:
├─ [ ] RLS habilitado em todas tabelas
├─ [ ] Policies criadas
├─ [ ] Índices criados
├─ [ ] Connection pooling ativo
└─ [ ] Roles testadas

Frontend Setup:
├─ [ ] Supabase client inicializado
├─ [ ] Auth flow implementado
├─ [ ] Token passado ao WebSocket
├─ [ ] Reconnect logic implementado
└─ [ ] Error handling configurado

Testes:
├─ [ ] JWT validation funciona
├─ [ ] RLS protege dados
├─ [ ] User client respeita RLS
├─ [ ] Service role bypassa RLS
└─ [ ] Tokens expiram/renovam corretamente
```

---

## 📘 Documentação Relacionada

- [03 - Database Schema](./03-database-schema.md) — RLS Policies
- [04 - Sync Flows](./04-sync-flows.md) — Fluxos com autenticação
- [05 - WebSocket Events](./05-websocket-events.md) — Eventos com JWT
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Variáveis de ambiente

---

**Versão**: v1.0  
**Atualizado**: Outubro 2025  
**Status**: 🟢 Integração Completa
