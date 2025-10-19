# 3. Source Tree and Module Organization

## Project Structure (Actual)

```plaintext
D: (Workspace Root)
│
│   .env                         # Variáveis de ambiente (não commitado)
│   .gitignore                   # Regras de ignore Git
│   package.json                 # Dependências npm
│   package-lock.json            # Lock file npm
│   vite.config.js               # Configuração Vite
│   dev-server.cjs               # Servidor dev customizado
│   vercel.json                  # Config Vercel
│   *.html                       # Múltiplos pontos de entrada (index.html, game.html, etc.)
│   *.sql                        # Configuração Supabase (schema, migrations, RLS)
│
├───.bmad-core/                  # Framework BMad-Method (config e agentes)
├───.github/                     # Configuração GitHub (Actions, Chatmodes)
├───.vercel/                     # Configuração Vercel
├───.cursor/                     # Configuração Cursor IDE
│
├───docs/                        # Documentação do projeto (45+ docs)
│   ├───prd/                     # PRD dividido em shards
│   └───architecture/            # Este documento (arquitetura dividida)
│
├───node_modules/               # Dependências npm (gerado)
│
├───public/                      # Assets estáticos servidos por Vite
│   └───assets/
│       ├───aim/                 # Sprites de mira
│       ├───background/          # Texturas de background
│       ├───fonts/               # Arquivos de fonte
│       ├───icones/              # Ícones da UI
│       ├───images/              # Imagens gerais
│       ├───sounds_effects/      # Efeitos sonoros
│       ├───videos/              # Vídeos
│       └───aseprite/            # Arquivos fonte Aseprite
│
├───src/                         # Código fonte principal
│   │
│   ├───auth.js                  # Lógica de autenticação (Supabase)
│   ├───config.js                # Configuração geral
│   ├───game-only.js             # **PONTO DE ENTRADA PRINCIPAL** (especificado em package.json)
│   ├───solana_nft.js            # Lógica de integração Solana/NFT
│   ├───styles.css               # Estilos CSS globais
│   ├───supabase-dev.js          # Configuração/inicialização Supabase
│   │
│   ├───config/                  # Arquivos de configuração específicos
│   │   ├───config.js            # Config central
│   │   ├───supabase-config.js   # Config cliente Supabase
│   │   └───...
│   │
│   ├───effects/                 # Efeitos visuais
│   │   ├───particle-effects.js
│   │   └───...
│   │
│   ├───managers/                # **GERENCIADORES PRINCIPAIS** (padrão do Phaser)
│   │   ├───AudioManager.js
│   │   ├───ShipManager.js       # Naves do jogador
│   │   ├───CollisionManager.js  # Sistema de colisões
│   │   ├───UIManager.js         # Gerenciamento de UI
│   │   ├───EnemyManager.js      # Inimigos
│   │   ├───LootManager.js       # Loot/Prêmios
│   │   ├───HUDManager.js        # HUD/Interface
│   │   └───...
│   │
│   ├───scenes/                  # Cenas do Phaser
│   │   ├───GameSceneModular.js  # **CENA PRINCIPAL DO JOGO**
│   │   ├───MenuScene.js
│   │   └───...
│   │
│   ├───simulation/              # Lógica de simulação
│   │   ├───background-simulation.js
│   │   └───...
│   │
│   ├───styles/                  # CSS modulares
│   │   ├───base/
│   │   ├───components/
│   │   └───...
│   │
│   └───utils/                   # Funções utilitárias
│       ├───helpers.js
│       └───...
│
├───backup/                      # Backups de arquivos HTML antigos
│
├───BMAD-METHOD/                 # Cópia local do framework BMad-Method
│
├───dev/                         # Páginas HTML para debug (dev-only)
│   ├───check-supabase-config.html
│   ├───debug-auth.html
│   ├───test-supabase.html
│   └───...
│
├───dist/                        # Saída do build (gerado por `vite build`)
│   ├───assets/                  # Assets otimizados
│   ├───index.html               # HTML final
│   └───...
│
├───fonts/                       # Arquivos de fontes customizadas
│
├───js/                          # (Aparentemente vazio - legado?)
│
├───screenshots/                 # Capturas de tela
│
└───web-bundles/                 # Bundles web gerados pelo BMad-Method
```

---

## Key Modules and Their Purpose

