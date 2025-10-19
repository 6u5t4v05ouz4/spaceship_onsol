/**
 * Auth Middleware
 * Valida JWT tokens do Supabase
 */

import { supabaseAnonClient } from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Middleware para validar JWT token
 * Extrai token do header Authorization: Bearer <token>
 */
export async function authMiddleware(req, res, next) {
  try {
    // Extrair token do header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token não fornecido',
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Validar token com Supabase
    const {
      data: { user },
      error,
    } = await supabaseAnonClient.auth.getUser(token);

    if (error || !user) {
      logger.warn('❌ Token inválido:', error?.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token inválido ou expirado',
      });
    }

    // Anexar user ao request
    req.user = user;
    req.userId = user.id;

    logger.debug(`✅ User autenticado: ${user.email} (${user.id})`);

    next();
  } catch (error) {
    logger.error('❌ Erro no auth middleware:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro ao validar token',
    });
  }
}

/**
 * Middleware opcional (não bloqueia se não houver token)
 */
export async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      const {
        data: { user },
      } = await supabaseAnonClient.auth.getUser(token);

      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    logger.error('❌ Erro no optional auth middleware:', error);
    next();
  }
}

export default authMiddleware;

