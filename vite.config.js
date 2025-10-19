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

      // 1) Dev callback endpoint: registre THIS URL no painel OAuth como Redirect URI:
      //    http://localhost:3000/__dev/oauth-callback
      // Ele captura ?code=...&state=... e redireciona para a origem de dev (ex.: /dashboard) mantendo query.
      server.middlewares.use((req, res, next) => {
        try {
          const reqUrl = new URL(req.url, `http://${req.headers.host}`);
          if (reqUrl.pathname === devCallbackPath) {
            // Escolha destino local (poderia ser /dashboard ou outro)
            const localTargetPath = process.env.DEV_POST_LOGIN_PATH || '/dashboard';
            const target = new URL(localTargetPath, devOrigin);
            // Preserve query (code, state, etc.)
            target.search = reqUrl.search;
            res.writeHead(302, { Location: target.toString() });
            return res.end();
          }
        } catch (e) {
          // ignore and continue to other middleware
        }

        // 2) Fallback existente: reescrever Location em respostas locais (mantive lógica)
        const originalWriteHead = res.writeHead;
        res.writeHead = function (statusCode, reasonOrHeaders, maybeHeaders) {
          // Normalize headers object (node compat)
          let headers = {};
          if (typeof reasonOrHeaders === 'object' && reasonOrHeaders !== null) {
            headers = reasonOrHeaders;
          } else if (typeof maybeHeaders === 'object' && maybeHeaders !== null) {
            headers = maybeHeaders;
          }

          // Check Location header in headers argument
          const locHeader = (headers && (headers.location || headers.Location)) || res.getHeader && (res.getHeader('location') || res.getHeader('Location'));
          if (typeof locHeader === 'string' && locHeader.includes('://')) {
            try {
              const url = new URL(locHeader);
              const devUrl = new URL(devOrigin);
              if (url.origin !== devUrl.origin) {
                url.protocol = devUrl.protocol;
                url.host = devUrl.host;
                const newLoc = url.toString();
                if (headers && (headers.location || headers.Location)) {
                  headers.location = newLoc;
                  headers.Location = newLoc;
                }
                try { res.setHeader('Location', newLoc); } catch (e) { /* ignore */ }
              }
            } catch (e) { /* ignore malformed URL */ }
          }

          // Call original writeHead with original args (preserve behavior)
          if (typeof reasonOrHeaders === 'object' && reasonOrHeaders !== null) {
            return originalWriteHead.call(this, statusCode, reasonOrHeaders);
          }
          if (typeof maybeHeaders === 'object' && maybeHeaders !== null) {
            return originalWriteHead.call(this, statusCode, reasonOrHeaders, maybeHeaders);
          }
          return originalWriteHead.call(this, statusCode);
        };
        next();
      });
    }
  }
});
