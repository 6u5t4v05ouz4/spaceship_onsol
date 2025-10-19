# Space Crypto Miner Brownfield Architecture Document

## Introduction

Este documento captura o ESTADO ATUAL do código-fonte do **Space Crypto Miner**, incluindo padrões reais, tecnologias e estrutura, com base na análise dos arquivos fornecidos (`package.json`, `vite.config.js`, estrutura de diretórios) e na documentação existente (`ROADMAP.md`, `GDD.md`, `UI_UX_DESIGN_SYSTEM.md`, `README.md` listando ~45 docs). Ele serve como referência para agentes de IA que trabalharão em melhorias futuras, como as delineadas no `ROADMAP.md`.

### Document Scope

Documentação abrangente do sistema atual, com foco nas áreas relevantes para as Fases 1 e 2 do `ROADMAP.md` (Core Gameplay PvE/PvP, Sistema NFT, Economia de Tokens, Integração Supabase/Solana).

### Change Log

| Date            | Version | Description                 | Author    |
| --------------- | ------- | --------------------------- | --------- |
| October 18, 2025 | 1.0     | Initial brownfield analysis | Winston (Architect) |
| October 18, 2025 | 1.1     | Updated Testing/Integration notes based on PO feedback | Winston (Architect) |


## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

* **Main Entry (Game Logic)**: `src/game-only.js` (Inferido do `package.json`)
* **Main Scene**: `src/scenes/GameSceneModular.js` (Inferido da estrutura e docs)
* **Configuration**: `src/config/config.js`, `.env` (ou `env.example`), `vite.config.js`
* **Core Business Logic (Managers)**: `src/managers/` (contém `ShipManager.js`, `CollisionManager.js`, `UIManager.js`, etc.)
* **Blockchain Integration**: `src/solana_nft.js`
* **Database/Backend Integration**: `src/supabase-dev.js`, `src/config/supabase-config.js`, arquivos SQL na raiz.
* **Build/Dev Server**: `vite.config.js`, `dev-server.cjs`
* **HTML Entry Points**: `index.html`, `game.html`, `dashboard.html`, `login.html`, `profile.html`

## High Level Architecture

### Technical Summary

O Space Crypto Miner é atualmente um jogo web **"brownfield"** construído com **Phaser 3.90.0** como motor de jogo principal. A aplicação é servida e construída usando **Vite 7.1.9**. Ele integra funcionalidades Web3 através da biblioteca **@solana/web3.js 1.98.4** para interações com a blockchain Solana (NFTs, Wallet Phantom). O backend de dados e autenticação parece ser gerenciado pelo **Supabase**, como indicado pelos arquivos SQL e configuração. A estrutura do código sugere uma abordagem modular baseada em Cenas e Managers dentro do Phaser. O projeto está configurado para deploy na **Vercel**.

### Actual Tech Stack (from package.json/vite.config.js)

| Category             | Technology                 | Version      | Notes                                                              |
| -------------------- | -------------------------- | ------------ | ------------------------------------------------------------------ |
| Game Engine          | Phaser                     | ^3.90.0      | Motor principal para o jogo.                                       |
| Blockchain Lib       | @solana/web3.js            | ^1.98.4      | Integração com a blockchain Solana.                                |
| Build Tool / Server  | Vite                       | ^7.1.9       | Ferramenta de build e servidor de desenvolvimento frontend.        |
| Analytics            | @vercel/analytics          | ^1.5.0       | Coleta de métricas de uso (Vercel).                                |
| Speed Insights       | @vercel/speed-insights     | ^1.2.0       | Coleta de métricas de performance (Vercel).                        |
| Runtime Environment  | Node.js                    | (Implícito)  | Necessário para Vite, dev server, build scripts. Versão não especificada. |
| Backend/DB           | Supabase                   | (Implícito)  | Inferido pelos arquivos SQL, `supabase-dev.js`, `supabase-config.js`. |
| Deployment Platform  | Vercel                     | (Implícito)  | Inferido por analytics e `vercel.json`.                            |

### Repository Structure Reality Check

* **Tipo**: Monorepo (único repositório contém frontend, jogo, scripts, docs).
* **Package Manager**: npm (indicado por `package-lock.json`).
* **Notável**:
    * Múltiplos arquivos HTML na raiz (`index.html`, `game.html`, etc.) indicam diferentes pontos de entrada ou uma migração em andamento (visto em `index-unified.html`, `index-backup.html`). **Isto é um ponto chave a ser abordado na refatoração.**
    * Presença de arquivos SQL na raiz para schema, migração e funções do Supabase.
    * Extensa documentação na pasta `docs`.
    * Pastas de configuração para múltiplas IDEs/ferramentas (`.bmad-core`, `.claude`, `.cursor`, etc.).

