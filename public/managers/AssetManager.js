/**
 * Asset Manager
 * Gerencia carregamento e cache de assets visuais para elementos do mapa
 */

export default class AssetManager {
  constructor(scene) {
    this.scene = scene;
    this.loadedAssets = new Map(); // assets carregados
    this.loadedChunks = new Set(); // chunks com assets carregados
    this.chunkAssets = new Map(); // cache de assets por chunk
    this.preloadRadius = 1; // quantos chunks ao redor carregar
    this.maxCacheSize = 100; // máximo de chunks em cache
  }

  /**
   * Inicializa o Asset Manager
   */
  async init() {
    console.log('🎨 Inicializando Asset Manager...');

    // Carregar sprite sheets base
    await this.loadSpriteSheets();

    console.log('✅ Asset Manager inicializado');
  }

  /**
   * Carrega os sprite sheets principais
   */
  async loadSpriteSheets() {
    const spriteSheets = [
      // Asteroides por dificuldade
      {
        key: 'asteroids_common',
        texturePath: '/assets/spritesheets/asteroids/common_asteroids.png',
        atlasPath: '/assets/spritesheets/asteroids/common_asteroids.json'
      },
      {
        key: 'asteroids_rare',
        texturePath: '/assets/spritesheets/asteroids/rare_asteroids.png',
        atlasPath: '/assets/spritesheets/asteroids/rare_asteroids.json'
      },
      {
        key: 'asteroids_legendary',
        texturePath: '/assets/spritesheets/asteroids/legendary_asteroids.png',
        atlasPath: '/assets/spritesheets/asteroids/legendary_asteroids.json'
      },
      // Cristais por tipo
      {
        key: 'crystals_basic',
        texturePath: '/assets/spritesheets/crystals/basic_crystals.png',
        atlasPath: '/assets/spritesheets/crystals/basic_crystals.json'
      },
      {
        key: 'crystals_energy',
        texturePath: '/assets/spritesheets/crystals/energy_crystals.png',
        atlasPath: '/assets/spritesheets/crystals/energy_crystals.json'
      },
      {
        key: 'crystals_quantum',
        texturePath: '/assets/spritesheets/crystals/quantum_crystals.png',
        atlasPath: '/assets/spritesheets/crystals/quantum_crystals.json'
      },
      // Recursos minerais
      {
        key: 'resources_metals',
        texturePath: '/assets/spritesheets/resources/metals.png',
        atlasPath: '/assets/spritesheets/resources/metals.json'
      },
      {
        key: 'resources_fuels',
        texturePath: '/assets/spritesheets/resources/fuels.png',
        atlasPath: '/assets/spritesheets/resources/fuels.json'
      },
      {
        key: 'resources_oxygen',
        texturePath: '/assets/spritesheets/resources/oxygen.png',
        atlasPath: '/assets/spritesheets/resources/oxygen.json'
      },
      {
        key: 'resources_crystals',
        texturePath: '/assets/spritesheets/resources/crystals.png',
        atlasPath: '/assets/spritesheets/resources/crystals.json'
      },
      {
        key: 'resources_projectiles',
        texturePath: '/assets/spritesheets/resources/projectiles.png',
        atlasPath: '/assets/spritesheets/resources/projectiles.json'
      },
      {
        key: 'resources_special',
        texturePath: '/assets/spritesheets/resources/special.png',
        atlasPath: '/assets/spritesheets/resources/special.json'
      },
      // Planetas
      {
        key: 'planets',
        texturePath: '/assets/spritesheets/planets/planets.png',
        atlasPath: '/assets/spritesheets/planets/planets.json'
      },
      // Naves NPCs
      {
        key: 'npc_ships',
        texturePath: '/assets/spritesheets/npcs/npc_ships.png',
        atlasPath: '/assets/spritesheets/npcs/npc_ships.json'
      },
      // Estações espaciais
      {
        key: 'space_stations',
        texturePath: '/assets/spritesheets/stations/space_stations.png',
        atlasPath: '/assets/spritesheets/stations/space_stations.json'
      },
      // Efeitos
      {
        key: 'effects_explosions',
        texturePath: '/assets/spritesheets/effects/explosions.png',
        atlasPath: '/assets/spritesheets/effects/explosions.json'
      },
      {
        key: 'effects_particles',
        texturePath: '/assets/spritesheets/effects/particle_effects.png',
        atlasPath: '/assets/spritesheets/effects/particle_effects.json'
      }
    ];

    for (const sheet of spriteSheets) {
      try {
        // Carregar atlas (se o arquivo JSON existir)
        if (this.scene.textures.exists(sheet.key)) {
          console.log(`⚠️ Sprite sheet já carregado: ${sheet.key}`);
          continue;
        }

        // Para desenvolvimento, criar fallback caso os arquivos não existam
        console.log(`📦 Carregando sprite sheet: ${sheet.key}`);

        // Criar textura dummy para desenvolvimento
        this.createDummyTexture(sheet.key);

      } catch (error) {
        console.warn(`⚠️ Erro ao carregar sprite sheet ${sheet.key}:`, error.message);
        this.createDummyTexture(sheet.key);
      }
    }
  }

