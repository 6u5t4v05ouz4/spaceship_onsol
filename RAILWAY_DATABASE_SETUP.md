# Railway Database Setup Guide

## 🗄️ Configurar PostgreSQL no Railway

### 1. Adicionar PostgreSQL ao seu projeto Railway

1. Acesse o dashboard do Railway
2. Selecione seu projeto `space-crypto-miner`
3. Clique em "New Service"
4. Escolha "Add PostgreSQL"
5. Dê um nome: `space-crypto-miner-db`

### 2. Configurar Variáveis de Ambiente

No Railway Dashboard, vá para seu serviço principal (Node.js) e adicione estas variáveis de ambiente:

```bash
# Database Connection
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# Substitua com seus valores reais do Railway:
# - postgres: usuário do banco
# - password: senha gerada pelo Railway
# - containers-us-west-xxx.railway.app: host do banco
# - railway: nome do banco de dados
```

**Como obter a DATABASE_URL:**
1. Vá para o serviço PostgreSQL no Railway
2. Clique na aba "Connect"
3. Copie a "Connection URL" do formato PostgreSQL
4. Cole na variável DATABASE_URL do seu serviço Node.js

### 3. Verificar Conexão

Após configurar as variáveis, o sistema deverá:

1. **Automaticamente criar as tabelas** na primeira inicialização
2. **Conectar-se ao banco** PostgreSQL
3. **Logar sucesso** no console: `✅ PostgreSQL conectado`

### 4. Estrutura do Banco de Dados

O sistema criará automaticamente estas tabelas:

#### `chunks`
- Armazena informações dos chunks do mapa
- Tipos de zona: `safe`, `hostile`, `resource`
- Primary key: (chunk_x, chunk_y)

#### `chunk_elements`
- Elementos dentro dos chunks (asteroides, cristais)
- Posições X/Y relativas ao chunk
- Dados JSON para propriedades personalizadas

#### `player_state`
- Estado dos jogadores online
- Posição, vida, chunk atual
- Status online/offline

#### `chunk_events`
- Eventos de sincronização do chunk
- Log de ações dos jogadores

### 5. Testar Funcionamento

#### Verificar logs do servidor:
```bash
✅ PostgreSQL conectado: 2025-01-20T...
✅ Sistema multiplayer inicializado com PostgreSQL
```

#### Testar com 2 navegadores:
1. Abra o jogo em 2 janelas/anônimas
2. Faça login com contas diferentes
3. Mova os jogadores para o mesmo chunk
4. Deverão ver um ao outro

### 6. Troubleshooting

#### Erro: "DATABASE_URL não configurada"
- **Causa:** Variável de ambiente não definida
- **Solução:** Adicione DATABASE_URL nas configurações do serviço

#### Erro: "password authentication failed"
- **Causa:** URL do banco incorreta
- **Solução:** Copie exatamente a Connection URL do Railway

#### Erro: "relation does not exist"
- **Causa:** Tabelas não criadas
- **Solução:** Reinicie o serviço para recriar tabelas

#### Players não aparecem:
- **Verifique:** Console do navegador para erros
- **Verifique:** Logs do servidor para eventos
- **Verifique:** Se ambos estão no mesmo chunk

### 7. Consultas SQL Úteis

#### Verificar jogadores online:
```sql
SELECT username, chunk_x, chunk_y, health, last_seen
FROM player_state
WHERE is_online = true;
```

#### Verificar chunks criados:
```sql
SELECT chunk_x, chunk_y, zone_type, created_at
FROM chunks
ORDER BY created_at DESC
LIMIT 10;
```

#### Verificar elementos em um chunk:
```sql
SELECT element_type, x, y, data
FROM chunk_elements
WHERE chunk_x = 0 AND chunk_y = 0;
```

### 8. Performance

O sistema usa:
- **Connection Pooling** (máx 20 conexões)
- **Índices** para queries rápidas
- **Sala por chunk** para reduzir broadcast
- **Throttle** de posição (100ms)

### 9. Backup

O Railway faz backup automático do PostgreSQL, mas você pode:
- Exportar dados via pg_dump
- Conectar com clientes PostgreSQL (DBeaver, TablePlus)
- Monitorar performance no dashboard Railway

---

## ✅ Checklist Final

- [ ] PostgreSQL adicionado ao projeto Railway
- [ ] DATABASE_URL configurada no serviço Node.js
- [ ] Logs mostram conexão bem-sucedida
- [ ] Tabelas criadas automaticamente
- [ ] 2 jogadores conseguem se ver no mesmo chunk
- [ ] Movimento sincronizado entre jogadores
- [ ] Asteroides aparecem para ambos os jogadores

Quando todos estiverem marcados, seu mapa compartilhado estará funcionando! 🎉