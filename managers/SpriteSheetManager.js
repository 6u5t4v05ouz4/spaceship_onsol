/**
 * Sprite Sheet Manager
 * Gerencia atlas de texturas e frame mapping para elementos do mapa
 */

export default class SpriteSheetManager {
  constructor(scene) {
    this.scene = scene;
    this.spriteSheets = new Map(); // sprite sheets carregados
    this.frameMappings = new Map(); // mapeamento de frames
    this.textureAtlases = new Map(); // atlases de texturas
  }

  /**
   * Inicializa o Sprite Sheet Manager
   */
  async init() {
    console.log('🖼️ Inicializando Sprite Sheet Manager...');

    // Carregar configurações de sprite sheets
    await this.loadSpriteSheetConfigs();

    // Gerar atlas de texturas dinamicamente
    await this.generateTextureAtlases();

    console.log('✅ Sprite Sheet Manager inicializado');
  }

  /**
   * Carrega configurações dos sprite sheets
   */
  async loadSpriteSheetConfigs() {
    const configs = [
      // Configuração para asteroides
      {
        key: 'asteroids_common',
        frames: [
          { name: 'asteroid_small_1', x: 0, y: 0, width: 32, height: 32 },
          { name: 'asteroid_small_2', x: 32, y: 0, width: 32, height: 32 },
          { name: 'asteroid_small_3', x: 64, y: 0, width: 32, height: 32 },
          { name: 'asteroid_large_1', x: 0, y: 32, width: 64, height: 64 },
          { name: 'asteroid_large_2', x: 64, y: 32, width: 64, height: 64 },
          { name: 'asteroid_large_3', x: 128, y: 32, width: 64, height: 64 }
        ]
      },
      {
        key: 'asteroids_rare',
        frames: [
          { name: 'asteroid_small_rare_1', x: 0, y: 0, width: 32, height: 32 },
          { name: 'asteroid_small_rare_2', x: 32, y: 0, width: 32, height: 32 },
          { name: 'asteroid_small_rare_3', x: 64, y: 0, width: 32, height: 32 },
          { name: 'asteroid_large_rare_1', x: 0, y: 32, width: 64, height: 64 },
          { name: 'asteroid_large_rare_2', x: 64, y: 32, width: 64, height: 64 },
          { name: 'asteroid_large_rare_3', x: 128, y: 32, width: 64, height: 64 }
        ]
      },
      {
        key: 'asteroids_legendary',
        frames: [
          { name: 'asteroid_small_legendary_1', x: 0, y: 0, width: 32, height: 32 },
          { name: 'asteroid_small_legendary_2', x: 32, y: 0, width: 32, height: 32 },
          { name: 'asteroid_small_legendary_3', x: 64, y: 0, width: 32, height: 32 },
          { name: 'asteroid_large_legendary_1', x: 0, y: 32, width: 64, height: 64 },
          { name: 'asteroid_large_legendary_2', x: 64, y: 32, width: 64, height: 64 },
          { name: 'asteroid_large_legendary_3', x: 128, y: 32, width: 64, height: 64 }
        ]
      },
      // Configuração para cristais
      {
        key: 'crystals_basic',
        frames: [
          { name: 'crystal_basic_1', x: 0, y: 0, width: 24, height: 24 },
          { name: 'crystal_basic_2', x: 24, y: 0, width: 24, height: 24 },
          { name: 'crystal_basic_3', x: 48, y: 0, width: 24, height: 24 },
          { name: 'crystal_basic_4', x: 72, y: 0, width: 24, height: 24 }
        ]
      },
      {
        key: 'crystals_energy',
        frames: [
          { name: 'crystal_energy_1', x: 0, y: 0, width: 28, height: 28 },
          { name: 'crystal_energy_2', x: 28, y: 0, width: 28, height: 28 },
          { name: 'crystal_energy_3', x: 56, y: 0, width: 28, height: 28 },
          { name: 'crystal_energy_4', x: 84, y: 0, width: 28, height: 28 }
        ]
      },
      {
        key: 'crystals_quantum',
        frames: [
          { name: 'crystal_quantum_1', x: 0, y: 0, width: 32, height: 32 },
          { name: 'crystal_quantum_2', x: 32, y: 0, width: 32, height: 32 },
          { name: 'crystal_quantum_3', x: 64, y: 0, width: 32, height: 32 },
          { name: 'crystal_quantum_4', x: 96, y: 0, width: 32, height: 32 }
        ]
      },
      // Configuração para recursos - Metais
      {
        key: 'resources_metals',
        frames: [
          { name: 'iron_1', x: 0, y: 0, width: 20, height: 20 },
          { name: 'iron_2', x: 20, y: 0, width: 20, height: 20 },
          { name: 'iron_3', x: 40, y: 0, width: 20, height: 20 },
          { name: 'copper_1', x: 60, y: 0, width: 20, height: 20 },
          { name: 'copper_2', x: 80, y: 0, width: 20, height: 20 },
          { name: 'copper_3', x: 100, y: 0, width: 20, height: 20 },
          { name: 'aluminum_1', x: 120, y: 0, width: 22, height: 22 },
          { name: 'aluminum_2', x: 142, y: 0, width: 22, height: 22 },
          { name: 'titanium_1', x: 164, y: 0, width: 24, height: 24 },
          { name: 'titanium_2', x: 188, y: 0, width: 24, height: 24 },
          { name: 'platinum_1', x: 212, y: 0, width: 26, height: 26 }
        ]
      },
      // Configuração para recursos - Combustíveis
      {
        key: 'resources_fuels',
        frames: [
          { name: 'hydrogen_1', x: 0, y: 0, width: 18, height: 18 },
          { name: 'hydrogen_2', x: 18, y: 0, width: 18, height: 18 },
          { name: 'hydrogen_3', x: 36, y: 0, width: 18, height: 18 },
          { name: 'deuterium_1', x: 54, y: 0, width: 20, height: 20 },
          { name: 'deuterium_2', x: 74, y: 0, width: 20, height: 20 },
          { name: 'antimatter_1', x: 94, y: 0, width: 22, height: 22 }
        ]
      },
      // Configuração para recursos - Oxigênio
      {
        key: 'resources_oxygen',
        frames: [
          { name: 'liquid_oxygen_1', x: 0, y: 0, width: 16, height: 16 },
          { name: 'liquid_oxygen_2', x: 16, y: 0, width: 16, height: 16 },
          { name: 'compressed_oxygen_1', x: 32, y: 0, width: 18, height: 18 }
        ]
      },
      // Configuração para recursos - Cristais Especiais
      {
        key: 'resources_crystals',
        frames: [
          { name: 'basic_crystal_1', x: 0, y: 0, width: 24, height: 24 },
          { name: 'basic_crystal_2', x: 24, y: 0, width: 24, height: 24 },
          { name: 'basic_crystal_3', x: 48, y: 0, width: 24, height: 24 },
          { name: 'basic_crystal_4', x: 72, y: 0, width: 24, height: 24 },
          { name: 'energy_crystal_1', x: 96, y: 0, width: 28, height: 28 },
          { name: 'energy_crystal_2', x: 124, y: 0, width: 28, height: 28 },
          { name: 'quantum_crystal_1', x: 152, y: 0, width: 32, height: 32 },
          { name: 'quantum_crystal_2', x: 184, y: 0, width: 32, height: 32 },
          { name: 'quantum_crystal_3', x: 216, y: 0, width: 32, height: 32 },
          { name: 'quantum_crystal_4', x: 248, y: 0, width: 32, height: 32 },
          { name: 'air_crystal_1', x: 0, y: 32, width: 30, height: 30 },
          { name: 'power_crystal_1', x: 30, y: 32, width: 34, height: 34 }
        ]
      },
      // Configuração para recursos - Projéteis
      {
        key: 'resources_projectiles',
        frames: [
          { name: 'basic_missile_1', x: 0, y: 0, width: 24, height: 8 },
          { name: 'basic_missile_2', x: 24, y: 0, width: 24, height: 8 },
          { name: 'guided_missile_1', x: 48, y: 0, width: 28, height: 10 },
          { name: 'energy_missile_1', x: 76, y: 0, width: 26, height: 12 },
          { name: 'plasma_torpedo_1', x: 102, y: 0, width: 32, height: 14 }
        ]
      },
      // Configuração para recursos - Especiais
      {
        key: 'resources_special',
        frames: [
          { name: 'space_crystal_1', x: 0, y: 0, width: 36, height: 36 },
          { name: 'stellar_essence_1', x: 36, y: 0, width: 40, height: 40 },
          { name: 'reality_fragment_1', x: 76, y: 0, width: 44, height: 44 }
        ]
      },
      // Configuração para planetas
      {
        key: 'planets',
        frames: [
          { name: 'planet_rocky_1', x: 0, y: 0, width: 128, height: 128 },
          { name: 'planet_rocky_2', x: 128, y: 0, width: 128, height: 128 },
          { name: 'planet_icy_1', x: 256, y: 0, width: 128, height: 128 },
          { name: 'planet_icy_2', x: 384, y: 0, width: 128, height: 128 },
          { name: 'planet_desert_1', x: 0, y: 128, width: 128, height: 128 },
          { name: 'planet_crystal_1', x: 128, y: 128, width: 128, height: 128 },
          { name: 'planet_gas_1', x: 256, y: 128, width: 128, height: 128 },
          { name: 'planet_gas_2', x: 384, y: 128, width: 128, height: 128 }
        ]
      },
      // Configuração para naves NPCs
      {
        key: 'npc_ships',
        frames: [
          { name: 'npc_trader_1', x: 0, y: 0, width: 48, height: 32 },
          { name: 'npc_miner_1', x: 48, y: 0, width: 44, height: 36 },
          { name: 'npc_patrol_1', x: 92, y: 0, width: 52, height: 40 },
          { name: 'npc_scavenger_1', x: 144, y: 0, width: 36, height: 28 },
          { name: 'npc_explorer_1', x: 180, y: 0, width: 40, height: 30 }
        ]
      },
      // Configuração para estações espaciais
      {
        key: 'space_stations',
        frames: [
          { name: 'station_trading_post', x: 0, y: 0, width: 96, height: 80 },
          { name: 'station_mining', x: 96, y: 0, width: 80, height: 72 },
          { name: 'station_research', x: 176, y: 0, width: 88, height: 76 },
          { name: 'station_military', x: 264, y: 0, width: 104, height: 88 },
          { name: 'station_refuel', x: 368, y: 0, width: 84, height: 74 }
        ]
      },
      // Configuração para efeitos
      {
        key: 'effects_explosions',
        frames: [
          { name: 'explosion_small_1', x: 0, y: 0, width: 48, height: 48 },
          { name: 'explosion_small_2', x: 48, y: 0, width: 48, height: 48 },
          { name: 'explosion_small_3', x: 96, y: 0, width: 48, height: 48 },
          { name: 'explosion_small_4', x: 144, y: 0, width: 48, height: 48 },
          { name: 'explosion_large_1', x: 0, y: 48, width: 96, height: 96 },
          { name: 'explosion_large_2', x: 96, y: 48, width: 96, height: 96 },
          { name: 'explosion_large_3', x: 192, y: 48, width: 96, height: 96 },
          { name: 'explosion_large_4', x: 288, y: 48, width: 96, height: 96 }
        ]
      },
      {
        key: 'effects_particles',
        frames: [
          { name: 'particle_spark_1', x: 0, y: 0, width: 8, height: 8 },
          { name: 'particle_spark_2', x: 8, y: 0, width: 8, height: 8 },
          { name: 'particle_debris_1', x: 16, y: 0, width: 12, height: 12 },
          { name: 'particle_debris_2', x: 28, y: 0, width: 12, height: 12 },
          { name: 'particle_energy_1', x: 40, y: 0, width: 16, height: 16 },
          { name: 'particle_energy_2', x: 56, y: 0, width: 16, height: 16 }
        ]
      }
    ];

    // Armazenar configurações
    configs.forEach(config => {
      this.spriteSheets.set(config.key, config);

      // Criar mapeamento de frames
      config.frames.forEach(frame => {
        this.frameMappings.set(frame.name, {
          spriteSheet: config.key,
          frame: frame
        });
      });
    });

    console.log(`📋 Carregadas ${configs.length} configurações de sprite sheets`);
  }

