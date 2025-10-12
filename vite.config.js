import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        game: 'game.html'
      }
    }
  },
  server: {
    open: '/',
    port: 3000
  }
});
