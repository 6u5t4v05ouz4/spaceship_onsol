# Space Crypto Miner - Brownfield Architecture

**Documentação Arquitetônica do Projeto**

Este documento arquitetônico captura o **estado atual** do código-fonte do Space Crypto Miner, incluindo padrões reais, tecnologias e estrutura, servindo como referência para agentes de IA e desenvolvedores trabalhando em melhorias futuras.

## 📋 Estrutura de Documentos

1. **[01-introduction.md](./01-introduction.md)**
   - Escopo e objetivos do documento
   - Referência rápida - arquivos críticos e pontos de entrada
   - Changelog

2. **[02-high-level-overview.md](./02-high-level-overview.md)**
   - Resumo técnico da arquitetura
   - Stack de tecnologia completo
   - Estrutura do repositório

3. **[03-module-organization.md](./03-module-organization.md)**
   - Estrutura de diretórios real do projeto
   - Descrição de cada módulo principal
   - Organização de código

4. **[04-data-models.md](./04-data-models.md)**
   - Modelos de dados (Supabase)
   - Dados blockchain (Solana/NFT)
   - Schema do banco de dados

5. **[05-api-specifications.md](./05-api-specifications.md)**
   - API interna (Jogo ↔ Backend)
   - API externa (Backend ↔ Serviços)
   - Proxy de desenvolvimento

6. **[06-integration-points.md](./06-integration-points.md)**
   - Serviços externos e integrações
   - Pontos de integração internos
   - Fluxo de comunicação entre componentes

7. **[07-development-deployment.md](./07-development-deployment.md)**
   - Setup de desenvolvimento local
   - Build e processo de deployment
   - Ambientes

8. **[08-testing-reality.md](./08-testing-reality.md)**
   - Cobertura de testes atual
   - Métodos de testes manuais
   - Recomendações futuras

9. **[09-technical-debt.md](./09-technical-debt.md)**
   - Dívidas técnicas críticas
   - Problemas conhecidos
   - Workarounds e "gotchas"

---

## 🎯 Informações Rápidas

### Stack Tecnológico

| Componente | Tecnologia | Versão |
|-----------|-----------|---------|
| 🎮 Game Engine | Phaser | ^3.90.0 |
| ⛓️ Blockchain | @solana/web3.js | ^1.98.4 |
| 🔨 Build Tool | Vite | ^7.1.9 |
| 🗄️ Backend/DB | Supabase | - |
| 🚀 Deploy | Vercel | - |

### Arquivos Críticos

- **Entrada Principal:** `src/game-only.js`
- **Cena Principal:** `src/scenes/GameSceneModular.js`
- **Config:** `src/config/config.js`, `vite.config.js`
- **Gerenciadores:** `src/managers/` (8+ managers)
- **Blockchain:** `src/solana_nft.js`
- **Backend:** `src/supabase-dev.js`, arquivos `.sql` na raiz

---

## 📅 Changelog

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| Oct 18, 2025 | 2.0 | Divisão em múltiplos documentos para manutenção | Sistema |
| Oct 18, 2025 | 1.1 | Updated Testing/Integration notes | Winston (Architect) |
| Oct 18, 2025 | 1.0 | Initial brownfield analysis | Winston (Architect) |

---

## 🔍 Como Usar Esta Documentação

- **Para entender a arquitetura geral:** Leia `02-high-level-overview.md` primeiro
- **Para encontrar um arquivo específico:** Consulte `03-module-organization.md`
- **Para integrar um novo serviço:** Veja `06-integration-points.md`
- **Para diagnosticar problemas:** Consulte `09-technical-debt.md`
- **Para adicionar testes:** Leia `08-testing-reality.md`

**Nota:** Este documento é descritivo do estado ATUAL. Para planos de refatoração, consulte `docs/prd/`.
