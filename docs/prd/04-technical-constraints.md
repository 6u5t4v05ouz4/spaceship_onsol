# 4. Technical Constraints and Integration Requirements

## Stack de Tecnologia Existente

A pilha de tecnologia atual, conforme documentada pelo Arquiteto, deve ser mantida. Novas dependências devem ser introduzidas apenas se estritamente necessário e com justificativa clara.

### Dependências Críticas

- **Game Engine:** Phaser ^3.90.0
- **Blockchain Lib:** @solana/web3.js ^1.98.4
- **Build Tool / Server:** Vite ^7.1.9
- **Backend/DB:** Supabase (via SDK cliente)
- **Deployment:** Vercel

---

## Estratégias de Integração

### 1. Integração de Código

* A parte do "site" será movida para uma estrutura dedicada (ex: `src/web/`)
* Usará um roteador JavaScript
* O código do jogo Phaser permanecerá separado (ex: `src/game/`)
* Uma pasta `src/shared/` pode ser criada para código comum (tipos, utils)

### 2. Integração de Banco de Dados

* Interação com Supabase continuará via SDK cliente JavaScript
* Camada de serviços do site: `src/web/services/`
* Nenhuma mudança na API do Supabase ou no schema é esperada *apenas* pela refatoração estrutural
* As políticas RLS existentes devem ser mantidas

### 3. Integração de API (Blockchain)

* Lógica de interação com Solana (`src/solana_nft.js`) deve ser encapsulada
* Novo local: `src/web/services/walletService.js` ou `src/shared/solanaService.js`
* Chamada conforme necessário pelo site ou jogo

### 4. Integração de Frontend

* Um roteador JavaScript (ex: `page.js`, `react-router` ou similar) substituirá os múltiplos arquivos HTML
* Os componentes de UI seguirão `UI_UX_DESIGN_SYSTEM.md`

### 5. Integração de Testes

Introduzir testes automatizados como parte desta refatoração:
* **Testes Unitários** - Para serviços
* **Testes de Integração/E2E Básicos** - Para fluxos críticos
* Objetivo: Garantir funcionalidade e prevenir regressões

---

## Organização de Código e Padrões

### Abordagem da Estrutura de Arquivos

Seguir a estrutura validada:
```
src/
├── web/
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── contexts/
│   ├── styles/
│   └── utils/
├── game/
│   ├── scenes/
│   ├── managers/
│   └── ...
└── shared/
    ├── utils/
    ├── types/
    └── ...
```

### Convenções de Nomenclatura

* **PascalCase** para componentes/classes
* **camelCase** para funções/variáveis
* Nomes de arquivos devem corresponder aos componentes/módulos

### Padrões de Codificação

* Estabelecer e seguir um guia de estilo (ex: ESLint com configuração padrão)
* Código modular seguindo Single Responsibility
* Documentação com JSDoc para funções, classes e tipos importantes

---

## Deployment e Operações

### Integração do Processo de Build

* `vite.config.js` atualizado para ponto de entrada único
* Build correto do projeto
* `npm run build` deve funcionar

### Estratégia de Deploy

* Manter deploy via Vercel
* Ajustar `vercel.json` para roteamento SPA, se necessário
* `npm run vercel-build` deve funcionar

### Monitoramento e Logging

* Manter Vercel Analytics/Speed Insights
* Considerar adicionar logging cliente mais robusto

### Gerenciamento de Configuração

* Continuar usando variáveis de ambiente (`.env`) via Vercel/local

---

## Avaliação de Riscos e Mitigação

### Riscos Técnicos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Quebra de Funcionalidade | Alto | Refatoração Incremental, Testes Automatizados (Regressão!), Testes Manuais |
| Problemas de Roteamento | Alto | Testes de integração, Monitoramento |
| Degradação de Performance | Médio | Análise de performance, Otimizações direcionadas |
| Conflitos de CSS | Médio | Escopo de estilos, Testes manuais |

### Riscos de Integração

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Falha Auth Supabase | Alto | Testes unitários/integração, Tratamento de erro robusto |
| Falha Conexão Solana | Médio | Testes, Tratamento de erro robusto (NFR6) |

### Riscos de Deploy

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Build Falhando | Alto | Testar build local, Deploy Gradual (Vercel Previews) |
| Aplicação Quebrada | Alto | Plano de Rollback detalhado, Monitoramento Pós-deploy |

### Estratégias Gerais de Mitigação

* Refatoração Incremental
* Feature Flags (Considerar)
* Versionamento Git eficaz (Branches, Tags)
* Backup Pré-Refatoração
