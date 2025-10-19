# 3. User Interface Enhancement Goals

## Integração com Sistema de Design Existente

A refatoração estrutural moverá os componentes de UI (atualmente possivelmente dentro ou acoplados aos arquivos HTML na raiz) para uma estrutura dedicada (ex: `src/web/components/`, `src/web/pages/`).

### Conformidade com Design System

Todos os novos componentes ou páginas criadas durante a refatoração **DEVEM aderir estritamente** às diretrizes definidas em `docs/UI_UX_DESIGN_SYSTEM.md`, incluindo:

- **Paleta de cores**
- **Tipografia** (SD Glitch Robot, Exo 2)
- **Sistema de cards** (com `backdrop-filter`)
- **Botões** (primário com gradiente, secundário outline)
- **Inputs**

### Facilitação de Aplicação Consistente

A estrutura refatorada deve facilitar a aplicação consistente do design system em toda a parte do "site".

### Sistema de Background

O sistema de background existente (gradiente espacial, estrelas animadas, simulação de gameplay opcional) descrito no design system deve ser mantido e integrado à nova estrutura de roteamento/páginas.

---

## Telas Modificadas/Novas

### Migração de Telas Existentes

As telas existentes serão convertidas em componentes/páginas dentro da nova estrutura:

| Tela Atual | Novo Componente |
|-----------|-----------------|
| `login.html` | `LoginPage.js` |
| `dashboard.html` | `DashboardPage.js` |
| `profile.html` | `ProfilePage.js` |
| `auth-callback.html` | `AuthCallbackPage.js` |

### Preservação de Conteúdo e Funcionalidade

O conteúdo visual e funcionalidade principal dessas telas devem ser preservados durante a migração para a nova estrutura.

### Novas Telas Planejadas

* **Marketplace** - Planejada como parte do Épico 2 (adiado por enquanto)

---

## Requisitos de Consistência UI

### Navegação Consistente

A navegação entre as diferentes seções do site (Login, Dashboard, Profile) deve ser clara e consistente após a implementação do roteamento.

### Elementos de UI Padronizados

Elementos de UI devem continuar usando os estilos definidos no Design System:
- Indicadores de status (conectado/desconectado)
- Badges de raridade (comum, lendário, etc.)
- Abas

### Responsividade

A responsividade definida pelos breakpoints no design system deve ser mantida ou melhorada na nova estrutura.
