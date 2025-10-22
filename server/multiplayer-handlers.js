/**
 * Multiplayer Handlers
 * Gerencia eventos de multiplayer usando PostgreSQL
 */

import {
  initDatabase,
  getOrCreateChunk,
  getChunkElements,
  updatePlayerState,
  getPlayersInChunk,
  removePlayerOnline
} from './database.js';
import { supabaseAdmin, supabaseAnonClient } from './config/supabase.js';
import ChunkManager from './chunk-manager.js';
import RedisManager from './redis-manager.js';
import ClusterManager from './cluster-manager.js';
import LoadBalancer from './load-balancer.js';

// Map de players conectados por socket (fallback local)
const connectedPlayers = new Map();

// Managers para escalabilidade
let chunkManager = null;
let redisManager = null;
let clusterManager = null;
let loadBalancer = null;

/**
 * Inicializa o sistema multiplayer com escalabilidade
 */
export async function initMultiplayer() {
  const success = await initDatabase();
  if (success) {
    console.log('✅ Sistema multiplayer inicializado com PostgreSQL');
  } else {
    console.warn('⚠️ Sistema multiplayer operando sem banco de dados');
  }

  // Inicializar RedisManager
  redisManager = new RedisManager({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    keyPrefix: 'space_crypto_miner:',
    defaultTTL: 3600, // 1 hora
    enableFallback: true
  });

  const redisConnected = await redisManager.connect();
  if (redisConnected) {
    console.log('✅ RedisManager conectado');
  } else {
    console.warn('⚠️ RedisManager usando fallback local');
  }

  // Inicializar ClusterManager
  clusterManager = new ClusterManager({
    instanceId: process.env.INSTANCE_ID || `instance-${Date.now()}`,
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    maxPlayersPerInstance: parseInt(process.env.MAX_PLAYERS_PER_INSTANCE) || 100,
    redisManager: redisManager
  });

  const clusterInitialized = await clusterManager.init(redisManager);
  if (clusterInitialized) {
    console.log('✅ ClusterManager inicializado');
  } else {
    console.warn('⚠️ ClusterManager não inicializado');
  }

  // Inicializar LoadBalancer
  loadBalancer = new LoadBalancer({
    algorithm: process.env.LOAD_BALANCER_ALGORITHM || 'least-connections',
    healthCheckInterval: 10000, // 10s
    instanceTimeout: 30000, // 30s
    maxRetries: 3
  });

  // Adicionar instância local ao LoadBalancer
  loadBalancer.addInstance(clusterManager.instanceId, {
    host: clusterManager.host,
    port: clusterManager.port,
    weight: 1,
    maxConnections: clusterManager.maxPlayersPerInstance
  });

  loadBalancer.startHealthChecks();
  console.log('✅ LoadBalancer inicializado');

  // Inicializar ChunkManager
  chunkManager = new ChunkManager({
    chunkTTL: 300000, // 5 minutos
    cleanupInterval: 60000, // 1 minuto
    maxChunksInMemory: 100,
    enableStats: true
  });

  // Iniciar cleanup automático
  chunkManager.startCleanup();

  // Configurar callback de cleanup
  chunkManager.onCleanupComplete = (stats) => {
    console.log('📊 Cleanup stats:', stats);
  };

  console.log('✅ ChunkManager inicializado e cleanup automático ativado');

  return success;
}

/**
 * Handler de autenticação
 */
