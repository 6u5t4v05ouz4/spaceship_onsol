# Shared - Code Compartilhado

## Visão Geral

Estrutura **compartilhada** entre site web e jogo. Contém:
- **Router:** Roteador SPA para navegação web
- **Config:** Configurações globais (Supabase, etc)
- **Services:** Serviços reutilizáveis (Auth, Wallet, etc)
- **Utils:** Funções utilitárias
- **Styles:** Estilos CSS globais e tema

## Arquitetura

```
src/shared/
├── router.js                    # Roteador page.js (SPA)
├── config/
│   ├── environment.js          # Variáveis de ambiente
│   ├── supabase-config.js      # Configuração Supabase
│   └── env-loader.js           # Loader de env
├── services/                    # Serviços (a implementar)
│   ├── authService.js          # Auth (Story 1.2)
│   ├── profileService.js       # Profile (Story 1.5)
│   └── walletService.js        # Solana/NFT (Story 1.6)
├── utils/
│   ├── error-handler.js        # Tratamento de erro
│   └── security.js             # Funções segurança
├── styles/
│   ├── main.css
│   ├── themes/
│   │   └── variables.css       # CSS variables (cores, fonts)
│   ├── base/
│   │   ├── reset.css
│   │   ├── typography.css
│   │   └── background.css
│   └── components/
│       ├── buttons.css
│       └── cards.css
└── README.md
```

## Router (page.js)

### Inicializar

```javascript
import { initRouter } from './shared/router.js';

const appContainer = document.getElementById('app');
initRouter(appContainer);
```

### Navegar

```javascript
import { navigateTo } from './shared/router.js';

navigateTo('/login');
```

### Adicionar Rota

Edit `src/shared/router.js` e adicione:

```javascript
page('/myroute', () => {
  loadPage('myroute');
});

// E no switch:
case 'myroute':
  PageClass = (await import('../web/pages/MyRoutePage.js')).default;
  break;
```

## Services (Serviços)

### AuthService (Story 1.2)

Encapsula toda lógica de autenticação Supabase:

```javascript
import { authService } from './shared/services/authService.js';

// Login
await authService.signIn(email, password);

// OAuth
await authService.signInWithOAuth('google');

// Sessão
const session = await authService.getSession();

// Logout
await authService.signOut();
```

### ProfileService (Story 1.5)

Gerencia dados do perfil do usuário:

```javascript
import { profileService } from './shared/services/profileService.js';

const profile = await profileService.getProfile(userId);
await profileService.updateProfile(userId, data);
```

### WalletService (Story 1.6)

Integração Solana/NFT:

```javascript
import { walletService } from './shared/services/walletService.js';

await walletService.connectWallet();
const nfts = await walletService.getNFTs();
```

## CSS Variables (Design System)

### Cores

```css
--primary-cyan: #00ffcc;
--primary-cyan-light: #66ffee;
--secondary-blue: #0099ff;
--secondary-purple: #9933ff;

--text-primary: #ffffff;
--text-secondary: #b0b0b0;
--text-tertiary: #808080;

--bg-dark: #0a0e27;
--bg-darker: #000000;
```

### Tipografia

```css
--font-primary: 'SD Glitch Robot';    /* Bold, títulos *)
--font-secondary: 'Exo 2';           /* Body text *)

--text-xl: 2.5rem;
--text-lg: 1.5rem;
--text-body: 1rem;
--text-sm: 0.875rem;
```

### Espaçamento

```css
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
--spacing-2xl: 3rem;
```

### Outros

```css
--border-radius-sm: 0.25rem;
--border-radius-md: 0.5rem;
--border-radius-lg: 1rem;

--z-bg: 0;
--z-content: 10;
--z-modal: 100;

--transition-fast: 0.15s ease;
--transition-normal: 0.3s ease;
--transition-slow: 0.5s ease;
```

## Environment Variables

Configurações por ambiente (dev/prod):

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_REDIRECT_TO=http://localhost:3000/auth-callback
DEV_REDIRECT_ORIGIN=http://localhost:3000
DEV_POST_LOGIN_PATH=/dashboard
```

## Estrutura de Pastas - Princípios

1. **Separação de Responsabilidades:**
   - `shared/` = código reutilizável
   - `web/` = apenas interface web
   - `game/` = apenas lógica Phaser

2. **Services Pattern:**
   - Cada serviço encapsula uma responsabilidade
   - Exportar apenas funções públicas
   - Erros tratados internamente

3. **Lazy Loading:**
   - Páginas carregadas dinamicamente
   - Services importados conforme necessário

4. **CSS Modular:**
   - Variables centralizadas em `themes/`
   - Base styles em `base/`
   - Components em `components/`

## Próximas Tarefas

- [ ] Story 1.2: Implementar AuthService
- [ ] Story 1.3: Implementar AuthCallbackPage
- [ ] Story 1.4: Implementar DashboardPage + Dashboard Service
- [ ] Story 1.5: Implementar ProfileService
- [ ] Story 1.6: Refatorar WalletService (Solana/NFT)
- [ ] Story 1.7: Testes unitários para services
