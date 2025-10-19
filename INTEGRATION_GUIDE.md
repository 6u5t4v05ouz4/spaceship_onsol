# 🔗 Guia de Integração - Frontend ↔ Servidor

Guia completo para integrar o frontend do Space Crypto Miner com o servidor Node.js.

---

## 📋 Pré-requisitos

- ✅ Servidor rodando em `http://localhost:3001`
- ✅ Frontend rodando em `http://localhost:3000` ou `http://localhost:5173`
- ✅ Supabase configurado em ambos
- ✅ Usuário autenticado no frontend

---

## 🚀 Passo 1: Instalar Socket.io Client no Frontend

```bash
npm install socket.io-client
```

---

## 🔌 Passo 2: Criar Cliente WebSocket

Crie `src/services/socketService.js`:

```javascript
import { io } from 'socket.io-client';
import { supabase } from './supabaseClient';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.authenticated = false;
    this.playerId = null;
    this.playerState = null;
  }

  /**
   * Conecta ao servidor WebSocket
   */
  connect() {
    if (this.socket?.connected) {
      console.log('✅ Já conectado');
      return;
    }

    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

    this.socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupListeners();
  }

  /**
   * Configura event listeners
   */
  setupListeners() {
    // Conexão
    this.socket.on('connect', () => {
      console.log('✅ Conectado ao servidor:', this.socket.id);
      this.connected = true;
      
      // Auto-autenticar se já temos sessão
      this.authenticateIfNeeded();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado:', reason);
      this.connected = false;
      this.authenticated = false;
    });

    // Autenticação
    this.socket.on('auth:success', (data) => {
      console.log('✅ Autenticado:', data);
      this.authenticated = true;
      this.playerId = data.playerId;
      this.playerState = data.playerState;
      
      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('socket:authenticated', { detail: data }));
    });

    this.socket.on('auth:error', (data) => {
      console.error('❌ Erro de autenticação:', data.message);
      window.dispatchEvent(new CustomEvent('socket:auth:error', { detail: data }));
    });

    // Chunk
    this.socket.on('chunk:data', (data) => {
      console.log('📦 Dados do chunk:', data);
      window.dispatchEvent(new CustomEvent('socket:chunk:data', { detail: data }));
    });

    // Players
    this.socket.on('player:joined', (data) => {
      console.log('👤 Player entrou:', data.username);
      window.dispatchEvent(new CustomEvent('socket:player:joined', { detail: data }));
    });

    this.socket.on('player:left', (data) => {
      console.log('👋 Player saiu:', data.playerId);
      window.dispatchEvent(new CustomEvent('socket:player:left', { detail: data }));
    });

    this.socket.on('player:moved', (data) => {
      window.dispatchEvent(new CustomEvent('socket:player:moved', { detail: data }));
    });

    // Combate
    this.socket.on('battle:hit', (data) => {
      console.log('💥 Você foi atingido:', data);
      window.dispatchEvent(new CustomEvent('socket:battle:hit', { detail: data }));
    });

    this.socket.on('battle:attack', (data) => {
      console.log('⚔️ Combate no chunk:', data);
      window.dispatchEvent(new CustomEvent('socket:battle:attack', { detail: data }));
    });

    this.socket.on('player:died', (data) => {
      console.log('💀 Player morreu:', data);
      window.dispatchEvent(new CustomEvent('socket:player:died', { detail: data }));
    });

    this.socket.on('player:death', (data) => {
      console.log('💀 Você morreu!', data);
      window.dispatchEvent(new CustomEvent('socket:player:death', { detail: data }));
    });

    this.socket.on('player:respawned', (data) => {
      console.log('🔄 Respawn:', data);
      window.dispatchEvent(new CustomEvent('socket:player:respawned', { detail: data }));
    });

    // Erros
    this.socket.on('error', (data) => {
      console.error('❌ Erro:', data.message);
      window.dispatchEvent(new CustomEvent('socket:error', { detail: data }));
    });
  }

  /**
   * Autentica com o servidor
   */
  async authenticate() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('❌ Sem sessão ativa');
      return false;
    }

    console.log('🔐 Autenticando...');
    this.socket.emit('auth', {
      token: session.access_token,
    });

    return true;
  }

  /**
   * Auto-autentica se necessário
   */
  async authenticateIfNeeded() {
    if (!this.authenticated && this.connected) {
      await this.authenticate();
    }
  }

  /**
   * Entra em um chunk
   */
  enterChunk(chunkX, chunkY) {
    if (!this.authenticated) {
      console.error('❌ Não autenticado');
      return;
    }

    console.log(`📍 Entrando no chunk (${chunkX}, ${chunkY})`);
    this.socket.emit('chunk:enter', { chunkX, chunkY });
  }

  /**
   * Atualiza posição
   */
  updatePosition(x, y, chunkX, chunkY) {
    if (!this.authenticated) return;

    this.socket.emit('player:move', { x, y, chunkX, chunkY });
  }

  /**
   * Ataca outro jogador
   */
  attack(targetId) {
    if (!this.authenticated) {
      console.error('❌ Não autenticado');
      return;
    }

    console.log(`⚔️ Atacando ${targetId}`);
    this.socket.emit('battle:attack', { targetId });
  }

  /**
   * Solicita respawn
   */
  respawn() {
    if (!this.authenticated) {
      console.error('❌ Não autenticado');
      return;
    }

    console.log('🔄 Solicitando respawn...');
    this.socket.emit('battle:respawn', {});
  }

  /**
   * Desconecta
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.authenticated = false;
    }
  }

  /**
   * Verifica se está conectado
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Verifica se está autenticado
   */
  isAuthenticated() {
    return this.authenticated;
  }

  /**
   * Obtém estado do jogador
   */
  getPlayerState() {
    return this.playerState;
  }
}

// Singleton
const socketService = new SocketService();

export default socketService;
```

