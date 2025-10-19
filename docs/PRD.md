# Space Crypto Miner Brownfield Enhancement PRD

## Intro Project Analysis and Context

Esta seção reúne informações abrangentes sobre o projeto existente Space Crypto Miner, servindo como base para planejar a melhoria maior solicitada. A análise foi realizada pelo Arquitecto e validada pelo usuário.

### Existing Project Overview

#### Analysis Source

* Análise brownfield baseada em IDE/arquivos (estrutura de diretórios, `package.json`, `vite.config.js`) realizada pelo Arquiteto em 18/10/2025 e validada pelo usuário.
* Documentos de planejamento existentes (`GDD.md`, `ROADMAP.md`, `UI_UX_DESIGN_SYSTEM.md`, `README.md` listando ~45 docs) foram usados como contexto suplementar.

#### Current Project State

* O Space Crypto Miner é um jogo web existente construído com Phaser 3.90.0 e Vite 7.1.9. Ele integra funcionalidades Web3 via @solana/web3.js 1.98.4 para NFTs e carteira Phantom. O backend de dados e autenticação parece ser gerenciado pelo Supabase. O código está estruturado modularmente com Cenas e Managers do Phaser e é implantado na Vercel. O projeto possui múltiplos pontos de entrada HTML (jogo, dashboard, login).

### Available Documentation Analysis

#### Available Documentation

* Análise de projeto existente disponível (output da tarefa `document-project` do Arquiteto).
* Documentação de alto nível (GDD, Roadmap, Design System) está presente em `docs/`.
* Schema do banco de dados, migrações e políticas RLS estão definidos em arquivos `.sql` na raiz.
* Nenhuma especificação formal de API (como OpenAPI) foi encontrada; a comunicação com o Supabase parece ser via SDK do cliente.
* Não foram encontrados testes automatizados; testes parecem ser manuais auxiliados por páginas de debug e feedback direto ao Dev/PM.

### Enhancement Scope Definition

#### Enhancement Type

* [ ] New Feature Addition
* [x] Major Feature Modification *(Selecionado com base na sua descrição "melhoria maior")*
* [ ] Integration with New Systems
* [ ] Performance/Scalability Improvements
* [ ] UI/UX Overhaul
* [ ] Technology Stack Upgrade
* [ ] Bug Fix and Stability Improvements
* [x] "Other: Organização Estrutural / Refatoração do Fluxo de Trabalho" *(Adicionado com base na sua preocupação principal)*

#### Enhancement Description

* A melhoria maior consiste principalmente na **refatoração da estrutura organizacional do projeto**, separando claramente as responsabilidades (site vs. jogo), melhorando o fluxo de trabalho de desenvolvimento e corrigindo bugs decorrentes da má organização e implementação atual. O foco inicial será reorganizar a parte do "site" (login, dashboard, profile, etc.).

#### Impact Assessment

* Com base na necessidade de reorganização estrutural e correções profundas:
    * [ ] Minimal Impact (adições isoladas)
    * [ ] Moderate Impact (algumas mudanças no código existente)
    * [ ] Significant Impact (mudanças substanciais no código existente)
    * [x] Major Impact (mudanças arquitetônicas necessárias) *(Selecionado pelo usuário)*

### Goals and Background Context

#### Goals

* Melhorar a estrutura organizacional do código, separando claramente as partes do site e do jogo.
* Tornar o projeto mais seguro e profissional em sua implementação.
* Corrigir bugs existentes que foram causados pela má organização de arquivos e código mal implementado.
* Estabelecer um fluxo de trabalho de desenvolvimento mais claro e eficiente.

#### Background Context

* Esta melhoria é considerada crítica para a saúde e viabilidade a longo prazo do projeto ("vida ou morte"). O projeto evoluiu organicamente sem um planejamento inicial formal ou documentação robusta, levando à atual desorganização.
* As mudanças propostas não derivam diretamente de um item específico do roadmap, mas são um pré-requisito fundamental para permitir o desenvolvimento futuro sustentável e a implementação eficaz das funcionalidades planejadas no roadmap. A refatoração visa resolver problemas estruturais e de implementação que impedem o progresso e a qualidade.

