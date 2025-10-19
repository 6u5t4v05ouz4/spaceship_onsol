/**
 * Página de Login - Stub para Story 1.2
 * Será implementada na próxima história
 */

export default class LoginPage {
  constructor() {
    this.name = 'LoginPage';
  }

  render() {
    const container = document.createElement('div');
    container.className = 'login-page';
    container.innerHTML = `
      <div class="background-primary"></div>
      <div class="stars-background"></div>
      <div style="position: relative; z-index: 10; padding: 2rem; text-align: center; color: #00ffcc;">
        <h1>📝 Login</h1>
        <p>Esta página será implementada na Story 1.2</p>
        <a href="/" style="color: #00ffcc; text-decoration: underline; cursor: pointer;">← Voltar para Home</a>
      </div>
    `;
    return container;
  }
}
