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
		// Variáveis do Supabase para produção
		'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
		'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
	},
  publicDir: 'public',
  plugins: [spaFallbackPlugin],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000, // Aumenta limite de warning para 1MB
    rollupOptions: {
      input: {
        main: 'index.html'
        // game.html será servido diretamente pelo servidor Node.js
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
    // Proxy desabilitado - não temos backend local
    // Se precisar de proxy no futuro, adicione aqui
    // proxy: {
    //   '/auth': { ... },
    //   '/api': { ... }
    // }
  }
});
