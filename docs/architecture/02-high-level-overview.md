# 2. High Level Architecture

## Technical Summary

O Space Crypto Miner é atualmente um jogo web **"brownfield"** com as seguintes características:

### Arquitetura Geral

- **Motor de Jogo:** **Phaser 3.90.0** como motor principal
- **Build Tool:** **Vite 7.1.9** para build e desenvolvimento
- **Integração Web3:** **@solana/web3.js 1.98.4** para blockchain Solana
- **Backend:** **Supabase** para dados e autenticação
- **Deploy:** **Vercel** como plataforma de deployment
- **Package Manager:** **npm** (verificado via `package-lock.json`)

### Fluxo de Funcionamento

1. **Usuário acessa a aplicação** via navegador web
2. **Frontend Vite** serve aplicação estática (HTML + JS + CSS)
3. **Phaser Game** renderiza em canvas dentro da página
4. **Comunicação com Supabase** para auth, dados de usuario e game state
5. **Integração Solana** para verificação de NFTs e interação com wallet Phantom
6. **Analytics** via Vercel (Speed Insights e Analytics)

---

## Actual Tech Stack (from package.json/vite.config.js)

### Principais Dependências

| Categoria | Tecnologia | Versão | Notas |
|-----------|-----------|---------|-------|
| 🎮 Game Engine | Phaser | ^3.90.0 | Motor principal para o jogo |
| ⛓️ Blockchain Lib | @solana/web3.js | ^1.98.4 | Integração com blockchain Solana |
| 🔨 Build Tool / Server | Vite | ^7.1.9 | Ferramenta de build e servidor de dev frontend |
| 📊 Analytics | @vercel/analytics | ^1.5.0 | Coleta de métricas de uso (Vercel) |
| ⚡ Speed Insights | @vercel/speed-insights | ^1.2.0 | Coleta de métricas de performance (Vercel) |
| 🖥️ Runtime | Node.js | (Implícito) | Necessário para Vite, dev server, build scripts |
| 🗄️ Backend/DB | Supabase | (Implícito) | Inferido pelos arquivos SQL e configs |
| 🚀 Deployment | Vercel | (Implícito) | Inferido por analytics e `vercel.json` |

### Versão de Node.js

Não especificada explicitamente no `package.json`. Recomendação: usar LTS mais recente (18.x, 20.x ou 22.x).

---

## Repository Structure Reality Check

### Tipo de Repositório

- **Tipo:** Monorepo
- **Características:** Um único repositório contém:
  - Frontend/Jogo
  - Scripts de build e desenvolvimento
  - Documentação extensa
  - Configurações de múltiplas ferramentas

### Package Manager

- **Gerenciador:** npm
- **Indicação:** `package-lock.json` presente
- **Lock File:** Commited (bom para reprodutibilidade)

### Pontos Notáveis

#### Múltiplos Pontos de Entrada HTML

**Problema Identificado:** Múltiplos arquivos HTML na raiz:
- `index.html`
- `game.html`
- `dashboard.html`
- `login.html`
- `profile.html`
- `auth-callback.html`

Evidência de diferentes pontos de entrada ou migração em andamento:
- `index-unified.html` (tentativa de unificação?)
- `index-backup.html` (backup de versão anterior)

**Impacto:** Dificulta navegação e manutenção. Será refatorado no PRD (História 1.1).

#### Configuração do SQL

**Localização:** Arquivos SQL na raiz do projeto:
- Schema, migrations, funções customizadas
- Políticas RLS para segurança
- Dados de seed

**Significado:** Banco de dados é parte crítica da aplicação e versionado no Git.

#### Documentação Extensa

**Pasta `docs/`:** Contém 45+ documentos sobre:
- Game Design Document (GDD)
- Roadmap
- Design System UI/UX
- Segurança
- Histórico de correções

#### Configurações de Ferramentas

**Pastas especializadas:**
- `.bmad-core/` - Framework BMad-Method
- `.github/` - Configuração GitHub (Actions, Chatmodes)
- `.vercel/` - Configuração Vercel
- `.cursor/` - Configuração Cursor IDE

**Indicação:** Projeto bem instrumentado com boas práticas de CI/CD e IDE.

---

## Architecture Diagram (Conceitual)

```
┌─────────────────────────────────────────────────────────────┐
│                   Navegador do Usuário                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Vercel (Hosting + Edge Functions)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Aplicação SPA (Vite + HTML + JS + CSS)               │ │
│  │  ├── Login Page                                       │ │
│  │  ├── Dashboard Page                                  │ │
│  │  ├── Profile Page                                    │ │
│  │  └── Game Canvas (Phaser)                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
              ↙                    ↓                    ↘
    ┌─────────────┐    ┌──────────────────┐    ┌──────────────┐
    │  Supabase   │    │  Solana RPC      │    │  Vercel      │
    │             │    │                  │    │  Analytics   │
    │ - Auth      │    │ - NFT Metadata   │    │              │
    │ - Database  │    │ - Wallet Connect │    │ - Speed      │
    │ - Storage   │    │ - Token Balance  │    │   Insights   │
    └─────────────┘    └──────────────────┘    └──────────────┘
              ↓                    ↓
    ┌─────────────┐    ┌──────────────────┐
    │  PostgreSQL │    │ Phantom Wallet   │
    │             │    │ (Browser Ext)    │
    │ - Users     │    │                  │
    │ - Game Data │    │ (User Controlled)│
    └─────────────┘    └──────────────────┘
```
