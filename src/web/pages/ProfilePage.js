/**
 * Página de Perfil - Stub para Story 1.5
 * Será implementada na próxima história
 */

export default class ProfilePage {
  constructor() {
    this.name = 'ProfilePage';
  }

  render() {
    const container = document.createElement('div');
    container.className = 'profile-page';
    container.innerHTML = `
      <div class="background-primary"></div>
      <div class="stars-background"></div>
      <div style="position: relative; z-index: 10; padding: 2rem; text-align: center; color: #00ffcc;">
        <h1>👤 Perfil</h1>
        <p>Esta página será implementada na Story 1.5</p>
        <a href="/" style="color: #00ffcc; text-decoration: underline; cursor: pointer;">← Voltar para Home</a>
      </div>
    `;
    return container;
  }
}
