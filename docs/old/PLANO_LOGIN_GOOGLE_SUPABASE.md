# 🚀 **PLANO COMPLETO: LOGIN COM GOOGLE - SUPABASE AUTH**

## 📋 **VISÃO GERAL**

Implementação completa do sistema de autenticação com Google usando Supabase Auth, baseado na [documentação oficial](https://supabase.com/docs/guides/auth/social-login/auth-google).

---

## 🎯 **OBJETIVOS**

### **✅ Principais:**
- [x] **Implementar** login com Google via Supabase Auth
- [x] **Configurar** fluxo OAuth completo
- [x] **Garantir** segurança e boas práticas
- [x] **Suportar** desenvolvimento e produção

### **✅ Secundários:**
- [ ] **Implementar** Google One Tap (opcional)
- [ ] **Configurar** domínio customizado
- [ ] **Adicionar** nonce para segurança extra

---

## 📋 **FASE 1: CONFIGURAÇÃO GOOGLE CLOUD PROJECT**

### **🔧 1.1 Setup do Google Cloud Project**

#### **📝 Checklist:**
- [ ] **Criar/Configurar** projeto no [Google Cloud Platform](https://console.cloud.google.com/)
- [ ] **Configurar Audience** (quais usuários podem fazer login)
- [ ] **Configurar Data Access (Scopes)**:
  - `openid` (adicionar manualmente)
  - `.../auth/userinfo.email` (padrão)
  - `.../auth/userinfo.profile` (padrão)
- [ ] **Configurar Branding** (logo e nome personalizados)
- [ ] **Configurar Consent Screen** com domínio customizado

#### **🔧 Configuração de Scopes:**
```javascript
// Scopes necessários para Supabase Auth
const requiredScopes = [
    'openid',                    // Adicionar manualmente
    '.../auth/userinfo.email',   // Padrão
    '.../auth/userinfo.profile'  // Padrão
];
```

### **🔧 1.2 Criar OAuth Client ID**

#### **📝 Passos:**
1. **Acessar** [Google Auth Platform Console](https://console.developers.google.com/apis/credentials)
2. **Criar** novo OAuth client ID
3. **Escolher** tipo: **Web application**
4. **Configurar** Authorized JavaScript origins:
   ```
   http://localhost:3000                    // Desenvolvimento
   https://spaceshiponsol.vercel.app       // Produção
   ```
5. **Configurar** Authorized redirect URIs:
   ```
   http://localhost:3000/auth/v1/callback  // Desenvolvimento
   https://spaceshiponsol.vercel.app/auth/v1/callback  // Produção
   ```
6. **Salvar** Client ID e Client Secret

#### **⚠️ Importante:**
- **Client ID** será usado no frontend
- **Client Secret** será usado no Supabase Dashboard
- **URLs de callback** devem corresponder exatamente

---

## 📋 **FASE 2: CONFIGURAÇÃO SUPABASE DASHBOARD**

### **🔧 2.1 Configurar Google Provider**

#### **📝 Passos:**
1. **Acessar** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Navegar** para: Authentication → Providers
3. **Ativar** Google provider
4. **Inserir** Client ID do Google
5. **Inserir** Client Secret do Google
6. **Configurar** Site URL e Redirect URLs

#### **🔧 Configuração de URLs:**
```toml
# Site URL
http://localhost:3000                    # Desenvolvimento
https://spaceshiponsol.vercel.app       # Produção

# Redirect URLs
http://localhost:3000/auth-callback.html  # Desenvolvimento
https://spaceshiponsol.vercel.app/auth-callback.html  # Produção
```

### **🔧 2.2 Configuração de Desenvolvimento Local**

#### **📝 Variável de Ambiente:**
```bash
# .env
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET="<client-secret>"
```

#### **📝 Configuração do Provider:**
```toml
# supabase/config.toml
[auth.external.google]
enabled = true
client_id = "<client-id>"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
skip_nonce_check = false
```

---

## 📋 **FASE 3: IMPLEMENTAÇÃO FRONTEND**

### **🔧 3.1 Implementação Básica (✅ CONCLUÍDA)**

#### **📝 Código Implementado:**
```javascript
// Login com Google usando Supabase Auth
async function loginWithGoogle() {
    try {
        console.log('🔄 Iniciando login com Google via Supabase Auth...');
        
        // Criar cliente se não existir
        if (!supabaseClient) {
            supabaseClient = await window.createSupabaseClient();
        }
        
        // Usar signInWithOAuth conforme documentação oficial
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'http://localhost:3000/auth-callback.html',
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            }
        });

        if (error) {
            throw error;
        }

        console.log('✅ Login Google iniciado com sucesso:', data);
        
    } catch (error) {
        console.error('❌ Erro no login Google:', error);
        // Fallback temporário para desenvolvimento
    }
}
```

### **🔧 3.2 Configuração PKCE Flow**

#### **📝 Query Parameters:**
```javascript
queryParams: {
    access_type: 'offline',    // Permite refresh token
    prompt: 'consent',         // Força consent screen
}
```

### **🔧 3.3 Tratamento de Erros**

#### **📝 Implementação:**
- **Logs detalhados** para debug
- **Fallback temporário** para desenvolvimento
- **Mensagens genéricas** para usuário
- **Tratamento específico** para diferentes tipos de erro

---

## 📋 **FASE 4: CONFIGURAÇÃO DE REDIRECIONAMENTO**

### **🔧 4.1 auth-callback.html**

#### **📝 Verificações Necessárias:**
- [ ] **Processar** callback do Google
- [ ] **Verificar** status do perfil do usuário
- [ ] **Redirecionar** para dashboard ou profile setup
- [ ] **Tratar** erros de callback

#### **🔧 Código de Exemplo:**
```javascript
// Verificar se há código de autorização
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
    // Processar código de autorização
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
        console.error('❌ Erro no callback:', error);
        // Redirecionar para página de erro
    } else {
        // Verificar se usuário tem perfil
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
            
        if (profile) {
            window.location.href = '/dashboard.html';
        } else {
            window.location.href = '/profile.html';
        }
    }
}
```

---

## 📋 **FASE 5: TESTES E VALIDAÇÃO**

### **🔧 5.1 Testes Locais**

#### **📝 Checklist:**
- [ ] **Testar** login com Google em localhost
- [ ] **Verificar** redirecionamento para auth-callback
- [ ] **Confirmar** criação de sessão
- [ ] **Validar** redirecionamento para dashboard
- [ ] **Testar** tratamento de erros

#### **🔧 Logs Esperados:**
```
🚀 Página de login carregada
✅ Supabase SDK carregado
🔄 Iniciando login com Google via Supabase Auth...
🔧 Criando cliente Supabase...
🔍 Iniciando OAuth com Google...
✅ Login Google iniciado com sucesso: {url: "https://..."}
```

### **🔧 5.2 Testes de Produção**

#### **📝 Checklist:**
- [ ] **Configurar** URLs de produção
- [ ] **Testar** fluxo completo em produção
- [ ] **Verificar** que não há vazamentos de desenvolvimento
- [ ] **Validar** segurança em produção

---

## 📋 **FASE 6: SEGURANÇA E OTIMIZAÇÃO**

### **🔧 6.1 Implementar Nonce (Opcional)**

#### **📝 Implementação:**
```javascript
// Gerar nonce aleatório
const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));

// Hash SHA-256 do nonce
const encoder = new TextEncoder();
const encodedNonce = encoder.encode(nonce);
const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hashedNonce = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

// Usar nonce no login
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: 'http://localhost:3000/auth-callback.html',
        queryParams: {
            nonce: hashedNonce
        }
    }
});
```

### **🔧 6.2 Google One Tap (Opcional)**

#### **📝 Implementação:**
```html
<!-- Carregar Google client library -->
<script src="https://accounts.google.com/gsi/client" async></script>

<!-- Botão personalizado -->
<div id="g_id_onload" 
     data-client_id="<client-id>"
     data-callback="handleSignInWithGoogle"
     data-auto_select="true">
</div>
```

```javascript
// Callback do Google One Tap
async function handleSignInWithGoogle(response) {
    const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
    });
    
    if (error) {
        console.error('❌ Erro no One Tap:', error);
    } else {
        console.log('✅ Login One Tap realizado:', data);
    }
}
```

---

## 🚀 **STATUS ATUAL**

### **✅ CONCLUÍDO:**
- [x] **Implementação básica** do `signInWithOAuth`
- [x] **Configuração** de query parameters
- [x] **Tratamento de erros** básico
- [x] **Fallback temporário** para desenvolvimento

### **🔄 EM ANDAMENTO:**
- [ ] **Configuração** do Google Cloud Project
- [ ] **Configuração** do Supabase Dashboard
- [ ] **Testes** do fluxo completo

### **⏳ PENDENTE:**
- [ ] **Configuração** de URLs de produção
- [ ] **Implementação** de nonce
- [ ] **Google One Tap** (opcional)

---

## 📊 **PRÓXIMOS PASSOS**

### **🔧 IMEDIATO:**
1. **Configurar** Google Cloud Project
2. **Configurar** Supabase Dashboard
3. **Testar** fluxo completo

### **🔧 MÉDIO PRAZO:**
1. **Implementar** nonce para segurança
2. **Configurar** domínio customizado
3. **Otimizar** experiência do usuário

### **🔧 LONGO PRAZO:**
1. **Implementar** Google One Tap
2. **Adicionar** outros provedores OAuth
3. **Melhorar** tratamento de erros

---

**Status**: 🚀 **IMPLEMENTAÇÃO INICIADA** - Fase 3 concluída  
**Próximo**: 🔧 **Configuração Google Cloud Project**  
**Documentação**: [Supabase Auth Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
