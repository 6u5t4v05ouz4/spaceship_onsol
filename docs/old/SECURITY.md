# 🔒 Política de Segurança - Space Crypto Miner

## ⚠️ Arquivos Sensíveis

Este projeto contém informações sensíveis que **NUNCA** devem ser commitadas no Git:

### 🚫 Nunca commite:
- Arquivos `.env*` (variáveis de ambiente)
- Chaves de API (`*.key`, `*.pem`, `*.crt`)
- Credenciais de banco de dados
- Tokens de autenticação
- Chaves privadas SSH
- Certificados SSL/TLS
- Configurações de produção
- Logs com dados sensíveis

### ✅ Sempre commite:
- Arquivo `env.example` (template de variáveis)
- Configurações de desenvolvimento (sem credenciais)
- Documentação de setup
- Scripts de migração (sem dados sensíveis)

## 🛡️ Boas Práticas de Segurança

### 1. Variáveis de Ambiente
```bash
# ✅ Correto
cp env.example .env
# Edite o .env com suas credenciais reais

# ❌ Incorreto
# Nunca commite o arquivo .env
```

### 2. Configurações Sensíveis
```javascript
// ✅ Correto - usar variáveis de ambiente
const config = {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY
};

// ❌ Incorreto - hardcoded
const config = {
    supabaseUrl: "https://cjrbhqlwfjebnjoyfjnc.supabase.co",
    supabaseKey: "eyJhbGciOiJIUzI1NiIs..."
};
```

### 3. Banco de Dados
- Use políticas RLS (Row Level Security)
- Nunca exponha credenciais de banco
- Use connection pooling
- Implemente rate limiting

### 4. Autenticação
- Use JWT com expiração curta
- Implemente refresh tokens
- Valide tokens no servidor
- Use HTTPS sempre

## 🔍 Verificação de Segurança

### Antes de cada commit:
```bash
# Verifique se não há arquivos sensíveis
git status
git diff --cached

# Procure por padrões suspeitos
grep -r "password\|secret\|key" --exclude-dir=node_modules .
```

### Ferramentas recomendadas:
- `git-secrets` - Detecta secrets no Git
- `trufflehog` - Scanner de secrets
- `detect-secrets` - Detecção de secrets

## 🚨 Se você encontrou um vazamento:

1. **Imediatamente**:
   - Revogue todas as credenciais expostas
   - Force logout de todas as sessões
   - Alerte a equipe

2. **Limpeza**:
   - Remova do histórico do Git
   - Atualize todas as credenciais
   - Monitore logs por atividade suspeita

3. **Prevenção**:
   - Revise políticas de commit
   - Implemente hooks de pre-commit
   - Treine a equipe

## 📞 Contato de Segurança

Para reportar vulnerabilidades de segurança:
- Email: security@spacecryptominer.com
- Use o template de reporte de vulnerabilidade
- Não divulgue publicamente até a correção

## 📋 Checklist de Segurança

- [ ] Nenhum arquivo `.env` no Git
- [ ] Nenhuma chave hardcoded no código
- [ ] Políticas RLS implementadas
- [ ] HTTPS configurado
- [ ] Rate limiting ativo
- [ ] Logs sem dados sensíveis
- [ ] Backup seguro das credenciais
- [ ] Monitoramento de segurança ativo

---

**Lembre-se**: Segurança é responsabilidade de todos. Quando em dúvida, não commite!
