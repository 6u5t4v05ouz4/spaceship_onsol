/**
 * Redis Configuration
 * Conexão com Redis para cache (opcional)
 * Se Redis não estiver disponível, usa fallback in-memory
 */

import { createClient } from 'redis';
import logger from '../utils/logger.js';

let redisClient = null;
let isRedisAvailable = false;

/**
 * Inicializa conexão com Redis
 * @returns {Promise<Object>} Cliente Redis ou null
 */
export async function initRedis() {
  const redisUrl = process.env.REDIS_URL;

  // Se não há URL configurada, usa fallback in-memory
  if (!redisUrl) {
    logger.warn('⚠️ Redis URL não configurada, usando cache in-memory');
    return null;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      password: process.env.REDIS_PASSWORD,
      socket: {
        reconnectStrategy: (retries) => {
          // Retry exponencial: 100ms, 200ms, 400ms, 800ms, max 3s
          const delay = Math.min(100 * Math.pow(2, retries), 3000);
          logger.debug(`🔄 Redis reconnect attempt ${retries + 1}, delay: ${delay}ms`);
          return delay;
        },
      },
    });

    // Event listeners
    redisClient.on('error', (err) => {
      logger.error('❌ Redis error:', err);
      isRedisAvailable = false;
    });

    redisClient.on('connect', () => {
      logger.info('🔌 Redis conectando...');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis conectado e pronto');
      isRedisAvailable = true;
    });

    redisClient.on('reconnecting', () => {
      logger.warn('🔄 Redis reconectando...');
      isRedisAvailable = false;
    });

    // Conectar
    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error('❌ Falha ao conectar Redis:', error.message);
    logger.warn('⚠️ Usando cache in-memory como fallback');
    return null;
  }
}

/**
 * Verifica se Redis está disponível
 * @returns {boolean}
 */
export function isRedisConnected() {
  return isRedisAvailable && redisClient?.isOpen;
}

/**
 * Obtém cliente Redis
 * @returns {Object|null}
 */
export function getRedisClient() {
  return isRedisConnected() ? redisClient : null;
}

/**
 * Fecha conexão Redis
 */
export async function closeRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('✅ Redis desconectado');
    } catch (error) {
      logger.error('❌ Erro ao desconectar Redis:', error);
    }
  }
}

export default {
  initRedis,
  isRedisConnected,
  getRedisClient,
  closeRedis,
};

