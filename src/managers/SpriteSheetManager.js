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