  /**
   * Gera atlas de texturas proceduralmente
   */
  async generateTextureAtlases() {
    console.log('🎨 Gerando atlas de texturas...');

    for (const [key, config] of this.spriteSheets) {
      await this.generateProceduralTextureAtlas(key, config);
    }

    console.log('✅ Atlas de texturas gerados');
  }

  /**
   * Gera textura procedural para um sprite sheet
   */
  async generateProceduralTextureAtlas(spriteSheetKey, config) {
    // Criar canvas para o sprite sheet
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Calcular dimensões do canvas baseado nos frames
    let maxWidth = 0, maxHeight = 0;
    config.frames.forEach(frame => {
      maxWidth = Math.max(maxWidth, frame.x + frame.width);
      maxHeight = Math.max(maxHeight, frame.y + frame.height);
    });

    canvas.width = Math.max(maxWidth, 256);
    canvas.height = Math.max(maxHeight, 256);

    // Gerar texturas para cada frame
    config.frames.forEach(frame => {
      this.generateFrameTexture(ctx, frame, spriteSheetKey);
    });

    // Converter canvas para textura do Phaser
    const textureKey = spriteSheetKey;
    if (this.scene.textures.exists(textureKey)) {
      this.scene.textures.remove(textureKey);
    }

    this.scene.textures.addCanvas(textureKey, canvas);

    // Adicionar frames ao atlas
    const frames = {};
    config.frames.forEach(frame => {
      frames[frame.name] = {
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height
      };
    });

    this.scene.textures.get(textureKey).add('atlas', frames);

    console.log(`🎨 Gerado atlas procedural: ${textureKey}`);
  }