export async function handleAuth(socket, data, io) {
  try {
    console.log('🔐 Auth request:', data);
    console.log('🔍 Socket ID:', socket.id);
    console.log('🔍 Token length:', data.token ? data.token.length : 'undefined');
    const { token } = data;

    if (!token) {
      console.error('❌ Token não fornecido');
      socket.emit('auth:error', { message: 'Token não fornecido' });
      return;
    }

    // 1. Validar JWT com Supabase
    console.log('🔍 Validando token com Supabase...');
    const {
      data: { user },
      error: authError,
    } = await supabaseAnonClient.auth.getUser(token);
    
    console.log('🔍 User:', user ? 'presente' : 'ausente');
    console.log('🔍 Auth error:', authError);

    if (authError || !user) {
      console.error('❌ Auth falhou:', authError?.message);
      socket.emit('auth:error', { message: 'Token inválido ou expirado' });
      return;
    }

    console.log('✅ Usuário autenticado:', user.email);

    // 2. Buscar ou criar player_state
    let { data: playerState, error: fetchError } = await supabaseAdmin
      .from('player_state')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Se não existe, criar
    if (fetchError && fetchError.code === 'PGRST116') {
      console.log(`🆕 Criando novo player_state para ${user.email}`);

      const { data: newPlayer, error: createError } = await supabaseAdmin
        .from('player_state')
        .insert({
          user_id: user.id,
          username: user.email?.split('@')[0] || 'Player',
          x: 400,
          y: 300,
          current_chunk: '0,0',
          health: 100,
          max_health: 100,
          energy: 100,
          max_energy: 100,
          resources: 0,
          experience: 0,
          level: 1,
          armor: 0,
          weapon_damage: 10,
          is_online: true,
          is_in_game: false,
          last_login: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar player_state:', createError);
        socket.emit('auth:error', { message: 'Erro ao criar estado do jogador' });
        return;
      }

      playerState = newPlayer;
    } else if (fetchError) {
      console.error('❌ Erro ao buscar player_state:', fetchError);
      socket.emit('auth:error', { message: 'Erro ao buscar estado do jogador' });
      return;
    }

    // 3. Atualizar is_online e last_login
    await supabaseAdmin
      .from('player_state')
      .update({
        is_online: true,
        last_login: new Date().toISOString(),
      })
      .eq('id', playerState.id);

    // 4. Salvar informações do socket
    socket.userId = user.id;
    socket.playerId = playerState.id;
    socket.username = playerState.username;

    // 5. Verificar se jogador já está conectado em outra instância
    if (redisManager) {
      const existingPlayer = await redisManager.getPlayerState(user.id);
      if (existingPlayer && existingPlayer.instanceId !== clusterManager?.instanceId) {
        console.log(`🔄 Jogador ${playerState.username} já conectado em instância ${existingPlayer.instanceId}`);
        
        // Notificar migração
        if (clusterManager) {
          await clusterManager.migratePlayer(user.id, existingPlayer.instanceId, 'duplicate_connection');
        }
        
        socket.emit('auth:error', { 
          message: 'Jogador já conectado em outra instância',
          redirectTo: existingPlayer.instanceId 
        });
        return;
      }

      // Armazenar estado do jogador no Redis
      const playerRedisState = {
        userId: user.id,
        playerId: playerState.id,
        username: playerState.username,
        instanceId: clusterManager?.instanceId || 'local',
        socketId: socket.id,
        connectedAt: Date.now(),
        lastSeen: Date.now(),
        chunkX: Math.floor(playerState.x / 1000),
        chunkY: Math.floor(playerState.y / 1000),
        x: playerState.x,
        y: playerState.y,
        is_in_game: false
      };

      await redisManager.setPlayerState(user.id, playerRedisState);
      
      // Adicionar jogador local ao ClusterManager
      if (clusterManager) {
        clusterManager.addLocalPlayer(user.id);
      }
      
      // Atualizar LoadBalancer
      if (loadBalancer && clusterManager) {
        loadBalancer.releaseConnection(clusterManager.instanceId);
      }
    }

    // 6. Adicionar aos players conectados (fallback local)
    connectedPlayers.set(socket.id, {
      userId: user.id,
      playerId: playerState.id,
      username: playerState.username,
      socketId: socket.id,
      chunkX: Math.floor(playerState.x / 1000),
      chunkY: Math.floor(playerState.y / 1000),
      is_in_game: false // Por padrão, não está no multiplayer
    });

    console.log('✅ Player autenticado:', playerState.username, `(Socket: ${socket.id})`);

    // Responder ao cliente
    socket.emit('auth:success', {
      playerId: playerState.id,
      username: playerState.username,
      playerState: playerState,
      instanceId: clusterManager?.instanceId || 'local'
    });

    // Notificar outras instâncias sobre novo jogador
    if (redisManager && clusterManager) {
      await redisManager.publish('cluster:events', {
        type: 'player:join',
        instanceId: clusterManager.instanceId,
        data: {
          userId: user.id,
          username: playerState.username,
          timestamp: Date.now()
        }
      });
    }

  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    socket.emit('auth:error', { message: 'Erro na autenticação' });
  }
}

/**
 * Handler para entrar em um chunk
 */
export async function handleChunkEnter(socket, data, io) {
  try {
    const { chunkX, chunkY } = data;
    if (!socket.userId) {
      socket.emit('error', { message: 'Não autenticado' });
      return;
    }

    console.log(`📍 Player ${socket.username} entrando no chunk (${chunkX}, ${chunkY})`);

    // Verificar se chunk já está carregado no ChunkManager
    const chunkId = `${chunkX},${chunkY}`;
    let chunkData = null;

    if (chunkManager && chunkManager.isChunkLoaded(chunkId)) {
      console.log(`📦 Chunk ${chunkId} já carregado, usando cache`);
      chunkData = chunkManager.getChunk(chunkId);
    } else {
      console.log(`🆕 Carregando chunk ${chunkId} do banco de dados`);
      
      // Obter ou criar o chunk do banco
      const chunk = await getOrCreateChunk(chunkX, chunkY);
      
      // Obter elementos do chunk
      const elements = await getChunkElements(chunkX, chunkY);
      
      // Preparar dados do chunk
      chunkData = {
        chunk: {
          chunkX,
          chunkY,
          zoneType: chunk.zone_type
        },
        elements: elements
      };

      // Carregar no ChunkManager se disponível
      if (chunkManager) {
        chunkManager.loadChunk(chunkId, chunkData);
      }
    }

    // Atualizar posição do jogador
    const playerState = await updatePlayerState(socket.playerId, {
      socketId: socket.id,
      x: chunkX * 1000 + 400, // Centro do chunk
      y: chunkY * 1000 + 300,
      chunkX,
      chunkY
    });

    // Obter outros players no chunk
    const playersInChunk = await getPlayersInChunk(chunkX, chunkY);

    // Converter elementos para formato esperado pelo cliente
    const asteroids = elements
      .filter(e => e.element_type === 'asteroid')
      .map(e => ({
        id: e.id,
        x: e.x,
        y: e.y,
        rotation: e.rotation,
        scale: e.scale,
        size: e.data?.size || 'small',
        health: e.data?.health || 100,
        composition: e.data?.composition || {}
      }));

    const crystals = elements
      .filter(e => e.element_type === 'crystal')
      .map(e => ({
        id: e.id,
        x: e.x,
        y: e.y,
        rotation: e.rotation,
        scale: e.scale,
        value: e.data?.value || 10,
        energy: e.data?.energy || 8,
        purity: e.data?.purity || 70
      }));

    const resources = elements
      .filter(e => e.element_type === 'resource')
      .map(e => ({
        id: e.id,
        x: e.x,
        y: e.y,
        rotation: e.rotation,
        scale: e.scale,
        resource_type: e.data?.resource_type || 'iron',
        amount: e.data?.amount || 5,
        purity: e.data?.purity || 70
      }));

    const planets = elements
      .filter(e => e.element_type === 'planet')
      .map(e => ({
        id: e.id,
        x: e.x,
        y: e.y,
        rotation: e.rotation,
        scale: e.scale || 2.0, // Planetas são maiores
        planet_type: e.data?.planet_type || 'rocky',
        size: e.data?.size || 'large',
        gravity: e.data?.gravity || 1.0,
        atmosphere: e.data?.atmosphere || false,
        resources: e.data?.resources || {}
      }));

    const npcs = elements
      .filter(e => e.element_type && e.element_type.startsWith('npc_'))
      .map(e => ({
        id: e.id,
        x: e.x,
        y: e.y,
        rotation: e.rotation,
        scale: e.scale,
        ship_type: e.data?.ship_type || 'trader',
        behavior: e.data?.behavior || 'neutral',
        cargo: e.data?.cargo || {},
        credits: e.data?.credits || 100,
        reputation: e.data?.reputation || 50
      }));

    const stations = elements
      .filter(e => e.element_type && e.element_type.startsWith('station_'))
      .map(e => ({
        id: e.id,
        x: e.x,
        y: e.y,
        rotation: e.rotation,
        scale: e.scale || 1.5,
        station_type: e.data?.station_type || 'trading_post',
        services: e.data?.services || [],
        docking_fee: e.data?.docking_fee || 20,
        reputation: e.data?.reputation || 50
      }));

    // Preparar dados dos players (excluindo o próprio jogador)
    const otherPlayers = playersInChunk
      .filter(p => p.user_id !== socket.playerId)
      .map(p => ({
        id: p.user_id,
        username: p.username,
        x: p.x,
        y: p.y,
        health: p.health,
        maxHealth: p.max_health,
        currentChunk: `(${p.chunk_x}, ${p.chunk_y})`
      }));

    // Enviar dados do chunk para o jogador
    socket.emit('chunk:data', {
      chunk: {
        chunkX,
        chunkY,
        zoneType: chunk.zone_type
      },
      asteroids,
      crystals,
      resources,
      planets,
      npcs,
      stations,
      players: otherPlayers,
      timestamp: Date.now()
    });

    // No multiplayer.html, o jogador entra automaticamente no jogo ao entrar no chunk
    const playerData = connectedPlayers.get(socket.id);
    if (playerData) {
      // Se não está no multiplayer, define como ativo automaticamente
      if (!playerData.is_in_game) {
        playerData.is_in_game = true;
        await updatePlayerState(socket.playerId, { is_in_game: true });
        console.log(`🎮 ${socket.username} ativou multiplayer automaticamente`);
      }

      console.log(`🚀 ${socket.username} está no multiplayer - emitindo player:joined para chunk (${chunkX}, ${chunkY})`);
      console.log(`📡 Emitindo player:joined para ${io.sockets.adapter.rooms.get(`chunk:${chunkX}:${chunkY}`)?.size || 0} sockets`);

      socket.to(`chunk:${chunkX}:${chunkY}`).emit('player:joined', {
        id: socket.playerId,
        username: socket.username,
        x: playerState.x,
        y: playerState.y,
        health: playerState.health,
        maxHealth: playerState.max_health,
        currentChunk: `(${chunkX}, ${chunkY})`
      });

      console.log(`✅ player:joined emitido com sucesso para ${socket.username}`);
    }

    // Juntar o socket à sala do chunk
    socket.join(`chunk:${chunkX}:${chunkY}`);

    console.log(`📦 Chunk (${chunkX}, ${chunkY}) enviado: ${asteroids.length} asteroides, ${crystals.length} cristais, ${otherPlayers.length} players`);
    console.log(`🔍 Players encontrados no chunk:`, otherPlayers.map(p => `${p.username}(${p.id})`));
    console.log(`🌐 Sockets na sala chunk:${chunkX}:${chunkY}:`, Array.from(io.sockets.adapter.rooms.get(`chunk:${chunkX}:${chunkY}`) || []));

  } catch (error) {
    console.error('❌ Erro ao entrar no chunk:', error);
    socket.emit('error', { message: 'Erro ao entrar no chunk' });
  }
}

/**
 * Handler de movimento do jogador
 */
export async function handlePlayerMove(socket, data, io) {
  try {
    const { x, y, chunkX, chunkY } = data;
    if (!socket.userId) return;

    // Atualizar estado no banco
    await updatePlayerState(socket.playerId, {
      socketId: socket.id,
      x,
      y,
      chunkX,
      chunkY
    });

    // Verificar se mudou de chunk
    const connectedPlayer = connectedPlayers.get(socket.id);
    let changedChunk = false;

    if (connectedPlayer) {
      changedChunk = connectedPlayer.chunkX !== chunkX || connectedPlayer.chunkY !== chunkY;

      if (changedChunk) {
        // Sair da sala antiga
        socket.leave(`chunk:${connectedPlayer.chunkX}:${connectedPlayer.chunkY}`);

        // Entrar na nova sala
        socket.join(`chunk:${chunkX}:${chunkY}`);

        // Atualizar chunk do player conectado
        connectedPlayer.chunkX = chunkX;
        connectedPlayer.chunkY = chunkY;

        console.log(`🔄 Player ${socket.username} mudou do chunk (${connectedPlayer.chunkX}, ${connectedPlayer.chunkY}) para (${chunkX}, ${chunkY})`);
      }
    }

    // Broadcast do movimento para players no mesmo chunk
    socket.to(`chunk:${chunkX}:${chunkY}`).emit('player:moved', {
      playerId: socket.playerId,
      username: socket.username,
      x,
      y,
      chunkX,
      chunkY,
      timestamp: Date.now()
    });

    // Se mudou de chunk, notificar players novos e antigos
    if (changedChunk) {
      // Notificar chunk antigo que o player saiu
      io.to(`chunk:${connectedPlayer.chunkX}:${connectedPlayer.chunkY}`).emit('player:left', {
        playerId: socket.playerId,
        username: socket.username
      });

      // Trigger de entrar no novo chunk
      setTimeout(() => {
        handleChunkEnter(socket, { chunkX, chunkY }, io);
      }, 100);
    }

  } catch (error) {
    console.error('❌ Erro no movimento:', error);
  }
}

/**
 * Handler de ataque
 */
export async function handleAttack(socket, data, io) {
  try {
    const { targetId } = data;
    if (!socket.userId) return;

    // Obter posições dos jogadores
    const attacker = connectedPlayers.get(socket.id);
    const targetSocket = Array.from(connectedPlayers.values()).find(p => p.userId === targetId);

    if (!attacker || !targetSocket) {
      socket.emit('battle:attack:failed', { reason: 'Alvo não encontrado' });
      return;
    }

    // Verificar se estão no mesmo chunk
    if (attacker.chunkX !== targetSocket.chunkX || attacker.chunkY !== targetSocket.chunkY) {
      socket.emit('battle:attack:failed', { reason: 'Alvo muito distante' });
      return;
    }

    // Calcular dano (simples por enquanto)
    const damage = Math.floor(Math.random() * 20) + 10; // 10-30 dano
    const isCritical = Math.random() < 0.2; // 20% chance de crítico

    // Notificar chunk sobre o ataque
    io.to(`chunk:${attacker.chunkX}:${attacker.chunkY}`).emit('battle:attack', {
      attackerId: socket.playerId,
      attackerName: socket.username,
      defenderId: targetId,
      defenderName: targetSocket.username,
      damage,
      isCritical,
      timestamp: Date.now()
    });

    // Resposta de sucesso ao atacante
    socket.emit('battle:attack:success', {
      targetId,
      damage,
      isCritical
    });

    // TODO: Aplicar dano real ao defensor (reduzir vida no banco)
    console.log(`⚔️ ${socket.username} atacou ${targetSocket.username} (-${damage} HP)`);

  } catch (error) {
    console.error('❌ Erro no ataque:', error);
    socket.emit('battle:attack:failed', { reason: 'Erro no ataque' });
  }
}

/**
 * Handler de respawn
 */
export async function handleRespawn(socket, data, io) {
  try {
    if (!socket.userId) return;

    // Resetar posição e vida
    const playerState = await updatePlayerState(socket.playerId, {
      socketId: socket.id,
      x: 400,
      y: 300,
      chunkX: 0,
      chunkY: 0,
      health: 100
    });

    // Notificar respawn
    socket.emit('player:respawned', {
      x: playerState.x,
      y: playerState.y,
      chunkX: playerState.chunk_x,
      chunkY: playerState.chunk_y,
      health: playerState.health,
      maxHealth: playerState.max_health
    });

    console.log(`🔄 Player ${socket.username} deu respawn`);

  } catch (error) {
    console.error('❌ Erro no respawn:', error);
  }
}

/**
 * Handler de desconexão
 */
export async function handleDisconnect(socket, reason, io) {
  try {
    if (!socket.userId) return;

    console.log(`👋 Player ${socket.username} desconectou: ${reason}`);

    // Remover do Redis se disponível
    if (redisManager) {
      await redisManager.removePlayerState(socket.userId);
      
      // Remover jogador local do ClusterManager
      if (clusterManager) {
        clusterManager.removeLocalPlayer(socket.userId);
      }
      
      // Notificar outras instâncias sobre desconexão
      await redisManager.publish('cluster:events', {
        type: 'player:leave',
        instanceId: clusterManager?.instanceId || 'local',
        data: {
          userId: socket.userId,
          username: socket.username,
          reason: reason,
          timestamp: Date.now()
        }
      });
    }

    // Remover do banco
    await removePlayerOnline(socket.id);

    // Remover dos players conectados
    const connectedPlayer = connectedPlayers.get(socket.id);
    if (connectedPlayer) {
      // Notificar chunk que o player saiu
      io.to(`chunk:${connectedPlayer.chunkX}:${connectedPlayer.chunkY}`).emit('player:left', {
        playerId: socket.playerId,
        username: socket.username
      });

      connectedPlayers.delete(socket.id);
    }

    console.log(`📊 Players conectados: ${connectedPlayers.size}`);

  } catch (error) {
    console.error('❌ Erro na desconexão:', error);
  }
}

/**
 * Handler para entrar no jogo (play:start)
 */
export async function handlePlayStart(socket, data, io) {
  try {
    if (!socket.userId) {
      socket.emit('error', { message: 'Não autenticado' });
      return;
    }

    console.log(`🎮 ${socket.username} está entrando no multiplayer`);

    // Marcar jogador como ativo no multiplayer
    const playerData = connectedPlayers.get(socket.id);
    if (playerData) {
      playerData.is_in_game = true;
    }

    // Atualizar no banco também
    await updatePlayerState(socket.playerId, {
      is_in_game: true
    });

    // Notificar outros players do chunk atual
    if (playerData) {
      console.log(`🚀 ${socket.username} está no multiplayer - emitindo player:joined para chunk (${playerData.chunkX}, ${playerData.chunkY})`);
      socket.to(`chunk:${playerData.chunkX}:${playerData.chunkY}`).emit('player:joined', {
        id: socket.playerId,
        username: socket.username,
        x: 400, // Posição padrão
        y: 300,
        health: 100,
        maxHealth: 100,
        currentChunk: `(${playerData.chunkX}, ${playerData.chunkY})`
      });
    }

    socket.emit('play:started', { success: true });
    console.log(`✅ ${socket.username} entrou no multiplayer`);

  } catch (error) {
    console.error('❌ Erro no handlePlayStart:', error);
    socket.emit('error', { message: 'Erro ao entrar no jogo' });
  }
}

/**
 * Handler para sair do jogo (play:stop)
 */
export async function handlePlayStop(socket, data, io) {
  try {
    if (!socket.userId) return;

    console.log(`🚪 ${socket.username} está saindo do multiplayer`);

    // Marcar jogador como inativo no multiplayer
    const playerData = connectedPlayers.get(socket.id);
    if (playerData) {
      playerData.is_in_game = false;
    }

    // Atualizar no banco também
    await updatePlayerState(socket.playerId, {
      is_in_game: false
    });

    // Notificar outros players que saiu
    if (playerData) {
      socket.to(`chunk:${playerData.chunkX}:${playerData.chunkY}`).emit('player:left', {
        playerId: socket.playerId,
        username: socket.username
      });
    }

    socket.emit('play:stopped', { success: true });
    console.log(`✅ ${socket.username} saiu do multiplayer`);

  } catch (error) {
    console.error('❌ Erro no handlePlayStop:', error);
  }
}

/**
 * Obtém estatísticas do servidor
 */
export function getServerStats() {
  const baseStats = {
    connectedPlayers: connectedPlayers.size,
    playersByChunk: Array.from(connectedPlayers.values()).reduce((acc, player) => {
      const key = `${player.chunkX},${player.chunkY}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
    timestamp: Date.now()
  };

  // Adicionar estatísticas do ChunkManager se disponível
  if (chunkManager) {
    baseStats.chunkManager = chunkManager.getStats();
  }

  // Adicionar estatísticas do RedisManager se disponível
  if (redisManager) {
    baseStats.redisManager = redisManager.getStats();
  }

  // Adicionar estatísticas do ClusterManager se disponível
  if (clusterManager) {
    baseStats.clusterManager = clusterManager.getStats();
  }

  // Adicionar estatísticas do LoadBalancer se disponível
  if (loadBalancer) {
    baseStats.loadBalancer = loadBalancer.getStats();
  }

  return baseStats;
}