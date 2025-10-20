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

    // 6. Confirmar autenticação (NÃO entrar em room aqui; apenas autentica)
    socket.emit('auth:success', {
      playerId: playerState.id,
      playerState: playerState,
    });

    logger.info(`✅ Player autenticado: ${playerState.username} (${playerState.id})`);
    // Não emitimos player:joined aqui para evitar aparecer no mapa sem dar Play
  } catch (error) {
    logger.error('❌ Erro no handleAuth:', error);
    socket.emit('auth:error', { message: 'Erro interno ao autenticar' });
  }
}

/**
 * Handler: play:start
 * Entra no jogo (room do chunk atual) e notifica presença
 */
export async function handlePlayStart(socket, data, io) {
  try {
    const player = cacheManager.getPlayerBySocket(socket.id);
    if (!player) {
      socket.emit('error', { message: 'Player não autenticado' });
      return;
    }

    // Entrar na room do chunk atual
    if (player.current_chunk) {
      socket.join(`chunk:${player.current_chunk}`);
    }

    // Opcional: marcar flag em cache
    player.is_in_game = true;

    // Notificar outros players do chunk
    socket.to(`chunk:${player.current_chunk}`).emit('player:joined', {
      id: player.id,
      username: player.username,
      x: player.x,
      y: player.y,
      health: player.health,
      max_health: player.max_health,
      current_chunk: player.current_chunk,
    });
  } catch (error) {
    logger.error('❌ Erro no handlePlayStart:', error);
    socket.emit('error', { message: 'Erro ao iniciar jogo' });
  }
}

/**
 * Handler: play:stop
 * Sai do jogo e notifica saída
 */
export async function handlePlayStop(socket, data, io) {
  try {
    const player = cacheManager.getPlayerBySocket(socket.id);
    if (!player) {
      return;
    }

    // Sair das rooms de chunk
    if (player.current_chunk) {
      socket.leave(`chunk:${player.current_chunk}`);
      socket.to(`chunk:${player.current_chunk}`).emit('player:left', {
        id: player.id,
      });
    }

    player.is_in_game = false;
  } catch (error) {
    logger.error('❌ Erro no handlePlayStop:', error);
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
        id: player.id,
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

    // Se chunk não informado, manter chunk atual e apenas broadcast de movimento
    const hasChunk = Number.isInteger(chunkX) && Number.isInteger(chunkY);
    const newChunkId = hasChunk ? `${chunkX},${chunkY}` : player.current_chunk;

    // Validação básica
    if (typeof x !== 'number' || typeof y !== 'number') {
      return;
    }

    // Verificar se mudou de chunk
    const changedChunk = hasChunk && player.current_chunk !== newChunkId;

    // Atualizar cache
    cacheManager.updatePosition(player.id, x, y, newChunkId);

    // Se mudou de chunk, processar transição
    if (changedChunk) {
      logger.debug(`🚀 ${player.username} mudou de chunk: ${player.current_chunk} -> ${newChunkId}`);

      // Sair da room antiga
      socket.leave(`chunk:${player.current_chunk}`);
      socket.to(`chunk:${player.current_chunk}`).emit('player:left', {
        id: player.id,
      });

      // Entrar na room nova
      socket.join(`chunk:${newChunkId}`);

      // Enviar dados básicos do novo chunk e anunciar entrada
      socket.join(`chunk:${newChunkId}`);
      socket.emit('chunk:data', {
        chunk: { chunk_x: chunkX, chunk_y: chunkY, zone_type: 'safe' },
        asteroids: [],
        players: cacheManager
          .getPlayersInChunk(newChunkId)
          .filter((p) => p.id !== player.id)
          .map((p) => ({
            id: p.id,
            username: p.username,
            x: p.x,
            y: p.y,
            health: p.health,
            max_health: p.max_health,
            current_chunk: p.current_chunk,
          })),
      });
      socket.to(`chunk:${newChunkId}`).emit('player:joined', {
        id: player.id,
        username: player.username,
        x,
        y,
        health: player.health,
        max_health: player.max_health,
        current_chunk: newChunkId,
      });
    } else {
      // Broadcast posição para outros players no chunk
      socket.to(`chunk:${newChunkId}`).emit('player:moved', {
        id: player.id,
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
        id: player.id,
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
  handlePlayStart,
  handlePlayStop,
  handleChunkEnter,
  handlePlayerMove,
  handleDisconnect,
};

