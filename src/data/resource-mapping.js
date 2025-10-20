/**
 * Resource Mapping Configuration
 * Mapeamento completo de todos os recursos existentes no banco de dados
 */

export const RESOURCE_TYPES = {
  // Metais (6 tipos)
  METALS: {
    iron: { name: 'Ferro', rarity: 'common', color: '#8B8680', density: 1.0 },
    copper: { name: 'Cobre', rarity: 'common', color: '#B87333', density: 0.8 },
    aluminum: { name: 'Alumínio', rarity: 'uncommon', color: '#C0C0C0', density: 0.6 },
    titanium: { name: 'Titânio', rarity: 'rare', color: '#8890A0', density: 1.2 },
    platinum: { name: 'Platina', rarity: 'epic', color: '#E5E4E2', density: 1.5 },
    energy_crystal: { name: 'Cristal de Energia', rarity: 'legendary', color: '#FFD700', density: 0.8 }
  },

  // Combustíveis (4 tipos)
  FUELS: {
    hydrogen: { name: 'Hidrogênio', rarity: 'common', color: '#00FFFF', density: 0.3 },
    deuterium: { name: 'Deutério', rarity: 'uncommon', color: '#00CCFF', density: 0.4 },
    antimatter: { name: 'Antimatéria', rarity: 'rare', color: '#FF00FF', density: 0.2 },
    power_crystal: { name: 'Cristal de Poder', rarity: 'epic', color: '#FFFF00', density: 0.6 }
  },

  // Oxigênio (3 tipos)
  OXYGEN: {
    liquid_oxygen: { name: 'Oxigênio Líquido', rarity: 'common', color: '#4169E1', density: 0.7 },
    compressed_oxygen: { name: 'Oxigênio Comprimido', rarity: 'uncommon', color: '#6495ED', density: 0.9 },
    air_crystal: { name: 'Cristal de Ar', rarity: 'rare', color: '#87CEEB', density: 0.5 }
  },

  // Projéteis (4 tipos)
  PROJECTILES: {
    basic_missiles: { name: 'Mísseis Básicos', rarity: 'common', color: '#FF6347', density: 2.0 },
    guided_missiles: { name: 'Mísseis Guiados', rarity: 'uncommon', color: '#FF4500', density: 2.2 },
    energy_missiles: { name: 'Mísseis Energéticos', rarity: 'rare', color: '#FF1493', density: 1.8 },
    plasma_torpedoes: { name: 'Torpedos de Plasma', rarity: 'epic', color: '#DC143C', density: 2.5 }
  },

  // Especiais (3 tipos)
  SPECIAL: {
    space_crystal: { name: 'Cristal Espacial', rarity: 'mythic', color: '#9400D3', density: 0.4 },
    stellar_essence: { name: 'Essência Estelar', rarity: 'mythic', color: '#FFB6C1', density: 0.3 },
    reality_fragment: { name: 'Fragmento de Realidade', rarity: 'mythic', color: '#FFA500', density: 0.2 }
  }
};

export const PLANET_TYPES = {
  rocky: {
    name: 'Rochoso',
    colors: ['#8B7355', '#A0522D', '#CD853F'],
    resources: ['iron', 'copper', 'aluminum'],
    rarity: 'common'
  },
  icy: {
    name: 'Gelado',
    colors: ['#B0E0E6', '#87CEEB', '#ADD8E6'],
    resources: ['liquid_oxygen', 'hydrogen', 'iron'],
    rarity: 'common'
  },
  desert: {
    name: 'Deserto',
    colors: ['#DEB887', '#D2691E', '#F4A460'],
    resources: ['aluminum', 'copper', 'deuterium'],
    rarity: 'uncommon'
  },
  crystal: {
    name: 'Cristalino',
    colors: ['#E6E6FA', '#D8BFD8', '#DDA0DD'],
    resources: ['titanium', 'energy_crystal', 'antimatter'],
    rarity: 'rare'
  },
  gas: {
    name: 'Gasoso',
    colors: ['#FFB6C1', '#FFC0CB', '#FFE4E1'],
    resources: ['platinum', 'power_crystal', 'stellar_essence'],
    rarity: 'epic'
  }
};

export const NPC_SHIP_TYPES = {
  trader: {
    name: 'Comerciante',
    behavior: 'peaceful',
    colors: ['#32CD32', '#228B22'],
    size: 'medium',
    speed: 'slow'
  },
  miner: {
    name: 'Minerador',
    behavior: 'neutral',
    colors: ['#FFD700', '#FFA500'],
    size: 'medium',
    speed: 'medium'
  },
  patrol: {
    name: 'Patrulha',
    behavior: 'hostile',
    colors: ['#FF0000', '#8B0000'],
    size: 'large',
    speed: 'fast'
  },
  scavenger: {
    name: 'Catador',
    behavior: 'neutral',
    colors: ['#808080', '#696969'],
    size: 'small',
    speed: 'medium'
  },
  explorer: {
    name: 'Explorador',
    behavior: 'friendly',
    colors: ['#00CED1', '#008B8B'],
    size: 'small',
    speed: 'fast'
  }
};

