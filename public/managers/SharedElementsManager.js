// =====================================================
// SHARED ELEMENTS MANAGER - Sistema Compartilhado
// =====================================================

class SharedElementsManager {
  constructor(scene) {
    this.scene = scene;
    this.elements = new Map(); // Cache local de elementos
    this.currentChunk = null;
    this.serverUrl = window.VITE_SERVER_URL || 'https://spaceshiponsol-production-5493.up.railway.app';
  }

  /**
   * Carrega elementos do chunk atual do servidor
   */
  async loadChunkElements(chunkX, chunkY) {
    try {
      console.log(`📦 Carregando elementos do chunk (${chunkX}, ${chunkY})`);
      
      const response = await fetch(`${this.serverUrl}/api/chunk/${chunkX}/${chunkY}/elements`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        console.log(`✅ ${data.count} elementos carregados do chunk (${chunkX}, ${chunkY})`);
        return data.elements;
      } else {
        throw new Error(data.message || 'Erro ao carregar elementos');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar elementos do chunk:', error);
      return [];
    }
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
    this.scene.physics.add.existing(meteor);
    meteor.body.setImmovable(true);
    
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
