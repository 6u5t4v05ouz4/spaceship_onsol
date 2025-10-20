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

    // Tabela de elementos no chunk (asteroides, cristais, etc)
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
        asset_variant_id VARCHAR(50),
        asset_frame VARCHAR(50),
        rarity_level VARCHAR(20) DEFAULT 'common',
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
    // Importar mapeamento de recursos
    const { SPAWN_CONFIG, RESOURCE_TYPES, PLANET_TYPES, NPC_SHIP_TYPES, STATION_TYPES } = await import('../src/data/resource-mapping.js');

    // Calcular distância do centro para determinar raridade
    const distance = Math.sqrt(chunkX * chunkX + chunkY * chunkY);

    // Obter configuração de spawn baseada na zona
    const spawnConfig = SPAWN_CONFIG[zoneType] || SPAWN_CONFIG.safe;
    const availableElements = spawnConfig.elements;
    const rarityConfig = spawnConfig.resource_rarity;

    // Gerar elementos variados
    const elementCount = Math.floor(Math.random() * 8) + 4; // 4-11 elementos

    for (let i = 0; i < elementCount; i++) {
      const x = Math.random() * 1000;
      const y = Math.random() * 1000;

      // Selecionar tipo de elemento baseado na configuração
      const elementType = availableElements[Math.floor(Math.random() * availableElements.length)];

      // Determinar raridade baseada na distância e configuração
      const rarity = selectRarity(distance, rarityConfig);

      // Gerar dados específicos do elemento
      let elementData = {};
      let assetVariant = null;
      let assetFrame = null;

      switch (elementType) {
        case 'asteroid':
          const asteroidSize = distance <= 10 ? 'small' : distance <= 30 ? 'medium' : 'large';
          elementData = {
            size: asteroidSize,
            health: asteroidSize === 'small' ? 50 : asteroidSize === 'medium' ? 100 : 150,
            composition: generateAsteroidComposition(rarity)
          };
          assetVariant = `asteroid_${rarity}`;
          assetFrame = `asteroid_${asteroidSize}_${Math.floor(Math.random() * 3) + 1}`;
          break;

        case 'crystal':
          const crystalValue = Math.floor(getCrystalValueByRarity(rarity));
          elementData = {
            value: crystalValue,
            energy: crystalValue * 0.8,
            purity: getPurityByRarity(rarity)
          };
          assetVariant = `crystal_${getCrystalTypeByRarity(rarity)}`;
          assetFrame = `crystal_${getCrystalTypeByRarity(rarity)}_${Math.floor(Math.random() * 4) + 1}`;
          break;

        case 'resource':
          const resourceType = selectResourceType(rarity);
          const resource = RESOURCE_TYPES.METALS[resourceType] ||
                          RESOURCE_TYPES.FUELS[resourceType] ||
                          RESOURCE_TYPES.OXYGEN[resourceType];
          elementData = {
            resource_type: resourceType,
            amount: Math.floor(Math.random() * 10) + 5,
            purity: getPurityByRarity(rarity)
          };
          assetVariant = `resource_${resourceType}`;
          assetFrame = `${resourceType}_${Math.floor(Math.random() * 3) + 1}`;
          break;

        case 'planet':
          // Planetas são raros e grandes
          if (Math.random() < 0.05) { // 5% de chance
            const planetType = selectPlanetType(rarity);
            elementData = {
              planet_type: planetType,
              size: 'large',
              gravity: Math.random() * 2 + 0.5,
              atmosphere: Math.random() > 0.5,
              resources: generatePlanetResources(planetType, rarity)
            };
            assetVariant = `planet_${planetType}`;
            assetFrame = `planet_${planetType}_${Math.floor(Math.random() * 2) + 1}`;
          } else {
            continue; // Skip planet generation if not lucky
          }
          break;

        case 'npc_trader':
        case 'npc_miner':
        case 'npc_patrol':
        case 'npc_scavenger':
        case 'npc_explorer':
          const npcType = elementType.replace('npc_', '');
          const npc = NPC_SHIP_TYPES[npcType];
          elementData = {
            ship_type: npcType,
            behavior: npc.behavior,
            cargo: generateNPCCargo(npcType),
            credits: Math.floor(Math.random() * 1000) + 100,
            reputation: Math.floor(Math.random() * 100)
          };
          assetVariant = `npc_ships`;
          assetFrame = `npc_${npcType}_1`;
          break;

        case 'station_trading_post':
        case 'station_mining_station':
        case 'station_research_outpost':
        case 'station_military_base':
        case 'station_refueling_station':
          const stationType = elementType.replace('station_', '');
          const station = STATION_TYPES[stationType];
          elementData = {
            station_type: stationType,
            services: station.services,
            docking_fee: Math.floor(Math.random() * 50) + 10,
            reputation: Math.floor(Math.random() * 100)
          };
          assetVariant = `space_stations`;
          assetFrame = `station_${stationType}`;
          break;
      }

      await client.query(
        `INSERT INTO chunk_elements (chunk_x, chunk_y, element_type, x, y, rotation, scale,
                                    asset_variant_id, asset_frame, rarity_level, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [chunkX, chunkY, elementType, x, y, Math.random() * Math.PI * 2, 0.5 + Math.random() * 0.5,
         assetVariant, assetFrame, rarity, JSON.stringify(elementData)]
      );
    }

    console.log(`✅ Gerados ${elementCount} elementos diversos para chunk (${chunkX}, ${chunkY})`);
  } finally {
    client.release();
  }
}

// Funções auxiliares para geração de elementos
function selectRarity(distance, rarityConfig) {
  const random = Math.random();
  let cumulative = 0;

  for (const [rarity, chance] of Object.entries(rarityConfig)) {
    cumulative += chance;
    if (random < cumulative) {
      return rarity;
    }
  }
  return 'common';
}

function generateAsteroidComposition(rarity) {
  const baseCompositions = {
    common: { iron: 0.7, copper: 0.2, aluminum: 0.1 },
    uncommon: { iron: 0.4, copper: 0.3, aluminum: 0.2, titanium: 0.1 },
    rare: { copper: 0.3, aluminum: 0.3, titanium: 0.3, platinum: 0.1 },
    epic: { titanium: 0.4, platinum: 0.3, iron: 0.2, copper: 0.1 },
    legendary: { platinum: 0.5, titanium: 0.3, aluminum: 0.2 }
  };

  return baseCompositions[rarity] || baseCompositions.common;
}

function getCrystalValueByRarity(rarity) {
  const values = {
    common: Math.random() * 20 + 10,
    uncommon: Math.random() * 30 + 30,
    rare: Math.random() * 40 + 60,
    epic: Math.random() * 50 + 100,
    legendary: Math.random() * 80 + 150,
    mythic: Math.random() * 100 + 250
  };
  return values[rarity] || values.common;
}

function getCrystalTypeByRarity(rarity) {
  const types = {
    common: 'basic',
    uncommon: 'basic',
    rare: 'energy',
    epic: 'quantum',
    legendary: 'quantum',
    mythic: 'quantum'
  };
  return types[rarity] || 'basic';
}

function getPurityByRarity(rarity) {
  const purities = {
    common: Math.random() * 30 + 60,
    uncommon: Math.random() * 20 + 70,
    rare: Math.random() * 15 + 80,
    epic: Math.random() * 10 + 85,
    legendary: Math.random() * 5 + 90,
    mythic: Math.random() * 3 + 95
  };
  return purities[rarity] || 70;
}

function selectResourceType(rarity) {
  const commonResources = ['iron', 'copper', 'hydrogen', 'liquid_oxygen'];
  const uncommonResources = ['aluminum', 'deuterium', 'compressed_oxygen', 'basic_missiles'];
  const rareResources = ['titanium', 'antimatter', 'air_crystal', 'guided_missiles'];
  const epicResources = ['platinum', 'energy_crystal', 'power_crystal', 'energy_missiles'];
  const legendaryResources = ['plasma_torpedoes'];
  const mythicResources = ['space_crystal', 'stellar_essence', 'reality_fragment'];

  let resourcePool = commonResources;
  if (rarity === 'uncommon') resourcePool = uncommonResources;
  else if (rarity === 'rare') resourcePool = rareResources;
  else if (rarity === 'epic') resourcePool = epicResources;
  else if (rarity === 'legendary') resourcePool = legendaryResources;
  else if (rarity === 'mythic') resourcePool = mythicResources;

  return resourcePool[Math.floor(Math.random() * resourcePool.length)];
}

function selectPlanetType(rarity) {
  const types = {
    common: ['rocky', 'icy'],
    uncommon: ['rocky', 'icy', 'desert'],
    rare: ['desert', 'crystal'],
    epic: ['crystal', 'gas'],
    legendary: ['gas', 'crystal'],
    mythic: ['gas']
  };

  const typePool = types[rarity] || types.common;
  return typePool[Math.floor(Math.random() * typePool.length)];
}

function generatePlanetResources(planetType, rarity) {
  const resources = {
    rocky: { iron: 50, copper: 30, aluminum: 20 },
    icy: { liquid_oxygen: 60, hydrogen: 30, iron: 10 },
    desert: { aluminum: 40, copper: 35, deuterium: 25 },
    crystal: { titanium: 30, energy_crystal: 20, air_crystal: 15 },
    gas: { platinum: 25, power_crystal: 15, stellar_essence: 10 }
  };

  return resources[planetType] || resources.rocky;
}

function generateNPCCargo(npcType) {
  const cargo = {
    trader: { credits: 500, resources: ['iron', 'copper'] },
    miner: { resources: ['hydrogen', 'deuterium'] },
    patrol: { weapons: ['basic_missiles', 'energy_missiles'] },
    scavenger: { scrap: true, random: true },
    explorer: { data: true, fuel: true }
  };

  return cargo[npcType] || {};
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