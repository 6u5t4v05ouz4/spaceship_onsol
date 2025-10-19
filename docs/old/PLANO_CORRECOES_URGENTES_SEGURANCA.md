# 🚨 **PLANO DE CORREÇÕES URGENTES DE SEGURANÇA**

## ⚡ **PRIORIDADE CRÍTICA - EXECUÇÃO IMEDIATA**

### **🎯 OBJETIVO**: Corrigir vulnerabilidades críticas identificadas na análise de segurança
### **⏰ TEMPO ESTIMADO**: 2-3 horas
### **🔒 IMPACTO**: Reduzir score de segurança de 3.5/10 para 8.5/10

---

## 📋 **FASE 1: ISOLAMENTO DE CHAVES API (30 min)**

### **🚨 Problema**: Chaves Supabase hardcoded em múltiplos arquivos
### **🎯 Solução**: Mover para variáveis de ambiente

#### **1.1 Criar arquivo .env**
```bash
# Arquivo: .env
SUPABASE_URL=https://cjrbhqlwfjebnjoyfjnc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcmJocWx3ZmplYm5qb3lmam5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDIwNTMsImV4cCI6MjA3NTI3ODA1M30.X4uaKnfrmHYYSkVXz1qWYF0wmy-bkjHgbvonubYUTA4
NODE_ENV=development
```

#### **1.2 Criar arquivo .env.example**
```bash
# Arquivo: .env.example
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
NODE_ENV=development
```

#### **1.3 Atualizar .gitignore**
```bash
# Adicionar ao .gitignore
.env
.env.local
.env.production
.env.staging
*.key
*.pem
```

---

## 📋 **FASE 2: ATUALIZAÇÃO DOS ARQUIVOS (45 min)**

### **2.1 src/supabase-dev.js**
```javascript
// ANTES (vulnerável):
const supabaseUrl = "https://cjrbhqlwfjebnjoyfjnc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIs...";

// DEPOIS (seguro):
const supabaseUrl = process.env.SUPABASE_URL || window.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY;

// Validação obrigatória
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing. Check environment variables.');
}
```

### **2.2 auth-callback.html**
```javascript
// ANTES (vulnerável):
const supabaseConfig = {
    url: "https://cjrbhqlwfjebnjoyfjnc.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIs..."
};

// DEPOIS (seguro):
const supabaseConfig = {
    url: window.SUPABASE_URL || 'https://cjrbhqlwfjebnjoyfjnc.supabase.co',
    anonKey: window.SUPABASE_ANON_KEY || ''
};

// Validação
if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    showStatus('error', 'Configuration error. Please contact support.');
    return;
}
```

### **2.3 login.html**
```javascript
// ANTES (vulnerável):
const supabaseConfig = {
    url: "https://cjrbhqlwfjebnjoyfjnc.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIs..."
};

// DEPOIS (seguro):
// Remover configuração hardcoded
// Usar apenas window.supabaseDev do supabase-dev.js
```

---

## 📋 **FASE 3: REMOÇÃO DE LOGS SENSÍVEIS (30 min)**

### **3.1 src/supabase-dev.js**
```javascript
// ANTES (vulnerável):
console.log('🔧 Supabase Dev Client Configuration:', {
    url: supabaseUrl,
    redirectTo: redirectUrl,
    hostname: window.location.hostname,
    origin: window.location.origin,
    isDevelopment: isDevelopment
});

// DEPOIS (seguro):
if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Supabase Dev Client initialized');
    console.log('🔧 Environment:', isDevelopment ? 'development' : 'production');
}
```

### **3.2 auth-callback.html**
```javascript
// ANTES (vulnerável):
console.log('📋 URL parameters:', {
    code: code ? 'Present' : 'Missing',
    accessToken: accessToken ? 'Present' : 'Missing',
    refreshToken: refreshToken ? 'Present' : 'Missing',
    // ... outros tokens
});

// DEPOIS (seguro):
console.log('📋 Processing OAuth callback...');
// Logs detalhados apenas em desenvolvimento
if (window.location.hostname === 'localhost') {
    console.log('📋 Debug mode: OAuth parameters received');
}
```

---

## 📋 **FASE 4: VALIDAÇÃO DE DOMÍNIO (30 min)**

### **4.1 Criar função de validação**
```javascript
// Arquivo: src/utils/security.js
const ALLOWED_DOMAINS = [
    'localhost:3000',
    '127.0.0.1:3000',
    'spacecryptominer.com',
    'www.spacecryptominer.com',
    'spacecryptominer.vercel.app'
];

export function validateRedirectUrl(url) {
    try {
        const urlObj = new URL(url);
        const domain = `${urlObj.hostname}:${urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80')}`;
        
        return ALLOWED_DOMAINS.includes(domain);
    } catch (error) {
        return false;
    }
}

export function sanitizeRedirectUrl(url) {
    if (!validateRedirectUrl(url)) {
        return window.location.origin + '/auth-callback.html';
    }
    return url;
}
```

### **4.2 Atualizar login.html**
```javascript
// Importar função de validação
import { sanitizeRedirectUrl } from '/src/utils/security.js';

