/**
 * PostgreSQL Database Configuration
 * Conexão com banco de dados do Railway
 */

import pkg from 'pg';
const { Pool } = pkg;

// Configuração do pool de conexões
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

let pool = null;

/**
 * Inicializa a conexão com PostgreSQL
 */
export async function initDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL não configurada, usando banco mock');
      return false;
    }

    pool = new Pool(poolConfig);

    // Testar conexão
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    console.log('✅ PostgreSQL conectado:', result.rows[0].now);

    // Criar tabelas se não existirem
    await createTables();

    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar PostgreSQL:', error.message);
    pool = null;
    return false;
  }
}

/**
 * Cria tabelas necessárias
 */
async function createTables() {
  const client = await pool.connect();

  try {
    console.log('🔧 Criando tabelas do banco...');

    // Tabela de chunks
    await client.query(`
      CREATE TABLE IF NOT EXISTS chunks (
        chunk_x INTEGER NOT NULL,
        chunk_y INTEGER NOT NULL,
        zone_type VARCHAR(20) NOT NULL DEFAULT 'safe',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (chunk_x, chunk_y)
      )
    `);

    // Tabela de elementos no chunk (asteroides, etc)
    await client.query(`
      CREATE TABLE IF NOT EXISTS chunk_elements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chunk_x INTEGER NOT NULL,
        chunk_y INTEGER NOT NULL,
        element_type VARCHAR(20) NOT NULL,
        x FLOAT NOT NULL,
        y FLOAT NOT NULL,
        rotation FLOAT DEFAULT 0,
        scale FLOAT DEFAULT 1,
        health INTEGER DEFAULT 100,
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chunk_x, chunk_y) REFERENCES chunks(chunk_x, chunk_y)
      )
    `);

    // Tabela de estado dos jogadores
    await client.query(`
      CREATE TABLE IF NOT EXISTS player_state (
        user_id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        x FLOAT NOT NULL DEFAULT 0,
        y FLOAT NOT NULL DEFAULT 0,
        chunk_x INTEGER NOT NULL DEFAULT 0,
        chunk_y INTEGER NOT NULL DEFAULT 0,
        health INTEGER NOT NULL DEFAULT 100,
        max_health INTEGER NOT NULL DEFAULT 100,
        is_online BOOLEAN DEFAULT false,
        socket_id VARCHAR(255),
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de eventos do chunk (para sincronização)
    await client.query(`
      CREATE TABLE IF NOT EXISTS chunk_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chunk_x INTEGER NOT NULL,
        chunk_y INTEGER NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        player_id VARCHAR(255) NOT NULL,
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chunk_x, chunk_y) REFERENCES chunks(chunk_x, chunk_y)
      )
    `);

    // Índices para performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_player_state_chunk ON player_state(chunk_x, chunk_y)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_player_state_online ON player_state(is_online)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_chunk_elements_chunk ON chunk_elements(chunk_x, chunk_y)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_chunk_events_chunk ON chunk_events(chunk_x, chunk_y, created_at)');

    console.log('✅ Tabelas criadas com sucesso');

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtém ou cria um chunk
 */
export async function getOrCreateChunk(chunkX, chunkY) {
  if (!pool) return null;

  const client = await pool.connect();
  try {
    // Tentar buscar chunk existente
    const result = await client.query(
      'SELECT * FROM chunks WHERE chunk_x = $1 AND chunk_y = $2',
      [chunkX, chunkY]
    );

    if (result.rows.length === 0) {
      // Criar novo chunk com zone type baseado na posição
      const zoneType = getZoneType(chunkX, chunkY);

      const insertResult = await client.query(
        `INSERT INTO chunks (chunk_x, chunk_y, zone_type)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [chunkX, chunkY, zoneType]
      );

      // Gerar elementos para o chunk
      await generateChunkElements(chunkX, chunkY, zoneType);

      return insertResult.rows[0];
    }

    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Gera elementos para um chunk
 */
async function generateChunkElements(chunkX, chunkY, zoneType) {
  if (!pool) return;

  const client = await pool.connect();
  try {
    const elementCount = Math.floor(Math.random() * 5) + 3; // 3-7 elementos

    for (let i = 0; i < elementCount; i++) {
      const x = Math.random() * 1000;
      const y = Math.random() * 1000;
      const type = Math.random() > 0.7 ? 'asteroid' : 'crystal';

      await client.query(
        `INSERT INTO chunk_elements (chunk_x, chunk_y, element_type, x, y, rotation, scale, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [chunkX, chunkY, type, x, y, Math.random() * Math.PI * 2, 0.5 + Math.random() * 0.5, JSON.stringify({
          value: type === 'crystal' ? Math.floor(Math.random() * 50) + 10 : null,
          size: type === 'asteroid' ? Math.random() > 0.5 ? 'large' : 'small' : null
        })]
      );
    }

    console.log(`✅ Gerados ${elementCount} elementos para chunk (${chunkX}, ${chunkY})`);
  } finally {
    client.release();
  }
}

/**
 * Obtém elementos de um chunk
 */
export async function getChunkElements(chunkX, chunkY) {
  if (!pool) return [];

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM chunk_elements WHERE chunk_x = $1 AND chunk_y = $2',
      [chunkX, chunkY]
    );

    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Atualiza estado do jogador
 */
export async function updatePlayerState(userId, data) {
  if (!pool) return null;

  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE player_state
       SET x = $2, y = $3, chunk_x = $4, chunk_y = $5,
           health = $6, socket_id = $7, is_online = true, last_seen = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING *`,
      [userId, data.x, data.y, data.chunkX, data.chunkY, data.health || 100, data.socketId]
    );

    if (result.rows.length === 0) {
      // Inserir novo jogador
      const insertResult = await client.query(
        `INSERT INTO player_state (user_id, username, x, y, chunk_x, chunk_y, health, socket_id, is_online)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
         RETURNING *`,
        [userId, data.username, data.x, data.y, data.chunkX, data.chunkY, data.health || 100, data.socketId]
      );
      return insertResult.rows[0];
    }

    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Obtém jogadores em um chunk
 */
export async function getPlayersInChunk(chunkX, chunkY) {
  if (!pool) return [];

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM player_state
       WHERE chunk_x = $1 AND chunk_y = $2 AND is_online = true
       ORDER BY username`,
      [chunkX, chunkY]
    );

    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Remove jogador do jogo (desconectou)
 */
export async function removePlayerOnline(socketId) {
  if (!pool) return;

  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE player_state SET is_online = false, socket_id = NULL WHERE socket_id = $1',
      [socketId]
    );
  } finally {
    client.release();
  }
}

/**
 * Determina tipo de zona baseado na posição
 */
function getZoneType(chunkX, chunkY) {
  // Zona PvP (chunk 51, 0)
  if (chunkX === 51 && chunkY === 0) {
    return 'hostile';
  }

  // Zonas de recurso
  if (Math.abs(chunkX) > 30 || Math.abs(chunkY) > 30) {
    return 'resource';
  }

  // Zona segura por padrão
  return 'safe';
}

/**
 * Fecha a conexão com o banco
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ PostgreSQL desconectado');
  }
}

/**
 * Exporta o pool para queries diretas
 */
export { pool };