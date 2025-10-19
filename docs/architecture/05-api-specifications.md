# 5. API Specifications

## API Interna (Jogo → Backend)

### Comunicação via Supabase SDK

A comunicação com Supabase é realizada **exclusivamente via SDK cliente JavaScript**:

- Arquivo principal: `src/supabase-dev.js`
- Configuração: `src/config/supabase-config.js`
- Nenhuma API customizada exposta pelo projeto foi identificada

### Padrão de Chamadas

```javascript
// Pattern geral
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);

// Exemplos
// 1. Buscar dados do usuário
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// 2. Atualizar dados do jogo
const { data: updated } = await supabase
  .from('game_data')
  .update({ level: newLevel })
  .eq('user_id', userId);

// 3. Inserir novo registro
const { data: newRecord } = await supabase
  .from('inventory')
  .insert({ user_id: userId, item: itemData });
```

### Autenticação

```javascript
// Login via email/password
const { user, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Login via OAuth (Google, GitHub, etc)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: 'http://localhost:3000/auth-callback' },
});

// Verificar sessão atual
const { data: { session } } = await supabase.auth.getSession();
```

---

## API Externa (Backend → Serviços)

### 1. Supabase Backend

| Serviço | Propósito | Integração |
|---------|----------|-----------|
| **Supabase Auth** | Autenticação de usuários | OAuth2, Email/Password |
| **Supabase DB** | Armazenamento de dados | PostgreSQL + RLS |
| **Supabase Storage** | Armazenamento de arquivos | S3-compatible |
| **Supabase Realtime** | WebSocket para sync real-time | Optional |

### 2. Solana Blockchain

| Componente | Propósito | Integração |
|-----------|----------|-----------|
| **Solana RPC** | Comunicação com blockchain | JSON-RPC |
| **Phantom Wallet** | Wallet do usuário | Browser Extension |
| **Metaplex** | Padrão de metadados NFT | JSON Schema |

**Biblioteca:** `@solana/web3.js`

```javascript
// Exemplo: Conectar à carteira Phantom
const provider = window.solana;
const { publicKey } = await provider.connect();

// Exemplo: Buscar NFTs do usuário
const connection = new Connection(clusterApiUrl('mainnet-beta'));
const nfts = await connection.getParsedTokenAccountsByOwner(publicKey, {
  programId: TOKEN_PROGRAM_ID,
});
```

### 3. Vercel Analytics

| Serviço | Propósito |
|---------|----------|
| **Vercel Analytics** | Métricas de uso e comportamento |
| **Vercel Speed Insights** | Métricas de performance |

**Bibliotecas:**
- `@vercel/analytics`
- `@vercel/speed-insights`

---

## Proxy de Desenvolvimento

### Configuração do Vite

`vite.config.js` configura proxy para ambiente de desenvolvimento:

```javascript
// Exemplo: Proxy para /auth e /api em dev
server: {
  proxy: {
    '/auth': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    }
  }
}
```

**Nota:** O arquivo `dev-server.cjs` contém lógica customizada complexa para gerenciar redirects OAuth locais.

### Variáveis de Ambiente

Configuradas via `.env` (não commitado):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SOLANA_NETWORK=mainnet-beta
DEV_REDIRECT_ORIGIN=http://localhost:3000
```

**Problema Conhecido:** Bug de redirect OAuth em dev redirecionava para URL de produção. Será corrigido na História 1.3 do PRD.

---

## Error Handling

### Padrão Esperado

```javascript
const { data, error } = await supabase
  .from('table')
  .select('*');

if (error) {
  console.error('Erro:', error.message);
  // Tratar erro de forma amigável
}
```

### Erros Comuns

- **Network Error:** Sem conexão com Supabase
- **Auth Error:** Usuário não autenticado ou token expirado
- **RLS Error:** Usuário sem permissão para acessar dados
- **Validation Error:** Dados inválidos enviados
- **Solana Error:** Falha ao conectar wallet ou assinar transação

---

## Rate Limiting

### Supabase

- **Limite padrão:** 1000 requisições por segundo
- **Recomendação:** Implementar retry logic com exponential backoff (NFR6)

### Solana

- **Limite:** Depende do RPC utilizado
- **Recomendação:** Usar múltiplos RPCs com failover

---

## API Response Examples

### Success Response

```javascript
{
  data: { /* dados solicitados */ },
  error: null
}
```

### Error Response

```javascript
{
  data: null,
  error: {
    message: 'Erro descritivo',
    status: 400,
    code: 'PGRST116' // PostgreSQL error code
  }
}
```