---

## 🎮 Passo 3: Integrar no Game (Phaser)

Modifique seu `GameScene.js` para usar o WebSocket:

```javascript
import socketService from '../services/socketService';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentChunk = { x: 0, y: 0 };
    this.otherPlayers = new Map();
  }

  create() {
    // Conectar ao servidor
    socketService.connect();

    // Aguardar autenticação
    window.addEventListener('socket:authenticated', (e) => {
      console.log('✅ Autenticado no jogo:', e.detail);
      
      // Entrar no chunk inicial
      socketService.enterChunk(0, 0);
    });

    // Receber dados do chunk
    window.addEventListener('socket:chunk:data', (e) => {
      this.handleChunkData(e.detail);
    });

    // Players entrando/saindo
    window.addEventListener('socket:player:joined', (e) => {
      this.addOtherPlayer(e.detail);
    });

    window.addEventListener('socket:player:left', (e) => {
      this.removeOtherPlayer(e.detail.playerId);
    });

    window.addEventListener('socket:player:moved', (e) => {
      this.updateOtherPlayer(e.detail);
    });

    // Combate
    window.addEventListener('socket:battle:hit', (e) => {
      this.handleHit(e.detail);
    });

    window.addEventListener('socket:player:death', (e) => {
      this.handleDeath(e.detail);
    });

    // Criar jogador local
    this.createPlayer();
  }

  handleChunkData(data) {
    console.log('📦 Chunk data:', data);

    // Limpar chunk anterior
    this.clearChunk();

    // Criar asteroides
    data.asteroids.forEach(asteroid => {
      this.createAsteroid(asteroid);
    });

    // Criar outros players
    data.players.forEach(player => {
      this.addOtherPlayer(player);
    });
  }

  update() {
    if (!this.player) return;

    // Atualizar posição no servidor (throttle: 100ms)
    if (!this.lastPositionUpdate || Date.now() - this.lastPositionUpdate > 100) {
      const chunkX = Math.floor(this.player.x / 1000);
      const chunkY = Math.floor(this.player.y / 1000);

      socketService.updatePosition(
        Math.floor(this.player.x),
        Math.floor(this.player.y),
        chunkX,
        chunkY
      );

      this.lastPositionUpdate = Date.now();

      // Verificar mudança de chunk
      if (chunkX !== this.currentChunk.x || chunkY !== this.currentChunk.y) {
        this.currentChunk = { x: chunkX, y: chunkY };
        socketService.enterChunk(chunkX, chunkY);
      }
    }
  }

  handleAttack(targetId) {
    socketService.attack(targetId);
  }

  handleHit(data) {
    // Mostrar dano
    this.showDamageText(data.damage, data.isCritical);
    
    // Atualizar health
    this.updateHealth(data.health, data.maxHealth);

    // Se morreu
    if (data.wasFatal) {
      this.handleDeath(data);
    }
  }

  handleDeath(data) {
    console.log('💀 Você morreu!');
    
    // Mostrar tela de morte
    this.showDeathScreen(data);

    // Auto-respawn após delay
    setTimeout(() => {
      socketService.respawn();
    }, data.respawnDelay || 5000);
  }

  addOtherPlayer(data) {
    // Criar sprite do outro player
    const sprite = this.add.sprite(data.x, data.y, 'player');
    
    // Adicionar nome
    const nameText = this.add.text(data.x, data.y - 40, data.username, {
      fontSize: '12px',
      color: '#00ff88',
    }).setOrigin(0.5);

    this.otherPlayers.set(data.playerId, {
      sprite,
      nameText,
      data,
    });
  }

  updateOtherPlayer(data) {
    const player = this.otherPlayers.get(data.playerId);
    if (player) {
      // Animar movimento
      this.tweens.add({
        targets: [player.sprite, player.nameText],
        x: data.x,
        y: data.y,
        duration: 100,
      });
    }
  }

  removeOtherPlayer(playerId) {
    const player = this.otherPlayers.get(playerId);
    if (player) {
      player.sprite.destroy();
      player.nameText.destroy();
      this.otherPlayers.delete(playerId);
    }
  }
}
```

