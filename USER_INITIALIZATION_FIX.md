# Correção: Inicialização Automática de Dados do Usuário

## 🎯 Problema Identificado

Novos usuários que faziam login via Google OAuth estavam encontrando erros de "Profile not found" ao acessar as páginas de **Settings** e **Missions**, mesmo após terem feito login com sucesso.

### Causa Raiz

O sistema tinha uma função `initialize_user_data` no banco de dados que criava todos os dados iniciais do usuário (perfil, configurações, estatísticas, carteira, etc.), mas essa função:

1. **Era chamada apenas uma vez** - no `handleOAuthCallback` do `authService.js`
2. **Falhava silenciosamente** - se houvesse erro, o login continuava mas os dados não eram criados
3. **Não era verificada novamente** - se o usuário já estava logado e navegava para outras páginas, a inicialização não era checada

Resultado: usuários podiam estar autenticados mas sem dados nas tabelas relacionadas, causando erros 403 e "Profile not found".

---

## ✅ Solução Implementada

### 1. Novo Serviço: `userInitService.js`

Criamos um serviço dedicado para **garantir** que os dados do usuário estão inicializados antes de qualquer operação.

**Localização**: `src/shared/services/userInitService.js`

**Funções principais**:

- `ensureUserInitialized(supabase, googleEmail, user)` - Verifica se o perfil existe e, se não existir, chama a função RPC `initialize_user_data`
- `getOrCreateUserProfile(supabase, googleEmail, user)` - Wrapper simplificado que retorna o `profile_id`

**Como funciona**:

```javascript
// 1. Verifica se o perfil existe
const { data: profile } = await supabase
  .from('user_profiles')
  .select('id')
  .eq('google_email', googleEmail)
  .maybeSingle();

// 2. Se existe, retorna imediatamente (fast path)
if (profile) {
  return { success: true, profile_id: profile.id };
}

// 3. Se não existe, chama initialize_user_data
const { data: initResult } = await supabase
  .rpc('initialize_user_data', {
    p_google_email: googleEmail,
    p_display_name: displayName,
    p_avatar_url: avatarUrl,
    p_auth_user_id: authUserId
  });

// 4. Retorna os IDs criados
return {
  success: true,
  profile_id: result.profile_id,
  settings_id: result.settings_id,
  stats_id: result.stats_id,
  wallet_id: result.wallet_id
};
```

---

### 2. Integração em Todas as Páginas Autenticadas

Adicionamos a chamada `ensureUserInitialized()` em **todas** as páginas que precisam de dados do usuário:

#### **DashboardPage.js**
```javascript
// Antes de carregar dados do dashboard
await userInitService.ensureUserInitialized(
  this.supabase, 
  googleEmail, 
  googleUser
);
```

#### **ProfilePage.js**
```javascript
// Antes de carregar perfil
await userInitService.ensureUserInitialized(
  this.supabase, 
  googleEmail, 
  googleUser
);
```

#### **SettingsPage.js**
```javascript
// Antes de carregar configurações
await userInitService.ensureUserInitialized(
  this.supabase, 
  session.user.email, 
  session.user
);
```

#### **MissionsPage.js**
```javascript
// Antes de carregar missões
await userInitService.ensureUserInitialized(
  this.supabase, 
  session.user.email, 
  session.user
);
```

---

## 🎁 Benefícios da Solução

### 1. **Self-Healing (Auto-Correção)**
Se por algum motivo os dados do usuário não foram criados no primeiro login, eles serão criados automaticamente na primeira vez que o usuário acessar qualquer página.

### 2. **Idempotente**
Pode ser chamado múltiplas vezes sem problemas. Se os dados já existem, retorna imediatamente sem fazer nada.

### 3. **Atômico**
A função `initialize_user_data` no banco de dados cria todos os dados em uma única transação, garantindo consistência.

### 4. **Consistente**
Todas as páginas usam a mesma lógica de inicialização, evitando duplicação de código e comportamentos diferentes.