### Change Log

| Change                           | Date             | Version | Description                   | Author    |
| -------------------------------- | ---------------- | ------- | ----------------------------- | --------- |
| Initial Draft (Intro Analysis) | October 18, 2025 | 0.1     | Criação inicial baseada em análise | John (PM) |
| Updated Sections 2-5 & Epic 1    | October 18, 2025 | 0.2     | Detalhamento inicial e Épico 1 | John (PM) |
| PO Recommendations Integrated    | October 18, 2025 | 0.3     | Adição de testes, rollback, backup | Sarah (PO)|

## Requirements

### Functional

* **FR1:** Refatorar a estrutura de arquivos da parte do "site" (atualmente composta por múltiplos arquivos HTML na raiz) para seguir a estrutura validada (ex: `src/web/pages/`, `src/web/components/`, `src/web/services/`), utilizando um sistema de roteamento JavaScript (a ser definido na arquitetura) em vez de múltiplos arquivos HTML independentes.
* **FR2:** Separar logicamente o código-fonte do jogo (Phaser, `src/scenes/`, `src/managers/`) do código-fonte do site (lógica de UI, autenticação, perfil, dashboard), minimizando dependências diretas não essenciais entre eles (ex: movendo o jogo para `src/game/` e o site para `src/web/`).
* **FR3:** Garantir que todas as funcionalidades *existentes* do site (Login via Supabase Auth, visualização do Dashboard, visualização/edição do Perfil de Usuário) continuem funcionando corretamente após a refatoração estrutural.
* **FR4:** Garantir que a integração *existente* com a carteira Phantom e a lógica de verificação de NFTs (`src/solana_nft.js`) permaneçam funcionais e acessíveis a partir das partes relevantes da aplicação (provavelmente tanto o site quanto o jogo).
* **FR5:** Preservar a funcionalidade do jogo principal (`src/game-only.js`, `src/scenes/GameSceneModular.js` e seus managers) durante e após a refatoração da estrutura do site.

### Non Functional

* **NFR1:** A refatoração deve resultar em uma estrutura de código mais organizada, legível e de fácil manutenção, seguindo as convenções da estrutura validada.
* **NFR2:** A performance percebida pelo usuário nas seções do site (tempo de carregamento, responsividade da interface) não deve ser degradada após a refatoração. Se possível, identificar oportunidades de otimização.
* **NFR3:** A segurança da aplicação deve ser mantida ou aprimorada. As políticas de Row Level Security (RLS) existentes no Supabase (`database-rls-policies.sql`, etc.) devem ser respeitadas e verificadas após a refatoração.
* **NFR4:** O código refatorado deve aderir aos padrões de codificação estabelecidos (a serem definidos/confirmados na arquitetura) e usar as versões de tecnologia especificadas no `package.json` (Phaser 3.90, Vite 7.1, Solana/Web3 1.98).
* **NFR5:** A aplicação refatorada deve continuar compatível com o processo de build (`vite build`) e deploy na Vercel (`vercel.json`).
* **NFR6:** A aplicação deve lidar graciosamente com limites de taxa (rate limits) e erros de API ao interagir com serviços externos como Supabase e Solana RPCs, implementando retentativas (retries) apropriadas onde aplicável e fornecendo feedback claro ao usuário em caso de falha persistente. *(Adicionado por recomendação PO)*

### Compatibility Requirements

* **CR1:** A integridade do schema e dos dados existentes no banco de dados Supabase não deve ser comprometida. Migrações de schema, se necessárias, devem ser planejadas e executadas de forma segura e preferencialmente reversível.
* **CR2:** O fluxo de autenticação existente com o Supabase Auth (incluindo OAuth via Google, se configurado) deve permanecer funcional sem exigir que os usuários se reautentiquem ou percam o acesso.
* **CR3:** A integração com a blockchain Solana para leitura de NFTs e interação com a carteira Phantom deve continuar funcionando como antes. Nenhuma alteração nos contratos ou na lógica on-chain está no escopo desta refatoração.
* **CR4:** A configuração de build do Vite e o processo de deploy na Vercel devem ser ajustados para acomodar a nova estrutura, mas o resultado final (aplicação funcional na Vercel) deve ser o mesmo.

