import page from 'page';
import * as authService from './services/authService.js';

// Importar páginas (lazy loading será implementado conforme necessário)
let appContainer = null;

/**
 * Verifica se usuário está autenticado
 */
async function isAuthenticated() {
  const session = await authService.getSession();
  return !!session;
}

/**
 * Inicializa o roteador e configura todas as rotas
 * @param {HTMLElement} container - Elemento onde renderizar as páginas
 */
export function initRouter(container) {
  appContainer = container;

  // Rota: / (Home) - Pública
  page('/', () => {
    loadPage('home');
  });

  // Rota: /login - Pública
  page('/login', () => {
    loadPage('login');
  });

  // Rota: /dashboard - Protegida
  page('/dashboard', async () => {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      console.warn('⚠️ Acesso negado - redirecionando para login');
      page.redirect('/login');
      return;
    }
    loadPage('dashboard');
  });

  // Rota: /profile - Protegida
  page('/profile', async () => {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      console.warn('⚠️ Acesso negado - redirecionando para login');
      page.redirect('/login');
      return;
    }
    loadPage('profile');
  });

  // Rota: /auth-callback (OAuth callback) - Pública
  page('/auth-callback', () => {
    loadPage('auth-callback');
  });

  // Fallback para rotas não encontradas
  page('*', () => {
    console.warn('Rota não encontrada, redirecionando para home');
    page.redirect('/');
  });

  // Iniciar roteador
  page.start();

  // Detectar OAuth callback no hash (Supabase Implicit Flow)
  // page.js não processa fragments automaticamente, então fazemos isso manualmente
  if (window.location.hash.includes('access_token') || window.location.hash.includes('error')) {
    console.log('🔐 OAuth fragment detectado, redirecionando para /auth-callback');
    // Transformar hash em query string para page.js processar
    window.location.href = '/auth-callback' + window.location.hash;
  }
}

/**
 * Carrega uma página dinamicamente
 * @param {string} pageName - Nome da página (sem .js)
 */
async function loadPage(pageName) {
  try {
    // Limpar container
    if (appContainer) {
      appContainer.innerHTML = '';
    }

    // Importar página dinamicamente
    let PageClass;
    
    switch (pageName) {
      case 'home':
        PageClass = (await import('../web/pages/HomePage.js')).default;
        break;
      case 'login':
        PageClass = (await import('../web/pages/LoginPage.js')).default;
        break;
      case 'dashboard':
        PageClass = (await import('../web/pages/DashboardPage.js')).default;
        break;
      case 'profile':
        PageClass = (await import('../web/pages/ProfilePage.js')).default;
        break;
      case 'auth-callback':
        PageClass = (await import('../web/pages/AuthCallbackPage.js')).default;
        break;
      default:
        throw new Error(`Página desconhecida: ${pageName}`);
    }

    // Criar instância da página
    const page = new PageClass();
    
    // Renderizar página
    if (appContainer && typeof page.render === 'function') {
      const content = page.render();
      appContainer.appendChild(content);
    }
  } catch (error) {
    console.error(`Erro ao carregar página ${pageName}:`, error);
    if (appContainer) {
      appContainer.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #ff6b6b;">
          <h1>Erro ao carregar página</h1>
          <p>${error.message}</p>
        </div>
      `;
    }
  }
}

/**
 * Navega para uma rota específica
 * @param {string} path - Caminho da rota
 */
export function navigateTo(path) {
  page(path);
}

export default {
  initRouter,
  navigateTo
};