// Usar na função de login
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: sanitizeRedirectUrl(window.location.origin + '/auth-callback.html')
    }
});
```

---

## 📋 **FASE 5: TRATAMENTO DE ERRO SEGURO (30 min)**

### **5.1 Criar sistema de mensagens seguras**
```javascript
// Arquivo: src/utils/error-handler.js
const ERROR_MESSAGES = {
    'auth_failed': 'Falha na autenticação. Tente novamente.',
    'network_error': 'Erro de conexão. Verifique sua internet.',
    'config_error': 'Erro de configuração. Contate o suporte.',
    'rate_limit': 'Muitas tentativas. Aguarde alguns minutos.',
    'default': 'Ocorreu um erro inesperado. Tente novamente.'
};

export function getSafeErrorMessage(error) {
    // Log detalhado apenas no servidor/desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        console.error('Detailed error:', error);
    }
    
    // Retornar mensagem genérica para o usuário
    const errorCode = error.code || error.message || 'default';
    return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default;
}
```

### **5.2 Atualizar tratamento de erro**
```javascript
// ANTES (vulnerável):
catch (error) {
    console.error('❌ Erro no login Google:', error);
    alert('Erro no login: ' + error.message);
}

// DEPOIS (seguro):
catch (error) {
    const safeMessage = getSafeErrorMessage(error);
    console.error('❌ Login error occurred');
    alert(safeMessage);
}
```

---

## 📋 **FASE 6: CONFIGURAÇÃO DE AMBIENTE (15 min)**

### **6.1 Atualizar package.json**
```json
{
  "scripts": {
    "dev": "NODE_ENV=development node dev-server.cjs",
    "build": "NODE_ENV=production vite build",
    "preview": "NODE_ENV=production vite preview"
  }
}
```

### **6.2 Criar script de setup**
```bash
#!/bin/bash
# Arquivo: setup-env.sh
echo "🔧 Setting up environment variables..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please edit .env with your actual credentials"
else
    echo "✅ .env file already exists"
fi

echo "🔒 Security setup complete!"
```

---

## 📋 **FASE 7: TESTES E VALIDAÇÃO (30 min)**

### **7.1 Checklist de Testes**
- [ ] Login funciona com variáveis de ambiente
- [ ] Callback de autenticação funciona
- [ ] Logs sensíveis não aparecem no console
- [ ] Erros mostram mensagens genéricas
- [ ] Validação de domínio funciona
- [ ] Arquivo .env não é commitado

### **7.2 Testes de Segurança**
```bash
# Verificar se .env não está no git
git status | grep -i env

# Verificar se chaves não estão hardcoded
grep -r "cjrbhqlwfjebnjoyfjnc" --exclude-dir=node_modules .

# Verificar logs sensíveis
grep -r "accessToken.*Present" --exclude-dir=node_modules .
```

---

## 🎯 **CRONOGRAMA DE EXECUÇÃO**

### **⏰ Tempo Total: 2h 30min**

| Fase | Tempo | Prioridade | Status |
|------|-------|------------|--------|
| **Fase 1**: Isolamento de Chaves | 30min | 🚨 Crítica | ⏳ Pendente |
| **Fase 2**: Atualização de Arquivos | 45min | 🚨 Crítica | ⏳ Pendente |
| **Fase 3**: Remoção de Logs | 30min | 🚨 Crítica | ⏳ Pendente |
| **Fase 4**: Validação de Domínio | 30min | ⚠️ Alta | ⏳ Pendente |
| **Fase 5**: Tratamento de Erro | 30min | ⚠️ Alta | ⏳ Pendente |
| **Fase 6**: Configuração | 15min | ✅ Média | ⏳ Pendente |
| **Fase 7**: Testes | 30min | ✅ Média | ⏳ Pendente |

---

## 🚨 **CRITÉRIOS DE SUCESSO**

### **✅ Objetivos Alcançados:**
1. **Chaves API** movidas para variáveis de ambiente
2. **Logs sensíveis** removidos ou sanitizados
3. **Validação de domínio** implementada
4. **Tratamento de erro** seguro implementado
5. **Score de segurança** aumentado para 8.5/10

### **📊 Métricas de Melhoria:**
- **API Key Security**: 2/10 → 9/10
- **Logging Security**: 2/10 → 8/10
- **Error Handling**: 3/10 → 8/10
- **Domain Validation**: 4/10 → 8/10

---

## 🔄 **PRÓXIMOS PASSOS APÓS CORREÇÕES**

### **📅 Semana 1:**
- Implementar rate limiting
- Adicionar CSP headers
- Configurar monitoramento

### **📅 Semana 2:**
- Auditoria de segurança completa
- Testes de penetração
- Documentação de segurança

---

**Status**: 🚨 **PLANO CRIADO - PRONTO PARA EXECUÇÃO** ⚡

---

**Data do Plano**: 16 de Janeiro de 2025  
**Responsável**: Equipe de Desenvolvimento  
**Prazo**: 24 horas para correções críticas  
**Prioridade**: 🚨 **CRÍTICA - EXECUÇÃO IMEDIATA** ⚡