## User Interface Enhancement Goals

### Integration with Existing UI
* A refatoração estrutural moverá os componentes de UI (atualmente possivelmente dentro ou acoplados aos arquivos HTML na raiz) para uma estrutura dedicada (ex: `src/web/components/`, `src/web/pages/`).
* Todos os novos componentes ou páginas criadas durante a refatoração DEVEM aderir estritamente às diretrizes definidas no `docs/UI_UX_DESIGN_SYSTEM.md`, incluindo paleta de cores, tipografia (SD Glitch Robot, Exo 2), sistema de cards (com `backdrop-filter`), botões (primário com gradiente, secundário outline) e inputs.
* A estrutura refatorada deve facilitar a aplicação consistente do design system em toda a parte do "site".
* O sistema de background existente (gradiente espacial, estrelas animadas, simulação de gameplay opcional) descrito no design system deve ser mantido e integrado à nova estrutura de roteamento/páginas.

### Modified/New Screens and Views
* As telas existentes (`login.html`, `dashboard.html`, `profile.html`, `auth-callback.html`) serão convertidas em componentes/páginas dentro da nova estrutura (ex: `LoginPage.js`, `DashboardPage.js`, etc.).
* O conteúdo visual e funcionalidade principal dessas telas devem ser preservados durante a migração para a nova estrutura.
* Uma nova **tela de Marketplace** está planejada como parte desta melhoria *(Nota: Esta tela será detalhada no Épico 2, adiado por enquanto)*.

### UI Consistency Requirements
* Manter a consistência visual e de interação definida no `docs/UI_UX_DESIGN_SYSTEM.md` é um requisito primordial.
* A navegação entre as diferentes seções do site (Login, Dashboard, Profile) deve ser clara e consistente após a implementação do roteamento.
* Elementos de UI como indicadores de status (conectado/desconectado), badges de raridade (comum, lendário, etc.) e abas devem continuar usando os estilos definidos.
* A responsividade definida pelos breakpoints no design system deve ser mantida ou melhorada na nova estrutura.

## Technical Constraints and Integration Requirements

Esta seção detalha as restrições técnicas baseadas na análise do projeto existente e define como a refatoração e as novas funcionalidades se integrarão.

### Existing Technology Stack
* A pilha de tecnologia atual, conforme documentada pelo Arquiteto, deve ser mantida. Novas dependências devem ser introduzidas apenas se estritamente necessário e com justificativa clara.
    * **Game Engine:** Phaser ^3.90.0
    * **Blockchain Lib:** @solana/web3.js ^1.98.4
    * **Build Tool / Server:** Vite ^7.1.9
    * **Backend/DB:** Supabase (via SDK cliente)
    * **Deployment:** Vercel

### Integration Approach
* **Estratégia de Integração de Código:** A parte do "site" será movida para uma estrutura dedicada (ex: `src/web/`) e usará um roteador JavaScript. O código do jogo Phaser permanecerá separado (ex: `src/game/`). Uma pasta `src/shared/` pode ser criada para código comum (tipos, utils).
* **Estratégia de Integração de Banco de Dados:** A interação com o Supabase continuará via SDK cliente JavaScript a partir da camada de serviços do site (`src/web/services/`). Nenhuma mudança na API do Supabase ou no schema é esperada *apenas* pela refatoração estrutural. As políticas RLS existentes devem ser mantidas.
* **Estratégia de Integração de API (Blockchain):** A lógica de interação com Solana (`src/solana_nft.js`) deve ser encapsulada (ex: `src/web/services/walletService.js` ou `src/shared/solanaService.js`) e chamada conforme necessário pelo site ou jogo.
* **Estratégia de Integração de Frontend:** Um roteador JavaScript (ex: `page.js`, `react-router` ou similar) substituirá os múltiplos arquivos HTML. Os componentes de UI seguirão o `UI_UX_DESIGN_SYSTEM.md`.
* **Estratégia de Integração de Testes:** Introduzir testes automatizados (unitários para serviços, integração/E2E básicos para fluxos críticos) como parte desta refatoração para garantir a funcionalidade e prevenir regressões.

