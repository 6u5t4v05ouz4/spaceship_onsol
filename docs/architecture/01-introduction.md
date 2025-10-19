# 1. Introduction

## Document Scope

Este documento captura o **ESTADO ATUAL** do código-fonte do **Space Crypto Miner**, incluindo:
- Padrões reais identificados
- Tecnologias utilizadas
- Estrutura de organização
- Base para futuras melhorias (conforme `ROADMAP.md`)

Baseado em análise dos arquivos fornecidos:
- `package.json`
- `vite.config.js`
- Estrutura de diretórios
- Documentação existente (`ROADMAP.md`, `GDD.md`, `UI_UX_DESIGN_SYSTEM.md`)

### Foco da Documentação

Documentação abrangente do sistema atual, com ênfase em áreas relevantes para:
- Phase 1 e 2 do `ROADMAP.md`
- Core Gameplay PvE/PvP
- Sistema NFT
- Economia de Tokens
- Integração Supabase/Solana

---

## Quick Reference - Key Files and Entry Points

### Arquivos Críticos para Compreender o Sistema

#### Game Logic
| Arquivo | Propósito |
|---------|----------|
| `src/game-only.js` | Ponto de entrada principal do jogo Phaser (especificado no `package.json`) |
| `src/scenes/GameSceneModular.js` | Cena principal do jogo |

#### Configuration
| Arquivo | Propósito |
|---------|----------|
| `src/config/config.js` | Configuração geral |
| `.env` | Variáveis de ambiente (sensíveis) |
| `vite.config.js` | Config de build e dev server |

#### Core Business Logic
| Arquivo | Propósito |
|---------|----------|
| `src/managers/` | Gerenciadores (Audio, Ship, Collision, UI, Enemy, etc.) |
| `src/managers/ShipManager.js` | Gerenciamento de naves do jogador |
| `src/managers/CollisionManager.js` | Sistema de colisões |
| `src/managers/UIManager.js` | Gerenciamento de UI |

#### Blockchain Integration
| Arquivo | Propósito |
|---------|----------|
| `src/solana_nft.js` | Lógica de integração Solana/NFT |

#### Database/Backend
| Arquivo | Propósito |
|---------|----------|
| `src/supabase-dev.js` | Configuração/inicialização Supabase para dev |
| `src/config/supabase-config.js` | Config do cliente Supabase |
| `database-schema.sql` | Schema do banco de dados |
| `database-rls-policies.sql` | Políticas Row Level Security |
| `database-functions.sql` | Funções customizadas do DB |

#### Build and Development
| Arquivo | Propósito |
|---------|----------|
| `vite.config.js` | Configuração do Vite |
| `dev-server.cjs` | Servidor de desenvolvimento customizado |
| `vercel.json` | Configuração de deploy Vercel |

#### HTML Entry Points
| Arquivo | Propósito |
|---------|----------|
| `index.html` | Página inicial |
| `game.html` | Entrada do jogo |
| `dashboard.html` | Dashboard do usuário |
| `login.html` | Página de login |
| `profile.html` | Página de perfil do usuário |
| `auth-callback.html` | Callback de autenticação OAuth |

### Asset Directories
| Diretório | Conteúdo |
|-----------|---------|
| `public/assets/` | Assets do jogo (imagens, sons, JSONs de spritesheets) |
| `src/styles/` | Arquivos CSS modulares |

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| October 18, 2025 | 1.1 | Updated Testing/Integration notes based on PO feedback | Winston (Architect) |
| October 18, 2025 | 1.0 | Initial brownfield analysis | Winston (Architect) |