  /**
   * Gera textura para um frame específico
   */
  generateFrameTexture(ctx, frame, spriteSheetKey) {
    ctx.save();

    // Limpar área do frame
    ctx.clearRect(frame.x, frame.y, frame.width, frame.height);

    // Desenhar baseado no tipo de sprite sheet
    if (spriteSheetKey.includes('asteroid')) {
      this.drawAsteroid(ctx, frame, spriteSheetKey);
    } else if (spriteSheetKey.includes('crystal')) {
      this.drawCrystal(ctx, frame, spriteSheetKey);
    } else if (spriteSheetKey.includes('resources')) {
      this.drawResource(ctx, frame, spriteSheetKey);
    } else if (spriteSheetKey.includes('planets')) {
      this.drawPlanet(ctx, frame, spriteSheetKey);
    } else if (spriteSheetKey.includes('npc_ships')) {
      this.drawNPCShip(ctx, frame, spriteSheetKey);
    } else if (spriteSheetKey.includes('space_stations')) {
      this.drawSpaceStation(ctx, frame, spriteSheetKey);
    } else if (spriteSheetKey.includes('effects')) {
      this.drawEffect(ctx, frame, spriteSheetKey);
    }

    ctx.restore();
  }

  /**
   * Desenha um asteroide
   */
  drawAsteroid(ctx, frame, spriteSheetKey) {
    const centerX = frame.x + frame.width / 2;
    const centerY = frame.y + frame.height / 2;
    const radius = Math.min(frame.width, frame.height) / 2 - 2;

    // Determinar cor baseada na raridade
    let color = '#8B8680'; // Cinza para comum
    if (spriteSheetKey.includes('rare')) {
      color = '#CD853F'; // Marrom para raro
    } else if (spriteSheetKey.includes('legendary')) {
      color = '#FFD700'; // Dourado para lendário
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    // Desenhar forma irregular de asteroide
    ctx.beginPath();
    const points = 8;
    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 * i) / points;
      const radiusVariation = radius + (Math.random() - 0.5) * radius * 0.3;
      const x = centerX + Math.cos(angle) * radiusVariation;
      const y = centerY + Math.sin(angle) * radiusVariation;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Adicionar crateras
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (let i = 0; i < 3; i++) {
      const craterX = centerX + (Math.random() - 0.5) * radius;
      const craterY = centerY + (Math.random() - 0.5) * radius;
      const craterRadius = Math.random() * radius * 0.2;

      ctx.beginPath();
      ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Desenha um cristal
   */
  drawCrystal(ctx, frame, spriteSheetKey) {
    const centerX = frame.x + frame.width / 2;
    const centerY = frame.y + frame.height / 2;
    const size = Math.min(frame.width, frame.height) * 0.4;

    // Determinar cor baseada no tipo
    let color = '#00FFFF'; // Ciano para básico
    if (spriteSheetKey.includes('energy')) {
      color = '#FF00FF'; // Magenta para energia
    } else if (spriteSheetKey.includes('quantum')) {
      color = '#FFFF00'; // Amarelo para quântico
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    // Desenhar hexágono
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = centerX + Math.cos(angle) * size;
      const y = centerY + Math.sin(angle) * size;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Adicionar brilho central
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Desenha um efeito
   */
  drawEffect(ctx, frame, spriteSheetKey) {
    const centerX = frame.x + frame.width / 2;
    const centerY = frame.y + frame.height / 2;

    if (spriteSheetKey.includes('explosion')) {
      this.drawExplosion(ctx, frame, centerX, centerY);
    } else if (spriteSheetKey.includes('particle')) {
      this.drawParticle(ctx, frame, centerX, centerY);
    }
  }

  /**
   * Desenha naves NPCs
   */
  drawNPCShip(ctx, frame, spriteSheetKey, centerX, centerY, size) {

    // Determinar tipo de NPC baseado no spriteSheetKey
    let shipType = 'trader'; // padrão
    let colors = ['#32CD32', '#228B22']; // verde para comerciante

    if (spriteSheetKey.includes('miner')) {
      shipType = 'miner';
      colors = ['#FFD700', '#FFA500']; // dourado para minerador
    } else if (spriteSheetKey.includes('patrol')) {
      shipType = 'patrol';
      colors = ['#FF0000', '#8B0000']; // vermelho para patrulha
    } else if (spriteSheetKey.includes('scavenger')) {
      shipType = 'scavenger';
      colors = ['#808080', '#696969']; // cinza para catador
    } else if (spriteSheetKey.includes('explorer')) {
      shipType = 'explorer';
      colors = ['#00CED1', '#008B8B']; // ciano para explorador
    }

    // Desenhar corpo da nave baseado no tipo
    ctx.fillStyle = colors[0];
    ctx.strokeStyle = colors[1];
    ctx.lineWidth = 2;

    ctx.beginPath();
    if (shipType === 'trader' || shipType === 'miner') {
      // Nave cargueira (formato retangular com asas)
      ctx.rect(centerX - size, centerY - size * 0.6, size * 2, size * 1.2);
      // Asas
      ctx.moveTo(centerX - size * 1.3, centerY);
      ctx.lineTo(centerX - size, centerY - size * 0.3);
      ctx.moveTo(centerX - size * 1.3, centerY);
      ctx.lineTo(centerX - size, centerY + size * 0.3);
      ctx.moveTo(centerX + size * 1.3, centerY);
      ctx.lineTo(centerX + size, centerY - size * 0.3);
      ctx.moveTo(centerX + size * 1.3, centerY);
      ctx.lineTo(centerX + size, centerY + size * 0.3);
    } else if (shipType === 'patrol') {
      // Nave de combate (formato triangular)
      ctx.moveTo(centerX, centerY - size);
      ctx.lineTo(centerX - size * 0.8, centerY + size * 0.8);
      ctx.lineTo(centerX + size * 0.8, centerY + size * 0.8);
      ctx.closePath();
    } else if (shipType === 'scavenger') {
      // Nave pequena e irregular
      ctx.moveTo(centerX - size * 0.7, centerY - size * 0.5);
      ctx.lineTo(centerX + size * 0.3, centerY - size * 0.7);
      ctx.lineTo(centerX + size * 0.8, centerY + size * 0.2);
      ctx.lineTo(centerX - size * 0.2, centerY + size * 0.8);
      ctx.lineTo(centerX - size * 0.9, centerY);
      ctx.closePath();
    } else if (shipType === 'explorer') {
      // Nave rápida e aerodinâmica
      ctx.ellipse(centerX, centerY, size * 0.6, size * 1.2, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // Adicionar detalhes
    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Janelas/luzes
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 3; i++) {
      const lightX = centerX - size * 0.6 + i * size * 0.6;
      const lightY = centerY - size * 0.2;
      ctx.beginPath();
      ctx.arc(lightX, lightY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Desenha estações espaciais
   */
  drawSpaceStation(ctx, frame, spriteSheetKey, centerX, centerY, size) {

    // Determinar tipo de estação
    let stationType = 'trading_post'; // padrão
    let color = '#4169E1'; // azul para posto de comércio

    if (spriteSheetKey.includes('mining')) {
      stationType = 'mining_station';
      color = '#FF8C00'; // laranja para estação de mineração
    } else if (spriteSheetKey.includes('research')) {
      stationType = 'research_outpost';
      color = '#9370DB'; // roxo para posto de pesquisa
    } else if (spriteSheetKey.includes('military')) {
      stationType = 'military_base';
      color = '#DC143C'; // vermelho para base militar
    } else if (spriteSheetKey.includes('refueling')) {
      stationType = 'refueling_station';
      color = '#00CED1'; // ciano para estação de reabastecimento
    }

    // Desenhar estrutura principal
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    // Corpo principal da estação
    ctx.beginPath();
    if (stationType === 'trading_post' || stationType === 'military_base') {
      // Estação grande e quadrada
      ctx.rect(centerX - size, centerY - size, size * 2, size * 2);
    } else if (stationType === 'mining_station' || stationType === 'refueling_station') {
      // Estação circular
      ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    } else if (stationType === 'research_outpost') {
      // Estação hexagonal
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = centerX + Math.cos(angle) * size;
        const y = centerY + Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();

    // Adicionar módulos e detalhes
    ctx.fillStyle = '#C0C0C0';
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1;

    // Módulos externos
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const moduleX = centerX + Math.cos(angle) * size * 1.5;
      const moduleY = centerY + Math.sin(angle) * size * 1.5;

      ctx.beginPath();
      ctx.rect(moduleX - size * 0.3, moduleY - size * 0.3, size * 0.6, size * 0.6);
      ctx.fill();
      ctx.stroke();

      // Conector
      ctx.beginPath();
      ctx.moveTo(centerX + Math.cos(angle) * size, centerY + Math.sin(angle) * size);
      ctx.lineTo(moduleX, moduleY);
      ctx.stroke();
    }

    // Luzes de navegação
    ctx.fillStyle = '#FFFF00';
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i;
      const lightX = centerX + Math.cos(angle) * size * 0.8;
      const lightY = centerY + Math.sin(angle) * size * 0.8;

      ctx.beginPath();
      ctx.arc(lightX, lightY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Centro de comando
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Desenha recursos minerais
   */
  drawResource(ctx, frame, spriteSheetKey) {
    const centerX = frame.x + frame.width / 2;
    const centerY = frame.y + frame.height / 2;
    const size = Math.min(frame.width, frame.height) / 2;

    if (spriteSheetKey.includes('metals')) {
      this.drawMetalResource(ctx, frame, spriteSheetKey, centerX, centerY, size);
    } else if (spriteSheetKey.includes('fuels')) {
      this.drawFuelResource(ctx, frame, spriteSheetKey, centerX, centerY, size);
    } else if (spriteSheetKey.includes('oxygen')) {
      this.drawOxygenResource(ctx, frame, spriteSheetKey, centerX, centerY, size);
    } else if (spriteSheetKey.includes('crystals')) {
      this.drawSpecialCrystal(ctx, frame, spriteSheetKey, centerX, centerY, size);
    } else if (spriteSheetKey.includes('projectiles')) {
      this.drawProjectileResource(ctx, frame, spriteSheetKey, centerX, centerY, size);
    } else if (spriteSheetKey.includes('special')) {
      this.drawSpecialResource(ctx, frame, spriteSheetKey, centerX, centerY, size);
    }
  }

  /**
   * Desenha recurso de metal
   */
  drawMetalResource(ctx, frame, spriteSheetKey, centerX, centerY, size) {
    let color = '#8B8680'; // Ferro por padrão

    if (spriteSheetKey.includes('copper')) color = '#B87333';
    else if (spriteSheetKey.includes('aluminum')) color = '#C0C0C0';
    else if (spriteSheetKey.includes('titanium')) color = '#8890A0';
    else if (spriteSheetKey.includes('platinum')) color = '#E5E4E2';

    ctx.fillStyle = color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    // Forma geométrica angular para metal
    ctx.beginPath();
    const sides = 6;
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const x = centerX + Math.cos(angle) * size;
      const y = centerY + Math.sin(angle) * size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Brilho metálico
    const gradient = ctx.createLinearGradient(
      centerX - size, centerY - size,
      centerX + size, centerY + size
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  /**
   * Desenha recurso de combustível
   */
  drawFuelResource(ctx, frame, spriteSheetKey, centerX, centerY, size) {
    let color = '#00FFFF'; // Hidrogênio por padrão

    if (spriteSheetKey.includes('deuterium')) color = '#00CCFF';
    else if (spriteSheetKey.includes('antimatter')) color = '#FF00FF';

    ctx.fillStyle = color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    // Forma de gota/elipse para combustível
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, size * 0.8, size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Efeito de energia pulsante
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.7, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  /**
   * Desenha recurso de oxigênio
   */
  drawOxygenResource(ctx, frame, spriteSheetKey, centerX, centerY, size) {
    let color = '#4169E1'; // Oxigênio líquido por padrão

    if (spriteSheetKey.includes('compressed')) color = '#6495ED';
    else if (spriteSheetKey.includes('air')) color = '#87CEEB';

    ctx.fillStyle = color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    // Bolha de ar para oxigênio
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bolhas internas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 3; i++) {
      const bubbleX = centerX + (Math.random() - 0.5) * size;
      const bubbleY = centerY + (Math.random() - 0.5) * size;
      const bubbleSize = size * 0.2;

      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Desenha cristal especial
   */
  drawSpecialCrystal(ctx, frame, spriteSheetKey, centerX, centerY, size) {
    let color = '#FFD700'; // Cristal de energia por padrão

    if (spriteSheetKey.includes('air')) color = '#87CEEB';
    else if (spriteSheetKey.includes('power')) color = '#FFFF00';

    ctx.fillStyle = color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    // Cristal com múltiplas pontas
    const points = 8;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI * i) / points;
      const radius = i % 2 === 0 ? size : size * 0.5;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Brilho intenso
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(0.6, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  /**
   * Desenha recurso de projétil
   */
  drawProjectileResource(ctx, frame, spriteSheetKey, centerX, centerY, size) {
    let color = '#FF6347'; // Mísseis básicos por padrão

    if (spriteSheetKey.includes('guided')) color = '#FF4500';
    else if (spriteSheetKey.includes('energy')) color = '#FF1493';
    else if (spriteSheetKey.includes('plasma')) color = '#DC143C';

    ctx.fillStyle = color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    // Forma de míssil/foguete
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY);
    ctx.lineTo(centerX + size * 0.7, centerY - size * 0.3);
    ctx.lineTo(centerX + size, centerY);
    ctx.lineTo(centerX + size * 0.7, centerY + size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ponta de fogo
    ctx.fillStyle = '#FF8800';
    ctx.beginPath();
    ctx.moveTo(centerX + size * 0.7, centerY - size * 0.3);
    ctx.lineTo(centerX + size * 1.2, centerY);
    ctx.lineTo(centerX + size * 0.7, centerY + size * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Desenha recurso especial
   */
  drawSpecialResource(ctx, frame, spriteSheetKey, centerX, centerY, size) {
    let color = '#9400D3'; // Cristal espacial por padrão

    if (spriteSheetKey.includes('stellar')) color = '#FFB6C1';
    else if (spriteSheetKey.includes('reality')) color = '#FFA500';

    // Efeito especial com múltiplas camadas
    for (let layer = 3; layer > 0; layer--) {
      const layerSize = size * (layer / 3);
      const layerAlpha = 0.3 / layer;

      ctx.fillStyle = color;
      ctx.globalAlpha = layerAlpha;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;

      // Forma irregular mística
      ctx.beginPath();
      const points = 12;
      for (let i = 0; i < points; i++) {
        const angle = (Math.PI * 2 * i) / points;
        const radiusVariation = layerSize + Math.sin(angle * 3) * layerSize * 0.3;
        const x = centerX + Math.cos(angle) * radiusVariation;
        const y = centerY + Math.sin(angle) * radiusVariation;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Centro brilhante
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.2, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Desenha planeta
   */
  drawPlanet(ctx, frame, spriteSheetKey, centerX, centerY, size) {
    let colors = ['#8B7355', '#A0522D']; // Rochoso por padrão

    if (spriteSheetKey.includes('icy')) colors = ['#B0E0E6', '#87CEEB'];
    else if (spriteSheetKey.includes('desert')) colors = ['#DEB887', '#D2691E'];
    else if (spriteSheetKey.includes('crystal')) colors = ['#E6E6FA', '#D8BFD8'];
    else if (spriteSheetKey.includes('gas')) colors = ['#FFB6C1', '#FFC0CB'];

    // Corpo principal do planeta
    const gradient = ctx.createRadialGradient(
      centerX - size * 0.3, centerY - size * 0.3, 0,
      centerX, centerY, size
    );
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.7, colors[1]);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    ctx.fill();

    // Anéis (para planetas gasosos)
    if (spriteSheetKey.includes('gas')) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, size * 1.5, size * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Detalhes superficiais
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 5; i++) {
      const craterX = centerX + (Math.random() - 0.5) * size * 1.5;
      const craterY = centerY + (Math.random() - 0.5) * size * 1.5;
      const craterSize = Math.random() * size * 0.2;

      ctx.beginPath();
      ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Desenha uma explosão
   */
  drawExplosion(ctx, frame, centerX, centerY) {
    const maxRadius = Math.min(frame.width, frame.height) / 2 - 2;

    // Explosão com círculos concêntricos
    const colors = ['#FFFFFF', '#FFFF00', '#FF8800', '#FF0000', '#880000'];

    colors.forEach((color, index) => {
      const radius = maxRadius * (1 - index * 0.2);
      if (radius > 0) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7 - index * 0.1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.globalAlpha = 1;
  }

  /**
   * Desenha uma partícula
   */
  drawParticle(ctx, frame, centerX, centerY) {
    const size = Math.min(frame.width, frame.height) / 3;

    // Partícula como pequeno círculo brilhante
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.5, '#FFFF00');
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Obtém um frame aleatório para um tipo de elemento
   */
  getRandomFrame(elementType, variant = 'common') {
    const frameNames = Array.from(this.frameMappings.keys())
      .filter(name => name.includes(elementType) && name.includes(variant));

    if (frameNames.length === 0) {
      console.warn(`⚠️ Nenhum frame encontrado para ${elementType}_${variant}`);
      return 'asteroid_small_1'; // Fallback
    }

    const randomFrame = frameNames[Math.floor(Math.random() * frameNames.length)];
    return this.frameMappings.get(randomFrame);
  }

  /**
   * Obtém todas as variações de frames para um tipo
   */
  getAllFrames(elementType) {
    const frameNames = Array.from(this.frameMappings.keys())
      .filter(name => name.includes(elementType));

    return frameNames.map(name => this.frameMappings.get(name));
  }

  /**
   * Verifica se um sprite sheet está carregado
   */
  isSpriteSheetLoaded(spriteSheetKey) {
    return this.scene.textures.exists(spriteSheetKey);
  }

  /**
   * Obtém estatísticas dos sprite sheets
   */
  getStats() {
    return {
      spriteSheetsCount: this.spriteSheets.size,
      frameMappingsCount: this.frameMappings.size,
      loadedAtlases: this.textureAtlases.size,
      availableFrames: Array.from(this.frameMappings.keys())
    };
  }

  /**
   * Limpa todos os recursos
   */
  cleanup() {
    console.log('🧹 Limpando Sprite Sheet Manager...');

    // Remover texturas geradas
    for (const key of this.spriteSheets.keys()) {
      if (this.scene.textures.exists(key)) {
        this.scene.textures.remove(key);
      }
    }

    this.spriteSheets.clear();
    this.frameMappings.clear();
    this.textureAtlases.clear();

    console.log('✅ Sprite Sheet Manager limpo');
  }
}