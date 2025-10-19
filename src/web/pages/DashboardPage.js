/**
 * Página de Dashboard - Stub para Story 1.4
 * Será implementada na próxima história
 */

export default class DashboardPage {
  constructor() {
    this.name = 'DashboardPage';
  }

  render() {
    const container = document.createElement('div');
    container.className = 'dashboard-page';
    container.innerHTML = `
      <div class="background-primary"></div>
      <div class="stars-background"></div>
      <div style="position: relative; z-index: 10; padding: 2rem; text-align: center; color: #00ffcc;">
        <h1>📊 Dashboard</h1>
        <p>Esta página será implementada na Story 1.4</p>
        <a href="/" style="color: #00ffcc; text-decoration: underline; cursor: pointer;">← Voltar para Home</a>
      </div>
    `;
    return container;
  }
}
