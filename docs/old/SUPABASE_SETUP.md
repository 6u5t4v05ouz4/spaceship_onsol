# Configuração do Supabase Auth

## Migração do Firebase Auth para Supabase Auth

Este projeto foi migrado do Firebase Auth para Supabase Auth com Google OAuth.

## Configuração Necessária

### 1. Configurar Projeto Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Crie um novo projeto ou selecione um existente
3. Vá para **Settings > API**
4. Copie a **Project URL** e **anon public key**

### 2. Configurar Google OAuth

1. No dashboard do Supabase, vá para **Authentication > Providers**
2. Habilite o provedor **Google**
3. Configure as credenciais OAuth do Google:
   - **Client ID**: Seu Google OAuth Client ID
   - **Client Secret**: Seu Google OAuth Client Secret
4. Configure as URLs de redirecionamento:
   - Para desenvolvimento: `http://localhost:3000/auth/v1/callback`
   - Para produção: `https://seu-dominio.com/auth/v1/callback`

### 3. Configurar Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Habilite a **Google+ API**
4. Vá para **Credentials** e crie um **OAuth 2.0 Client ID**
5. Configure as URLs autorizadas:
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (desenvolvimento)
     - `https://seu-dominio.com` (produção)
   - **Authorized redirect URIs**:
     - `https://seu-projeto.supabase.co/auth/v1/callback`

### 4. Atualizar Configuração no Código

No arquivo `index.html`, atualize as configurações do Supabase:

```javascript
const supabaseConfig = {
    url: "https://seu-projeto.supabase.co", // Substitua pela sua URL
    anonKey: "sua-chave-anonima-aqui" // Substitua pela sua chave anônima
};
```

## Funcionalidades Implementadas

- ✅ Login com Google via Supabase OAuth
- ✅ Verificação automática de sessão
- ✅ Overlay de login responsivo
- ✅ Logout funcional
- ✅ Persistência de sessão
- ✅ Integração com Solana Wallet (mantida)

## Diferenças da Implementação Anterior

### Firebase Auth (Antigo)
- Usava popup para login
- Sessão gerenciada pelo Firebase
- Configuração via Firebase Console

### Supabase Auth (Novo)
- Usa redirecionamento OAuth (mais seguro)
- Sessão gerenciada pelo Supabase
- Configuração via Supabase Dashboard
- Melhor integração com banco de dados

## Testando a Implementação

1. Configure as credenciais do Supabase
2. Configure as credenciais do Google OAuth
3. Abra o projeto no navegador
4. O overlay de login deve aparecer automaticamente
5. Clique em "Login com Google"
6. Você será redirecionado para o Google
7. Após autorizar, será redirecionado de volta para o app
8. O overlay deve desaparecer e mostrar a interface normal

## Troubleshooting

### Overlay não aparece
- Verifique se as configurações do Supabase estão corretas
- Abra o console do navegador para ver erros
- Execute `window.showLoginOverlayTest()` para forçar mostrar o overlay

### Erro de OAuth
- Verifique se as URLs de redirecionamento estão configuradas corretamente
- Confirme se o Client ID e Client Secret estão corretos
- Verifique se o domínio está autorizado no Google Cloud Console

### Sessão não persiste
- Verifique se o Supabase está configurado corretamente
- Confirme se o listener de mudanças de auth está funcionando
- Verifique os logs no console do navegador