export const STATION_TYPES = {
  trading_post: {
    name: 'Posto de Comércio',
    type: 'trade',
    size: 'large',
    services: ['buy', 'sell', 'repair']
  },
  mining_station: {
    name: 'Estação de Mineração',
    type: 'mining',
    size: 'medium',
    services: ['refine', 'store', 'launch']
  },
  research_outpost: {
    name: 'Posto de Pesquisa',
    type: 'research',
    size: 'small',
    services: ['upgrade', 'analyze', 'trade']
  },
  military_base: {
    name: 'Base Militar',
    type: 'military',
    size: 'large',
    services: ['repair', 'rearm', 'mission']
  },
  refueling_station: {
    name: 'Estação de Reabastecimento',
    type: 'refuel',
    size: 'medium',
    services: ['refuel', 'repair', 'trade']
  }
};

// Configuração de spawn por zona
export const SPAWN_CONFIG = {
  safe: {
    elements: ['asteroid', 'crystal', 'npc_trader', 'npc_miner', 'station_trading_post', 'station_mining_station'],
    resource_rarity: { common: 0.7, uncommon: 0.25, rare: 0.05, epic: 0.0, legendary: 0.0, mythic: 0.0 }
  },
  resource: {
    elements: ['asteroid', 'crystal', 'npc_miner', 'npc_scavenger', 'station_mining_station', 'station_refueling_station'],
    resource_rarity: { common: 0.4, uncommon: 0.35, rare: 0.2, epic: 0.05, legendary: 0.0, mythic: 0.0 }
  },
  hostile: {
    elements: ['asteroid', 'crystal', 'npc_patrol', 'npc_scavenger', 'station_military_base'],
    resource_rarity: { common: 0.2, uncommon: 0.3, rare: 0.3, epic: 0.15, legendary: 0.04, mythic: 0.01 }
  }
};

// Mapeamento de recursos para sprites
export const RESOURCE_SPRITE_MAPPING = {
  // Metais
  iron: { spriteSheet: 'resources_metals', frames: ['iron_1', 'iron_2', 'iron_3'] },
  copper: { spriteSheet: 'resources_metals', frames: ['copper_1', 'copper_2', 'copper_3'] },
  aluminum: { spriteSheet: 'resources_metals', frames: ['aluminum_1', 'aluminum_2'] },
  titanium: { spriteSheet: 'resources_metals', frames: ['titanium_1', 'titanium_2'] },
  platinum: { spriteSheet: 'resources_metals', frames: ['platinum_1'] },
  energy_crystal: { spriteSheet: 'resources_crystals', frames: ['energy_crystal_1', 'energy_crystal_2'] },

  // Combustíveis
  hydrogen: { spriteSheet: 'resources_fuels', frames: ['hydrogen_1', 'hydrogen_2', 'hydrogen_3'] },
  deuterium: { spriteSheet: 'resources_fuels', frames: ['deuterium_1', 'deuterium_2'] },
  antimatter: { spriteSheet: 'resources_fuels', frames: ['antimatter_1'] },
  power_crystal: { spriteSheet: 'resources_crystals', frames: ['power_crystal_1'] },

  // Oxigênio
  liquid_oxygen: { spriteSheet: 'resources_oxygen', frames: ['liquid_oxygen_1', 'liquid_oxygen_2'] },
  compressed_oxygen: { spriteSheet: 'resources_oxygen', frames: ['compressed_oxygen_1'] },
  air_crystal: { spriteSheet: 'resources_crystals', frames: ['air_crystal_1'] },

  // Projéteis
  basic_missiles: { spriteSheet: 'resources_projectiles', frames: ['basic_missile_1', 'basic_missile_2'] },
  guided_missiles: { spriteSheet: 'resources_projectiles', frames: ['guided_missile_1'] },
  energy_missiles: { spriteSheet: 'resources_projectiles', frames: ['energy_missile_1'] },
  plasma_torpedoes: { spriteSheet: 'resources_projectiles', frames: ['plasma_torpedo_1'] },

  // Especiais
  space_crystal: { spriteSheet: 'resources_special', frames: ['space_crystal_1'] },
  stellar_essence: { spriteSheet: 'resources_special', frames: ['stellar_essence_1'] },
  reality_fragment: { spriteSheet: 'resources_special', frames: ['reality_fragment_1'] }
};

export default {
  RESOURCE_TYPES,
  PLANET_TYPES,
  NPC_SHIP_TYPES,
  STATION_TYPES,
  SPAWN_CONFIG,
  RESOURCE_SPRITE_MAPPING
};