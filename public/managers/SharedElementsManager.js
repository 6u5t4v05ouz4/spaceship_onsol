// =====================================================
// SHARED ELEMENTS MANAGER - Sistema Compartilhado
// =====================================================

class SharedElementsManager {
  constructor(scene) {
    this.scene = scene;
    this.elements = new Map(); // Cache local de elementos
    this.currentChunk = null;
    this.supabase = window.supabaseClient; // Usar Supabase em vez de Railway
    console.log('🌐 SharedElementsManager inicializado com Supabase.');
  }

  /**
   * Carrega elementos do chunk atual do Supabase
   */
  async loadChunkElements(chunkX, chunkY) {
    try {
      console.log(`📦 Carregando elementos do chunk (${chunkX}, ${chunkY}) do Supabase`);
      
      // Buscar elementos existentes no Supabase
      const { data: existingElements, error } = await this.supabase
        .from('game_elements')
        .select('*')
        .eq('chunk_x', chunkX)
        .eq('chunk_y', chunkY);

      if (error) {
        console.error('❌ Erro ao buscar elementos do Supabase:', error);
        return [];
      }

      if (existingElements && existingElements.length > 0) {
        console.log(`✅ ${existingElements.length} elementos existentes encontrados para o chunk (${chunkX}, ${chunkY}).`);
        return existingElements;
      }

      // Se não existem elementos, gerar novos
      console.log(`🆕 Gerando novos elementos para o chunk (${chunkX}, ${chunkY})...`);
      const newElements = this.generateChunkElements(chunkX, chunkY);
      
      // Salvar no Supabase
      const { data: savedElements, error: saveError } = await this.supabase
        .from('game_elements')
        .insert(newElements)
        .select();

      if (saveError) {
        console.error('❌ Erro ao salvar elementos no Supabase:', saveError);
        return newElements; // Retornar elementos gerados mesmo se não salvar
      }

      console.log(`✅ ${savedElements.length} elementos gerados e salvos para o chunk (${chunkX}, ${chunkY}).`);
      return savedElements;

    } catch (error) {
      console.error('❌ Erro ao carregar elementos do chunk:', error);
      return [];
    }
  }

  /**
   * Gera elementos para um chunk usando algoritmo determinístico
   */
  generateChunkElements(chunkX, chunkY) {
    const elements = [];
    const baseSeed = `${chunkX},${chunkY}`;
    const CHUNK_SIZE = 1000;
    
    // Gerar Meteoros
    for (let i = 0; i < 10; i++) {
      const randomX = this.seededRandom(baseSeed, i * 2);
      const randomY = this.seededRandom(baseSeed, i * 2 + 1);
      const x = chunkX * CHUNK_SIZE + Math.floor(randomX * CHUNK_SIZE);
      const y = chunkY * CHUNK_SIZE + Math.floor(randomY * CHUNK_SIZE);
      
      elements.push({
        chunk_x: chunkX,
        chunk_y: chunkY,
        element_type: 'meteor',
        x,
        y,
        data: { 
          size: Math.floor(this.seededRandom(baseSeed, i * 3) * 3) + 1,
          health: 100,
          speed: 50
        }
      });
    }

    // Gerar NPCs
    for (let i = 0; i < 5; i++) {
      const randomX = this.seededRandom(baseSeed, i * 4 + 2);
      const randomY = this.seededRandom(baseSeed, i * 4 + 3);
      const x = chunkX * CHUNK_SIZE + Math.floor(randomX * CHUNK_SIZE);
      const y = chunkY * CHUNK_SIZE + Math.floor(randomY * CHUNK_SIZE);
      
      elements.push({
        chunk_x: chunkX,
        chunk_y: chunkY,
        element_type: 'npc',
        x,
        y,
        data: { 
          health: Math.floor(this.seededRandom(baseSeed, i * 5) * 100) + 50,
          speed: 30,
          aiType: ['patrol', 'aggressive', 'defensive'][Math.floor(this.seededRandom(baseSeed, i * 6) * 3)]
        }
      });
    }

    // Gerar Planetas
    for (let i = 0; i < 3; i++) {
      const randomX = this.seededRandom(baseSeed, i * 6 + 4);
      const randomY = this.seededRandom(baseSeed, i * 6 + 5);
      const x = chunkX * CHUNK_SIZE + Math.floor(randomX * CHUNK_SIZE);
      const y = chunkY * CHUNK_SIZE + Math.floor(randomY * CHUNK_SIZE);
      
      elements.push({
        chunk_x: chunkX,
        chunk_y: chunkY,
        element_type: 'planet',
        x,
        y,
        data: { 
          resourceType: `resource_${Math.floor(this.seededRandom(baseSeed, i * 7) * 3) + 1}`,
          miningRate: Math.floor(this.seededRandom(baseSeed, i * 8) * 50) + 10,
          capacity: Math.floor(this.seededRandom(baseSeed, i * 9) * 1000) + 500
        }
      });
    }

    return elements;
  }