  /**
   * Cria uma textura dummy para desenvolvimento
   */
  createDummyTexture(key) {
    if (this.scene.textures.exists(key)) return;

    // Criar textura procedural de 64x64 pixels
    const graphics = this.scene.add.graphics();
    graphics.generateTexture(key, 64, 64);
    graphics.destroy();

    console.log(`🎨 Criada textura dummy para: ${key}`);
  }

  /**
   * Determina qual asset carregar baseado no tipo e distância
   */
  getAssetForElement(elementType, elementData, chunkDistance) {
    const assetMap = {
      asteroid: {
        getSpriteSheet: (distance) => {
          if (distance <= 10) return 'asteroids_common';
          if (distance <= 30) return 'asteroids_rare';
          return 'asteroids_legendary';
        },
        getFrame: (data) => {
          const size = data?.size || 'small';
          return `asteroid_${size}_${Math.floor(Math.random() * 3) + 1}`;
        }
      },
      crystal: {
        getSpriteSheet: (distance) => {
          if (distance <= 10) return 'crystals_basic';
          if (distance <= 30) return 'crystals_energy';
          return 'crystals_quantum';
        },
        getFrame: (data) => {
          const value = data?.value || 10;
          const tier = value <= 20 ? 'basic' : value <= 50 ? 'energy' : 'quantum';
          return `crystal_${tier}_${Math.floor(Math.random() * 2) + 1}`;
        }
      },
      // Recursos minerais
      resource: {
        getSpriteSheet: (distance) => {
          const resourceType = elementData?.resource_type || 'iron';

          // Mapear tipos de recursos para sprite sheets
          if (['iron', 'copper', 'aluminum', 'titanium', 'platinum'].includes(resourceType)) {
            return 'resources_metals';
          } else if (['hydrogen', 'deuterium', 'antimatter'].includes(resourceType)) {
            return 'resources_fuels';
          } else if (['liquid_oxygen', 'compressed_oxygen', 'air_crystal'].includes(resourceType)) {
            return 'resources_oxygen';
          } else if (['energy_crystal', 'power_crystal'].includes(resourceType)) {
            return 'resources_crystals';
          } else if (['basic_missiles', 'guided_missiles', 'energy_missiles', 'plasma_torpedoes'].includes(resourceType)) {
            return 'resources_projectiles';
          } else {
            return 'resources_special';
          }
        },
        getFrame: (data) => {
          const resourceType = data?.resource_type || 'iron';
          const variant = Math.floor(Math.random() * 3) + 1;
          return `${resourceType}_${variant}`;
        }
      },
      // Planetas
      planet: {
        getSpriteSheet: (distance) => 'planets',
        getFrame: (data) => {
          const planetType = data?.planet_type || 'rocky';
          const variant = Math.floor(Math.random() * 2) + 1;
          return `planet_${planetType}_${variant}`;
        }
      },
      // Naves NPCs - mapeamento individual
      npc_trader: {
        getSpriteSheet: (distance) => 'npc_ships',
        getFrame: (data) => 'npc_trader_1'
      },
      npc_miner: {
        getSpriteSheet: (distance) => 'npc_ships',
        getFrame: (data) => 'npc_miner_1'
      },
      npc_patrol: {
        getSpriteSheet: (distance) => 'npc_ships',
        getFrame: (data) => 'npc_patrol_1'
      },
      npc_scavenger: {
        getSpriteSheet: (distance) => 'npc_ships',
        getFrame: (data) => 'npc_scavenger_1'
      },
      npc_explorer: {
        getSpriteSheet: (distance) => 'npc_ships',
        getFrame: (data) => 'npc_explorer_1'
      },
      // Estações espaciais - mapeamento individual
      station_trading_post: {
        getSpriteSheet: (distance) => 'space_stations',
        getFrame: (data) => 'station_trading_post'
      },
      station_mining_station: {
        getSpriteSheet: (distance) => 'space_stations',
        getFrame: (data) => 'station_mining'
      },
      station_research_outpost: {
        getSpriteSheet: (distance) => 'space_stations',
        getFrame: (data) => 'station_research'
      },
      station_military_base: {
        getSpriteSheet: (distance) => 'space_stations',
        getFrame: (data) => 'station_military'
      },
      station_refueling_station: {
        getSpriteSheet: (distance) => 'space_stations',
        getFrame: (data) => 'station_refuel'
      }
    };

    // Para tipos que começam com npc_
    if (elementType.startsWith('npc_')) {
      return {
        spriteSheet: 'npc_ships',
        frame: `npc_${elementType.replace('npc_', '')}_1`
      };
    }

    // Para tipos que começam com station_
    if (elementType.startsWith('station_')) {
      return {
        spriteSheet: 'space_stations',
        frame: `station_${elementType.replace('station_', '')}`
      };
    }

    const assetConfig = assetMap[elementType];
    if (!assetConfig) {
      console.warn(`⚠️ Tipo de elemento não mapeado: ${elementType}`);
      return { spriteSheet: 'asteroids_common', frame: 'default' };
    }

    return {
      spriteSheet: assetConfig.getSpriteSheet(chunkDistance),
      frame: assetConfig.getFrame(elementData)
    };
  }

