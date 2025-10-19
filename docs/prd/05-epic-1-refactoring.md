# 5. Epic 1 - Refatoração Estrutural e Correção de Bugs do Site

## Meta do Épico

Reorganizar a estrutura de arquivos do código-fonte do site para uma **arquitetura baseada em componentes e roteamento JavaScript** (`src/web/`), separando-a claramente da lógica do jogo Phaser (`src/game/`).

### Objetivos Específicos

* Migrar as funcionalidades existentes das páginas HTML atuais (Login, Dashboard, Profile, Auth Callback) para a nova estrutura
* Garantir que continuem operando corretamente com Supabase e Solana
* Corrigir bugs conhecidos resultantes da desorganização atual, incluindo o redirecionamento incorreto do login em ambiente de desenvolvimento
* Introduzir uma base de testes automatizados para melhorar a estabilidade e manutenibilidade futuras

### Requisitos de Integração

Manter compatibilidade com:
- Schema existente do Supabase
- Fluxo de autenticação
- API da Solana
- Processo de deploy na Vercel

---

## Histórias de Usuário

### História 1.0: Preparação Segura para Refatoração ⚠️ PRÉ-REQUISITO

**Como** PO/Desenvolvedor, **eu quero** realizar um backup completo do banco de dados Supabase e criar um tag/branch Git estável do estado atual, **para que** possamos reverter com segurança caso a refatoração cause problemas críticos.

#### Critérios de Aceitação

1. ✅ Backup completo do banco de dados Supabase (estrutura e dados) realizado e armazenado com segurança
2. ✅ Um branch Git (ex: `pre-refactor-stable`) criado a partir do commit atual
3. ✅ Um tag Git (ex: `v0.X-pre-refactor`) criado no mesmo commit

#### Dev Notes

* **Pré-requisito:** Executar *antes* de iniciar História 1.1
* **Ferramentas:** Supabase CLI, Git

---

### História 1.1: Configuração da Nova Estrutura e Roteamento Básico

**Como** Arquiteto/Desenvolvedor, **eu quero** criar a nova estrutura de pastas (`src/web/`, `src/game/`, `src/shared/`) e configurar um roteador JavaScript básico, **para que** a base organizacional do site esteja estabelecida e a navegação inicial seja possível.

#### Critérios de Aceitação

1. ✅ Estrutura de pastas `src/web`, `src/game`, `src/shared` criada
2. ✅ Roteador JS configurado para `/`, `/login`, `/dashboard`, `/profile`, `/auth-callback`
3. ✅ `vite.config.js` atualizado para ponto de entrada único
4. ✅ Página inicial simples (`/`) renderiza via roteador
5. ✅ `npm run build` e `npm run preview` funcionam

#### Dev Notes

* **Roteador Sugerido:** `page.js` ou similar
* **Plano de Rollback:** Reverter esta história é complexo devido à mudança estrutural
  - Garantir backups (História 1.0) antes
  - Proceder com cautela
  - Reversão manual: descartar mudanças no Git e restaurar `vite.config.js` anterior

---

### História 1.2: Migração da Funcionalidade de Login

**Como** Usuário, **eu quero** poder fazer login usando a interface existente, **para que** eu possa acessar minha conta na nova estrutura.

#### Critérios de Aceitação

1. ✅ Conteúdo/funcionalidade de `login.html` migrados para `LoginPage`
2. ✅ Autenticação Supabase (email/senha e/ou OAuth) funciona via `LoginPage`
3. ✅ Login redireciona para `/dashboard`
4. ✅ Erros de login tratados e exibidos ao usuário (seguir `UI_UX_DESIGN_SYSTEM.md`)
5. ✅ Lógica de autenticação encapsulada em `authService.js`
6. ✅ Estados de carregamento (loading) exibidos durante autenticação
7. ✅ Testes automatizados (integração/E2E básicos) criados para validar fluxo principal de login
8. ✅ Novos testes de regressão passam

#### Dev Notes

* **Plano de Rollback:** Se testes de regressão falharem ou bug crítico encontrado
  - Usar `git revert [commit]` ou `git reset --hard [commit anterior]`
* **Dependências:** História 1.1

---

### História 1.3: Migração e Correção do Callback de Autenticação OAuth

**Como** Sistema, **eu quero** processar corretamente os redirects de callback do OAuth na nova estrutura de roteamento, **para que** o login via OAuth funcione e redirecione corretamente no ambiente de desenvolvimento.

#### Critérios de Aceitação

1. ✅ Lógica de `auth-callback.html` migrada para `AuthCallbackPage` na rota `/auth-callback`
2. ✅ Componente captura parâmetros da URL e processa via `authService.js`
3. ✅ Após sucesso, usuário autenticado e redirecionado para `/dashboard`
4. ✅ **BUGFIX:** Redirecionamento após callback OAuth no ambiente `dev` agora direciona para URL de desenvolvimento local (ex: `localhost:3000/dashboard`) e **NÃO** para URL de produção da Vercel
5. ✅ Erros durante callback tratados e exibidos (se aplicável)

