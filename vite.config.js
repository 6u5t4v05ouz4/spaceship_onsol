import { defineConfig } from 'vite';
import { parse } from 'node:url';

export default defineConfig({
	// Expor origem e path para uso no frontend e para registro no provedor OAuth
	define: {
		'process.env.VITE_APP_REDIRECT_ORIGIN': JSON.stringify(process.env.DEV_REDIRECT_ORIGIN || 'http://localhost:3000'),
		'process.env.VITE_APP_REDIRECT_PATH': JSON.stringify(process.env.DEV_REDIRECT_PATH || '/__dev/oauth-callback'),
	},
  publicDir: 'public',
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
    },
    // Middleware dev: reescreve header Location quando backend redireciona para URL de produção
    // Usa DEV_REDIRECT_ORIGIN (ex.: export DEV_REDIRECT_ORIGIN="http://localhost:3000")
    // para sobrescrever o destino do redirect durante desenvolvimento.
    configureServer(server) {
      const devOrigin = process.env.DEV_REDIRECT_ORIGIN || `http://localhost:3000`;
      const devCallbackPath = process.env.DEV_REDIRECT_PATH || '/__dev/oauth-callback';

      // Middleware: SPA fallback - redireciona todas as rotas desconhecidas para index.html
      // Isso permite que o router.js no frontend gerencie a navegação
      return () => {
        server.middlewares.use((req, res, next) => {
          // Se a URL é um arquivo estático conhecido, deixa passar
          if (req.url.includes('.') || req.url.startsWith('/node_modules')) {
            return next();
          }

          // OAuth dev callback
          try {
            const reqUrl = new URL(req.url, `http://${req.headers.host}`);
            if (reqUrl.pathname === devCallbackPath) {
              const localTargetPath = process.env.DEV_POST_LOGIN_PATH || '/dashboard';
              const target = new URL(localTargetPath, devOrigin);
              target.search = reqUrl.search;
              res.writeHead(302, { Location: target.toString() });
              return res.end();
            }
          } catch (e) {
            // ignore and continue
          }

          // Para rotas da SPA (não são arquivos estáticos), servir index.html
          // Isso permite que o router do frontend gerencie a navegação
          if (!req.url.startsWith('/@')) {
            req.url = '/index.html';
          }

          next();
        });
      };
    }
  }
});
