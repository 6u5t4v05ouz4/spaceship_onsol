# 6. Integration Points and External Dependencies

## External Services

### Tabela Resumida de Integrações

| Serviço | Propósito | Tipo de Integração | Arquivos Chave | Criticidade |
|---------|----------|-------------------|-----------------|------------|
| **Supabase** | Backend (Auth, DB, Storage) | Client SDK / REST API | `src/supabase-dev.js`, `src/config/supabase-config.js`, `.sql` files | 🔴 Crítica |
| **Solana** | Blockchain (NFTs, Wallet) | `@solana/web3.js` SDK | `src/solana_nft.js` | 🟠 Alta |
| **Vercel** | Deployment, Analytics | Config Files / SDK | `vercel.json`, `@vercel/analytics`, `@vercel/speed-insights` | 🟡 Média |
| **Filebase** | IPFS Storage (Planejado) | API / SDK (TBD) | Mencionado no `ROADMAP.md` | 🟢 Planejada |

---

## Detailed Service Integrations

### 1. Supabase Backend 🔴 CRÍTICO

#### Propósito

- **Autenticação:** OAuth2, Email/Password, Social Login
- **Banco de Dados:** PostgreSQL com RLS (Row Level Security)
- **Storage:** Armazenamento de arquivos (avatares, assets)
- **Realtime (Opcional):** WebSocket para sincronização

#### Integração

```javascript
// Inicialização (src/supabase-dev.js)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;
```

#### Responsabilidades do Frontend

- Gerenciar autenticação (login, logout, refresh token)
- Buscar dados do usuário (perfil, game state)
- Atualizar dados de gameplay
- Fazer upload de assets

#### Dependências de Configuração

- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do cliente
- `.sql` files - Schema e políticas RLS

#### Resiliência

- **Retry:** Implementar exponential backoff para falhas de rede
- **Fallback:** Considerar cache local de dados críticos
- **Health Check:** Verificar conexão periodicamente

---

### 2. Solana Blockchain 🟠 ALTA CRITICIDADE

#### Propósito

- **NFT Verification:** Verificar posse de NFTs (naves)
- **Wallet Connection:** Conectar à carteira Phantom
- **Token Metadata:** Buscar dados de NFTs
- **On-chain Data:** Ler dados da blockchain

#### Integração

```javascript
// src/solana_nft.js
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { getParsedTokenAccountsByOwner } from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('mainnet-beta'));

// Conectar à Phantom wallet
const provider = window.solana;
const { publicKey } = await provider.connect();

// Buscar NFTs do usuário
const nfts = await connection.getParsedTokenAccountsByOwner(publicKey, {
  programId: TOKEN_PROGRAM_ID,
});
```

#### Responsabilidades

- Detectar presença do Phantom Wallet
- Solicitar conexão ao wallet
- Assinar transações (se necessário)
- Buscar dados de NFTs e metadados
- Verificar saldo de tokens

#### Pontos de Falha

- **Wallet não instalada:** Phantom extension não disponível
- **Rede errada:** Usuário conectado à rede diferente
- **RPC indisponível:** Solana RPC fora do ar
- **Rate Limit:** Limite de requisições excedido

#### Resiliência

- Verificar presença do Phantom antes de usar
- Tratamento gracioso de erros de wallet
- Retry com múltiplos RPCs em caso de falha
- Feedback claro ao usuário sobre problemas

---

### 3. Vercel 🟡 MÉDIA CRITICIDADE

#### Propósito

- **Hosting:** Servir aplicação web
- **Analytics:** Coletar métricas de uso
- **Speed Insights:** Monitorar performance
- **Edge Functions (Futuro):** Executar lógica no edge

#### Integração

```javascript
// Analytics
import { Analytics } from '@vercel/analytics/react';

// Speed Insights
import { SpeedInsights } from '@vercel/speed-insights/next';
```

#### Responsabilidades

- Registrar eventos de uso
- Monitorar performance da aplicação
- Coletar Web Vitals
- Rastrear conversões (login, gameplay)

#### Não Afeta Funcionalidade Core

- Se Vercel Analytics falhar, jogo continua funcionando
- Speed Insights é apenas para monitoramento
- Deploy automático (CI/CD)

---

## Internal Integration Points

### 1. Phaser Game ↔ Web UI

**Padrão:** Comunicação via DOM events ou variáveis globais

```javascript
// Phaser enviando evento para UI
window.dispatchEvent(new CustomEvent('gameStateChanged', {
  detail: { level: 5, xp: 1000 }
}));

// UI ouvindo eventos do Phaser
window.addEventListener('gameStateChanged', (e) => {
  console.log('Jogo atualizado:', e.detail);
});
```

**Nota PO:** A forma exata de comunicação precisa ser verificada no código detalhado.

### 2. Phaser Game ↔ Solana

**Padrão:** Chamadas diretas via `solana_nft.js`

```javascript
// Dentro de GameSceneModular.js
import { getNFTsForPlayer } from '../solana_nft.js';

// Na inicialização ou quando necessário
const playerNFTs = await getNFTsForPlayer(playerWalletAddress);
this.updateShipsFromNFTs(playerNFTs);
```

### 3. Web UI ↔ Supabase

**Padrão:** Chamadas diretas via `supabase-dev.js` e serviços

```javascript
// Em login.html / LoginPage
import supabase from '../supabase-dev.js';

const { user, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

---

## Communication Flow Diagram

```
┌──────────────────────┐
│   Navegador Usuário  │
│  ┌────────────────┐  │
│  │  Phantom Wallet│  │ ◄── Extensão do navegador
│  └────────────────┘  │
└──────────────────────┘
            │
            ├─────────┬─────────┬─────────┐
            ▼         ▼         ▼         ▼
      ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐
      │  Phaser │ │  Web UI │ │Analytics│ │Supabase  │
      │  Game   │ │(HTML/JS)│ │ Vercel  │ │Client SDK│
      └──┬──────┘ └────┬────┘ └─────────┘ └────┬─────┘
         │             │                       │
         └─────────────┼───────────────────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
          ┌─────────┐       ┌────────────┐
          │  Solana │       │ PostgreSQL │
          │   RPC   │       │  Supabase  │
          └─────────┘       └────────────┘
```

---

## Dependency Chain

```
package.json
├── phaser@^3.90.0
│   └── Canvas/WebGL
├── @solana/web3.js@^1.98.4
│   ├── Solana RPC connection
│   └── Phantom Wallet API
├── @supabase/supabase-js
│   ├── PostgreSQL (via REST API)
│   └── Auth tokens (JWT)
├── @vercel/analytics@^1.5.0
│   └── Vercel Analytics API
└── vite@^7.1.9
    └── Build & Dev Server
```
