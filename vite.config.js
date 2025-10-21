import { defineConfig } from 'vite';
import { parse } from 'node:url';
import { copyFileSync, existsSync } from 'fs';

// Plugin para copiar arquivos HTML
const copyHtmlPlugin = {
  name: 'copy-html-files',
  writeBundle() {
    const htmlFiles = ['game.html', 'login.html', 'multiplayer.html'];
    htmlFiles.forEach(file => {
      if (existsSync(file)) {
        copyFileSync(file, `dist/${file}`);
        console.log(`✅ ${file} copiado para dist/`);
      }
    });
  }
};

// Plugin SPA Fallback
const spaFallbackPlugin = {
  name: 'spa-fallback',
  configResolved(config) {
    // Não precisamos armazenar config aqui
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
		'process.env.VITE_APP_REDIRECT_ORIGIN': JSON.stringify(process.env.RAILWAY_PUBLIC_DOMAIN || 'https://spaceshiponsol-production.up.railway.app'),
		'process.env.VITE_APP_REDIRECT_PATH': JSON.stringify('/auth-callback'),
		// URL do servidor Railway para WebSocket
		'import.meta.env.VITE_SERVER_URL': JSON.stringify(process.env.RAILWAY_PUBLIC_DOMAIN || 'https://spaceshiponsol-production.up.railway.app'),
		// Variáveis do Supabase para produção
		'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
		'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
	},
  publicDir: 'public',
  plugins: [spaFallbackPlugin, copyHtmlPlugin],
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