### 📍 `src/` - Código-Fonte Principal

Contém todo o código-fonte principal da aplicação e do jogo.

### 🎬 `src/scenes/` - Cenas do Phaser

Define as diferentes telas ou estados do jogo.

| Arquivo | Propósito |
|---------|----------|
| `GameSceneModular.js` | **Cena principal do jogo** - Lógica de gameplay |
| `MenuScene.js` | Menu principal (se existente) |
| Outras cenas | Telas adicionais |

**Nota:** O padrão Phaser uses "Scenes" como estado principal de cada tela/estado do jogo.

### 👔 `src/managers/` - Gerenciadores

Implementa a lógica de gerenciamento para diferentes aspectos do jogo, indicando **abordagem modular de design**.

| Manager | Responsabilidade |
|---------|-----------------|
| `AudioManager.js` | Som e música |
| `ShipManager.js` | Naves do jogador e inimigas |
| `CollisionManager.js` | Sistema de detecção de colisões |
| `UIManager.js` | Elementos de UI (HUD, menus, etc) |
| `EnemyManager.js` | Comportamento e lógica de inimigas |
| `LootManager.js` | Drop de loot/recompensas |
| `HUDManager.js` | Interface de cabeça acima (health bars, etc) |

**Padrão:** Cada manager é uma classe/módulo responsável por um aspecto específico.

### ⚙️ `src/config/` - Configuração

Centraliza as configurações, incluindo integração com Supabase.

| Arquivo | Propósito |
|---------|----------|
| `config.js` | Configuração central do projeto |
| `supabase-config.js` | Inicialização cliente Supabase |

### 🎨 `src/effects/` - Efeitos Visuais

Módulos para efeitos visuais como partículas, explosões, etc.

### 🔄 `src/simulation/` - Simulação

Lógica para simulação de gameplay em background (ex: `background-simulation.js` para sistema de estrelas/background).

### 🛠️ `src/utils/` - Utilitários

Funções utilitárias reutilizáveis compartilhadas entre módulos.

### 🔐 `src/auth.js` - Autenticação

Lógica de autenticação, provavelmente usando **Supabase Auth** (email/senha e/ou OAuth).

### ⛓️ `src/solana_nft.js` - Integração Blockchain

Lógica específica para interagir com:
- Blockchain **Solana**
- NFTs (metadados, verificação)
- Wallet **Phantom** (conexão, assinatura)

### 🎮 `src/game-only.js` - Entrada Principal

**Ponto de entrada principal** especificado no `package.json`.  
Provavelmente configura e inicia o jogo **Phaser**.

### 📦 `public/assets/` - Assets do Jogo

Armazena todos os assets:
- **Imagens** (sprites, backgrounds, texturas)
- **Sons** (efeitos, música)
- **Fontes** (web fonts)
- **JSONs** (configuração de spritesheets, mapas)
- **Aseprite** (arquivos fonte para animações)

### 📚 `docs/` - Documentação

Contém documentação extensa sobre design, planejamento, segurança e correções.

### 🗄️ Arquivos SQL na Raiz

Definem a infraestrutura Supabase:
- **Schema:** Tabelas e estrutura de dados
- **Migrações:** Alterações incrementais
- **Funções:** Lógica customizada no banco
- **RLS:** Políticas de segurança por row
- **Seed:** Dados iniciais

### 🌐 Arquivos HTML na Raiz

Múltiplos pontos de entrada para diferentes partes da aplicação web:

| Arquivo | Propósito |
|---------|----------|
| `index.html` | Página inicial/landing |
| `game.html` | Entrada do jogo |
| `dashboard.html` | Dashboard do usuário |
| `login.html` | Página de login |
| `profile.html` | Página de perfil |
| `auth-callback.html` | Callback de OAuth |

**Status:** Será refatorado em uma estrutura única com roteamento SPA (PRD - História 1.1).

---

## Design Patterns Utilizados

### Padrão Manager/Service

Os "managers" são uma implementação do padrão **Service Locator** ou **Manager Pattern** comum no Phaser, onde cada manager encapsula a lógica de um domínio específico.

### Padrão Scene

Phaser utiliza o padrão **Scene** para gerenciar diferentes estados/telas da aplicação.

### Modularidade

O código está organizado de forma modular, separando responsabilidades em diferentes arquivos e pastas, facilitando manutenção.
