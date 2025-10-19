# 4. Data Models and APIs

## Data Models

### Banco de Dados (Supabase)

O schema está definido nos arquivos SQL na raiz do projeto:

| Arquivo | Conteúdo |
|---------|----------|
| `database-schema.sql` | Define as tabelas principais (users, profiles, game_data, etc) |
| `database-migration.sql` | Contém alterações incrementais no schema |
| `database-functions.sql` | Funções PL/pgSQL customizadas |
| `uuid-v7-function.sql` | Função para geração de UUIDs v7 |
| `database-rls-policies.sql` | Políticas Row Level Security (segurança por usuário) |
| `apply-rls-fix.sql` | Correções/ajustes em políticas RLS |
| `fix-user-profiles-rls.sql` | Correções específicas em políticas de perfil |
| `database-seed-data.sql` | Dados iniciais para desenvolvimento |
| `supabase-storage-setup.sql` | Configuração do Storage para arquivos |

**Referência Completa:** Arquivos `.sql` na raiz do projeto.

### Principais Entidades

*(Inferido da estrutura)*

#### Users (Autenticação)
- `id` (UUID) - Chave primária
- `email` - Email único
- `password_hash` - Senha hash (managed by Supabase Auth)
- `created_at` - Timestamp

#### Profiles (Dados do Usuário)
- `id` (UUID) - Referência para Users
- `username` - Nome de usuário
- `avatar_url` - URL do avatar
- `bio` - Biografia
- `updated_at` - Último update

#### Game Data
- `user_id` (FK para Users)
- `ship_id` - ID da nave NFT
- `level` - Nível do jogador
- `experience` - XP acumulada
- `inventory` - JSON com items
- `last_played` - Timestamp

#### NFT Metadata
- `contract_address` - Endereço do contrato
- `token_id` - ID do token NFT
- `owner_address` - Endereço do proprietário
- `metadata_uri` - URI do metadado
- `attributes` - JSON com atributos

### Blockchain (Solana)

NFTs representam as naves do jogo, seguindo o padrão **Metaplex**:

- **Program ID:** Contrato SPL Token
- **Metadata Standard:** Metaplex Token Metadata v0.14
- **Attributes:** Raridade, Classe, Stats (defesa, ataque, etc)

**Referência:** `docs/NFT_COLLECTION_PLAN.md` e `src/solana_nft.js`

### Estrutura de Dados - Supabase RLS

**Segurança:** Utiliza Row Level Security para garantir que cada usuário só acesse seus próprios dados.

```sql
-- Exemplo de política RLS
CREATE POLICY user_profile_policy ON profiles
  FOR SELECT
  USING (auth.uid() = id);
```

---

## Database Integration Pattern

### Client-Side SDK

A aplicação utiliza o **Supabase JavaScript Client** (`@supabase/supabase-js`):

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exemplo: Buscar perfil do usuário
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);
```

### Autenticação

- **Método:** OAuth2 + Email/Password via Supabase Auth
- **Providers:** Google, GitHub (configuráveis)
- **Session:** Stored em localStorage (managed by Supabase)
- **Tokens:** JWT com refresh token

---

## Known Data Issues

### RLS Policies

Políticas RLS são **críticas para segurança**:
- Alterações no schema precisam considerar impacto nas RLS
- Múltiplos arquivos de fix RLS indicam complexidade/iterações passadas
- Verificar `database-rls-policies.sql` antes de fazer mudanças estruturais

### Seeding

Dados de desenvolvimento são seedados via `database-seed-data.sql`. Atenção:
- Dados de mock são apenas para testes (não usar em prod)
- Limpar dados de test antes de deploy em produção
