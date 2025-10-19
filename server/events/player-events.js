/**
 * Player Events
 * Handlers para eventos WebSocket relacionados a jogadores
 */

import { supabaseAdmin, supabaseAnonClient } from '../config/supabase.js';
import cacheManager from '../managers/cache-manager.js';
import zoneManager from '../managers/zone-manager.js';
import chunkGenerator from '../engines/chunk-generator.js';
import logger from '../utils/logger.js';

/**
 * Handler: auth
 * Autentica jogador via JWT e carrega seu estado
 */
export async function handleAuth(socket, data, io) {
  try {
    const { token } = data;

    if (!token) {
      socket.emit('auth:error', { message: 'Token não fornecido' });
      return;
    }

    // 1. Validar JWT com Supabase
    const {
      data: { user },
      error: authError,
    } = await supabaseAnonClient.auth.getUser(token);

    if (authError || !user) {
      logger.warn(`❌ Auth falhou: ${authError?.message}`);
      socket.emit('auth:error', { message: 'Token inválido ou expirado' });
      return;
    }

    // 2. Buscar ou criar player_state
    let { data: playerState, error: fetchError } = await supabaseAdmin
      .from('player_state')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Se não existe, criar
    if (fetchError && fetchError.code === 'PGRST116') {
      logger.info(`🆕 Criando novo player_state para ${user.email}`);

      const { data: newPlayer, error: createError } = await supabaseAdmin
        .from('player_state')
        .insert({
          user_id: user.id,
          username: user.email?.split('@')[0] || 'Player',
          x: 0,
          y: 0,
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
          last_login: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        logger.error('❌ Erro ao criar player_state:', createError);
        socket.emit('auth:error', { message: 'Erro ao criar estado do jogador' });
        return;
      }

      playerState = newPlayer;
    } else if (fetchError) {
      logger.error('❌ Erro ao buscar player_state:', fetchError);
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

    // 4. Adicionar ao cache
    cacheManager.addPlayer(playerState.id, {
      ...playerState,
      socketId: socket.id,
      userId: user.id,
    });

    // 5. Armazenar playerId no socket para referência
    socket.playerId = playerState.id;
    socket.userId = user.id;

    // 6. Entrar na room do chunk
    socket.join(`chunk:${playerState.current_chunk}`);

    // 7. Confirmar autenticação
    socket.emit('auth:success', {
      playerId: playerState.id,
      playerState: playerState,
    });

    logger.info(`✅ Player autenticado: ${playerState.username} (${playerState.id})`);

    // 8. Notificar outros players no chunk
    socket.to(`chunk:${playerState.current_chunk}`).emit('player:joined', {
      id: playerState.id, // IMPORTANTE: usar 'id' não 'playerId'
      username: playerState.username,
      x: playerState.x,
      y: playerState.y,
      health: playerState.health,
      max_health: playerState.max_health,
      current_chunk: playerState.current_chunk,
    });
  } catch (error) {
    logger.error('❌ Erro no handleAuth:', error);
    socket.emit('auth:error', { message: 'Erro interno ao autenticar' });
  }
}

/**
 * Handler: chunk:enter
 * Carrega dados do chunk quando jogador entra
 */
export async function handleChunkEnter(socket, data, io) {
  try {
    const player = cacheManager.getPlayerBySocket(socket.id);

    if (!player) {
      socket.emit('error', { message: 'Player não autenticado' });
      return;
    }

    const { chunkX, chunkY } = data;
    const chunkId = `${chunkX},${chunkY}`;

    logger.debug(`📍 ${player.username} entrando no chunk ${chunkId}`);

    // 1. Sair da room do chunk anterior
    if (player.current_chunk) {
      socket.leave(`chunk:${player.current_chunk}`);

      // Notificar saída
      socket.to(`chunk:${player.current_chunk}`).emit('player:left', {
        playerId: player.id,
      });
    }

    // 2. Entrar na room do novo chunk
    socket.join(`chunk:${chunkId}`);

    // 3. Atualizar posição no cache
    cacheManager.updatePosition(player.id, player.x, player.y, chunkId);

    // 4. Buscar ou criar chunk no banco
    let { data: chunk, error: fetchError } = await supabaseAdmin
      .from('chunks')
      .select('*')
      .eq('chunk_x', chunkX)
      .eq('chunk_y', chunkY)
      .single();

    // Se não existe, criar usando Chunk Generator
    if (fetchError && fetchError.code === 'PGRST116') {
      const chunkData = chunkGenerator.generateChunkData(chunkX, chunkY);

      const { data: newChunk, error: createError } = await supabaseAdmin
        .from('chunks')
        .insert(chunkData)
        .select()
        .single();

      if (createError) {
        logger.error('❌ Erro ao criar chunk:', createError);
      } else {
        chunk = newChunk;
        logger.info(`🆕 Chunk criado: ${chunkId} (${chunkData.zone_type}) - Bioma: ${chunkData.biome_type}`);

        // Gerar asteroides para o novo chunk
        const asteroids = chunkGenerator.generateAsteroids(chunkX, chunkY, newChunk.id);

        if (asteroids.length > 0) {
          const { error: asteroidsError } = await supabaseAdmin
            .from('chunk_asteroids')
            .insert(asteroids);

          if (asteroidsError) {
            logger.error('❌ Erro ao criar asteroides:', asteroidsError);
          } else {
            logger.info(`🪨 ${asteroids.length} asteroides criados para chunk ${chunkId}`);
          }
        }
      }
    }

    // 5. Buscar asteroides do chunk
    const { data: asteroids } = await supabaseAdmin
      .from('chunk_asteroids')
      .select('*')
      .eq('chunk_id', chunk?.id);

    // 6. Buscar outros players no chunk
    const playersInChunk = cacheManager
      .getPlayersInChunk(chunkId)
      .filter((p) => p.id !== player.id)
      .map((p) => ({
        id: p.id, // IMPORTANTE: usar 'id' não 'playerId'
        username: p.username,
        x: p.x,
        y: p.y,
        health: p.health,
        max_health: p.max_health,
        current_chunk: p.current_chunk,
      }));

    // 7. Enviar dados do chunk
    socket.emit('chunk:data', {
      chunk: chunk || { chunk_x: chunkX, chunk_y: chunkY, zone_type: 'safe' },
      asteroids: asteroids || [],
      players: playersInChunk,
    });

    // 8. Notificar outros players
    socket.to(`chunk:${chunkId}`).emit('player:joined', {
      id: player.id, // IMPORTANTE: usar 'id' não 'playerId'
      username: player.username,
      x: player.x,
      y: player.y,
      health: player.health,
      max_health: player.max_health,
      current_chunk: chunkId,
    });

    logger.debug(`✅ ${player.username} entrou no chunk ${chunkId} (${playersInChunk.length} players)`);
  } catch (error) {
    logger.error('❌ Erro no handleChunkEnter:', error);
    socket.emit('error', { message: 'Erro ao entrar no chunk' });
  }
}

/**
 * Handler: player:move
 * Atualiza posição do jogador em tempo real
 */
export async function handlePlayerMove(socket, data, io) {
  try {
    const player = cacheManager.getPlayerBySocket(socket.id);

    if (!player) {
      return;
    }

    const { x, y, chunkX, chunkY } = data;
    const newChunkId = `${chunkX},${chunkY}`;

    // Validação básica
    if (typeof x !== 'number' || typeof y !== 'number') {
      return;
    }

    // Verificar se mudou de chunk
    const changedChunk = player.current_chunk !== newChunkId;

    // Atualizar cache
    cacheManager.updatePosition(player.id, x, y, newChunkId);

    // Se mudou de chunk, processar transição
    if (changedChunk) {
      logger.debug(`🚀 ${player.username} mudou de chunk: ${player.current_chunk} -> ${newChunkId}`);

      // Sair da room antiga
      socket.leave(`chunk:${player.current_chunk}`);
      socket.to(`chunk:${player.current_chunk}`).emit('player:left', {
        playerId: player.id,
      });

      // Entrar na room nova
      socket.join(`chunk:${newChunkId}`);

      // Carregar novo chunk
      await handleChunkEnter(socket, { chunkX, chunkY }, io);
    } else {
      // Broadcast posição para outros players no chunk
      socket.to(`chunk:${newChunkId}`).emit('player:moved', {
        playerId: player.id,
        x,
        y,
      });
    }
  } catch (error) {
    logger.error('❌ Erro no handlePlayerMove:', error);
  }
}

/**
 * Handler: disconnect
 * Limpa cache quando jogador desconecta
 */
export async function handleDisconnect(socket, reason, io) {
  try {
    const player = cacheManager.getPlayerBySocket(socket.id);

    if (!player) {
      return;
    }

    logger.info(`❌ Player desconectado: ${player.username} (${reason})`);

    // 1. Notificar outros players no chunk
    if (player.current_chunk) {
      socket.to(`chunk:${player.current_chunk}`).emit('player:left', {
        playerId: player.id,
      });
    }

    // 2. Atualizar is_online no banco
    await supabaseAdmin
      .from('player_state')
      .update({
        is_online: false,
      })
      .eq('id', player.id);

    // 3. Remover do cache (marca para sync final)
    cacheManager.removePlayer(player.id);

    logger.debug(`✅ Player ${player.username} removido do cache`);
  } catch (error) {
    logger.error('❌ Erro no handleDisconnect:', error);
  }
}

export default {
  handleAuth,
  handleChunkEnter,
  handlePlayerMove,
  handleDisconnect,
};

