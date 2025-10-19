# 🧭 Visão Geral

**ATLAS** é o sistema de gerenciamento de universo infinito para o jogo espacial top-down desenvolvido em **Phaser.js**, com suporte a **PvE e PvP**.

## Propósito

Seu propósito é oferecer um **mundo contínuo, explorável, procedural e persistente**, onde os jogadores podem descobrir, explorar, modificar e compartilhar o mesmo espaço sideral sem limitação física de mapa.

---

## 🌌 Objetivos Principais

- Implementar **mundo infinito** baseado em **chunks dinâmicos** (streaming sob demanda).  
- Permitir **exploração procedural determinística** (mesmo chunk = mesmo resultado).  
- Garantir **persistência e sincronização** entre jogadores (PvP) e sessões (PvE).  
- Oferecer **otimização de memória** através de *load/unload* dinâmico de chunks.  
- Integrar **eventos de descoberta, mineração, crafting e combate espacial**.

---

## 📊 Características Principais

| Aspecto | Descrição |
|---------|-----------|
| **Escopo** | Universo potencialmente infinito |
| **Tecnologia** | Phaser.js 3 (WebGL + Arcade Physics) |
| **Persistência** | Servidor com Supabase/PostgreSQL |
| **Sincronização** | Real-time via WebSocket |
| **Modo PvE** | Universo instanciado por jogador |
| **Modo PvP** | Universo compartilhado globalmente |

---

## 🎮 Contexto do Jogo

O ATLAS é a espinha dorsal do jogo espacial SPACE CRYPTO MINER, permitindo:

- **Exploração**: Descobrir novos setores e recursos
- **Mineração**: Extrair recursos de asteroides
- **Combate**: Enfrentar NPCs e outros jogadores
- **Construção**: Estabelecer estações e bases
- **Economia**: Comércio e mercado de recursos
