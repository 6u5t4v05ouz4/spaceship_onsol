import { defineConfig } from 'vite';
import { parse } from 'node:url';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

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

// Plugin para copiar arquivos de scenes
const copyScenesPlugin = {
  name: 'copy-scenes-files',
  writeBundle() {
    // Garantir que o diretório dist/scenes exista
    if (!existsSync('dist/scenes')) {
      mkdirSync('dist/scenes', { recursive: true });
      console.log('📁 Diretório dist/scenes criado');
    }

    // Copiar arquivos de scenes
    const sceneFiles = ['MultiplayerGameScene.js'];
    sceneFiles.forEach(file => {
      const srcPath = join('src/scenes', file);
      const destPath = join('dist/scenes', file);
      if (existsSync(srcPath)) {
        copyFileSync(srcPath, destPath);
        console.log(`✅ ${file} copiado para dist/scenes/`);
      }
    });
  }
};

// Plugin para copiar arquivos de managers
const copyManagersPlugin = {
  name: 'copy-managers-files',
  writeBundle() {
    // Garantir que o diretório dist/managers exista
    if (!existsSync('dist/managers')) {
      mkdirSync('dist/managers', { recursive: true });
      console.log('📁 Diretório dist/managers criado');
    }

    // Copiar arquivos de managers necessários para multiplayer
    const managerFiles = [
      'JuiceManager.js',
      'AudioManager.js',
      'GameStateManager.js',
      'ShipManager.js',
      'CollisionManager.js',
      'UIManager.js',
      'BackgroundManager.js',
      'GameOverManager.js',
      'MultiplayerManager.js',
      'AssetManager.js',
      'SpriteSheetManager.js'
    ];

    managerFiles.forEach(file => {
      const srcPath = join('src/managers', file);
      const destPath = join('dist/managers', file);
      if (existsSync(srcPath)) {
        copyFileSync(srcPath, destPath);
        console.log(`✅ ${file} copiado para dist/managers/`);
      }
    });
  }
};

// Plugin para copiar arquivos de effects
const copyEffectsPlugin = {
  name: 'copy-effects-files',
  writeBundle() {
    // Garantir que o diretório dist/effects exista
    if (!existsSync('dist/effects')) {
      mkdirSync('dist/effects', { recursive: true });
      console.log('📁 Diretório dist/effects criado');
    }

    // Copiar arquivos de effects necessários para multiplayer
    const effectFiles = [
      'ParticleEffects.js',
      'UIAnimations.js',
      'TrailEffects.js'
    ];

    effectFiles.forEach(file => {
      const srcPath = join('src/effects', file);
      const destPath = join('dist/effects', file);
      if (existsSync(srcPath)) {
        copyFileSync(srcPath, destPath);
        console.log(`✅ ${file} copiado para dist/effects/`);
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
  plugins: [spaFallbackPlugin, copyHtmlPlugin, copyScenesPlugin, copyManagersPlugin, copyEffectsPlugin],
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