  /**
   * Prepara assets para um chunk específico e adjacentes
   */
  async preloadChunkAssets(chunkX, chunkY) {
    const chunkKey = `${chunkX},${chunkY}`;

    if (this.loadedChunks.has(chunkKey)) {
      return; // Já carregado
    }

    console.log(`📦 Preparando assets para chunk (${chunkX}, ${chunkY})`);

    // Calcular distância do centro (0,0) para dificuldade
    const distance = Math.sqrt(chunkX * chunkX + chunkY * chunkY);

    // Adicionar chunk ao conjunto de carregados
    this.loadedChunks.add(chunkKey);

    // Manter cache limitado
    if (this.loadedChunks.size > this.maxCacheSize) {
      this.cleanupOldestChunks();
    }

    // Preparar também chunks adjacentes
    for (let dx = -this.preloadRadius; dx <= this.preloadRadius; dx++) {
      for (let dy = -this.preloadRadius; dy <= this.preloadRadius; dy++) {
        const adjacentKey = `${chunkX + dx},${chunkY + dy}`;

        if (!this.loadedChunks.has(adjacentKey)) {
          this.loadedChunks.add(adjacentKey);
        }
      }
    }

    console.log(`✅ Assets preparados para chunk (${chunkX}, ${chunkY}) e adjacentes`);
  }

  /**
   * Limpa chunks mais antigos do cache
   */
  cleanupOldestChunks() {
    const chunksToRemove = Array.from(this.loadedChunks).slice(0, 10);
    chunksToRemove.forEach(chunk => {
      this.loadedChunks.delete(chunk);
      this.chunkAssets.delete(chunk);
    });
    console.log(`🧹 Removidos ${chunksToRemove.length} chunks mais antigos do cache`);
  }

