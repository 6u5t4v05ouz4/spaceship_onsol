# Configuração do Google OAuth no Supabase

## Passos para configurar o login com Google

### 1. Configurar no Supabase Dashboard

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Authentication > Providers**
4. Encontre **Google** e clique em **Enable**

### 2. Configurar credenciais do Google

No Supabase, você precisará configurar:

**Client ID**: `seu-google-client-id`
**Client Secret**: `seu-google-client-secret`

### 3. Configurar no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Habilite a **Google+ API**
4. Vá para **Credentials** e crie um **OAuth 2.0 Client ID**

### 4. URLs de redirecionamento

No Google Cloud Console, configure:

**Authorized JavaScript origins:**
- `http://localhost:3000` (desenvolvimento)
- `https://seu-dominio.com` (produção)

**Authorized redirect URIs:**
- `https://cjrbhqlwfjebnjoyfjnc.supabase.co/auth/v1/callback`

### 5. Testando o fluxo

1. Acesse `http://localhost:3000/login`
2. Clique em "Entrar com Google"
3. Autorize no Google
4. Você será redirecionado para `/profile.html`
5. Complete o perfil
6. Será redirecionado para `/game.html`

### 6. Logs de debug

Abra o console do navegador (F12) para ver os logs:

```
🚀 Login page initialized
🔄 Auth state changed: SIGNED_IN user@email.com
✅ User signed in via callback: user@email.com
❌ No profile found, redirecting to profile setup
```

### 7. Troubleshooting

**Problema**: Erro de redirect URI
**Solução**: Verifique se a URL de callback está correta no Google Cloud Console

**Problema**: Client ID inválido
**Solução**: Verifique se o Client ID está correto no Supabase

**Problema**: Usuário não é redirecionado
**Solução**: Verifique se o `redirectTo` está configurado corretamente

### 8. Configuração atual

```javascript
// No login.html
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: window.location.origin + '/profile.html'
    }
});
```

### 9. Verificar configuração

Execute este comando para verificar se o Supabase está configurado:

```javascript
// No console do navegador
console.log('Supabase URL:', window.appConfig.getSupabaseConfig().url);
console.log('Supabase Key:', window.appConfig.getSupabaseConfig().anonKey);
```
