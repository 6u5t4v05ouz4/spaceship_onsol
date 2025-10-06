# Sistema de Perfis Unificados - Space Crypto Miner

## 📋 Visão Geral

Este sistema permite que usuários vinculem suas contas Google e carteiras Solana em um perfil unificado, garantindo que:
- Um email não pode estar vinculado a múltiplas carteiras
- Uma carteira não pode estar vinculada a múltiplos emails
- Os dados do usuário são persistidos entre sessões

## 🗄️ Estrutura do Banco de Dados

### Tabela `user_profiles`
```sql
- id: UUID (chave primária)
- google_email: TEXT (único)
- wallet_address: TEXT (único)
- display_name: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 🔧 Configuração do Supabase

### 1. Execute o SQL
Execute o arquivo `supabase_profiles_table.sql` no SQL Editor do Supabase Dashboard.

### 2. Configure as Políticas RLS
As políticas já estão incluídas no SQL e garantem que:
- Usuários só podem ver seus próprios perfis
- Usuários só podem criar/atualizar seus próprios perfis

## 🚀 Como Funciona

### Cenário 1: Login Inicial via Google
1. Usuário faz login com Google
2. Sistema cria perfil com `google_email` e `display_name`
3. Usuário conecta carteira nas configurações
4. Sistema atualiza perfil com `wallet_address`
5. Validação garante que a carteira não está vinculada a outro email

### Cenário 2: Login Inicial via Wallet
1. Usuário conecta carteira
2. Sistema cria perfil com `wallet_address`
3. Usuário faz login com Google nas configurações
4. Sistema atualiza perfil com `google_email` e `display_name`
5. Validação garante que o email não está vinculado a outra carteira

## 🔒 Validações de Segurança

### `validateAccountLinking(googleEmail, walletAddress)`
- Verifica se o email já está vinculado a outra carteira
- Verifica se a carteira já está vinculada a outro email
- Retorna erro específico se houver conflito

### `createOrUpdateUserProfile(googleEmail, walletAddress, displayName)`
- Busca perfil existente por email ou carteira
- Atualiza perfil existente com novos dados
- Cria novo perfil se não existir
- Garante unicidade de email e carteira

## 📊 Funções Principais

### `createOrUpdateUserProfile()`
```javascript
// Cria ou atualiza perfil do usuário
const profile = await createOrUpdateUserProfile(
    'user@gmail.com',    // email Google
    'ABC123...',         // endereço da carteira
    'Nome do Usuário'     // nome de exibição
);
```

### `getUserProfile()`
```javascript
// Busca perfil por email ou carteira
const profile = await getUserProfile('user@gmail.com');
const profile = await getUserProfile(null, 'ABC123...');
```

### `validateAccountLinking()`
```javascript
// Valida se pode vincular email e carteira
const validation = await validateAccountLinking('user@gmail.com', 'ABC123...');
if (!validation.valid) {
    alert(validation.error);
}
```

## 🔄 Fluxo de Integração

### No Login Google
```javascript
supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
        const profile = await createOrUpdateUserProfile(
            session.user.email,
            walletAddress, // se já conectada
            session.user.user_metadata?.full_name
        );
    }
});
```

### Na Conexão da Carteira
```javascript
async function connectPhantomWithSupabase() {
    // ... conexão da carteira ...
    
    const profile = await createOrUpdateUserProfile(
        currentUser?.email || null,
        pub,
        currentUser?.user_metadata?.full_name || null
    );
}
```

## 🛡️ Segurança

### Row Level Security (RLS)
- Usuários só podem acessar seus próprios perfis
- Políticas baseadas em email ou wallet_address
- Prevenção de acesso não autorizado

### Validações
- Email único por perfil
- Carteira única por perfil
- Verificação de conflitos antes da vinculação

## 🧪 Testando o Sistema

### Teste 1: Login Google → Conectar Wallet
1. Faça login com Google
2. Vá para Configurações
3. Conecte sua carteira Phantom
4. Verifique no console se o perfil foi criado/atualizado

### Teste 2: Conectar Wallet → Login Google
1. Conecte sua carteira Phantom
2. Vá para Configurações
3. Faça login com Google
4. Verifique se o perfil foi vinculado

### Teste 3: Tentativa de Duplicação
1. Tente conectar uma carteira já vinculada a outro email
2. Deve aparecer erro: "Esta carteira já está vinculada a outro email"

## 📝 Logs de Debug

O sistema gera logs detalhados no console:
- `Creating/updating user profile:`
- `Found existing profile by email/wallet:`
- `Profile created/updated:`
- `User profile loaded:`

## 🔧 Manutenção

### Limpeza de Perfis Órfãos
```sql
-- Encontrar perfis sem email nem carteira
SELECT * FROM user_profiles 
WHERE google_email IS NULL AND wallet_address IS NULL;
```

### Estatísticas de Uso
```sql
-- Contar perfis por tipo
SELECT 
    COUNT(*) as total_profiles,
    COUNT(google_email) as with_google,
    COUNT(wallet_address) as with_wallet,
    COUNT(CASE WHEN google_email IS NOT NULL AND wallet_address IS NOT NULL THEN 1 END) as linked_accounts
FROM user_profiles;
```
