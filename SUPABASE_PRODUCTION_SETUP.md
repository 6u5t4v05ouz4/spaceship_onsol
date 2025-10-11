# Configuração do Supabase para Produção

## Problema Identificado
O projeto estava redirecionando para `localhost:3000` após o login porque a configuração de OAuth estava usando `window.location.origin` que em desenvolvimento aponta para localhost.

## Solução Implementada

### 1. Configuração Centralizada
Criado arquivo `js/config.js` que detecta automaticamente o ambiente e configura as URLs corretas.

### 2. URLs de Redirecionamento Corrigidas
O código agora detecta se está em produção e usa a URL correta do Vercel.

## Configurações Necessárias no Supabase Dashboard

### 1. Site URL
No Supabase Dashboard > Authentication > URL Configuration:
- **Site URL**: `https://seu-projeto.vercel.app` (substitua pela sua URL do Vercel)

### 2. Redirect URLs
No Supabase Dashboard > Authentication > URL Configuration:
- **Redirect URLs**: Adicione as seguintes URLs:
  - `https://seu-projeto.vercel.app` (URL de produção)
  - `http://localhost:3000` (URL de desenvolvimento - opcional)

### 3. Google OAuth Configuration
No Google Cloud Console > Credentials:
- **Authorized JavaScript origins**:
  - `https://seu-projeto.vercel.app`
  - `http://localhost:3000` (para desenvolvimento)

- **Authorized redirect URIs**:
  - `https://cjrbhqlwfjebnjoyfjnc.supabase.co/auth/v1/callback`
  - `https://seu-projeto.vercel.app/auth/callback` (se necessário)

## Como Verificar se Está Funcionando

1. **Em Desenvolvimento**:
   - Abra o console do navegador
   - Procure por logs que mostram:
     - `Environment info: { isProduction: false, hostname: 'localhost' }`
     - `OAuth redirect URL: http://localhost:3000`

2. **Em Produção**:
   - Abra o console do navegador
   - Procure por logs que mostram:
     - `Environment info: { isProduction: true, hostname: 'seu-projeto.vercel.app' }`
     - `OAuth redirect URL: https://seu-projeto.vercel.app`

## Arquivos Modificados

1. **js/config.js** (novo) - Configuração centralizada
2. **js/main.js** - Atualizado para usar configuração centralizada
3. **index.html** - Incluído o arquivo de configuração

## Próximos Passos

1. Faça commit das alterações
2. Faça push para o GitHub
3. O Vercel irá fazer o deploy automaticamente
4. Teste o login em produção
5. Se necessário, ajuste as configurações no Supabase Dashboard

## Debugging

Se ainda houver problemas:

1. Verifique o console do navegador para logs de configuração
2. Confirme que as URLs no Supabase Dashboard estão corretas
3. Verifique se o Google OAuth está configurado corretamente
4. Teste em modo incógnito para evitar cache

## Variáveis de Ambiente (Opcional)

Para maior flexibilidade, você pode usar variáveis de ambiente no Vercel:

1. No Vercel Dashboard > Settings > Environment Variables:
   - `NEXT_PUBLIC_SITE_URL`: `https://seu-projeto.vercel.app`

2. Atualize `js/config.js` para usar essas variáveis se necessário.