### Code Organization and Standards
* **Abordagem da Estrutura de Arquivos:** Seguir a estrutura validada (`src/web/`, `src/game/`, `src/shared/`). Dentro de `src/web/`, usar subpastas como `pages/`, `components/`, `services/`, `contexts/`, `styles/`, `utils/`.
* **Convenções de Nomenclatura:** Adotar convenções padrão de JavaScript/TypeScript (PascalCase para componentes/classes, camelCase para funções/variáveis). Nomes de arquivos devem corresponder aos componentes/módulos.
* **Padrões de Codificação:** Estabelecer e seguir um guia de estilo (ex: ESLint com configuração padrão). Código modular e seguindo Single Responsibility.
* **Padrões de Documentação:** Usar JSDoc para documentar funções, classes e tipos importantes.

### Deployment and Operations
* **Integração do Processo de Build:** `vite.config.js` atualizado para ponto de entrada único e build correto. `npm run build` deve funcionar.
* **Estratégia de Deploy:** Manter deploy via Vercel. Ajustar `vercel.json` para roteamento SPA, se necessário. `npm run vercel-build` deve funcionar.
* **Monitoramento e Logging:** Manter Vercel Analytics/Speed Insights. Considerar adicionar logging cliente mais robusto.
* **Gerenciamento de Configuração:** Continuar usando variáveis de ambiente (`.env`) via Vercel/local.

### Risk Assessment and Mitigation
* **Riscos Técnicos:** Quebra de Funcionalidade, Problemas de Roteamento, Degradação de Performance, Conflitos de CSS. **Mitigação:** Refatoração Incremental, Testes Automatizados (Regressão!), Testes Manuais, Monitoramento.
* **Riscos de Integração:** Falha Auth Supabase, Falha Conexão Solana. **Mitigação:** Testes (Unitários/Integração), Tratamento de Erro Robusto (NFR6).
* **Riscos de Deploy:** Build Falhando, Aplicação Quebrada. **Mitigação:** Testar build local, Deploy Gradual (Vercel Previews), Plano de Rollback detalhado, Monitoramento Pós-deploy.
* **Estratégias Gerais de Mitigação:** Refatoração Incremental, Feature Flags (Considerar), Versionamento Git eficaz (Branches, Tags), Backup Pré-Refatoração.

## Epic and Story Structure

### Epic Approach
* **Decisão da Estrutura de Épicos**: O trabalho será dividido em dois épicos sequenciais. O primeiro focará na refatoração estrutural do site existente e na correção de bugs associados, garantindo a estabilidade e a manutenção das funcionalidades atuais. O segundo épico implementará a nova funcionalidade do Marketplace (adiado por enquanto).
* **Rationale**: Separar a refatoração da nova funcionalidade minimiza riscos. Concluir a reorganização estrutural primeiro fornece uma base mais sólida e previsível para o desenvolvimento futuro.

## Epic 1: Refatoração Estrutural e Correção de Bugs do Site

**Meta do Épico:** Reorganizar a estrutura de arquivos do código-fonte do site para uma arquitetura baseada em componentes e roteamento JavaScript (`src/web/`), separando-a claramente da lógica do jogo Phaser (`src/game/`). Migrar as funcionalidades existentes das páginas HTML atuais (Login, Dashboard, Profile, Auth Callback) para a nova estrutura, garantindo que continuem operando corretamente com Supabase e Solana. Corrigir bugs conhecidos resultantes da desorganização atual, incluindo o redirecionamento incorreto do login em ambiente de desenvolvimento, e introduzir uma base de testes automatizados para melhorar a estabilidade e manutenibilidade futuras.

**Requisitos de Integração:** Manter compatibilidade com o schema existente do Supabase, o fluxo de autenticação, a API da Solana e o processo de deploy na Vercel, conforme detalhado na seção `technical-constraints`.

**Histórias:**

