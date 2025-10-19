# Space Crypto Miner Brownfield Enhancement PRD

**Índice de Documentos**

Este PRD foi dividido em múltiplos documentos para melhor organização e manutenibilidade:

## 📋 Estrutura de Documentos

1. **[01-analysis-context.md](./01-analysis-context.md)**
   - Análise geral do projeto existente
   - Visão do estado atual (tech stack, estrutura)
   - Documentação disponível
   - Escopo da melhoria
   - Objetivos e contexto

2. **[02-requirements.md](./02-requirements.md)**
   - Requisitos funcionais (FR1-FR5)
   - Requisitos não-funcionais (NFR1-NFR6)
   - Requisitos de compatibilidade (CR1-CR4)

3. **[03-ui-ux-goals.md](./03-ui-ux-goals.md)**
   - Integração com Design System existente
   - Telas modificadas/novas
   - Requisitos de consistência UI

4. **[04-technical-constraints.md](./04-technical-constraints.md)**
   - Stack de tecnologia
   - Estratégias de integração (código, DB, API, frontend, testes)
   - Padrões de organização e codificação
   - Deployment e operações
   - Avaliação de riscos e mitigação

5. **[05-epic-1-refactoring.md](./05-epic-1-refactoring.md)**
   - Meta do Épico 1
   - Histórias de usuário (1.0 até 1.8)
   - Critérios de aceitação e dev notes
   - Planos de rollback

## 🎯 Visão Geral Executiva

**Tipo de Melhoria:** Major Feature Modification + Reorganização Estrutural

**Impacto:** Major (mudanças arquitetônicas necessárias)

**Objetivo Principal:** Refatorar a estrutura organizacional do Space Crypto Miner, separando claramente:
- Site (login, dashboard, profile) → `src/web/`
- Jogo (Phaser, cenas) → `src/game/`
- Código compartilhado → `src/shared/`

**Criticidade:** Vida ou morte para a viabilidade do projeto

## 📅 Changelog

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
| Divisão em Shards | Oct 18, 2025 | 0.4 | PRD dividido em múltiplos docs para manutenção | Sistema |
| PO Recommendations Integrated | Oct 18, 2025 | 0.3 | Adição de testes, rollback, backup | Sarah (PO) |
| Updated Sections 2-5 & Epic 1 | Oct 18, 2025 | 0.2 | Detalhamento inicial e Épico 1 | John (PM) |
| Initial Draft (Intro Analysis) | Oct 18, 2025 | 0.1 | Criação inicial baseada em análise | John (PM) |

---

**Próximos Passos:** Revisar cada documento específico conforme necessário durante o desenvolvimento.