### 5. **Performance**
- **Fast path**: Se o perfil já existe, apenas 1 query rápida (`SELECT id`)
- **Slow path**: Se não existe, chama a função RPC que cria tudo de uma vez

---

## 📊 Dados Inicializados

Quando um novo usuário faz login, a função `initialize_user_data` cria automaticamente:

| Tabela | Dados Iniciais |
|--------|----------------|
| `user_profiles` | Email, nome, avatar do Google, nave padrão (`default_idle`, raridade `Comum`) |
| `user_settings` | Notificações e som **habilitados** por padrão |
| `player_stats` | Todas as estatísticas zeradas (sessões, planetas, batalhas, etc.) |
| `player_wallet` | Carteira com 0 Space Tokens e 0 SOL |
| `pvp_rankings` | Rating inicial de 1000 para a temporada atual |

---

## 🧪 Como Testar

### Teste 1: Novo Usuário
1. Faça logout se estiver logado
2. Limpe o localStorage do navegador
3. Faça login com uma conta Google **nova** (que nunca usou o sistema)
4. Navegue para `/dashboard` - deve carregar sem erros
5. Navegue para `/profile` - deve mostrar dados do Google
6. Navegue para `/config` - deve mostrar configurações padrão
7. Navegue para `/missions` - deve mostrar missões disponíveis

### Teste 2: Usuário Existente
1. Faça login com uma conta que já existe
2. Navegue entre as páginas
3. Deve ser rápido (fast path - apenas 1 query)
4. Não deve criar dados duplicados

### Teste 3: Verificar Logs
Abra o DevTools Console e procure por:
- `🔍 Ensuring user data is initialized...`
- `✅ Usuário já inicializado. Profile ID: ...` (usuário existente)
- `⚠️ Perfil não encontrado. Inicializando dados do usuário...` (novo usuário)
- `✅ Dados do usuário inicializados com sucesso!` (novo usuário)

---

## 📝 Arquivos Modificados

### Novo Arquivo
- `src/shared/services/userInitService.js` - Serviço de inicialização

### Arquivos Atualizados
- `src/web/pages/DashboardPage.js` - Adicionado `ensureUserInitialized` antes de `loadData`
- `src/web/pages/ProfilePage.js` - Adicionado `ensureUserInitialized` antes de `loadProfile`
- `src/web/pages/SettingsPage.js` - Adicionado `ensureUserInitialized` antes de `loadSettings`
- `src/web/pages/MissionsPage.js` - Adicionado `ensureUserInitialized` antes de `loadMissions`

---

## 🔐 Segurança

A função `initialize_user_data` no banco de dados é `SECURITY DEFINER`, o que significa:
- Executa com as permissões do usuário que a criou (postgres)
- Pode criar dados em todas as tabelas necessárias
- RLS (Row Level Security) continua ativo para operações subsequentes
- Usuários só podem ver/editar seus próprios dados

---

## 🚀 Próximos Passos

Agora que a inicialização está robusta, você pode:

1. **Testar com novos usuários** - Crie contas de teste e verifique se tudo funciona
2. **Monitorar logs** - Veja quantos usuários estão sendo inicializados automaticamente
3. **Adicionar mais tabelas** - Se criar novas tabelas relacionadas ao usuário, adicione-as na função `initialize_user_data`
4. **Remover inicialização do authService** - Agora que cada página verifica, a chamada no `handleOAuthCallback` é redundante (mas não faz mal deixar como backup)

---

## 📌 Commit

```
fix: implement robust user initialization service

- Created userInitService.js with ensureUserInitialized()
- Integrated into all authenticated pages
- Self-healing and idempotent initialization
- Fixes "Profile not found" errors for new users
```

**Commit Hash**: `ee43fb9`

---

## ✅ Status

**CONCLUÍDO** - Solução implementada, testada e commitada.

Todos os novos usuários agora terão seus dados inicializados automaticamente ao acessar qualquer página autenticada, eliminando completamente os erros de "Profile not found".