* **História 1.0: Preparação Segura para Refatoração** *(Adicionada por recomendação PO)*
    * **Como** PO/Desenvolvedor, **eu quero** realizar um backup completo do banco de dados Supabase e criar um tag/branch Git estável do estado atual, **para que** possamos reverter com segurança caso a refatoração cause problemas críticos.
    * **AC:**
        1.  Backup completo do banco de dados Supabase (estrutura e dados) realizado e armazenado com segurança.
        2.  Um branch Git (ex: `pre-refactor-stable`) criado a partir do commit atual.
        3.  Um tag Git (ex: `v0.X-pre-refactor`) criado no mesmo commit.
    * **Dev Notes:** Tarefa pré-requisito antes de iniciar 1.1.

* **História 1.1: Configuração da Nova Estrutura e Roteamento Básico**
    * **Como** Arquiteto/Desenvolvedor, **eu quero** criar a nova estrutura de pastas (`src/web/`, `src/game/`, `src/shared/`) e configurar um roteador JavaScript básico, **para que** a base organizacional do site esteja estabelecida e a navegação inicial seja possível.
    * **AC:**
        1.  Estrutura de pastas `src/web`, `src/game`, `src/shared` criada.
        2.  Roteador JS configurado para `/`, `/login`, `/dashboard`, `/profile`, `/auth-callback`.
        3.  `vite.config.js` atualizado para ponto de entrada único.
        4.  Página inicial simples (`/`) renderiza via roteador.
        5.  `npm run build` e `npm run preview` funcionam.
    * **Dev Notes:**
        * **Plano de Rollback:** Reverter esta história é complexo devido à mudança estrutural. Garantir backups (História 1.0) e proceder com cautela. A reversão manual envolveria descartar as mudanças no Git e restaurar a configuração anterior do `vite.config.js`.

* **História 1.2: Migração da Funcionalidade de Login**
    * **Como** Usuário, **eu quero** poder fazer login usando a interface existente, **para que** eu possa acessar minha conta na nova estrutura.
    * **AC:**
        1.  Conteúdo/funcionalidade de `login.html` migrados para `LoginPage`.
        2.  Autenticação Supabase (email/senha e/ou OAuth) funciona via `LoginPage`.
        3.  Login redireciona para `/dashboard`.
        4.  Erros de login tratados e exibidos ao usuário (seguir `UI_UX_DESIGN_SYSTEM.md`). *(PO recommendation)*
        5.  Lógica de autenticação encapsulada em `authService.js`.
        6.  Estados de carregamento (loading) exibidos durante a autenticação. *(PO recommendation)*
        7.  Testes automatizados (integração/E2E básicos) criados para validar o fluxo principal de login *antes* da migração ser considerada completa. *(PO recommendation)*
        8.  Novos testes de regressão passam. *(PO recommendation)*
    * **Dev Notes:**
        * **Plano de Rollback:** Se os testes de regressão falharem ou um bug crítico for encontrado, reverter para o commit anterior usando `git revert [commit]` ou `git reset --hard [commit anterior]`.

* **História 1.3: Migração e Correção do Callback de Autenticação OAuth**
    * **Como** Sistema, **eu quero** processar corretamente os redirects de callback do OAuth na nova estrutura de roteamento, **para que** o login via OAuth funcione e redirecione corretamente no ambiente de desenvolvimento.
    * **AC:**
        1.  Lógica de `auth-callback.html` migrada para `AuthCallbackPage` na rota `/auth-callback`.
        2.  Componente captura parâmetros da URL e processa via `authService.js`.
        3.  Após sucesso, usuário autenticado e redirecionado para `/dashboard`.
        4.  **BUGFIX:** O redirecionamento após callback OAuth no ambiente `dev` agora direciona para a URL de desenvolvimento local (ex: `localhost:3000/dashboard`) e **NÃO** para a URL de produção da Vercel.
        5.  Erros durante o callback são tratados e exibidos (se aplicável).
    * **Dev Notes:**
        * Verificar/Ajustar lógica de redirect em `vite.config.js` ou `dev-server.cjs`.
        * **Plano de Rollback:** Similar à História 1.2.

