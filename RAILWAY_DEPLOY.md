# Railway Deploy Configuration

## Frontend (Vite + Node.js Server)

### Build Process:
1. **Frontend Build**: `npm run build` - Gera arquivos estáticos em `/dist`
2. **Server Build**: `cd server && npm install` - Instala dependências do servidor
3. **Start**: `npm run start` - Inicia servidor Node.js que serve frontend + WebSocket

### Environment Variables:
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-app.railway.app

# Redis (opcional)
REDIS_URL=redis://localhost:6379
```

### Railway Configuration:
- **Build Command**: `npm run build && cd server && npm install`
- **Start Command**: `npm run start`
- **Node Version**: 18+

### File Structure:
```
/
├── dist/                 # Frontend build (Vite)
├── server/              # Node.js server
├── railway.json         # Railway config
├── package.json         # Root package.json
└── vercel.json         # Vercel config (backup)
```

### Start Script:
```json
{
  "scripts": {
    "start": "cd server && node server.js"
  }
}
```

### Notes:
- Railway detecta automaticamente Node.js
- Usa Nixpacks para build
- Servidor serve frontend estático + WebSocket
- Variáveis de ambiente configuradas no Railway Dashboard
