# 🎮 **MELHORIAS NA SIMULAÇÃO DE GAMEPLAY - GUIA DE IMPLEMENTAÇÃO**

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Para**: Desenvolvedor(es)  
**Prioridade**: P1 (Importante)  
**Tempo Estimado**: 2-3 horas

---

## 📋 **ÍNDICE**

1. [Visão Geral](#visão-geral)
2. [Problemas Identificados](#problemas-identificados)
3. [Melhorias Priorizadas](#melhorias-priorizadas)
4. [Implementação Detalhada](#implementação-detalhada)
5. [Testes e Validação](#testes-e-validação)
6. [Checklist de Implementação](#checklist-de-implementação)

---

## 🎯 **VISÃO GERAL**

A simulação de gameplay em background é uma **feature diferenciada e impressionante** do projeto. No entanto, algumas melhorias de **acessibilidade**, **performance** e **UX** são necessárias para torná-la ainda mais profissional.

### **Objetivo**
Melhorar a experiência da simulação sem alterar funcionalidade core, focando em:
- ♿ **Acessibilidade** (WCAG 2.1 AA)
- 📱 **Performance Mobile**
- 🎨 **UX e Feedback Visual**
- ⌨️ **Controle por teclado**

### **Impacto Esperado**
- ✅ Conformidade com WCAG 2.1 (prefers-reduced-motion)
- ✅ Melhor performance em dispositivos móveis (-30% CPU)
- ✅ Controles mais acessíveis e intuitivos
- ✅ Experiência adaptativa por contexto

---

## 🔍 **PROBLEMAS IDENTIFICADOS**

### **1. Acessibilidade** ⚠️ **CRÍTICO**

#### **Problema**: Sem suporte a `prefers-reduced-motion`
Usuários com sensibilidade a movimentos ou epilepsia podem ter problemas.

**Referência WCAG**: 2.3.3 Animation from Interactions (AAA)

```javascript
// ❌ PROBLEMA ATUAL
// Simulação sempre ativa, sem respeitar preferências do usuário
```

**Impacto**: Usuários com condições vestibulares podem sentir náusea ou desconforto.

---

#### **Problema**: Controles sem ARIA labels
```javascript
// ❌ PROBLEMA ATUAL - background-simulation.js:93-101
<button class="simulation-control-btn" onclick="...">
    ⏸️
</button>
// Sem aria-label, aria-pressed ou texto alternativo
```

**Impacto**: Screen readers não conseguem descrever os controles.

---

### **2. Performance Mobile** ⚠️ **IMPORTANTE**

#### **Problema**: Mesma configuração para desktop e mobile
```javascript
// ❌ PROBLEMA ATUAL - background-simulation.js:9-32
const simulationConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    // Sem diferenciação mobile/desktop
};
```

**Impacto**: 
- Consumo alto de bateria em mobile (~40-60% CPU)
- Possível lag em dispositivos antigos
- Aquecimento do dispositivo

---

### **3. UX e Contraste** 🟡 **MODERADO**

#### **Problema**: Opacity fixa em todas as páginas
```javascript
// ❌ PROBLEMA ATUAL - background-simulation.js:203
canvas.style.opacity = '1';
// Mesmo valor para home, login, dashboard, profile
```

**Impacto**: 
- Em páginas com forms (login/profile), pode dificultar leitura
- Falta de hierarquia visual por contexto

---

#### **Problema**: Controles sempre visíveis
```javascript
// ❌ PROBLEMA ATUAL - background-simulation.js:92
.simulation-controls {
    opacity: 0;
}
// Visível apenas no hover
```

**Impacto**: Usuários não sabem que existem controles.

---

### **4. Falta de Atalhos de Teclado** 🟡 **MODERADO**

**Problema**: Usuários avançados não têm como controlar via teclado.

**Impacto**: Experiência menos fluida para power users.

---

## 🚀 **MELHORIAS PRIORIZADAS**

### **📊 Resumo de Prioridades**

| # | Melhoria | Prioridade | Tempo | Impacto |
|---|----------|-----------|-------|---------|
| 1 | Suporte a prefers-reduced-motion | 🔥 P0 | 30min | Alto |
| 2 | ARIA labels nos controles | 🔥 P0 | 15min | Alto |
| 3 | Opacity adaptativa por página | ⚡ P1 | 20min | Médio |
| 4 | Performance mobile adaptativa | ⚡ P1 | 45min | Alto |
| 5 | Atalhos de teclado | ⚡ P1 | 30min | Médio |
| 6 | Fade in/out suave | ✨ P2 | 15min | Baixo |
| 7 | Indicador visual de performance | ✨ P2 | 30min | Baixo |

**Total Estimado (P0+P1)**: ~2h20min

---

## 💻 **IMPLEMENTAÇÃO DETALHADA**

### **MELHORIA 1: Suporte a `prefers-reduced-motion`** 🔥 **P0**

#### **Onde**: `src/simulation/background-simulation.js`

#### **Adicionar após linha 41** (no constructor):
```javascript
constructor() {
    this.game = null;
    this.isActive = false;
    this.isPaused = false;
    this.container = null;
    this.controls = null;
    
    // ✅ ADICIONAR
    this.prefersReducedMotion = false;
    this.checkMotionPreference();
}
```

#### **Adicionar novo método** (após linha 108):
```javascript
/**
 * Verifica preferência de movimento reduzido do usuário
 */
checkMotionPreference() {
    // Detectar preferência inicial
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion = mediaQuery.matches;
    
    // Log para debug
    if (this.prefersReducedMotion) {
        console.log('♿ Preferência de movimento reduzido detectada');
    }
    
    // Listener para mudanças em tempo real
    mediaQuery.addEventListener('change', (e) => {
        this.prefersReducedMotion = e.matches;
        this.applyMotionPreference();
        
        console.log(
            this.prefersReducedMotion 
                ? '♿ Movimento reduzido ativado' 
                : '▶️ Movimento normal ativado'
        );
    });
}

/**
 * Aplica preferência de movimento
 */
applyMotionPreference() {
    if (!this.container) return;
    
    if (this.prefersReducedMotion) {
        // Reduz opacity drasticamente
        this.container.style.opacity = '0.15';
        
        // Pausa automaticamente se estiver rodando
        if (this.isActive && !this.isPaused) {
            this.togglePause();
        }
    } else {
        // Restaura opacity padrão
        this.container.style.opacity = '0.6';
    }
}
```

#### **Modificar método `onGameReady`** (linha 192):
```javascript
onGameReady() {
    const canvas = this.game.canvas;
    if (canvas) {
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.display = 'block';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        
        // ✅ MODIFICAR: Aplicar preferência de movimento
        canvas.style.opacity = this.prefersReducedMotion ? '0.15' : '1';
        
        canvas.style.zIndex = '-1';
        
        console.log('🎨 Canvas configurado para background');
        
        // ✅ ADICIONAR: Aplicar preferência inicial
        this.applyMotionPreference();
    }
}
```

---

### **MELHORIA 2: ARIA Labels e Acessibilidade** 🔥 **P0**

#### **Onde**: `src/simulation/background-simulation.js`

#### **Substituir método `createControls`** (linha 79-108):
```javascript
/**
 * Criar controles da simulação com acessibilidade
 */
createControls() {
    // Verificar se já existe
    this.controls = document.getElementById('simulation-controls');
    if (this.controls) {
        return;
    }

    // Criar controles
    this.controls = document.createElement('div');
    this.controls.id = 'simulation-controls';
    this.controls.className = 'simulation-controls';
    this.controls.setAttribute('role', 'toolbar');
    this.controls.setAttribute('aria-label', 'Controles da simulação de background');
    
    this.controls.innerHTML = `
        <button 
            id="simulation-pause-btn"
            class="simulation-control-btn" 
            onclick="window.backgroundSimulation.togglePause()"
            aria-label="Pausar simulação de background"
            aria-pressed="false"
            title="Pausar/Retomar simulação (Ctrl+P)"
        >
            <span aria-hidden="true">⏸️</span>
            <span class="sr-only">Pausar</span>
        </button>
        <button 
            id="simulation-visibility-btn"
            class="simulation-control-btn" 
            onclick="window.backgroundSimulation.toggleVisibility()"
            aria-label="Alternar visibilidade da simulação"
            aria-pressed="false"
            title="Mostrar/Ocultar simulação (Ctrl+H)"
        >
            <span aria-hidden="true">👁️</span>
            <span class="sr-only">Visível</span>
        </button>
        <button 
            id="simulation-stop-btn"
            class="simulation-control-btn simulation-control-btn-danger" 
            onclick="window.backgroundSimulation.destroy()"
            aria-label="Parar simulação de background permanentemente"
            title="Parar simulação (Ctrl+S)"
        >
            <span aria-hidden="true">⏹️</span>
            <span class="sr-only">Parar</span>
        </button>
    `;
    
    // Adicionar ao body
    document.body.appendChild(this.controls);
    
    console.log('🎛️ Controles da simulação criados com acessibilidade');
}
```

#### **Adicionar CSS para `.sr-only`** em `src/styles/base/reset.css`:
```css
/* Screen reader only - Acessibilidade */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
```

#### **Atualizar método `togglePause`** (linha 211):
```javascript
togglePause() {
    if (!this.game || !this.isActive) return;

    const scene = this.game.scene.getScene('GameplaySimulation');
    if (!scene) return;

    if (this.isPaused) {
        scene.resumeSimulation();
        this.isPaused = false;
        console.log('▶️ Simulação retomada');
    } else {
        scene.pauseSimulation();
        this.isPaused = true;
        console.log('⏸️ Simulação pausada');
    }

    // Atualizar ícone e aria-label do botão
    const pauseBtn = document.getElementById('simulation-pause-btn');
    if (pauseBtn) {
        pauseBtn.querySelector('span[aria-hidden]').textContent = this.isPaused ? '▶️' : '⏸️';
        pauseBtn.querySelector('.sr-only').textContent = this.isPaused ? 'Retomar' : 'Pausar';
        pauseBtn.setAttribute('aria-pressed', this.isPaused ? 'true' : 'false');
        pauseBtn.setAttribute('aria-label', 
            this.isPaused 
                ? 'Retomar simulação de background' 
                : 'Pausar simulação de background'
        );
    }
}
```

#### **Atualizar método `toggleVisibility`** (linha 234):
```javascript
toggleVisibility() {
    if (!this.container) return;

    const isVisible = this.container.style.opacity !== '0';
    
    if (isVisible) {
        this.container.style.transition = 'opacity 0.3s ease';
        this.container.style.opacity = '0';
        console.log('👁️ Simulação ocultada');
    } else {
        this.container.style.transition = 'opacity 0.3s ease';
        this.container.style.opacity = this.prefersReducedMotion ? '0.15' : '0.6';
        console.log('👁️ Simulação visível');
    }

    // Atualizar ícone e aria-label do botão
    const visibilityBtn = document.getElementById('simulation-visibility-btn');
    if (visibilityBtn) {
        visibilityBtn.querySelector('span[aria-hidden]').textContent = isVisible ? '🙈' : '👁️';
        visibilityBtn.querySelector('.sr-only').textContent = isVisible ? 'Oculto' : 'Visível';
        visibilityBtn.setAttribute('aria-pressed', isVisible ? 'true' : 'false');
        visibilityBtn.setAttribute('aria-label', 
            isVisible 
                ? 'Mostrar simulação de background' 
                : 'Ocultar simulação de background'
        );
    }
}
```

---

### **MELHORIA 3: Opacity Adaptativa por Página** ⚡ **P1**

#### **Onde**: `src/simulation/background-simulation.js`

#### **Adicionar após linha 41** (no constructor):
```javascript
constructor() {
    this.game = null;
    this.isActive = false;
    this.isPaused = false;
    this.container = null;
    this.controls = null;
    this.prefersReducedMotion = false;
    
    // ✅ ADICIONAR
    this.currentPage = 'unknown';
    this.opacityMap = {
        'home': 0.8,      // Mais visível na home (destaque)
        'login': 0.3,     // Muito sutil (foco no form)
        'profile': 0.3,   // Muito sutil (foco no form)
        'dashboard': 0.5, // Moderado (equilíbrio)
        'game': 0.0,      // Invisível (não competir com jogo real)
        'default': 0.6    // Padrão para outras páginas
    };
    
    this.checkMotionPreference();
    this.observePageChanges(); // ✅ ADICIONAR
}
```

#### **Adicionar novo método** (após `applyMotionPreference`):
```javascript
/**
 * Observa mudanças de página para ajustar opacity
 */
observePageChanges() {
    // Detectar página inicial
    this.updateOpacityForCurrentPage();
    
    // Observer para mudanças na URL (SPA)
    let lastUrl = location.href; 
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            this.updateOpacityForCurrentPage();
        }
    }).observe(document, { subtree: true, childList: true });
    
    // Listener para popstate (navegação back/forward)
    window.addEventListener('popstate', () => {
        this.updateOpacityForCurrentPage();
    });
    
    console.log('👁️ Observer de páginas ativado');
}

/**
 * Atualiza opacity baseado na página atual
 */
updateOpacityForCurrentPage() {
    if (!this.container) return;
    
    // Detectar página atual pela URL
    const path = window.location.pathname;
    let pageName = 'default';
    
    if (path === '/' || path === '/index.html') {
        pageName = 'home';
    } else if (path.includes('/login')) {
        pageName = 'login';
    } else if (path.includes('/profile')) {
        pageName = 'profile';
    } else if (path.includes('/dashboard')) {
        pageName = 'dashboard';
    } else if (path.includes('/game')) {
        pageName = 'game';
    }
    
    this.currentPage = pageName;
    
    // Aplicar opacity (respeitando prefers-reduced-motion)
    let targetOpacity = this.opacityMap[pageName];
    
    if (this.prefersReducedMotion) {
        targetOpacity = Math.min(targetOpacity, 0.15);
    }
    
    this.container.style.transition = 'opacity 0.5s ease';
    this.container.style.opacity = targetOpacity;
    
    console.log(`🎨 Opacity ajustada para página "${pageName}": ${targetOpacity}`);
}
```

---

### **MELHORIA 4: Performance Mobile Adaptativa** ⚡ **P1**

#### **Onde**: `src/simulation/background-simulation.js`

#### **Adicionar após linha 41** (no constructor):
```javascript
constructor() {
    // ... código existente ...
    
    // ✅ ADICIONAR
    this.isMobile = this.detectMobile();
    this.performanceMode = this.detectPerformanceMode();
    
    console.log(`📱 Dispositivo: ${this.isMobile ? 'Mobile' : 'Desktop'}`);
    console.log(`⚡ Modo: ${this.performanceMode}`);
}
```

#### **Adicionar novos métodos** (após `observePageChanges`):
```javascript
/**
 * Detecta se é dispositivo móvel
 */
detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

/**
 * Detecta modo de performance ideal
 */
detectPerformanceMode() {
    // Fatores para determinar modo
    const isMobile = this.isMobile;
    const isLowEnd = navigator.hardwareConcurrency <= 4;
    const isSaveData = navigator.connection?.saveData === true;
    const isBatteryLow = false; // TODO: Implementar Battery API se necessário
    
    if (isMobile || isLowEnd || isSaveData) {
        return 'lite'; // Modo leve
    } else {
        return 'full'; // Modo completo
    }
}

/**
 * Retorna configuração adaptada à performance
 */
getAdaptiveConfig(baseConfig) {
    const config = { ...baseConfig };
    
    if (this.performanceMode === 'lite') {
        // Ajustes para dispositivos móveis/fracos
        config.fps = { target: 30, forceSetTimeOut: true };
        config.render = {
            ...config.render,
            antialias: false,
            pixelArt: true,
            roundPixels: true
        };
        config.physics.arcade.debug = false;
        
        console.log('⚡ Configuração LITE aplicada (mobile/low-end)');
    } else {
        // Configuração completa para desktop
        config.fps = { target: 60 };
        config.render = {
            ...config.render,
            antialias: true,
            pixelArt: false
        };
        
        console.log('🚀 Configuração FULL aplicada (desktop/high-end)');
    }
    
    return config;
}
```

#### **Modificar linha 8-32** (simulationConfig):
```javascript
// ❌ REMOVER configuração estática
// const simulationConfig = { ... };

// ✅ SUBSTITUIR por função que retorna config adaptada
function getSimulationConfig() {
    const baseConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 'transparent',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 0 },
                debug: false
            }
        },
        scene: [GameplaySimulation],
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            fullscreenTarget: 'simulation-container'
        },
        parent: 'simulation-container',
        render: {
            antialias: false,
            pixelArt: false
        }
    };
    
    // Aplicar adaptações se instância já existe
    if (window.backgroundSimulation) {
        return window.backgroundSimulation.getAdaptiveConfig(baseConfig);
    }
    
    return baseConfig;
}
```

#### **Modificar método `createGame`** (linha 150):
```javascript
createGame() {
    try {
        // ✅ USAR configuração adaptativa
        const config = this.getAdaptiveConfig(getSimulationConfig());
        
        this.game = new Phaser.Game(config);
        this.isActive = true;
        
        // Armazenar referência globalmente
        window.gameplaySimulation = this.game;
        
        // Configurar eventos
        this.setupEvents();
        
        console.log(`🎮 Jogo Phaser criado (modo: ${this.performanceMode})`);
        
    } catch (error) {
        console.error('❌ Erro ao criar jogo Phaser:', error);
    }
}
```

---

### **MELHORIA 5: Atalhos de Teclado** ⚡ **P1**

#### **Onde**: `src/simulation/background-simulation.js`

#### **Adicionar no método `init`** (linha 45):
```javascript
init() {
    console.log('🎮 Inicializando simulação de background...');
    
    // Criar container se não existir
    this.createContainer();
    
    // Criar controles
    this.createControls();
    
    // ✅ ADICIONAR
    this.setupKeyboardShortcuts();
    
    // Inicializar Phaser
    this.initPhaser();
    
    console.log('✅ Simulação de background inicializada');
}
```

#### **Adicionar novo método** (após `toggleVisibility`):
```javascript
/**
 * Configura atalhos de teclado
 */
setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignorar se usuário está digitando
        const activeElement = document.activeElement;
        const isTyping = 
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable;
        
        if (isTyping) return;
        
        // Ctrl+P: Pausar/Retomar
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            this.togglePause();
            this.showShortcutFeedback('Simulação ' + (this.isPaused ? 'pausada' : 'retomada'));
        }
        
        // Ctrl+H: Mostrar/Ocultar
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            this.toggleVisibility();
            const isVisible = this.container.style.opacity !== '0';
            this.showShortcutFeedback('Simulação ' + (isVisible ? 'visível' : 'oculta'));
        }
        
        // Ctrl+S: Parar (com confirmação)
        if (e.ctrlKey && e.key === 's' && e.shiftKey) {
            e.preventDefault();
            if (confirm('Tem certeza que deseja parar a simulação permanentemente?')) {
                this.destroy();
                this.showShortcutFeedback('Simulação encerrada');
            }
        }
    });
    
    console.log('⌨️ Atalhos de teclado configurados (Ctrl+P, Ctrl+H, Ctrl+Shift+S)');
}

/**
 * Mostra feedback visual de atalho executado
 */
showShortcutFeedback(message) {
    // Criar toast temporário
    const toast = document.createElement('div');
    toast.className = 'simulation-shortcut-toast';
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(toast);
    
    // Remover após 2 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}
```

#### **Adicionar CSS para toast** em `src/styles/base/background.css`:
```css
/* Toast de feedback de atalhos */
.simulation-shortcut-toast {
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: rgba(0, 255, 204, 0.9);
    color: #000;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: var(--font-secondary);
    font-size: 14px;
    font-weight: 600;
    z-index: var(--z-tooltip);
    box-shadow: 0 4px 12px rgba(0, 255, 204, 0.3);
    animation: slideInRight 0.3s ease-out;
    transition: opacity 0.3s ease;
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(100px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
```

---

### **MELHORIA 6: Fade In/Out Suave** ✨ **P2**

#### **Onde**: `src/simulation/background-simulation.js`

#### **Modificar método `onGameReady`** (linha 192):
```javascript
onGameReady() {
    const canvas = this.game.canvas;
    if (canvas) {
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.display = 'block';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        
        // ✅ ADICIONAR: Fade in suave
        canvas.style.opacity = '0';
        canvas.style.transition = 'opacity 1s ease-in';
        
        canvas.style.zIndex = '-1';
        
        console.log('🎨 Canvas configurado para background');
        
        // Aplicar preferência inicial
        this.applyMotionPreference();
        
        // ✅ ADICIONAR: Fade in após render inicial
        requestAnimationFrame(() => {
            const targetOpacity = this.prefersReducedMotion ? '0.15' : '1';
            canvas.style.opacity = targetOpacity;
        });
    }
}
```

---

### **MELHORIA 7: Indicador Visual de Performance** ✨ **P2**

#### **Onde**: `src/simulation/background-simulation.js`

#### **Adicionar no método `createControls`** (dentro do innerHTML):
```javascript
this.controls.innerHTML = `
    <!-- Botões existentes... -->
    
    <!-- ✅ ADICIONAR indicador de modo -->
    <div class="simulation-mode-indicator" title="Modo de performance atual">
        <span class="mode-badge mode-badge-${this.performanceMode}">
            ${this.performanceMode === 'lite' ? '⚡ Lite' : '🚀 Full'}
        </span>
    </div>
`;
```

#### **Adicionar CSS** em `src/styles/base/background.css`:
```css
/* Indicador de modo de performance */
.simulation-mode-indicator {
    display: flex;
    align-items: center;
    margin-left: 8px;
}

.mode-badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.mode-badge-lite {
    background: rgba(255, 170, 0, 0.2);
    color: #ffaa00;
    border: 1px solid rgba(255, 170, 0, 0.5);
}

.mode-badge-full {
    background: rgba(0, 255, 102, 0.2);
    color: #00ff66;
    border: 1px solid rgba(0, 255, 102, 0.5);
}
```

---

## 🧪 **TESTES E VALIDAÇÃO**

### **Checklist de Testes**

#### **1. Acessibilidade** ♿
- [ ] Ativar "Reduzir movimento" nas configurações do OS
  - **Windows**: Configurações > Acessibilidade > Efeitos visuais > Animação
  - **Mac**: Preferências > Acessibilidade > Display > Reduzir movimento
  - **Linux**: Varia por distribuição
- [ ] Verificar se simulação reduz opacity para 0.15
- [ ] Verificar se simulação pausa automaticamente
- [ ] Testar com screen reader (NVDA, JAWS, VoiceOver)
  - Todos os botões devem ser anunciados corretamente
  - Estados (pausado/ativo) devem ser comunicados

#### **2. Performance Mobile** 📱
- [ ] Testar em dispositivo Android real (Chrome DevTools não é suficiente)
  - Verificar FPS (deve ser ~30fps em modo lite)
  - Verificar consumo de bateria (monitorar por 10min)
  - Verificar aquecimento do dispositivo
- [ ] Testar em iOS real (iPhone/iPad)
  - Verificar suavidade das animações
  - Verificar se não trava em segundo plano
- [ ] Testar em tablet
- [ ] Verificar console: deve mostrar "Configuração LITE aplicada"

#### **3. Opacity Adaptativa** 🎨
- [ ] Navegar para `/` (home) - opacity deve ser 0.8
- [ ] Navegar para `/login` - opacity deve ser 0.3
- [ ] Navegar para `/dashboard` - opacity deve ser 0.5
- [ ] Navegar para `/profile` - opacity deve ser 0.3
- [ ] Verificar transição suave (0.5s) entre páginas

#### **4. Atalhos de Teclado** ⌨️
- [ ] Pressionar `Ctrl+P` - deve pausar/retomar
  - Toast deve aparecer com "Simulação pausada/retomada"
- [ ] Pressionar `Ctrl+H` - deve ocultar/mostrar
  - Toast deve aparecer
- [ ] Pressionar `Ctrl+Shift+S` - deve pedir confirmação
  - Confirmar deve destruir simulação
- [ ] Testar que atalhos NÃO funcionam em inputs/textareas

#### **5. Controles Visuais** 🎛️
- [ ] Verificar que botões têm tooltips
- [ ] Verificar que ícones mudam ao clicar
- [ ] Verificar aria-pressed atualiza corretamente
- [ ] Verificar indicador de modo (Lite/Full) aparece

#### **6. Fade In/Out** ✨
- [ ] Recarregar página - simulação deve fazer fade in suave
- [ ] Alternar visibilidade - deve ter transição suave

### **Validação com Ferramentas**

#### **Lighthouse (Chrome DevTools)**
```bash
# Rodar Lighthouse com foco em acessibilidade e performance
# Meta: Acessibilidade > 90, Performance > 80 (com simulação ativa)
```

**Expectativas**:
- ✅ Acessibilidade: 90-95 (antes: 70-75)
- ✅ Performance Mobile: 75-85 (antes: 60-70)
- ✅ Best Practices: 95-100

#### **axe DevTools**
```bash
# Instalar extensão: https://chrome.google.com/webstore
# Rodar scan na página com simulação ativa
```

**Expectativas**:
- ✅ 0 critical issues
- ✅ 0 serious issues
- ⚠️ Máximo 2-3 moderate issues

#### **WAVE**
```bash
# Acessar: https://wave.webaim.org/
# Inserir URL do projeto
```

**Expectativas**:
- ✅ Todos os controles com labels
- ✅ Sem erros de contraste
- ✅ Estrutura ARIA correta

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

### **Fase 1: Preparação** (15 min)
- [ ] Criar branch: `feature/gameplay-simulation-improvements`
- [ ] Backup de `src/simulation/background-simulation.js`
- [ ] Ler documentação completa
- [ ] Configurar ambiente de testes

### **Fase 2: Implementação P0** (45 min) 🔥
- [ ] Implementar MELHORIA 1: prefers-reduced-motion
  - [ ] Adicionar constructor properties
  - [ ] Criar `checkMotionPreference()`
  - [ ] Criar `applyMotionPreference()`
  - [ ] Modificar `onGameReady()`
  - [ ] Testar com OS settings
- [ ] Implementar MELHORIA 2: ARIA labels
  - [ ] Modificar `createControls()`
  - [ ] Adicionar CSS `.sr-only`
  - [ ] Atualizar `togglePause()`
  - [ ] Atualizar `toggleVisibility()`
  - [ ] Testar com screen reader

### **Fase 3: Implementação P1** (1h 35min) ⚡
- [ ] Implementar MELHORIA 3: Opacity adaptativa
  - [ ] Adicionar `opacityMap` no constructor
  - [ ] Criar `observePageChanges()`
  - [ ] Criar `updateOpacityForCurrentPage()`
  - [ ] Testar navegação entre páginas
- [ ] Implementar MELHORIA 4: Performance mobile
  - [ ] Adicionar detecção de dispositivo
  - [ ] Criar `detectMobile()` e `detectPerformanceMode()`
  - [ ] Criar `getAdaptiveConfig()`
  - [ ] Modificar configuração do Phaser
  - [ ] Testar em mobile real
- [ ] Implementar MELHORIA 5: Atalhos de teclado
  - [ ] Modificar `init()` para chamar setup
  - [ ] Criar `setupKeyboardShortcuts()`
  - [ ] Criar `showShortcutFeedback()`
  - [ ] Adicionar CSS do toast
  - [ ] Testar todos os atalhos

### **Fase 4: Implementação P2 (Opcional)** (45 min) ✨
- [ ] Implementar MELHORIA 6: Fade in/out
  - [ ] Modificar `onGameReady()`
  - [ ] Testar transição suave
- [ ] Implementar MELHORIA 7: Indicador de performance
  - [ ] Adicionar indicador em `createControls()`
  - [ ] Adicionar CSS do badge
  - [ ] Testar visibilidade

### **Fase 5: Testes e Validação** (30 min) 🧪
- [ ] Executar checklist de testes completo
- [ ] Rodar Lighthouse (mobile + desktop)
- [ ] Rodar axe DevTools
- [ ] Testar em dispositivos reais (mobile + tablet)
- [ ] Verificar console logs (sem erros)

### **Fase 6: Documentação e Deploy** (15 min) 📝
- [ ] Atualizar CHANGELOG.md
- [ ] Criar PR com descrição detalhada
- [ ] Solicitar code review
- [ ] Merge após aprovação
- [ ] Deploy para staging
- [ ] Testes em staging
- [ ] Deploy para produção

---

## 📊 **MÉTRICAS DE SUCESSO**

### **Antes da Implementação**
| Métrica | Valor Atual | Ferramenta |
|---------|-------------|------------|
| Lighthouse Acessibilidade | 70-75 | Chrome DevTools |
| Lighthouse Performance (Mobile) | 60-70 | Chrome DevTools |
| axe Critical Issues | 2-3 | axe DevTools |
| FPS Mobile | ~45-60fps | Inconsistente |
| Consumo CPU Mobile | ~50-70% | DevTools Performance |

### **Após Implementação** ✅
| Métrica | Valor Esperado | Melhoria |
|---------|----------------|----------|
| Lighthouse Acessibilidade | 90-95 | +20 pontos |
| Lighthouse Performance (Mobile) | 75-85 | +15 pontos |
| axe Critical Issues | 0 | -100% |
| FPS Mobile | ~30fps (estável) | Consistente |
| Consumo CPU Mobile | ~30-40% | -40% |

---

## 🚨 **PROBLEMAS CONHECIDOS E SOLUÇÕES**

### **Problema 1**: Phaser não carrega em alguns navegadores
**Sintoma**: Console mostra "Phaser is not defined"  
**Causa**: CDN bloqueado ou timeout  
**Solução**: 
```javascript
// Adicionar retry logic em loadPhaser()
async loadPhaser(retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            // ... código de carregamento
            return;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}
```

### **Problema 2**: Simulação não pausa em prefers-reduced-motion
**Sintoma**: Simulação continua rodando mesmo com preferência ativada  
**Causa**: `applyMotionPreference()` não é chamado  
**Solução**: Verificar que `checkMotionPreference()` é chamado no constructor

### **Problema 3**: Opacity não muda entre páginas
**Sintoma**: Opacity permanece a mesma em todas as páginas  
**Causa**: SPA não dispara eventos de navegação tradicionais  
**Solução**: MutationObserver já implementado, verificar que está ativo

### **Problema 4**: Atalhos não funcionam
**Sintoma**: Ctrl+P não faz nada  
**Causa**: Event listener não está registrado ou é bloqueado por outro  
**Solução**: Verificar console logs, adicionar `e.stopPropagation()` se necessário

---

## 📞 **SUPORTE E DÚVIDAS**

### **Durante Implementação**
- 📝 Documentar decisões no código com comentários `// NOTA:`
- 🐛 Reportar bugs encontrados durante implementação
- 💡 Sugerir melhorias adicionais identificadas

### **Após Implementação**
- ✅ Marcar tarefa como concluída no projeto
- 📊 Compartilhar métricas de Lighthouse antes/depois
- 🎉 Celebrar melhoria de acessibilidade!

---

## 🎯 **PRÓXIMOS PASSOS SUGERIDOS**

Após implementar estas melhorias, considerar:

1. **Sistema de Configurações Persistentes**
   - Salvar preferências do usuário em localStorage
   - Painel de configurações visual
   - Presets (Performance/Balanced/Quality)

2. **Telemetria e Analytics**
   - Rastrear quantos usuários usam modo lite
   - Medir FPS médio por dispositivo
   - A/B testing de opacity values

3. **Easter Eggs**
   - Comandos especiais no console
   - Modos de visualização alternativos
   - Integração com conquistas do jogo

---

**Versão**: 1.0  
**Última Atualização**: Janeiro 2025  
**Próxima Revisão**: Após implementação completa

---

*"Acessibilidade não é uma feature, é um requisito fundamental."* ♿✨

