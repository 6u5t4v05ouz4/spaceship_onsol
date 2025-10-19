# 2. Requirements

## Requisitos Funcionais

### FR1 - Refatoração de Estrutura de Arquivos do Site

Refatorar a estrutura de arquivos da parte do "site" (atualmente composta por múltiplos arquivos HTML na raiz) para seguir a estrutura validada (ex: `src/web/pages/`, `src/web/components/`, `src/web/services/`), utilizando um sistema de roteamento JavaScript (a ser definido na arquitetura) em vez de múltiplos arquivos HTML independentes.

### FR2 - Separação Lógica de Responsabilidades

Separar logicamente o código-fonte do jogo (Phaser, `src/scenes/`, `src/managers/`) do código-fonte do site (lógica de UI, autenticação, perfil, dashboard), minimizando dependências diretas não essenciais entre eles (ex: movendo o jogo para `src/game/` e o site para `src/web/`).

### FR3 - Preservação de Funcionalidades do Site

Garantir que todas as funcionalidades *existentes* do site continuem funcionando corretamente após a refatoração estrutural:
- Login via Supabase Auth
- Visualização do Dashboard
- Visualização/edição do Perfil de Usuário

### FR4 - Preservação da Integração Solana/NFT

Garantir que a integração *existente* com a carteira Phantom e a lógica de verificação de NFTs (`src/solana_nft.js`) permaneçam funcionais e acessíveis a partir das partes relevantes da aplicação (provavelmente tanto o site quanto o jogo).

### FR5 - Preservação do Jogo Principal

Preservar a funcionalidade do jogo principal (`src/game-only.js`, `src/scenes/GameSceneModular.js` e seus managers) durante e após a refatoração da estrutura do site.

---

## Requisitos Não-Funcionais

### NFR1 - Qualidade de Código

A refatoração deve resultar em uma estrutura de código mais organizada, legível e de fácil manutenção, seguindo as convenções da estrutura validada.

### NFR2 - Performance

A performance percebida pelo usuário nas seções do site (tempo de carregamento, responsividade da interface) não deve ser degradada após a refatoração. Se possível, identificar oportunidades de otimização.

### NFR3 - Segurança

A segurança da aplicação deve ser mantida ou aprimorada. As políticas de Row Level Security (RLS) existentes no Supabase (`database-rls-policies.sql`, etc.) devem ser respeitadas e verificadas após a refatoração.

### NFR4 - Conformidade com Padrões

O código refatorado deve aderir aos padrões de codificação estabelecidos (a serem definidos/confirmados na arquitetura) e usar as versões de tecnologia especificadas no `package.json`:
- Phaser 3.90
- Vite 7.1
- Solana/Web3 1.98

### NFR5 - Compatibilidade com Deploy

A aplicação refatorada deve continuar compatível com:
- Processo de build (`vite build`)
- Deploy na Vercel (`vercel.json`)

### NFR6 - Tratamento Robusto de Erros e Rate Limits

A aplicação deve lidar graciosamente com limites de taxa (rate limits) e erros de API ao interagir com serviços externos como Supabase e Solana RPCs, implementando retentativas (retries) apropriadas onde aplicável e fornecendo feedback claro ao usuário em caso de falha persistente.

---

## Requisitos de Compatibilidade

### CR1 - Integridade do Banco de Dados

A integridade do schema e dos dados existentes no banco de dados Supabase não deve ser comprometida. Migrações de schema, se necessárias, devem ser planejadas e executadas de forma segura e preferencialmente reversível.

### CR2 - Fluxo de Autenticação

O fluxo de autenticação existente com o Supabase Auth (incluindo OAuth via Google, se configurado) deve permanecer funcional sem exigir que os usuários se reautentiquem ou percam o acesso.

### CR3 - Integração Blockchain

A integração com a blockchain Solana para leitura de NFTs e interação com a carteira Phantom deve continuar funcionando como antes. Nenhuma alteração nos contratos ou na lógica on-chain está no escopo desta refatoração.

### CR4 - Build e Deploy

A configuração de build do Vite e o processo de deploy na Vercel devem ser ajustados para acomodar a nova estrutura, mas o resultado final (aplicação funcional na Vercel) deve ser o mesmo.
