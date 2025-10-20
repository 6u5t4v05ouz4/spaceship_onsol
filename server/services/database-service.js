// =====================================================
// DATABASE SERVICE - PostgreSQL Railway
// =====================================================

import { Pool } from 'pg';
import logger from './utils/logger.js';

class DatabaseService {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Configuração do PostgreSQL Railway
      const config = {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20, // máximo de conexões
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };

      this.pool = new Pool(config);
      
      // Testar conexão
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      this.isConnected = true;
      logger.info('✅ PostgreSQL conectado com sucesso');
      
      // Inicializar schema
      await this.initializeSchema();
      
    } catch (error) {
      logger.error('❌ Erro ao conectar PostgreSQL:', error);
      throw error;
    }
  }

  async initializeSchema() {
    try {
      const client = await this.pool.connect();
      
      // Criar tabelas se não existirem
      await client.query(`
        CREATE TABLE IF NOT EXISTS game_elements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          chunk_x INTEGER NOT NULL,
          chunk_y INTEGER NOT NULL,
          element_type VARCHAR(20) NOT NULL,
          x REAL NOT NULL,
          y REAL NOT NULL,
          data JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS game_chunks (
          chunk_x INTEGER NOT NULL,
          chunk_y INTEGER NOT NULL,
          seed VARCHAR(50) NOT NULL,
          generated_at TIMESTAMP DEFAULT NOW(),
          PRIMARY KEY (chunk_x, chunk_y)
        )
      `);

      // Criar índices
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_game_elements_chunk 
        ON game_elements(chunk_x, chunk_y)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_game_elements_type 
        ON game_elements(element_type)
      `);

      client.release();
      logger.info('✅ Schema PostgreSQL inicializado');
      
    } catch (error) {
      logger.error('❌ Erro ao inicializar schema:', error);
      throw error;
    }
  }

  // =====================================================
  // MÉTODOS PARA ELEMENTOS DO JOGO
  // =====================================================

  async getChunkElements(chunkX, chunkY) {
    try {
      const client = await this.pool.connect();
      const result = await client.query(
        'SELECT * FROM game_elements WHERE chunk_x = $1 AND chunk_y = $2',
        [chunkX, chunkY]
      );
      client.release();
      return result.rows;
    } catch (error) {
      logger.error('❌ Erro ao buscar elementos do chunk:', error);
      throw error;
    }
  }

  async createElement(chunkX, chunkY, elementType, x, y, data = {}) {
    try {
      const client = await this.pool.connect();
      const result = await client.query(
        `INSERT INTO game_elements (chunk_x, chunk_y, element_type, x, y, data)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [chunkX, chunkY, elementType, x, y, JSON.stringify(data)]
      );
      client.release();
      return result.rows[0];
    } catch (error) {
      logger.error('❌ Erro ao criar elemento:', error);
      throw error;
    }
  }

  async updateElement(id, data) {
    try {
      const client = await this.pool.connect();
      const result = await client.query(
        'UPDATE game_elements SET data = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [JSON.stringify(data), id]
      );
      client.release();
      return result.rows[0];
    } catch (error) {
      logger.error('❌ Erro ao atualizar elemento:', error);
      throw error;
    }
  }

  async deleteElement(id) {
    try {
      const client = await this.pool.connect();
      await client.query('DELETE FROM game_elements WHERE id = $1', [id]);
      client.release();
    } catch (error) {
      logger.error('❌ Erro ao deletar elemento:', error);
      throw error;
    }
  }

  // =====================================================
  // MÉTODOS PARA CHUNKS
  // =====================================================

  async getChunkSeed(chunkX, chunkY) {
    try {
      const client = await this.pool.connect();
      const result = await client.query(
        'SELECT seed FROM game_chunks WHERE chunk_x = $1 AND chunk_y = $2',
        [chunkX, chunkY]
      );
      client.release();
      return result.rows[0]?.seed || null;
    } catch (error) {
      logger.error('❌ Erro ao buscar seed do chunk:', error);
      throw error;
    }
  }

  async setChunkSeed(chunkX, chunkY, seed) {
    try {
      const client = await this.pool.connect();
      await client.query(
        `INSERT INTO game_chunks (chunk_x, chunk_y, seed)
         VALUES ($1, $2, $3)
         ON CONFLICT (chunk_x, chunk_y) DO UPDATE SET seed = $3`,
        [chunkX, chunkY, seed]
      );
      client.release();
    } catch (error) {
      logger.error('❌ Erro ao definir seed do chunk:', error);
      throw error;
    }
  }

  // =====================================================
  // LIMPEZA E MANUTENÇÃO
  // =====================================================

  async cleanupOldElements() {
    try {
      const client = await this.pool.connect();
      const result = await client.query(
        'DELETE FROM game_elements WHERE created_at < NOW() - INTERVAL \'1 hour\''
      );
      client.release();
      logger.info(`🧹 Limpeza: ${result.rowCount} elementos antigos removidos`);
    } catch (error) {
      logger.error('❌ Erro na limpeza:', error);
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      logger.info('🔌 PostgreSQL desconectado');
    }
  }
}

export default new DatabaseService();
