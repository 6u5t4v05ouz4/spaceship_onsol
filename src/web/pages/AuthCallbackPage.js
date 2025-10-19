/**
 * Página de Callback OAuth - Stub para Story 1.3
 * Será implementada na próxima história
 */

export default class AuthCallbackPage {
  constructor() {
    this.name = 'AuthCallbackPage';
  }

  render() {
    const container = document.createElement('div');
    container.className = 'auth-callback-page';
    container.innerHTML = `
      <div class="background-primary"></div>
      <div class="stars-background"></div>
      <div style="position: relative; z-index: 10; padding: 2rem; text-align: center; color: #00ffcc;">
        <h1>🔐 Autenticação</h1>
        <p>Processando callback OAuth...</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">Esta página será implementada na Story 1.3</p>
      </div>
    `;
    return container;
  }
}
