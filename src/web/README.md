# Web Site - Space Crypto Miner

## Visão Geral

Estrutura do **site web** da aplicação (páginas de login, dashboard, profile, etc). Este diretório contém apenas a interface web, separada da lógica do jogo Phaser que fica em `src/game/`.

## Estrutura de Pastas

```
src/web/
├── pages/           # Páginas principais (renderizadas via roteador)
│   ├── HomePage.js
│   ├── LoginPage.js
│   ├── DashboardPage.js
│   ├── ProfilePage.js
│   └── AuthCallbackPage.js
├── components/      # Componentes reutilizáveis
├── services/        # Serviços específicos do web (não auth/config)
└── README.md
```

## Rotas Disponíveis

| Rota | Página | Status | Descrição |
|------|--------|--------|-----------|
| `/` | HomePage | ✅ | Página inicial com navegação |
| `/login` | LoginPage | 🔄 Story 1.2 | Autenticação (email/OAuth) |
| `/dashboard` | DashboardPage | 🔄 Story 1.4 | Dashboard do usuário logado |
| `/profile` | ProfilePage | 🔄 Story 1.5 | Edição de perfil |
| `/auth-callback` | AuthCallbackPage | 🔄 Story 1.3 | Callback do OAuth |

## Criando uma Nova Página

### Passo 1: Criar classe Page

```javascript
// src/web/pages/MyPage.js
export default class MyPage {
  constructor() {
    this.name = 'MyPage';
  }

  render() {
    const container = document.createElement('div');
    container.className = 'my-page';
    container.innerHTML = `
      <div class="background-primary"></div>
      <div class="stars-background"></div>
      <div class="my-container">
        <!-- Seu conteúdo aqui -->
      </div>
    `;
    return container;
  }
}
```

### Passo 2: Adicionar rota no Router

Editar `src/shared/router.js`:

```javascript
// Adicionar novo case no switch
case 'mypage':
  PageClass = (await import('../web/pages/MyPage.js')).default;
  break;

// Adicionar rota
page('/mypage', () => {
  loadPage('mypage');
});
```

### Passo 3: Usar a rota

```html
<a href="/mypage">Ir para Minha Página</a>
```

## Padrões de Componente

Cada página deve:
1. ✅ Ser uma classe com método `render()` que retorna HTMLElement
2. ✅ Incluir `<div class="background-primary"></div>` e `<div class="stars-background"></div>`
3. ✅ Usar CSS variables do design system (`var(--primary-cyan)`, etc)
4. ✅ Ser responsiva (mobile-first)
5. ✅ Ter um `z-index: 10` no container principal (acima do background)

## Importando Serviços

Serviços compartilhados (auth, config) ficam em `src/shared/services/`:

```javascript
import { authService } from '../../shared/services/authService.js';

// Usar
const user = await authService.getSession();
```

## Estilos

### CSS Global
- `src/styles/main.css` - Estilos principais
- `src/styles/themes/variables.css` - Variáveis CSS (cores, tipografia)
- `src/styles/base/background.css` - Background e stars

### CSS Local (inline)
Para pequenos estilos específicos da página, adicione em `addStyles()`:

```javascript
addStyles() {
  const style = document.createElement('style');
  style.setAttribute('data-page', 'mypage');
  style.textContent = `
    .my-page { /* estilos */ }
  `;
  document.head.appendChild(style);
}
```

## Boas Práticas

1. **Sempre limpe estilos:** Use `data-page="nome"` para identificar e evitar duplicação
2. **Lazy Loading:** Páginas são carregadas dinamicamente via import()
3. **Erro Handling:** Router mostra erro se página falhar ao carregar
4. **Navegação:** Use `window.location.href` ou links `<a href>` para navegação
5. **Responsividade:** Teste em mobile (viewport < 768px)

## Próximas Histórias

- **Story 1.2:** Implementar LoginPage com Supabase Auth
- **Story 1.3:** Implementar AuthCallbackPage para OAuth
- **Story 1.4:** Implementar DashboardPage com dados do Supabase
- **Story 1.5:** Implementar ProfilePage com edição de perfil
