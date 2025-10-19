# 🔧 FIX OAuth Redirect - Localhost Dev

## ❌ Problema

Você está sendo redirecionado para a URL de produção (Vercel) em vez de localhost:3000 durante OAuth login.

**Causa:** A URL de callback `http://localhost:3000/auth-callback` não está autorizada no Supabase.

---

## ✅ Solução - Passo a Passo

### Passo 1: Pegar suas Credenciais do Supabase

1. Acesse: https://app.supabase.com/
2. Selecione seu projeto
3. Vá para **Settings → API** (ou **Authentication → URL Configuration**)
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon/Public Key** → `VITE_SUPABASE_ANON_KEY`

### Passo 2: Criar arquivo `.env.local`

Na **raiz do projeto**, crie um arquivo chamado `.env.local` (não será commitado):

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_REDIRECT_TO=http://localhost:3000/auth-callback
```

### Passo 3: Adicionar URL de Callback no Supabase Dashboard

**CRÍTICO:** Você DEVE adicionar localhost como URL autorizada.

1. Acesse: https://app.supabase.com/projects/[SEU_PROJECT_ID]/auth/url-configuration
2. Scroll até **"Redirect URLs"**
3. Clique em **"Add URL"**
4. Adicione estas URLs (uma por vez):
   ```
   http://localhost:3000/auth-callback
   http://localhost:3000/
   http://localhost:5173/auth-callback
   http://localhost:5173/
   ```
5. Clique em **"Save"**

### Passo 4: Configurar Google OAuth (se usar)

Se está usando "Login com Google":

1. Vá para: **Authentication → Providers → Google**
2. Verificar se estão habilitados os dados:
   - **Client ID** e **Client Secret** preenchidos
3. Em sua Google Cloud Console, adicione:
   ```
   http://localhost:3000/
   http://localhost:3000/auth-callback
   ```
   Como **Authorized Redirect URIs**

### Passo 5: Reiniciar Dev Server

```bash
npm run dev
```

---

## 🧪 Testar OAuth

1. Acesse: `http://localhost:3000`
2. Clique em "Fazer Login"
3. Clique em "🔍 Login com Google" (ou outro provider)
4. Faça login no Google
5. ✅ Deveria redirecionar para `http://localhost:3000/auth-callback`
6. ✅ Depois para `/dashboard`

---

## 🚨 Se Ainda Não Funcionar

### Verificar 1: VITE_SUPABASE_REDIRECT_TO

```javascript
// No console do browser, verifique:
console.log(import.meta.env.VITE_SUPABASE_REDIRECT_TO)
```

Deveria mostrar: `http://localhost:3000/auth-callback`

Se não estiver carregando, verifique:
- Arquivo `.env.local` existe na **raiz do projeto**?
- Reiniciou o dev server após criar `.env.local`?

### Verificar 2: Supabase URL Configuration

```bash
curl https://app.supabase.com/projects/[PROJECT_ID]/auth/url-configuration
```

Deve listar seu localhost na lista de URLs autorizadas.

### Verificar 3: Logs do Supabase

1. Acesse: https://app.supabase.com/projects/[PROJECT_ID]/logs
2. Procure por erros de "redirect_uri_mismatch"
3. Isso indica que a URL não está autorizada

---

## 📝 Código Implementado

O arquivo `src/shared/services/authService.js` já tem:

```javascript
const REDIRECT_URL = import.meta.env.VITE_SUPABASE_REDIRECT_TO || 'http://localhost:3000/auth-callback';
```

E o `vite.config.js` já reescreve headers de redirecionamento para localhost em dev.

---

## 🎯 Resumo

| O que | Onde | Por quê |
|------|------|--------|
| `.env.local` | Raiz do projeto | Supabase lê as URLs |
| localhost:3000/auth-callback | Supabase Dashboard | Autorizar redirect |
| Google OAuth URIs | Google Cloud Console | Se usar Google login |

---

## ✨ Depois de Implementar

Você conseguirá:

```
1. ✅ Acessar localhost:3000
2. ✅ Fazer login com email/senha
3. ✅ Fazer login com Google (OAuth)
4. ✅ Redirecionar para /auth-callback em localhost
5. ✅ Depois para /dashboard
6. ✅ Ver seus dados
7. ✅ Editar perfil
8. ✅ Logout voltar para /login
```

**Fluxo completo funcionando!** 🚀
