# 🚀 Setup do Servidor Node.js

Guia rápido para configurar e rodar o servidor.

---

## ✅ Pré-requisitos

- ✅ Node.js 18+ instalado
- ✅ npm ou yarn
- ✅ Supabase project configurado
- ✅ Schema do banco aplicado (ver `migrations/README.md`)

---

## 📋 Passo 1: Instalar Dependências

```bash
cd server
npm install
```

---

## 🔐 Passo 2: Configurar Variáveis de Ambiente

1. **Copie o arquivo de exemplo:**
   ```bash
   cp env.example .env.local
   ```

2. **Obtenha a Service Role Key:**
   - Acesse [Supabase Dashboard](https://app.supabase.com)
   - Selecione seu projeto: `spaceshiponsol`
   - Vá para **Settings** → **API**
   - Copie a **service_role** key (secret)

3. **Edite `.env.local`:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...sua_key_aqui
   ```

4. **Salve o arquivo**

---

## 🗄️ Passo 3: Aplicar Schema no Supabase

Se ainda não aplicou o schema:

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. SQL Editor → Copiar `migrations/001_initial_schema.sql`
3. Run → Verificar sucesso

Ver detalhes em: `migrations/README.md`

---

## ▶️ Passo 4: Rodar o Servidor

### Modo Desenvolvimento (com hot-reload):
```bash
npm run dev
```

### Modo Produção:
```bash
npm start
```

---

## ✅ Verificar se está Funcionando

O servidor deve iniciar em: `http://localhost:3001`

Você verá logs como:
```
🚀 Servidor rodando em http://localhost:3001
✅ Supabase conectado
✅ Socket.io pronto
```

**Teste o health check:**
```bash
curl http://localhost:3001/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-10-19T17:45:00.000Z",
  "uptime": 123.45
}
```

---

## 🔧 Troubleshooting

### Erro: "supabaseUrl is required"

**Causa:** `.env.local` não foi criado ou está vazio.

**Solução:**
1. Verifique se `.env.local` existe em `server/`
2. Copie de `env.example`: `cp env.example .env.local`
3. Preencha `SUPABASE_SERVICE_ROLE_KEY`

---

### Erro: "Port 3001 already in use"

**Causa:** Outra aplicação está usando a porta 3001.

**Solução:**
1. Mude a porta em `.env.local`: `PORT=3002`
2. Ou mate o processo: `lsof -ti:3001 | xargs kill -9` (Mac/Linux)

---

### Erro: "permission denied for table player_state"

**Causa:** Service Role Key incorreta ou não configurada.

**Solução:**
1. Verifique se `SUPABASE_SERVICE_ROLE_KEY` está correto
2. Certifique-se de usar a **service_role** key, não a **anon** key

---

### Erro: "Cannot find module 'express'"

**Causa:** Dependências não instaladas.

**Solução:**
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Próximos Passos

Após o servidor rodar com sucesso:

1. ✅ **Fase 1.3:** Implementar Cache Manager + Auth Middleware
2. ✅ **Fase 1.4:** Implementar WebSocket handlers
3. ✅ **Fase 2:** Implementar Zone Manager + Chunk Generator
4. ✅ **Fase 3:** Implementar Battle Engine

Ver plano completo em: `docs/architecture/server-nodejs/IMPLEMENTATION_PLAN.md`

---

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor em modo desenvolvimento |
| `npm start` | Inicia servidor em modo produção |
| `npm test` | Roda testes (quando implementados) |
| `npm run lint` | Verifica código com ESLint |
| `npm run format` | Formata código com Prettier |

---

**Status**: ✅ Fase 1.2 Completa - Schema Supabase aplicado  
**Próximo**: Fase 1.3 - Cache Manager + Auth Middleware

