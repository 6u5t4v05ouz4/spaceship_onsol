/**
 * Página inicial do Space Crypto Miner
 * Renderiza uma tela de boas-vindas com navegação para login/jogo
 */

export default class HomePage {
  constructor() {
    this.name = 'HomePage';
  }

  /**
   * Renderiza a página inicial
   * @returns {HTMLElement} - Elemento DOM da página
   */
  render() {
    const container = document.createElement('div');
    container.className = 'home-page';
    container.innerHTML = `
      <div class="background-primary"></div>
      <div class="stars-background"></div>
      
      <div class="home-container">
        <div class="home-header">
          <img src="/assets/icones/icone.png" alt="Space Crypto Miner" class="home-logo">
          <h1 class="home-title">Space Crypto Miner</h1>
          <p class="home-subtitle">
            Explore o universo da mineração espacial. Ganhe NFTs, tokens e domine a galáxia.
          </p>
        </div>
        
        <div class="home-actions">
          <button class="btn btn-primary" id="loginBtn" aria-label="Fazer login no Space Crypto Miner">
            <span role="img" aria-label="Foguete">🚀</span>
            <span>Fazer Login</span>
          </button>
          <button class="btn btn-secondary" id="learnBtn" aria-label="Saber mais sobre o jogo">
            <span role="img" aria-label="Livro">📖</span>
            <span>Saber Mais</span>
          </button>
        </div>
        
        <div class="home-features">
          <div class="feature">
            <div class="feature-icon" role="img" aria-label="Mineração">⛏️</div>
            <h3>Mineração</h3>
            <p>Colete recursos do espaço</p>
          </div>
          <div class="feature">
            <div class="feature-icon" role="img" aria-label="Gameplay">🎮</div>
            <h3>Gameplay</h3>
            <p>PvE e PvP épico</p>
          </div>
          <div class="feature">
            <div class="feature-icon" role="img" aria-label="NFTs">💎</div>
            <h3>NFTs</h3>
            <p>Possua seus ativos digitais</p>
          </div>
        </div>
      </div>
    `;

    // Adicionar estilos
    this.addStyles();

    // Adicionar event listeners
    container.querySelector('#loginBtn').addEventListener('click', () => {
      window.location.href = '/login';
    });

    container.querySelector('#learnBtn').addEventListener('click', () => {
      alert('Documentação em breve!');
    });

    return container;
  }

  /**
   * Adiciona estilos específicos da página inicial
   */
  addStyles() {
    // Verificar se já existe uma tag style para home-page
    if (!document.querySelector('style[data-page="home"]')) {
      const style = document.createElement('style');
      style.setAttribute('data-page', 'home');
      style.textContent = `
        .home-page {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .home-container {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: var(--spacing-xl, 2rem);
          max-width: 800px;
          width: 100%;
        }

        .home-header {
          margin-bottom: 3rem;
          animation: fadeInDown 0.8s ease-out;
        }

        .home-logo {
          width: 100px;
          height: 100px;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 0 20px rgba(0, 255, 204, 0.5));
          animation: float 3s ease-in-out infinite;
        }

        .home-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          color: var(--primary-cyan, #00ffcc);
          text-shadow: 0 0 20px rgba(0, 255, 204, 0.5);
          letter-spacing: 2px;
          margin-bottom: 1rem;
          font-family: var(--font-primary, 'Arial');
        }

        .home-subtitle {
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: var(--text-secondary, #b0b0b0);
          margin-bottom: 0;
          font-family: var(--font-secondary, 'Arial');
          line-height: 1.6;
        }

        .home-actions {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .btn {
          padding: 0.875rem 2rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: var(--font-primary, 'Arial');
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary-cyan, #00ffcc), var(--secondary-blue, #0099ff));
          color: #000;
          box-shadow: 0 0 20px rgba(0, 255, 204, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(0, 255, 204, 0.6);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          background: rgba(0, 255, 204, 0.1);
          border: 2px solid var(--primary-cyan, #00ffcc);
          color: var(--primary-cyan, #00ffcc);
        }

        .btn-secondary:hover {
          background: rgba(0, 255, 204, 0.2);
          box-shadow: 0 0 20px rgba(0, 255, 204, 0.4);
        }

        .home-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .feature {
          padding: 1.5rem;
          background: rgba(0, 255, 204, 0.05);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: 0.75rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .feature:hover {
          background: rgba(0, 255, 204, 0.1);
          border-color: rgba(0, 255, 204, 0.4);
          transform: translateY(-5px);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .feature h3 {
          color: var(--primary-cyan, #00ffcc);
          margin-bottom: 0.5rem;
          font-family: var(--font-primary, 'Arial');
        }

        .feature p {
          color: var(--text-secondary, #b0b0b0);
          font-size: 0.9rem;
          font-family: var(--font-secondary, 'Arial');
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @media (max-width: 768px) {
          .home-container {
            padding: var(--spacing-lg, 1.5rem);
          }

          .home-logo {
            width: 80px;
            height: 80px;
          }

          .home-actions {
            flex-direction: column;
            gap: 1rem;
          }

          .btn {
            width: 100%;
          }

          .home-features {
            gap: 1rem;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}