  /**
   * Gera um número pseudo-aleatório baseado em seed
   */
  seededRandom(seed, index) {
    const str = `${seed}-${index}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(Math.sin(hash)) % 1;
  }

  /**
   * Cria elementos no Phaser baseados nos dados do servidor
   */
  createElementsFromServer(elements) {
    elements.forEach(element => {
      switch (element.element_type) {
        case 'meteor':
          this.createMeteor(element);
          break;
        case 'npc':
          this.createNPC(element);
          break;
        case 'planet':
          this.createPlanet(element);
          break;
      }
    });
  }

  /**
   * Cria meteoro baseado nos dados do servidor
   */
  createMeteor(element) {
    const meteor = this.scene.add.sprite(element.x, element.y, 'meteoro');
    meteor.setData('serverId', element.id);
    meteor.setData('health', element.data.health);
    meteor.setData('speed', element.data.speed);
    meteor.setData('size', element.data.size);
    
    // Aplicar escala baseada no tamanho
    meteor.setScale(element.data.size);
    
    // Adicionar física
    this.scene.physics.add.existing(meteor);
    meteor.body.setVelocity(
      Phaser.Math.Between(-element.data.speed, element.data.speed),
      Phaser.Math.Between(-element.data.speed, element.data.speed)
    );
    
    this.elements.set(element.id, meteor);
    console.log(`☄️ Meteoro criado: ${element.id} em (${element.x}, ${element.y})`);
  }

  /**
   * Cria NPC baseado nos dados do servidor
   */
  createNPC(element) {
    const npc = this.scene.add.sprite(element.x, element.y, 'enemy');
    npc.setData('serverId', element.id);
    npc.setData('health', element.data.health);
    npc.setData('speed', element.data.speed);
    npc.setData('aiType', element.data.aiType);
    
    // Adicionar física
    this.scene.physics.add.existing(npc);
    
    // Configurar AI baseada no tipo
    this.setupNPCBehavior(npc, element.data.aiType);
    
    this.elements.set(element.id, npc);
    console.log(`🎯 NPC criado: ${element.id} em (${element.x}, ${element.y}) - AI: ${element.data.aiType}`);
  }

  /**
   * Cria planeta baseado nos dados do servidor
   */
  createPlanet(element) {
    const planet = this.scene.add.sprite(element.x, element.y, 'planets');
    planet.setData('serverId', element.id);
    planet.setData('miningRate', element.data.miningRate);
    planet.setData('resourceType', element.data.resourceType);
    planet.setData('capacity', element.data.capacity);
    
    // Adicionar física
    this.scene.physics.add.existing(planet);
    planet.body.setImmovable(true);
    
    this.elements.set(element.id, planet);
    console.log(`⛏️ Planeta criado: ${element.id} em (${element.x}, ${element.y}) - ${element.data.resourceType}`);
  }

  /**
   * Configura comportamento do NPC
   */
  setupNPCBehavior(npc, aiType) {
    switch (aiType) {
      case 'patrol':
        // Movimento em patrulha
        npc.body.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
        break;
      case 'aggressive':
        // Movimento agressivo em direção ao jogador
        npc.setData('behavior', 'aggressive');
        break;
      case 'defensive':
        // Movimento defensivo
        npc.setData('behavior', 'defensive');
        break;
    }
  }

  /**
   * Limpa elementos do chunk anterior
   */
  clearPreviousChunk() {
    this.elements.forEach((element, id) => {
      element.destroy();
    });
    this.elements.clear();
    console.log('🧹 Elementos do chunk anterior limpos');
  }

  /**
   * Atualiza chunk atual
   */
  async updateChunk(chunkX, chunkY) {
    // Verificar se mudou de chunk
    if (this.currentChunk && 
        this.currentChunk.x === chunkX && 
        this.currentChunk.y === chunkY) {
      return; // Mesmo chunk, não fazer nada
    }

    console.log(`🔄 Mudando para chunk (${chunkX}, ${chunkY})`);
    
    // Limpar chunk anterior
    this.clearPreviousChunk();
    
    // Carregar elementos do novo chunk
    const elements = await this.loadChunkElements(chunkX, chunkY);
    
    // Criar elementos no Phaser
    this.createElementsFromServer(elements);
    
    // Atualizar chunk atual
    this.currentChunk = { x: chunkX, y: chunkY };
  }
}

export default SharedElementsManager;
