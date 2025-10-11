import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: 'game.html'
    }
  },
  server: {
    open: '/game.html',
    port: 3000
  }
});