  /**
   * Cria um sprite de elemento visual
   */
  createElement(elementData, chunkX, chunkY) {
    const { element_type, x, y, rotation, scale, data } = elementData;

    // Calcular distância para determinar variação de assets
    const distance = Math.sqrt(chunkX * chunkX + chunkY * chunkY);

    // Obter configuração de asset
    const assetConfig = this.getAssetForElement(element_type, data, distance);

    // Verificar se o sprite sheet está carregado
    if (!this.scene.textures.exists(assetConfig.spriteSheet)) {
      console.warn(`⚠️ Sprite sheet não encontrado: ${assetConfig.spriteSheet}`);
      return this.createFallbackElement(elementData);
    }

    // Criar sprite
    const sprite = this.scene.physics.add.sprite(x, y, assetConfig.spriteSheet, assetConfig.frame);

    // Aplicar propriedades
    sprite.setRotation(rotation || 0);
    sprite.setScale(scale || 1);

    // Adicionar propriedades customizadas
    sprite.elementId = elementData.id;
    sprite.elementType = element_type;
    sprite.chunkPosition = { x: chunkX, y: chunkY };

    // Adicionar interatividade baseada no tipo
    if (element_type === 'asteroid') {
      this.setupAsteroidInteractions(sprite, elementData);
    } else if (element_type === 'crystal') {
      this.setupCrystalInteractions(sprite, elementData);
    }

    return sprite;
  }

  /**
   * Configura interações para asteroides
   */
  setupAsteroidInteractions(sprite, elementData) {
    // Asteroides podem ser minerados/destruídos
    sprite.setInteractive();
    sprite.on('pointerdown', () => {
      console.log('💥 Asteroide clicado:', elementData.id);
      // TODO: Implementar sistema de mineração
    });
  }

  /**
   * Configura interações para cristais
   */
  setupCrystalInteractions(sprite, elementData) {
    // Cristais brilham e podem ser coletados
    sprite.setInteractive();

    // Efeito de brilho/pulse
    this.scene.tweens.add({
      targets: sprite,
      alpha: { from: 1, to: 0.7 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    sprite.on('pointerdown', () => {
      console.log('💎 Cristal clicado:', elementData.id);
      // TODO: Implementar sistema de coleta
    });
  }

  /**
   * Cria elemento fallback caso assets não estejam disponíveis
   */
  createFallbackElement(elementData) {
    const { element_type, x, y, rotation, scale } = elementData;

    // Criar forma geométrica simples como fallback
    const graphics = this.scene.add.graphics();

    if (element_type === 'asteroid') {
      // Círculo cinza para asteroides
      graphics.fillStyle(0x8B8680);
      graphics.fillCircle(0, 0, 20);
    } else if (element_type === 'crystal') {
      // Hexágono azul para cristais
      graphics.fillStyle(0x00FFFF);
      graphics.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = Math.cos(angle) * 15;
        const py = Math.sin(angle) * 15;
        if (i === 0) graphics.moveTo(px, py);
        else graphics.lineTo(px, py);
      }
      graphics.closePath();
      graphics.fillPath();
    }

    // Converter para textura
    const textureKey = `fallback_${element_type}_${elementData.id}`;
    graphics.generateTexture(textureKey, 64, 64);
    graphics.destroy();

    // Criar sprite com a textura
    const sprite = this.scene.physics.add.sprite(x, y, textureKey);
    sprite.setRotation(rotation || 0);
    sprite.setScale(scale || 1);
    sprite.elementId = elementData.id;
    sprite.elementType = element_type;

    return sprite;
  }

  /**
   * Remove assets de chunks que não são mais necessários
   */
  unloadChunkAssets(chunkX, chunkY) {
    const chunkKey = `${chunkX},${chunkY}`;

    if (this.loadedChunks.has(chunkKey)) {
      this.loadedChunks.delete(chunkKey);
      this.chunkAssets.delete(chunkKey);
      console.log(`🗑️ Assets descarregados do chunk (${chunkX}, ${chunkY})`);
    }
  }

  /**
   * Limpa todos os assets
   */
  cleanup() {
    console.log('🧹 Limpando Asset Manager...');

    this.loadedAssets.clear();
    this.loadedChunks.clear();
    this.chunkAssets.clear();

    // Destruir texturas criadas dinamicamente
    const textures = this.scene.textures.getTextureKeys();
    textures.forEach(key => {
      if (key.startsWith('fallback_')) {
        this.scene.textures.remove(key);
      }
    });

    console.log('✅ Asset Manager limpo');
  }

  /**
   * Obtém estatísticas de uso
   */
  getStats() {
    return {
      loadedAssets: this.loadedAssets.size,
      loadedChunks: this.loadedChunks.size,
      chunkCacheSize: this.chunkAssets.size,
      textureCount: this.scene.textures.getTextureKeys().length
    };
  }
}
