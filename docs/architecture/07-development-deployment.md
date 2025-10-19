# 7. Development and Deployment

## Local Development Setup

### Pré-requisitos

- **Node.js:** 18.x, 20.x ou 22.x LTS (recomendado 20.x)
- **npm:** v9 ou superior
- **Git:** Para versionamento
- **Phantom Wallet:** Extensão do navegador (para testes Web3)
- **Supabase Account:** Projeto configurado

### Passo a Passo

#### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/space-crypto-miner.git
cd space-crypto-miner
```

#### 2. Instalar Dependências

```bash
npm install
```

**Resultado:** `node_modules/` criado com todas as dependências.

#### 3. Configurar Variáveis de Ambiente

Copiar `env.example` para `.env.local`:

```bash
cp env.example .env.local
```

Editar `.env.local` com suas chaves:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Solana
VITE_SOLANA_NETWORK=mainnet-beta  # ou devnet para testes

# Development
DEV_REDIRECT_ORIGIN=http://localhost:3000
```

#### 4. Executar Servidor de Desenvolvimento

Opção 1: Com servidor customizado (recomendado):

```bash
npm run dev
```

Opção 2: Com Vite puro:

```bash
npm run dev-vite
```

**Resultado:** Servidor iniciado em `http://localhost:3000` (ou porta configurada)

### Troubleshooting

**Problema:** `Cannot find module '@supabase/supabase-js'`
- **Solução:** Executar `npm install` novamente

**Problema:** Variáveis de ambiente não carregam
- **Solução:** Verificar nome do arquivo (`.env.local` ou `.env`)
- **Nota:** `.env` não deve ser commitado; use `.env.local` ou `.env.example`

**Problema:** Phantom Wallet não é detectado
- **Solução:** Instalar Phantom extension no navegador
- **Link:** https://phantom.app/

---

## Build and Deployment Process

### Build Local

```bash
npm run build
```

**Resultado:** `dist/` criado com aplicação otimizada.

### Preview da Build

Testar build localmente antes de deploy:

```bash
npm run preview
```

**Resultado:** Servidor local servindo conteúdo do `dist/`.

### Deploy na Vercel

#### Via Git (Recomendado)

1. Push branch para GitHub/GitLab/Bitbucket
2. Vercel detecta e inicia build automaticamente
3. Deploy para preview URL
4. Merge para main → deploy para produção

#### Via CLI

```bash
npm install -g vercel
vercel
```

**Primeiro deploy:** Será perguntado sobre configuração do projeto

**Deploys subsequentes:**

```bash
vercel --prod
```

### Vercel Configuration

Arquivo `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_key"
  }
}
```

**Nota:** Variáveis sensíveis devem ser configuradas no dashboard Vercel (Project Settings → Environment Variables).

---

## Environments

### Development (Local)

- **URL:** `http://localhost:3000`
- **Database:** Supabase dev/staging
- **Solana:** Devnet ou testnet
- **Debug:** Habilitado
- **Hot Reload:** Sim (Vite)

### Production (Vercel)

- **URL:** `space-crypto-miner.vercel.app` (ou domínio customizado)
- **Database:** Supabase production
- **Solana:** Mainnet
- **Debug:** Desabilitado
- **Hot Reload:** Não
- **Analytics:** Vercel Analytics + Speed Insights

### Testing (Branch Preview)

- **URL:** `space-crypto-miner-{branch}.vercel.app`
- **Database:** Supabase staging (se configurado)
- **Lifetime:** Até branch ser deletado
- **Use Case:** Testes de PR antes de merge

---

## Build Optimization

### Vite Configuration

`vite.config.js` configurado para:

- **Code Splitting:** Chunks separados para melhor cache
- **Tree Shaking:** Remove código não utilizado
- **Minification:** Reduz tamanho dos bundles
- **Asset Optimization:** Comprime imagens e assets

### Output Structure

```
dist/
├── index.html              # HTML principal
├── assets/
│   ├── index-[hash].js     # Main bundle
│   ├── game-[hash].js      # Game code (split)
│   └── vendor-[hash].js    # Dependencies
├── _headers                # Headers customizados Vercel
└── ...
```

### Performance Tips

- **Lazy Loading:** Carregar cenas/managers sob demanda
- **Image Optimization:** Usar formatos otimizados (WebP)
- **Cache Busting:** Hash automático em assets
- **Compression:** Vercel comprime automaticamente

---

## Continuous Integration / Continuous Deployment

### GitHub Actions (Se Configurado)

Arquivo `.github/workflows/deploy.yml`:

1. **On Push to main:** Executa testes e deploy
2. **On PR:** Executa testes e cria preview
3. **Build Check:** Verifica se `npm run build` passa

### Manual Deployment Checklist

Antes de fazer push para produção:

- [ ] `npm run build` sem erros
- [ ] `npm run preview` testa build local
- [ ] Testes manuais completos (login, game, wallet)
- [ ] Variáveis de ambiente corretas
- [ ] Sem console errors/warnings
- [ ] Performance aceitável (Lighthouse score)

---

## Rollback Strategy

### Se Deploy em Produção Quebrou

#### Opção 1: Git Revert Rápido

```bash
# Identificar commit ruim
git log --oneline -n 10

# Reverter (cria novo commit)
git revert [commit-sha]
git push
```

**Resultado:** Vercel detecta novo push e faz redeploy

#### Opção 2: Vercel Rollback Dashboard

1. Acessar Vercel Dashboard
2. Projeto → Deployments
3. Encontrar última versão boa
4. Clicar em "..." → "Rollback to this Deployment"

**Tempo:** ~2-5 minutos

#### Opção 3: Branch Backup

Se Historia 1.0 foi executada (backup Git):

```bash
# Restaurar do branch backup
git checkout pre-refactor-stable
git push --force-with-lease

# Depois investigar e corrigir
git checkout main
# ... fix ...
```

**Precaução:** Force push deve ser evitado em produção

---

## Database Migrations

### Aplicar Migrações

Durante desenvolvimento, se schema mudar:

```bash
# 1. Criar nova migração
npm run migrate:create --name "description_of_change"

# 2. Editar arquivo de migração criado

# 3. Aplicar migração
npm run migrate:up
```

### Vercel Deployment com Migrações

1. Commit mudança de schema + código
2. Deploy para preview (GitHub branch)
3. Testar completamente em preview
4. Se OK, fazer merge para main
5. Vercel faz deploy automático

**Importante:** Migrações devem ser reversíveis (incluir `DOWN` migrations).

---

## Monitoring & Logging

### Vercel Analytics

Dashboard Vercel automaticamente coleta:
- Page views
- Visitors
- Top pages
- Conversions

### Speed Insights

Monitora Web Vitals:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

### Custom Logging

Adicionar logs customizados para debugging:

```javascript
// Log apenas em produção
if (process.env.NODE_ENV === 'production') {
  console.log('Event:', eventName);
}
```

**Ferramentas Recomendadas:**
- Sentry (error tracking)
- LogRocket (session replay)
- DataDog (monitoring)