#### Dev Notes

* Verificar/Ajustar lógica de redirect em `vite.config.js` ou `dev-server.cjs`
* **Plano de Rollback:** Similar à História 1.2
* **Dependências:** História 1.1, 1.2

---

### História 1.4: Migração da Funcionalidade do Dashboard

**Como** Usuário logado, **eu quero** acessar meu dashboard, **para que** eu possa ver minhas informações principais.

#### Critérios de Aceitação

1. ✅ Conteúdo/funcionalidade de `dashboard.html` migrados para `DashboardPage`, protegida por login
2. ✅ Dados relevantes buscados do Supabase e exibidos corretamente
3. ✅ Navegação de/para dashboard funciona via roteador
4. ✅ Layout segue `UI_UX_DESIGN_SYSTEM.md`
5. ✅ Estados de carregamento (loading) exibidos durante busca de dados
6. ✅ Mensagens de erro exibidas se busca de dados falhar
7. ✅ Testes automatizados (integração/E2E básicos) criados para validar carregamento e exibição dos dados principais
8. ✅ Novos testes de regressão passam

#### Dev Notes

* **Plano de Rollback:** Similar à História 1.2
* **Dependências:** História 1.1

---

### História 1.5: Migração da Funcionalidade do Perfil

**Como** Usuário logado, **eu quero** visualizar e editar meu perfil, **para que** minhas informações estejam atualizadas.

#### Critérios de Aceitação

1. ✅ Conteúdo/funcionalidade de `profile.html` migrados para `ProfilePage`, protegida por login
2. ✅ Dados do perfil buscados e exibidos
3. ✅ Edição e salvamento no Supabase (via `profileService.js`) funcionam
4. ✅ Feedback de sucesso/erro ao salvar (seguir `UI_UX_DESIGN_SYSTEM.md`)
5. ✅ Layout segue `UI_UX_DESIGN_SYSTEM.md`
6. ✅ Estados de carregamento (loading) exibidos durante busca e salvamento
7. ✅ Validação de formulário implementada para campos editáveis
8. ✅ Testes automatizados (integração/E2E básicos) criados para validar visualização, edição e salvamento
9. ✅ Novos testes de regressão passam

#### Dev Notes

* **Plano de Rollback:** Similar à História 1.2. Se houver migração de schema do DB, rollback do DB também é necessário
* **Dependências:** História 1.1

---

### História 1.6: Refatoração da Integração Solana/NFT

**Como** Desenvolvedor, **eu quero** que a lógica Solana/NFT esteja encapsulada em um serviço reutilizável, **para que** seja fácil usar em diferentes partes da aplicação.

#### Critérios de Aceitação

1. ✅ Lógica de `src/solana_nft.js` refatorada para serviço (ex: `walletService.js`)
2. ✅ Componentes relevantes usam novo serviço
3. ✅ Funcionalidade de conectar carteira e exibir NFTs (se existente) preservada e testada manualmente
4. ✅ Tratamento de erros para interações com carteira/blockchain implementado (NFR6)

#### Dev Notes

* **Dependências:** História 1.1

---

### História 1.7: Introdução de Testes Unitários para Serviços

**Como** Desenvolvedor, **eu quero** configurar testes unitários para os novos serviços (Auth, Profile, Wallet), **para que** a lógica crítica seja verificada automaticamente.

#### Critérios de Aceitação

1. ✅ Framework de testes unitários (ex: Vitest) configurado
2. ✅ Scripts `npm test` adicionados/atualizados
3. ✅ Testes unitários escritos para funções principais dos serviços `authService.js`, `profileService.js`, `walletService.js`, mockando chamadas externas (Supabase, Solana)
4. ✅ Testes passam

#### Dev Notes

* **Dependências:** Histórias 1.2, 1.4, 1.5, 1.6

---

### História 1.8: Verificação Final e Limpeza 🎯 FINAL

**Como** Desenvolvedor, **eu quero** garantir que todos os arquivos HTML antigos foram removidos ou desativados e que não há referências quebradas, **para que** a aplicação refatorada esteja limpa e funcional.

#### Critérios de Aceitação

1. ✅ Arquivos HTML antigos removidos/obsoletos
2. ✅ Build final (`npm run build`) limpo
3. ✅ Teste manual completo confirma navegação e funcionalidades (Login, Dashboard, Profile, Conexão Wallet)
4. ✅ Bug de redirecionamento do login (História 1.3) verificado e corrigido
5. ✅ Todos os testes automatizados (unitários, integração/E2E) passam

#### Dev Notes

* **Dependências:** Todas as histórias anteriores (1.0 até 1.7)
* **Critério de Conclusão do Épico:** Esta história marca a conclusão do Épico 1
