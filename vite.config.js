import { defineConfig } from 'vite';
import { parse } from 'node:url';

// Plugin SPA Fallback
const spaFallbackPlugin = {
  name: 'spa-fallback',
  configResolved(config) {
    this.config = config;
  },
  configureServer(server) {
    // Adicionar no INÍCIO dos middlewares (antes do file serving)
    return () => {
      server.middlewares.use((req, res, next) => {
        // Se é arquivo estático (tem ponto na URL), deixa passar
        if (req.url.includes('.')) {
          return next();
        }

        // Se é Vite HMR ou dev socket, deixa passar
        if (req.url.startsWith('/@') || req.url === '/') {
          return next();
        }

        // Se é node_modules, deixa passar
        if (req.url.startsWith('/node_modules')) {
          return next();
        }

        // Para qualquer outra rota, servir index.html
        // O router.js no frontend vai gerenciar a navegação
        req.url = '/index.html';
        next();
      });
    };
  }
};

export default defineConfig({
	// Expor origem e path para uso no frontend e para registro no provedor OAuth
	define: {
		'process.env.VITE_APP_REDIRECT_ORIGIN': JSON.stringify(process.env.DEV_REDIRECT_ORIGIN || 'http://localhost:3000'),
		'process.env.VITE_APP_REDIRECT_PATH': JSON.stringify(process.env.DEV_REDIRECT_PATH || '/__dev/oauth-callback'),
	},
  publicDir: 'public',
  plugins: [spaFallbackPlugin],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000, // Aumenta limite de warning para 1MB
    rollupOptions: {
      input: {
        main: 'index.html',
        game: 'game.html'
      },
      output: {
        manualChunks: {
          // Separa Phaser em chunk próprio
          phaser: ['phaser'],
          // Separa Solana em chunk próprio
          solana: ['@solana/web3.js'],
          // Separa Vercel analytics em chunk próprio
          vercel: ['@vercel/analytics', '@vercel/speed-insights']
        }
      }
    }
  },
  server: {
    open: '/',
    port: 3000,
    // Proxy requests to backend (use BACKEND env var) and rewrite Location headers on proxy responses
    proxy: {
      // ajuste os contextos conforme seu backend (ex.: /auth, /oauth, /api/auth)
      '/auth': {
        // Default para desenvolvimento: localhost:3000
        target: process.env.BACKEND || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        onProxyRes(proxyRes) {
          const location = proxyRes.headers['location'] || proxyRes.headers['Location'];
          if (location && typeof location === 'string' && location.includes('://')) {
            try {
              const devOrigin = process.env.DEV_REDIRECT_ORIGIN || `http://localhost:${process.env.PORT || 3000}`;
              const url = new URL(location);
              const devUrl = new URL(devOrigin);
              if (url.origin !== devUrl.origin) {
                url.protocol = devUrl.protocol;
                url.host = devUrl.host;
                const newLoc = url.toString();
                proxyRes.headers['location'] = newLoc;
                proxyRes.headers['Location'] = newLoc;
              }
            } catch (e) {
              /* ignore malformed URL */
            }
          }
        }
      },
      '/api': {
        // Default para desenvolvimento: localhost:3000
        target: process.env.BACKEND || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        onProxyRes(proxyRes) {
          const location = proxyRes.headers['location'] || proxyRes.headers['Location'];
          if (location && typeof location === 'string' && location.includes('://')) {
            try {
              const devOrigin = process.env.DEV_REDIRECT_ORIGIN || `http://localhost:${process.env.PORT || 3000}`;
              const url = new URL(location);
              const devUrl = new URL(devOrigin);
              if (url.origin !== devUrl.origin) {
                url.protocol = devUrl.protocol;
                url.host = devUrl.host;
                const newLoc = url.toString();
                proxyRes.headers['location'] = newLoc;
                proxyRes.headers['Location'] = newLoc;
              }
            } catch (e) {
              /* ignore malformed URL */
            }
          }
        }
      }
    }
  }
});
