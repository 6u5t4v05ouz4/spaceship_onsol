# 1. Intro - Project Analysis and Context

## Visão Geral da Análise

Esta seção reúne informações abrangentes sobre o projeto existente Space Crypto Miner, servindo como base para planejar a melhoria maior solicitada. A análise foi realizada pelo Arquiteto e validada pelo usuário.

## Existing Project Overview

### Fonte de Análise

* Análise brownfield baseada em IDE/arquivos (estrutura de diretórios, `package.json`, `vite.config.js`) realizada pelo Arquiteto em 18/10/2025 e validada pelo usuário.
* Documentos de planejamento existentes (`GDD.md`, `ROADMAP.md`, `UI_UX_DESIGN_SYSTEM.md`, `README.md` listando ~45 docs) foram usados como contexto suplementar.

### Estado Atual do Projeto

* O Space Crypto Miner é um jogo web existente construído com **Phaser 3.90.0** e **Vite 7.1.9**.
* Integra funcionalidades Web3 via **@solana/web3.js 1.98.4** para NFTs e carteira Phantom.
* O backend de dados e autenticação é gerenciado pelo **Supabase**.
* Código estruturado modularmente com Cenas e Managers do Phaser.
* Implantado na **Vercel**.
* Múltiplos pontos de entrada HTML (jogo, dashboard, login).

## Análise de Documentação Disponível

### Documentação Existente

* Análise de projeto existente disponível (output da tarefa `document-project` do Arquiteto).
* Documentação de alto nível (GDD, Roadmap, Design System) presente em `docs/`.
* Schema do banco de dados, migrações e políticas RLS definidos em arquivos `.sql` na raiz.
* Nenhuma especificação formal de API (como OpenAPI) foi encontrada; a comunicação com o Supabase é via SDK do cliente.
* Não foram encontrados testes automatizados; testes parecem ser manuais auxiliados por páginas de debug e feedback direto ao Dev/PM.

## Definição do Escopo da Melhoria

### Tipo de Melhoria

* [x] Major Feature Modification
* [x] Organização Estrutural / Refatoração do Fluxo de Trabalho

### Descrição da Melhoria

A melhoria maior consiste principalmente na **refatoração da estrutura organizacional do projeto**, separando claramente as responsabilidades:
- **Site** (login, dashboard, profile, etc.)
- **Jogo** (Phaser, cenas, managers)

O foco inicial será reorganizar a parte do "site".

### Avaliação de Impacto

* **Impacto:** Major (mudanças arquitetônicas necessárias) *(Selecionado pelo usuário)*

## Objetivos e Contexto de Fundo

### Objetivos

* Melhorar a estrutura organizacional do código, separando claramente as partes do site e do jogo.
* Tornar o projeto mais seguro e profissional em sua implementação.
* Corrigir bugs existentes causados pela má organização de arquivos e código mal implementado.
* Estabelecer um fluxo de trabalho de desenvolvimento mais claro e eficiente.

### Contexto de Fundo

Esta melhoria é considerada **crítica para a saúde e viabilidade a longo prazo do projeto** ("vida ou morte"). O projeto evoluiu organicamente sem:
- Planejamento inicial formal
- Documentação robusta
- Estrutura clara de responsabilidades

As mudanças propostas **não derivam de um item específico do roadmap**, mas são um **pré-requisito fundamental** para permitir:
- Desenvolvimento futuro sustentável
- Implementação eficaz das funcionalidades planejadas

A refatoração visa resolver problemas estruturais e de implementação que impedem o progresso e a qualidade.