---

## 🎨 Passo 4: Integrar no Dashboard

Adicione status de conexão no dashboard:

```javascript
// src/web/pages/DashboardPage.js
import socketService from '../../services/socketService';

export default class DashboardPage {
  render() {
    const container = document.createElement('div');
    container.className = 'dashboard-page';

    // Status do servidor
    const serverStatus = document.createElement('div');
    serverStatus.className = 'server-status';
    serverStatus.innerHTML = `
      <div class="status-indicator">
        <span class="dot ${socketService.isConnected() ? 'online' : 'offline'}"></span>
        <span>Servidor: ${socketService.isConnected() ? 'Online' : 'Offline'}</span>
      </div>
    `;

    container.appendChild(serverStatus);

    // Conectar automaticamente
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    return container;
  }
}
```

---

## 🔧 Passo 5: Configurar Variáveis de Ambiente

Adicione ao `.env.local` do frontend:

```env
VITE_SERVER_URL=http://localhost:3001
```

Para produção:
```env
VITE_SERVER_URL=https://seu-servidor.railway.app
```

---

## 🧪 Passo 6: Testar Integração

### 1. Iniciar Servidor
```bash
cd server
npm run dev
```

### 2. Iniciar Frontend
```bash
npm run dev
```

### 3. Fazer Login
- Acesse `http://localhost:3000`
- Faça login com Google

### 4. Verificar Console
Você deve ver:
```
✅ Conectado ao servidor: abc123
🔐 Autenticando...
✅ Autenticado: { playerId: 'uuid', ... }
📍 Entrando no chunk (0, 0)
📦 Dados do chunk: { chunk: {...}, asteroids: [...], players: [...] }
```

---

## 🎮 Passo 7: Testar Multi-Player

1. Abra 2 abas do navegador
2. Faça login em ambas (usuários diferentes)
3. Entre no mesmo chunk
4. Mova um player
5. Observe o outro player se movendo em tempo real

---

## ⚔️ Passo 8: Testar Combate

1. Entre em uma zona hostile (chunk 51, 0)
2. Ataque outro player:
   ```javascript
   socketService.attack('uuid-do-outro-player');
   ```
3. Observe os eventos de combate

---

## 📊 Monitoramento

### Verificar Conexão
```javascript
console.log('Conectado:', socketService.isConnected());
console.log('Autenticado:', socketService.isAuthenticated());
console.log('Player State:', socketService.getPlayerState());
```

### Verificar Servidor
```bash
curl http://localhost:3001/metrics
```

---

## 🐛 Troubleshooting

### Erro: "CORS"
**Solução:** Adicione frontend URL no `server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

### Erro: "auth:error"
**Solução:** Verifique se o JWT token é válido:
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Token:', session?.access_token);
```

### Players não aparecem
**Solução:** Verifique se estão no mesmo chunk:
```javascript
console.log('Current chunk:', socketService.playerState?.current_chunk);
```

---

## 🚀 Deploy

### Frontend
1. Atualizar `VITE_SERVER_URL` para URL de produção
2. Build: `npm run build`
3. Deploy no Vercel/Netlify

### Servidor
1. Deploy no Railway/Render
2. Configurar variáveis de ambiente
3. Atualizar CORS com URL do frontend

---

## ✅ Checklist de Integração

- [ ] Socket.io client instalado
- [ ] socketService.js criado
- [ ] GameScene integrado
- [ ] Dashboard com status
- [ ] Variáveis de ambiente configuradas
- [ ] Teste de conexão funcionando
- [ ] Teste de autenticação funcionando
- [ ] Teste de movimento funcionando
- [ ] Teste multi-player funcionando
- [ ] Teste de combate funcionando

---

**Próximo:** Testar tudo e fazer deploy! 🎉

