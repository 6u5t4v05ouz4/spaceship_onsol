/**
 * Configuração de Redis Híbrida
 * Funciona tanto local quanto no Railway
 */

export function getRedisConfig() {
  // Prioridade: Railway REDIS_URL > variáveis individuais > localhost
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    // Parse REDIS_URL do Railway/Upstash
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || null,
      db: url.pathname ? parseInt(url.pathname.slice(1)) : 0
    };
  }
  
  // Fallback para variáveis individuais
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: parseInt(process.env.REDIS_DB) || 0
  };
}

export function getEnvironmentInfo() {
  const config = getRedisConfig();
  
  return {
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isRailway: !!process.env.RAILWAY_ENVIRONMENT,
    redisConfig: {
      ...config,
      password: config.password ? '***' : null // Ocultar senha nos logs
    },
    instanceId: process.env.INSTANCE_ID || `local-${Date.now()}`,
    port: process.env.PORT || 3001
  };
}