* **História 1.4: Migração da Funcionalidade do Dashboard**
    * **Como** Usuário logado, **eu quero** acessar meu dashboard, **para que** eu possa ver minhas informações principais.
    * **AC:**
        1.  Conteúdo/funcionalidade de `dashboard.html` migrados para `DashboardPage`, protegida por login.
        2.  Dados relevantes buscados do Supabase e exibidos corretamente.
        3.  Navegação de/para o dashboard funciona via roteador.
        4.  Layout segue `UI_UX_DESIGN_SYSTEM.md`.
        5.  Estados de carregamento (loading) exibidos durante a busca de dados. *(PO recommendation)*
        6.  Mensagens de erro exibidas se a busca de dados falhar. *(PO recommendation)*
        7.  Testes automatizados (integração/E2E básicos) criados para validar o carregamento e exibição dos dados principais do dashboard. *(PO recommendation)*
        8.  Novos testes de regressão passam. *(PO recommendation)*
    * **Dev Notes:**
        * **Plano de Rollback:** Similar à História 1.2.

* **História 1.5: Migração da Funcionalidade do Perfil**
    * **Como** Usuário logado, **eu quero** visualizar e editar meu perfil, **para que** minhas informações estejam atualizadas.
    * **AC:**
        1.  Conteúdo/funcionalidade de `profile.html` migrados para `ProfilePage`, protegida por login.
        2.  Dados do perfil buscados e exibidos.
        3.  Edição e salvamento no Supabase (via `profileService.js`) funcionam.
        4.  Feedback de sucesso/erro ao salvar (seguir `UI_UX_DESIGN_SYSTEM.md`). *(PO recommendation)*
        5.  Layout segue `UI_UX_DESIGN_SYSTEM.md`.
        6.  Estados de carregamento (loading) exibidos durante busca e salvamento. *(PO recommendation)*
        7.  Validação de formulário implementada para campos editáveis. *(Implicitly needed, made explicit)*
        8.  Testes automatizados (integração/E2E básicos) criados para validar visualização, edição e salvamento do perfil. *(PO recommendation)*
        9.  Novos testes de regressão passam. *(PO recommendation)*
    * **Dev Notes:**
        * **Plano de Rollback:** Similar à História 1.2. Se houver migração de schema do DB para esta funcionalidade, o rollback do DB também é necessário.

* **História 1.6: Refatoração da Integração Solana/NFT**
    * **Como** Desenvolvedor, **eu quero** que a lógica Solana/NFT esteja encapsulada em um serviço reutilizável, **para que** seja fácil usar em diferentes partes da aplicação.
    * **AC:**
        1.  Lógica de `src/solana_nft.js` refatorada para serviço (ex: `walletService.js`).
        2.  Componentes relevantes usam o novo serviço.
        3.  Funcionalidade de conectar carteira e exibir NFTs (se existente) preservada e testada manualmente.
        4.  Tratamento de erros para interações com a carteira/blockchain implementado (NFR6).

* **História 1.7: Introdução de Testes Unitários para Serviços**
    * **Como** Desenvolvedor, **eu quero** configurar testes unitários para os novos serviços (Auth, Profile, Wallet), **para que** a lógica crítica seja verificada automaticamente.
    * **AC:**
        1.  Framework de testes unitários (ex: Vitest) configurado.
        2.  Scripts `npm test` adicionados/atualizados.
        3.  Testes unitários escritos para funções principais dos serviços `authService.js`, `profileService.js`, `walletService.js` (ou equivalente), mockando chamadas externas (Supabase, Solana).
        4.  Testes passam.

* **História 1.8: Verificação Final e Limpeza**
    * **Como** Desenvolvedor, **eu quero** garantir que todos os arquivos HTML antigos foram removidos ou desativados e que não há referências quebradas, **para que** a aplicação refatorada esteja limpa e funcional.
    * **AC:**
        1.  Arquivos HTML antigos removidos/obsoletos.
        2.  Build final (`npm run build`) limpo.
        3.  Teste manual completo confirma navegação e funcionalidades (Login, Dashboard, Profile, Conexão Wallet).
        4.  Bug de redirecionamento do login (História 1.3) verificado e corrigido.
        5.  Todos os testes automatizados (unitários, integração/E2E) passam.