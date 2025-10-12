# Space Crypto Miner - Guia de Desenvolvimento

## 🚀 Configuração de Desenvolvimento

### Estrutura de Páginas

- **`/` (Produção)**: Página "Coming Soon" (`soon.html`)
- **`/login` (Desenvolvimento)**: Página de Login (`login.html`)
- **`/game`**: Jogo principal (`game.html`)
- **`/original`**: Página original de backup (`index-backup.html`)

### Como Executar

#### Desenvolvimento (com acesso ao login)
```bash
npm run dev
# ou
npm run dev-login
```
Acesse: http://localhost:3000 (mostra login.html)

#### Desenvolvimento com Vite (apenas jogo)
```bash
npm run dev-vite
```
Acesse: http://localhost:5173/game.html

### URLs Disponíveis

- **Login**: http://localhost:3000/login
- **Jogo**: http://localhost:3000/game
- **Coming Soon**: http://localhost:3000/soon
- **Original**: http://localhost:3000/original

### Produção (Vercel)

- **Página Principal**: https://spaceshiponsol.vercel.app/ (Coming Soon)
- **Login**: https://spaceshiponsol.vercel.app/login
- **Jogo**: https://spaceshiponsol.vercel.app/game

### Configuração

O arquivo `dev-config.js` permite alternar entre desenvolvimento e produção:

```javascript
const DEV_CONFIG = {
    isDevelopment: true, // true = dev, false = prod
    // ...
};
```

### Estrutura de Arquivos

```
├── index.html          # Página principal (Coming Soon)
├── login.html          # Página de login
├── game.html           # Jogo principal
├── soon.html           # Página Coming Soon
├── index-backup.html   # Backup da página original
├── dev-server.js       # Servidor de desenvolvimento
├── dev-config.js       # Configuração de ambiente
└── vercel.json         # Configuração do Vercel
```

### Fontes Personalizadas

- **SD Glitch Robot**: Fonte principal para títulos
- **Exo 2**: Fonte secundária
- **Audiowide**: Fallback para títulos
- **Share Tech Mono**: Fallback para monospace

### Comandos Úteis

```bash
# Desenvolvimento com login
npm run dev

# Desenvolvimento apenas jogo
npm run dev-vite

# Build para produção
npm run build

# Preview da build
npm run preview
```