## Source Tree and Module Organization

### Project Structure (Actual)

```plaintext
D:.
│   .env, .gitignore, package.json, vite.config.js, dev-server.cjs, vercel.json
│   *.html (index.html, game.html, dashboard.html, etc.)
│   *.sql (database-schema.sql, database-migration.sql, etc.)
│
├───.bmad-core/             # Configuração e agentes BMad
├───.github/                # Configuração GitHub (Actions, Chatmodes)
├───.vercel/                # Configuração Vercel
├───docs/                   # Documentação do projeto (GDD, Roadmap, Arquitetura, etc.)
├───node_modules/           # Dependências
├───public/                 # Assets estáticos servidos pelo Vite
│   └───assets/
│       ├───aim/, background/, fonts/, icones/, images/, sounds_effects/, videos/
│       └───aseprite/       # Arquivos fonte Aseprite
│
├───src/                    # Código fonte principal da aplicação/jogo
│   │   auth.js             # Lógica de autenticação (provavelmente Supabase)
│   │   config.js           # Configuração geral
│   │   game-only.js        # Ponto de entrada principal do jogo Phaser (package.json main)
│   │   solana_nft.js       # Lógica de integração Solana/NFT
│   │   styles.css          # Estilos CSS globais (se houver)
│   │   supabase-dev.js     # Configuração/inicialização do Supabase para dev
│   │
│   ├───config/             # Arquivos de configuração específicos
│   ├───effects/            # Efeitos visuais (partículas, etc.)
│   ├───managers/           # Classes de gerenciamento (AudioManager, ShipManager, etc.)
│   ├───scenes/             # Cenas do Phaser (GameSceneModular, MenuScene)
│   ├───simulation/         # Lógica para simulação de gameplay (background?)
│   ├───styles/             # Arquivos CSS modulares
│   └───utils/              # Funções utilitárias
│
├───backup/                 # Backups de arquivos HTML antigos
├───BMAD-METHOD/            # Cópia local do framework BMad-Method (?)
├───dev/                    # Páginas HTML para debug
├───dist/                   # Diretório de saída do build (gerado por `vite build`)
├───fonts/                  # Arquivos de fonte
├───js/                     # (Vazio?)
├───screenshots/            # Capturas de tela
└───web-bundles/            # Bundles web gerados pelo BMad-Method



# Key Modules and Their Purpose

### `src/`
Contém todo o código-fonte principal da aplicação e do jogo.

### `scenes/`
Define as diferentes telas ou estados do jogo Phaser (ex: `GameSceneModular`, `MenuScene`).  
`GameSceneModular.js` parece ser a cena principal do jogo.

### `managers/`
Implementa a lógica de gerenciamento para diferentes aspectos do jogo (Áudio, Naves, Colisões, UI, Inimigos, etc.).  
Indica uma abordagem de design modular.

### `config/`
Centraliza as configurações, incluindo a integração com Supabase.

### `effects/`, `simulation/`
Módulos para efeitos visuais e simulação de gameplay em background.

### `utils/`
Funções utilitárias reutilizáveis.

### `auth.js`
Lógica de autenticação, provavelmente usando **Supabase Auth**.

### `solana_nft.js`
Lógica específica para interagir com a blockchain **Solana** e **NFTs**.

### `game-only.js`
Ponto de entrada principal que provavelmente configura e inicia o jogo **Phaser**.

### `public/assets/`
Armazena todos os assets do jogo (imagens, sons, fontes, JSONs de spritesheets).

### `docs/`
Contém documentação extensa sobre design, planejamento, segurança e correções passadas.

### Arquivos SQL na raiz
Definem o schema do banco de dados (Supabase), migrações, funções e políticas RLS.

### Arquivos HTML na raiz
Múltiplos pontos de entrada para diferentes partes da aplicação web (jogo, dashboard, login).  
Esta estrutura será refatorada.

---

# Data Models and APIs

## Data Models

### Banco de Dados (Supabase)
O schema está definido nos arquivos SQL na raiz:

- `database-schema.sql`: Define as tabelas principais.  
- `database-migration.sql`: Contém alterações incrementais no schema.  
- `database-functions.sql`, `uuid-v7-function.sql`: Funções customizadas.  
- `database-rls-policies.sql`, `apply-rls-fix.sql`, `fix-user-profiles-rls.sql`: Políticas RLS.  
- `database-seed-data.sql`: Dados iniciais.  
- `supabase-storage-setup.sql`: Configuração do Storage.  

**Referência:** Arquivos `.sql` na raiz.

### Blockchain (Solana)
- NFTs representam as naves.  
- Metadados NFT seguem o padrão **Metaplex**.  
**Referência:** `docs/NFT_COLLECTION_PLAN.md` e `src/solana_nft.js`.

---

# API Specifications

### API Interna (Jogo → Backend)
Comunicação com Supabase via SDK cliente (`supabase-dev.js`, `supabase-config.js`).  
Nenhuma API customizada exposta pelo projeto foi identificada.

### API Externa (Backend → Serviços)
Integrações com **Supabase** e **Solana**.

### Proxy de Desenvolvimento
`vite.config.js` configura proxy para `/auth` e `/api` para desenvolvimento local.

---

# Technical Debt and Known Issues

### Critical Technical Debt
- **Ausência de Testes Automatizados:** O projeto depende de testes manuais, aumentando o risco de regressões. (Identificado pela PO)  
- **Estrutura Organizacional:** Múltiplos pontos de entrada HTML e mistura de responsabilidades dificultam manutenção e desenvolvimento.  
  (Principal motivação para a refatoração)

*(Necessita Input do Usuário)* Outras dívidas técnicas conhecidas (ex: módulos complexos, performance)?

---

# Workarounds and Gotchas

- **Múltiplos HTMLs:** Complexidade na navegação atual que será resolvida na refatoração.  
- **Configuração de Redirect OAuth:** `vite.config.js` contém lógica customizada complexa para dev local.  
  O bug de redirecionamento para produção em dev foi identificado e será corrigido.  
- **Políticas RLS do Supabase:** Segurança depende fortemente das RLS.  
  Alterações no DB devem considerar o impacto nelas.

---

# Integration Points and External Dependencies

## External Services

| Service | Purpose | Integration Type | Key Files / Configuration |
|----------|----------|------------------|----------------------------|
| **Supabase** | Backend (Auth, DB, Storage) | Client SDK / API | `src/supabase-dev.js`, `src/config/supabase-config.js`, `.sql` files |
| **Solana** | Blockchain (NFTs, Wallet) | `@solana/web3.js` SDK | `src/solana_nft.js`, Phantom Wallet (implícito) |
| **Vercel** | Deployment, Analytics | Config Files / SDK | `vercel.json`, `@vercel/analytics`, `@vercel/speed-insights` |
| **Filebase** | IPFS Storage (Planejado?) | API / SDK (TBD) | Mencionado no `ROADMAP.md` |

## Internal Integration Points

- **Phaser Game ↔ Web UI:** Comunicação entre canvas e HTML (ex: via eventos DOM, chamadas JS).  
  *Nota PO:* A forma exata precisa ser verificada no código detalhado.  
- **Phaser Game ↔ Solana:** `src/solana_nft.js` chamado por Cenas/Managers.  
- **Web UI ↔ Supabase:** Páginas HTML interagem com Supabase via `auth.js` e `supabase-dev.js`.

---

# Development and Deployment

## Local Development Setup

1. Clonar repositório.  
2. `npm install`  
3. Configurar `.env` (a partir de `env.example`) com chaves Supabase e `DEV_REDIRECT_ORIGIN`.  
4. Rodar `npm run dev` (com servidor customizado) ou `npm run dev-vite` (Vite puro).

## Build and Deployment Process

- **Build:** `npm run build` (via Vite) → `dist/`. Chunks otimizados.  
- **Deployment:** Vercel (`vercel.json`, `npm run vercel-build`).  
- **Preview:** `npm run preview`.  
- **Environments:** Development (local), Production (Vercel).

---

# Testing Reality

### Current Test Coverage
- **Unit Tests:** Inexistentes.  
- **Integration Tests:** Inexistentes.  
- **E2E Tests:** Inexistentes.  
- **Manual Testing:** Método primário.  
  Realizado com auxílio das páginas de debug em `dev/` e feedback direto do testador ao Dev/PM.  
  *(Confirmado pela PO)*
