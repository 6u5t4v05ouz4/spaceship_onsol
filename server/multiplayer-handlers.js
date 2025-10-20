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

// Map de players conectados por socket
const connectedPlayers = new Map();

/**
 * Inicializa o sistema multiplayer
 */
export async function initMultiplayer() {
  const success = await initDatabase();
  if (success) {
    console.log('✅ Sistema multiplayer inicializado com PostgreSQL');
  } else {
    console.warn('⚠️ Sistema multiplayer operando sem banco de dados');
  }
  return success;
}

/**
 * Handler de autenticação
 */
export async function handleAuth(socket, data, io) {
  try {
    console.log('🔐 Auth request:', data.userId ? data.userId.substring(0, 8) : 'unknown');

    // Em produção, aqui você validaria o token com Supabase
    // Por enquanto, aceitamos qualquer userId
    const userId = data.userId || `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const username = data.username || `Player_${userId.substring(0, 8)}`;

    // Salvar informações do socket
    socket.userId = userId;
    socket.username = username;

    // Atualizar estado do jogador no banco
    const playerState = await updatePlayerState(userId, {
      username,
      socketId: socket.id,
      x: 400, // Posição inicial
      y: 300,
      chunkX: 0,
      chunkY: 0,
      health: 100
    });

    // Adicionar aos players conectados
    connectedPlayers.set(socket.id, {
      userId,
      username,
      socketId: socket.id,
      chunkX: 0,
      chunkY: 0
    });

    console.log('✅ Player autenticado:', username, `(Socket: ${socket.id})`);

    // Responder ao cliente
    socket.emit('auth:success', {
      playerId: userId,
      username,
      playerState
    });

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

    // Atualizar posição do jogador
    const playerState = await updatePlayerState(socket.userId, {
      socketId: socket.id,
      x: chunkX * 1000 + 400, // Centro do chunk
      y: chunkY * 1000 + 300,
      chunkX,
      chunkY
    });

    // Atualizar chunk do player conectado
    const connectedPlayer = connectedPlayers.get(socket.id);
    if (connectedPlayer) {
      connectedPlayer.chunkX = chunkX;
      connectedPlayer.chunkY = chunkY;
    }

    // Obter ou criar o chunk
    const chunk = await getOrCreateChunk(chunkX, chunkY);

    // Obter elementos do chunk
    const elements = await getChunkElements(chunkX, chunkY);

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
      .filter(p => p.user_id !== socket.userId)
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

    // Notificar outros players no chunk sobre a chegada
    socket.to(`chunk:${chunkX}:${chunkY}`).emit('player:joined', {
      id: socket.userId,
      username: socket.username,
      x: playerState.x,
      y: playerState.y,
      health: playerState.health,
      maxHealth: playerState.max_health,
      currentChunk: `(${chunkX}, ${chunkY})`
    });

    // Juntar o socket à sala do chunk
    socket.join(`chunk:${chunkX}:${chunkY}`);

    console.log(`📦 Chunk (${chunkX}, ${chunkY}) enviado: ${asteroids.length} asteroides, ${crystals.length} cristais, ${otherPlayers.length} players`);

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
    await updatePlayerState(socket.userId, {
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
      playerId: socket.userId,
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
        playerId: socket.userId,
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
      attackerId: socket.userId,
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
    const playerState = await updatePlayerState(socket.userId, {
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

    // Remover do banco
    await removePlayerOnline(socket.id);

    // Remover dos players conectados
    const connectedPlayer = connectedPlayers.get(socket.id);
    if (connectedPlayer) {
      // Notificar chunk que o player saiu
      io.to(`chunk:${connectedPlayer.chunkX}:${connectedPlayer.chunkY}`).emit('player:left', {
        playerId: socket.userId,
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
 * Obtém estatísticas do servidor
 */
export function getServerStats() {
  return {
    connectedPlayers: connectedPlayers.size,
    playersByChunk: Array.from(connectedPlayers.values()).reduce((acc, player) => {
      const key = `${player.chunkX},${player.chunkY}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  };
}