# 🚀 PLANO COMPLETO: COLEÇÃO NFT SPACE CRYPTO MINER

## 📊 Informações do Projeto

- **Devnet:** 110 NFTs
- **Mainnet:** 3.777 NFTs
- **Blockchain:** Solana
- **Storage:** IPFS via Filebase
- **Padrão:** Metaplex Token Metadata
- **Ferramenta:** Metaplex Sugar CLI

---

## 🎯 DECISÃO TECNOLÓGICA

### Metaplex Sugar CLI vs Candy Machine v3

| Aspecto | Sugar CLI ✅ | Candy Machine v3 |
|---------|-------------|------------------|
| **Controle** | Total sobre metadata e atributos | Mais automatizado |
| **Flexibilidade** | Alta (ideal para atributos customizados) | Média |
| **Documentação** | Excelente e atualizada | Excelente |
| **Custo Devnet** | ~0.5-1 SOL (110 NFTs) | ~0.5-1 SOL |
| **Validação** | Nativo, verificação on-chain fácil | Nativo |
| **Atributos customizados** | ✅ Perfeito para gameplay | ✅ Também suporta |

**🏆 ESCOLHA: Metaplex Sugar CLI**

**Justificativa:** Controle total sobre metadata e atributos do gameplay (velocidade, carga, combustível, oxigênio, escudo).

---

## 📈 ESTRUTURA DE ATRIBUTOS

### Distribuição de Raridades (110 NFTs Devnet)

| Raridade | Quantidade | % | Velocidade | Carga | Combustível | Oxigênio | Escudo |
|----------|-----------|---|------------|-------|-------------|----------|--------|
| **Comum** | 55 | 50% | 100 | 50 | 100 | 100 | 100 |
| **Incomum** | 28 | 25% | 200 | 100 | 150 | 150 | 200 |
| **Raro** | 17 | 15% | 300 | 150 | 200 | 200 | 300 |
| **Épico** | 9 | 8% | 400 | 175 | 250 | 250 | 400 |
| **Lendário** | 2 | 2% | 500 | 200 | 300 | 300 | 500 |

### Distribuição de Raridades (3.777 NFTs Mainnet)

| Raridade | Quantidade | % | Atributos |
|----------|-----------|---|-----------|
| **Comum** | 1.889 | 50% | Velocidade 100, Carga 50, Combustível 100, Oxigênio 100, Escudo 100 |
| **Incomum** | 944 | 25% | Velocidade 200, Carga 100, Combustível 150, Oxigênio 150, Escudo 200 |
| **Raro** | 567 | 15% | Velocidade 300, Carga 150, Combustível 200, Oxigênio 200, Escudo 300 |
| **Épico** | 302 | 8% | Velocidade 400, Carga 175, Combustível 250, Oxigênio 250, Escudo 400 |
| **Lendário** | 75 | 2% | Velocidade 500, Carga 200, Combustível 300, Oxigênio 300, Escudo 500 |

---

## 📝 ESTRUTURA DE METADATA (Padrão Metaplex)

### Exemplo: NFT Comum

```json
{
  "name": "Space Miner #0001",
  "symbol": "SPACESHIP",
  "description": "Nave espacial mineradora única da coleção Space Crypto Miner",
  "seller_fee_basis_points": 500,
  "image": "0.png",
  "external_url": "https://space-crypto-miner.com",
  "attributes": [
    {
      "trait_type": "Raridade",
      "value": "Comum"
    },
    {
      "trait_type": "Velocidade",
      "value": 100
    },
    {
      "trait_type": "Carga",
      "value": 50
    },
    {
      "trait_type": "Combustível",
      "value": 100
    },
    {
      "trait_type": "Oxigênio",
      "value": 100
    },
    {
      "trait_type": "Escudo",
      "value": 100
    },
    {
      "trait_type": "Modelo",
      "value": "Nave-001"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "0.png",
        "type": "image/png"
      }
    ],
    "category": "image",
    "creators": [
      {
        "address": "SUA_WALLET_ADDRESS_AQUI",
        "share": 100
      }
    ]
  }
}
```

### Exemplo: NFT Lendário

```json
{
  "name": "Space Miner #0110",
  "symbol": "SPACESHIP",
  "description": "Nave espacial mineradora lendária da coleção Space Crypto Miner",
  "seller_fee_basis_points": 500,
  "image": "109.png",
  "external_url": "https://space-crypto-miner.com",
  "attributes": [
    {
      "trait_type": "Raridade",
      "value": "Lendário"
    },
    {
      "trait_type": "Velocidade",
      "value": 500
    },
    {
      "trait_type": "Carga",
      "value": 200
    },
    {
      "trait_type": "Combustível",
      "value": 300
    },
    {
      "trait_type": "Oxigênio",
      "value": 300
    },
    {
      "trait_type": "Escudo",
      "value": 500
    },
    {
      "trait_type": "Modelo",
      "value": "Nave-110"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "109.png",
        "type": "image/png"
      }
    ],
    "category": "image",
    "creators": [
      {
        "address": "SUA_WALLET_ADDRESS_AQUI",
        "share": 100
      }
    ]
  }
}
```

---

## 🗂️ ESTRUTURA DE PASTAS

```
nft_collection/
├── devnet/
│   ├── images/
│   │   ├── 0.png
│   │   ├── 1.png
│   │   ├── 2.png
│   │   └── ... (110 total)
│   ├── metadata/
│   │   ├── 0.json
│   │   ├── 1.json
│   │   ├── 2.json
│   │   └── ... (110 total)
│   ├── collection.json
│   ├── collection.png
│   └── config.json
├── mainnet/
│   └── (futuramente 3.777 NFTs)
└── scripts/
    ├── generate_metadata.js
    ├── validate_assets.js
    └── distribute_rarities.js
```

---

## 🛠️ FASES DE IMPLEMENTAÇÃO

### **FASE 1: PREPARAÇÃO DOS ASSETS (1-2 dias)**

#### 1.1. Organizar Sprites
- [ ] Criar pasta `nft_collection/devnet/images/`
- [ ] Copiar os 110 sprites das naves
- [ ] Renomear: `0.png`, `1.png`, `2.png`, ... `109.png`
- [ ] Verificar formato: PNG com fundo transparente
- [ ] Dimensões recomendadas: 512x512px ou 1024x1024px

#### 1.2. Criar Metadata JSON
- [ ] Criar pasta `nft_collection/devnet/metadata/`
- [ ] Executar script de geração de metadata
- [ ] Validar distribuição de raridades:
  - 55 Comum (0-54)
  - 28 Incomum (55-82)
  - 17 Raro (83-99)
  - 9 Épico (100-108)
  - 2 Lendário (109-110)

#### 1.3. Criar Collection Metadata
- [ ] Criar `collection.json` com metadata da coleção
- [ ] Criar `collection.png` (logo/banner 1000x1000px)
- [ ] Validar JSON schema

**Deliverables:**
- ✅ 110 imagens PNG numeradas
- ✅ 110 arquivos JSON de metadata
- ✅ collection.json
- ✅ collection.png

---

### **FASE 2: SETUP FILEBASE IPFS (1 dia)**

#### 2.1. Criar Conta Filebase
- [ ] Registrar em [filebase.com](https://filebase.com)
- [ ] Criar bucket IPFS: `space-crypto-miner-devnet`
- [ ] Obter API Keys:
  - Access Key ID
  - Secret Access Key

#### 2.2. Configurar Sugar CLI para Filebase
- [ ] Instalar Sugar CLI
- [ ] Configurar storage provider no `config.json`
- [ ] Testar conexão com Filebase

#### 2.3. Validar Upload
- [ ] Upload de teste: 1 imagem + 1 metadata
- [ ] Verificar URL IPFS gerada
- [ ] Testar acesso via gateway IPFS: `https://ipfs.filebase.io/ipfs/CID`
- [ ] Confirmar velocidade de acesso

**Deliverables:**
- ✅ Conta Filebase configurada
- ✅ Bucket IPFS criado
- ✅ API Keys salvas com segurança
- ✅ Upload de teste validado

---

### **FASE 3: CONFIGURAÇÃO SOLANA WALLET (1 dia)**

#### 3.1. Wallet para Devnet
- [ ] Criar nova wallet dedicada (Phantom ou Solana CLI)
- [ ] Exportar keypair para arquivo `.json`
- [ ] **CRÍTICO:** Guardar seed phrase offline e com segurança
- [ ] Nunca versionar keypair no Git

#### 3.2. Funding Devnet
```bash
# Airdrop SOL
solana airdrop 2 --url devnet

# Verificar saldo
solana balance --url devnet

# Repetir até ter ~5 SOL (suficiente para 110 NFTs + taxas)
```

#### 3.3. Configurar RPC
**Opção 1: RPC Público (grátis, pode ser lento)**
```
https://api.devnet.solana.com
```

**Opção 2: RPC Privado (RECOMENDADO)**
- Helius: https://helius.dev (500K requests/dia grátis)
- QuickNode: https://quicknode.com (free tier)

**Deliverables:**
- ✅ Wallet Devnet configurada
- ✅ Keypair exportado (.json)
- ✅ ~5 SOL em saldo
- ✅ RPC endpoint configurado

---

### **FASE 4: CRIAÇÃO DA COLEÇÃO COM SUGAR CLI (2-3 dias)**

#### 4.1. Instalação Sugar CLI
```bash
# Linux/Mac
bash <(curl -sSf https://sugar.metaplex.com/install.sh)

# Windows (PowerShell)
iwr -useb https://sugar.metaplex.com/install.ps1 | iex

# Verificar instalação
sugar --version
```

#### 4.2. Configuração do Projeto
```bash
# Navegar para pasta da coleção
cd nft_collection/devnet

# Inicializar configuração
sugar create-config
```

#### 4.3. Arquivo config.json
```json
{
  "price": 0.0,
  "number": 110,
  "symbol": "SPACESHIP",
  "sellerFeeBasisPoints": 500,
  "gatekeeper": null,
  "solTreasuryAccount": "SUA_WALLET_ADDRESS",
  "splTokenAccount": null,
  "splToken": null,
  "goLiveDate": "01 Jan 2025 00:00:00 GMT",
  "endSettings": null,
  "whitelistMintSettings": null,
  "hiddenSettings": null,
  "uploadMethod": "bundlr",
  "retainAuthority": true,
  "isMutable": true,
  "creators": [
    {
      "address": "SUA_WALLET_ADDRESS",
      "share": 100
    }
  ]
}
```

#### 4.4. Processo de Deploy

**Passo 1: Validar Assets**
```bash
sugar validate
```
Verifica:
- ✅ Todas as imagens existem
- ✅ Todos os JSONs existem
- ✅ Metadata está bem formada
- ✅ Número de assets corresponde ao config

**Passo 2: Upload para IPFS**
```bash
sugar upload
```
- Faz upload de todas as imagens
- Faz upload de todas as metadata
- Gera cache com URIs IPFS
- Tempo estimado: 10-30 minutos

**Passo 3: Deploy Candy Machine**
```bash
sugar deploy
```
- Cria Collection NFT
- Cria Candy Machine on-chain
- Configura settings
- **IMPORTANTE:** Salvar o Candy Machine ID

**Passo 4: Verificar Deployment**
```bash
sugar verify
```
Confirma:
- ✅ Candy Machine criada
- ✅ Metadata on-chain correta
- ✅ Collection verificada

**Passo 5: Mint NFTs**
```bash
# Mint todos os 110 NFTs
sugar mint
```
- Minta todos os NFTs para sua wallet
- Tempo estimado: 30-60 minutos
- Custo: ~0.5-1 SOL (taxas de rede)

#### 4.5. Verificação Final
- [ ] Conferir 110 NFTs na Phantom wallet
- [ ] Verificar metadata no Solana Explorer
- [ ] Testar visualização em Magic Eden Devnet
- [ ] Validar que Collection está verified
- [ ] Salvar Collection Address (necessário para validação no jogo)

**Deliverables:**
- ✅ 110 NFTs mintados
- ✅ Collection NFT criada
- ✅ Candy Machine deployada
- ✅ Collection Address anotado
- ✅ Cache file backup

**Comandos Úteis:**
```bash
# Ver informações da Candy Machine
sugar show

# Ver collection details
sugar collection

# Withdraw funds não utilizados
sugar withdraw
```

---

### **FASE 5: INTEGRAÇÃO COM O JOGO (3-5 dias)**

#### 5.1. Atualizar Dependências

**package.json:**
```json
{
  "dependencies": {
    "@solana/web3.js": "^1.98.4",
    "@metaplex-foundation/js": "^0.19.4",
    "@metaplex-foundation/mpl-token-metadata": "^3.2.1",
    "phaser": "^3.90.0",
    "bs58": "^5.0.0"
  }
}
```

```bash
npm install
```

#### 5.2. Criar NFTManager.js

**Arquivo: `src/managers/NFTManager.js`**

Responsabilidades:
- Buscar todos os NFTs da coleção oficial
- Validar ownership on-chain
- Extrair atributos (velocidade, carga, etc.)
- Cache de dados para performance

**Funcionalidades principais:**
```javascript
class NFTManager {
  async fetchUserNFTs(walletAddress, collectionAddress)
  async validateNFTOwnership(nftMint, walletAddress)
  async getNFTAttributes(nftMint)
  parseAttributes(metadata)
  cacheNFTData(nftData)
  getCachedNFTData(walletAddress)
}
```

#### 5.3. Atualizar solana_nft.js

**Funcionalidades a adicionar:**
- ✅ Filtrar apenas NFTs da coleção oficial
- ✅ Verificar collection.verified === true
- ✅ Extrair todos os atributos dos traits
- ✅ Retornar array completo de NFTs do usuário

**Estrutura de retorno:**
```javascript
{
  mint: "NFT_MINT_ADDRESS",
  name: "Space Miner #0001",
  imageUrl: "https://ipfs.filebase.io/ipfs/...",
  attributes: {
    raridade: "Comum",
    velocidade: 100,
    carga: 50,
    combustivel: 100,
    oxigenio: 100,
    escudo: 100,
    modelo: "Nave-001"
  },
  collection: {
    address: "COLLECTION_ADDRESS",
    verified: true
  }
}
```

#### 5.4. Criar ShipSelectionScene.js

**Arquivo: `src/scenes/ShipSelectionScene.js`**

**Layout da cena:**
```
┌─────────────────────────────────────┐
│  SELECIONE SUA NAVE                 │
├─────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐         │
│  │ NFT │  │ NFT │  │ NFT │         │
│  │  #1 │  │  #2 │  │  #3 │         │
│  └─────┘  └─────┘  └─────┘         │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ATRIBUTOS DA NAVE SELECIONADA │ │
│  │ Raridade: Raro                │ │
│  │ Velocidade: █████░░░░░ 300    │ │
│  │ Carga:      ███░░░░░░░ 150    │ │
│  │ Combustível:████░░░░░░ 200    │ │
│  │ Oxigênio:   ████░░░░░░ 200    │ │
│  │ Escudo:     █████░░░░░ 300    │ │
│  └───────────────────────────────┘ │
│                                     │
│  [CONFIRMAR]  [USAR NAVE PADRÃO]   │
└─────────────────────────────────────┘
```

**Funcionalidades:**
- Grid de NFTs (scroll se > 6)
- Preview da nave ao hover
- Destacar raridade com cores:
  - Comum: `#CCCCCC`
  - Incomum: `#00FF00`
  - Raro: `#0080FF`
  - Épico: `#A020F0`
  - Lendário: `#FFD700`
- Comparação de atributos
- Botão "Usar nave padrão" (fallback)

#### 5.5. Atualizar Fluxo de Navegação

**Novo fluxo:**
```
index.html
  ↓
Conectar Phantom
  ↓
Buscar NFTs da coleção
  ↓
┌─────────────────────┐
│ Quantos NFTs?       │
├─────────────────────┤
│ 0 → GameScene       │  (nave padrão)
│ 1 → GameScene       │  (usar automaticamente)
│ 2+ → ShipSelection  │  (escolher)
└─────────────────────┘
  ↓
GameScene (com nave selecionada)
```

**Atualizar index.html:**
```javascript
async function connectPhantom() {
  // ... código existente ...
  
  // Buscar NFTs da coleção oficial
  const COLLECTION_ADDRESS = "SEU_COLLECTION_ADDRESS_AQUI";
  const userNFTs = await NFTManager.fetchUserNFTs(pub, COLLECTION_ADDRESS);
  
  if (userNFTs.length === 0) {
    window.__GAME_CONFIG__ = { 
      playerName: playerNameInput.value || 'Piloto',
      walletAddress: pub,
      selectedNFT: null  // Usará nave padrão
    };
  } else if (userNFTs.length === 1) {
    window.__GAME_CONFIG__ = { 
      playerName: playerNameInput.value || 'Piloto',
      walletAddress: pub,
      selectedNFT: userNFTs[0]  // Usar automaticamente
    };
  } else {
    window.__GAME_CONFIG__ = { 
      playerName: playerNameInput.value || 'Piloto',
      walletAddress: pub,
      userNFTs: userNFTs  // Passar para seleção
    };
  }
}
```

#### 5.6. Carregar Sprite Dinâmico do IPFS

**Desafio:** Sprites estão em IPFS, não no bundle local

**Solução em GameScene.js:**

```javascript
async preload() {
  const nftData = this.game.config.selectedNFT;
  
  if (nftData && nftData.imageUrl) {
    // Tentar carregar do cache primeiro
    const cached = this.cache.image.exists(`nft_ship_${nftData.mint}`);
    
    if (!cached) {
      // Carregar do IPFS
      this.load.image(`nft_ship_${nftData.mint}`, nftData.imageUrl);
      
      // Loading screen
      this.showLoadingMessage("Carregando nave do IPFS...");
    }
  } else {
    // Fallback: nave padrão local
    this.load.atlas('ship', '/assets/images/01.png', '/assets/images/01.json');
  }
  
  // Resto dos assets...
}
```

**Otimizações:**
- Cache em localStorage (imagens pequenas)
- Timeout de 30s para carregamento
- Fallback automático se IPFS falhar
- Loading indicator

#### 5.7. Aplicar Atributos no Gameplay

**Em GameScene.create():**

```javascript
async create(data) {
  const nftData = data.selectedNFT || null;
  
  if (nftData && nftData.attributes) {
    // Aplicar atributos do NFT
    this.shipMaxSpeed = nftData.attributes.velocidade;
    this.shipCargoCapacity = nftData.attributes.carga;
    this.shipMaxFuel = nftData.attributes.combustivel;
    this.shipMaxOxygen = nftData.attributes.oxigenio;
    this.shipMaxHealth = nftData.attributes.escudo;
    
    // Inicializar valores atuais
    this.shipFuel = this.shipMaxFuel;
    this.shipOxygen = this.shipMaxOxygen;
    this.shipHealth = this.shipMaxHealth;
    
    // Aplicar sprite do NFT
    this.player = this.physics.add.sprite(400, 300, `nft_ship_${nftData.mint}`);
    
    // UI: Mostrar nome do NFT
    this.shipNameText = this.add.text(10, 10, nftData.name, {
      fontSize: '18px',
      color: this.getRarityColor(nftData.attributes.raridade)
    });
  } else {
    // Valores padrão para nave guest
    this.shipMaxSpeed = 100;
    this.shipCargoCapacity = 50;
    this.shipMaxFuel = 100;
    this.shipMaxOxygen = 100;
    this.shipMaxHealth = 100;
    
    this.shipFuel = this.shipMaxFuel;
    this.shipOxygen = this.shipMaxOxygen;
    this.shipHealth = this.shipMaxHealth;
    
    // Sprite padrão
    this.player = this.physics.add.sprite(400, 300, 'ship', 'idle_01.png');
    
    this.shipNameText = this.add.text(10, 10, 'Nave Padrão', {
      fontSize: '18px',
      color: '#FFFFFF'
    });
  }
  
  // Resto da lógica de criação...
}

getRarityColor(rarity) {
  const colors = {
    'Comum': '#CCCCCC',
    'Incomum': '#00FF00',
    'Raro': '#0080FF',
    'Épico': '#A020F0',
    'Lendário': '#FFD700'
  };
  return colors[rarity] || '#FFFFFF';
}
```

#### 5.8. Atualizar UI do Jogo

**Adicionar ao HUD (GameScene):**

```javascript
createHUD() {
  const W = this.cameras.main.width;
  
  // Painel de atributos (canto superior esquerdo)
  const panelX = 10;
  let panelY = 40;
  
  // Combustível (já existe, ajustar max)
  this.createFuelBar(panelX, panelY);
  panelY += 30;
  
  // Oxigênio (NOVO)
  this.createOxygenBar(panelX, panelY);
  panelY += 30;
  
  // Escudo/Vida (já existe como health)
  this.createHealthBar(panelX, panelY);
  panelY += 30;
  
  // Carga atual (NOVO)
  this.cargoText = this.add.text(panelX, panelY, 
    `Carga: 0/${this.shipCargoCapacity} kg`, {
    fontSize: '16px',
    color: '#FFFFFF'
  });
  panelY += 30;
  
  // Velocímetro (NOVO)
  this.speedText = this.add.text(panelX, panelY, 
    `Velocidade: 0/${this.shipMaxSpeed}`, {
    fontSize: '16px',
    color: '#00FFCC'
  });
}

createOxygenBar(x, y) {
  this.add.text(x, y, 'O₂:', { fontSize: '14px', color: '#00CCFF' });
  
  const barBg = this.add.rectangle(x + 40, y + 7, 150, 14, 0x333333);
  this.oxygenBarFill = this.add.rectangle(x + 40, y + 7, 150, 14, 0x00CCFF);
  this.oxygenBarFill.setOrigin(0, 0.5);
  
  this.oxygenText = this.add.text(x + 200, y, '100%', {
    fontSize: '14px',
    color: '#00CCFF'
  });
}

updateOxygen(delta) {
  // Consumir oxigênio ao longo do tempo
  const oxygenConsumptionRate = 1; // unidades por segundo
  this.shipOxygen = Math.max(0, this.shipOxygen - (oxygenConsumptionRate * delta / 1000));
  
  // Atualizar UI
  const oxygenPercent = (this.shipOxygen / this.shipMaxOxygen);
  this.oxygenBarFill.width = 150 * oxygenPercent;
  this.oxygenText.setText(Math.round(oxygenPercent * 100) + '%');
  
  // Mudar cor se crítico
  if (oxygenPercent < 0.25) {
    this.oxygenBarFill.setFillStyle(0xFF0000);
  } else if (oxygenPercent < 0.5) {
    this.oxygenBarFill.setFillStyle(0xFFAA00);
  } else {
    this.oxygenBarFill.setFillStyle(0x00CCFF);
  }
  
  // Game over se oxigênio acabar
  if (this.shipOxygen <= 0) {
    this.gameOver('Oxigênio esgotado!');
  }
}
```

**Atualizar loop principal:**
```javascript
update(time, delta) {
  if (this.isGameOver) return;
  
  // Atualizar oxigênio
  this.updateOxygen(delta);
  
  // Atualizar velocímetro
  const currentSpeed = Math.sqrt(
    Math.pow(this.player.body.velocity.x, 2) + 
    Math.pow(this.player.body.velocity.y, 2)
  );
  this.speedText.setText(
    `Velocidade: ${Math.round(currentSpeed)}/${this.shipMaxSpeed}`
  );
  
  // Atualizar carga (se implementado sistema de mineração)
  this.cargoText.setText(
    `Carga: ${this.currentCargo}/${this.shipCargoCapacity} kg`
  );
  
  // Resto da lógica...
}
```

**Deliverables:**
- ✅ NFTManager.js implementado
- ✅ solana_nft.js atualizado
- ✅ ShipSelectionScene.js criado
- ✅ Fluxo de navegação atualizado
- ✅ Sprite loading do IPFS funcionando
- ✅ Atributos aplicados no gameplay
- ✅ UI de atributos completa

---

### **FASE 6: SISTEMA DE VALIDAÇÃO E SEGURANÇA (2 dias)**

#### 6.1. Validação de Coleção On-Chain

**Arquivo: `src/utils/nft_validator.js`**

```javascript
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

export class NFTValidator {
  constructor(connection, expectedCollectionAddress) {
    this.connection = connection;
    this.metaplex = Metaplex.make(connection);
    this.expectedCollectionAddress = new PublicKey(expectedCollectionAddress);
  }
  
  /**
   * Valida que NFT pertence à coleção oficial
   */
  async validateNFTCollection(nftMint) {
    try {
      const mintPubKey = new PublicKey(nftMint);
      const nft = await this.metaplex.nfts().findByMint({ 
        mintAddress: mintPubKey 
      });
      
      // Verificar se tem collection
      if (!nft.collection) {
        console.warn('NFT não possui collection:', nftMint);
        return false;
      }
      
      // Verificar se é a collection correta
      if (nft.collection.address.toString() !== this.expectedCollectionAddress.toString()) {
        console.warn('NFT não pertence à collection oficial:', nftMint);
        return false;
      }
      
      // Verificar se collection está verified
      if (!nft.collection.verified) {
        console.warn('Collection não verificada:', nftMint);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao validar NFT:', error);
      return false;
    }
  }
  
  /**
   * Valida que carteira possui o NFT
   */
  async validateOwnership(nftMint, walletAddress) {
    try {
      const mintPubKey = new PublicKey(nftMint);
      const walletPubKey = new PublicKey(walletAddress);
      
      const nft = await this.metaplex.nfts().findByMint({ 
        mintAddress: mintPubKey 
      });
      
      // Buscar owner do token account
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        walletPubKey,
        { mint: mintPubKey }
      );
      
      if (tokenAccounts.value.length === 0) {
        console.warn('Carteira não possui este NFT:', nftMint);
        return false;
      }
      
      // Verificar que possui quantidade = 1
      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      if (balance !== 1) {
        console.warn('Token amount inválido:', balance);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao validar ownership:', error);
      return false;
    }
  }
  
  /**
   * Valida atributos do NFT
   */
  validateAttributes(attributes) {
    const required = ['raridade', 'velocidade', 'carga', 'combustivel', 'oxigenio', 'escudo'];
    
    for (const attr of required) {
      if (!(attr in attributes)) {
        console.warn('Atributo obrigatório faltando:', attr);
        return false;
      }
    }
    
    // Validar ranges
    const ranges = {
      velocidade: [100, 500],
      carga: [50, 200],
      combustivel: [100, 300],
      oxigenio: [100, 300],
      escudo: [100, 500]
    };
    
    for (const [attr, [min, max]] of Object.entries(ranges)) {
      const value = attributes[attr];
      if (value < min || value > max) {
        console.warn(`Atributo ${attr} fora do range: ${value}`);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Validação completa do NFT
   */
  async validateNFT(nftMint, walletAddress) {
    // 1. Validar collection
    const isValidCollection = await this.validateNFTCollection(nftMint);
    if (!isValidCollection) return { valid: false, reason: 'Collection inválida' };
    
    // 2. Validar ownership
    const isOwner = await this.validateOwnership(nftMint, walletAddress);
    if (!isOwner) return { valid: false, reason: 'Não é o dono do NFT' };
    
    return { valid: true };
  }
}
```

#### 6.2. Prevenir Exploits Comuns

**Checklist de Segurança:**

1. **✅ Validação de Collection Address**
   - Verificar que NFT pertence à collection oficial
   - Verificar que collection.verified === true
   - Rejeitar NFTs de outras coleções

2. **✅ Validação de Ownership**
   - Confirmar on-chain que carteira possui o NFT
   - Não confiar apenas em dados do cliente
   - Re-validar em ações críticas

3. **✅ Sanitização de URLs**
   - Validar que imageUrl vem de IPFS/Arweave
   - Bloquear URLs maliciosas (XSS)
   - Whitelist de gateways IPFS confiáveis

4. **✅ Validação de Atributos**
   - Verificar que atributos estão dentro dos ranges esperados
   - Rejeitar valores impossíveis
   - Usar valores default se atributo faltando

5. **✅ Rate Limiting**
   - Cache de NFTs buscados (TTL 5 minutos)
   - Limitar queries RPC (max 10/minuto)
   - Debounce em buscas repetidas

6. **✅ Error Handling**
   - Timeout de 30s para operações on-chain
   - Retry com backoff exponencial
   - Fallback para nave padrão em caso de erro

**Implementação de Rate Limiting:**

```javascript
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow; // ms
    this.requests = [];
  }
  
  canMakeRequest() {
    const now = Date.now();
    
    // Remover requests antigos
    this.requests = this.requests.filter(
      time => now - time < this.timeWindow
    );
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
  
  getWaitTime() {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = this.requests[0];
    const elapsed = Date.now() - oldestRequest;
    return Math.max(0, this.timeWindow - elapsed);
  }
}

// Uso
const rpcLimiter = new RateLimiter(10, 60000); // 10 requests por minuto

async function fetchNFTWithRateLimit(nftMint) {
  if (!rpcLimiter.canMakeRequest()) {
    const waitTime = rpcLimiter.getWaitTime();
    throw new Error(`Rate limit excedido. Aguarde ${Math.ceil(waitTime / 1000)}s`);
  }
  
  return await fetchNFT(nftMint);
}
```

#### 6.3. Cache de NFTs

**Implementação em NFTManager.js:**

```javascript
class NFTCache {
  constructor(ttl = 300000) { // 5 minutos default
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const age = Date.now() - entry.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  // Persistir em localStorage
  saveToLocalStorage() {
    const data = {};
    for (const [key, value] of this.cache.entries()) {
      data[key] = value;
    }
    try {
      localStorage.setItem('nft_cache', JSON.stringify(data));
    } catch (e) {
      console.warn('Erro ao salvar cache:', e);
    }
  }
  
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('nft_cache');
      if (!data) return;
      
      const parsed = JSON.parse(data);
      for (const [key, value] of Object.entries(parsed)) {
        // Verificar se ainda está dentro do TTL
        const age = Date.now() - value.timestamp;
        if (age <= this.ttl) {
          this.cache.set(key, value);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar cache:', e);
    }
  }
}

// Uso
const nftCache = new NFTCache();
nftCache.loadFromLocalStorage();

async function fetchNFT(mint) {
  // Tentar cache primeiro
  const cached = nftCache.get(mint);
  if (cached) {
    console.log('NFT carregado do cache:', mint);
    return cached;
  }
  
  // Buscar on-chain
  const nft = await metaplex.nfts().findByMint({ mintAddress: mint });
  
  // Salvar no cache
  nftCache.set(mint, nft);
  nftCache.saveToLocalStorage();
  
  return nft;
}
```

**Deliverables:**
- ✅ NFTValidator implementado
- ✅ Validações on-chain funcionando
- ✅ Rate limiting implementado
- ✅ Cache de NFTs implementado
- ✅ Sanitização de URLs
- ✅ Error handling robusto

---

### **FASE 7: TESTING E REFINAMENTO (2-3 dias)**

#### 7.1. Testes Funcionais

**Checklist de Testes:**

- [ ] **Teste 1: Usuário sem NFTs**
  - Conectar carteira sem NFTs da coleção
  - Verificar que jogo inicia com nave padrão
  - Confirmar que atributos padrão estão aplicados

- [ ] **Teste 2: Usuário com 1 NFT**
  - Conectar carteira com 1 NFT da coleção
  - Verificar que NFT é usado automaticamente
  - Confirmar que atributos do NFT estão aplicados
  - Verificar que sprite carrega do IPFS

- [ ] **Teste 3: Usuário com múltiplos NFTs**
  - Conectar carteira com 2+ NFTs
  - Verificar que ShipSelectionScene abre
  - Testar seleção de diferentes NFTs
  - Confirmar que NFT selecionado é usado no jogo

- [ ] **Teste 4: Diferentes Raridades**
  - Testar nave Comum (velocidade 100)
  - Testar nave Incomum (velocidade 200)
  - Testar nave Rara (velocidade 300)
  - Testar nave Épica (velocidade 400)
  - Testar nave Lendária (velocidade 500)
  - Confirmar que diferenças são perceptíveis no gameplay

- [ ] **Teste 5: Atributos no Gameplay**
  - Combustível: verificar que max depende do NFT
  - Oxigênio: verificar consumo e game over
  - Escudo: verificar que dano máximo depende do NFT
  - Carga: verificar limite de inventário
  - Velocidade: verificar velocidade máxima alcançável

- [ ] **Teste 6: UI e HUD**
  - Verificar que nome do NFT aparece
  - Verificar cor da raridade
  - Verificar barras de recursos
  - Verificar velocímetro
  - Verificar indicador de carga

- [ ] **Teste 7: Desconexão e Reconexão**
  - Conectar wallet e selecionar NFT
  - Desconectar wallet
  - Reconectar wallet
  - Verificar que NFT selecionado é lembrado

#### 7.2. Testes de Segurança

- [ ] **Teste 8: NFT de Outra Coleção**
  - Tentar usar NFT que não pertence à coleção oficial
  - Verificar que é rejeitado
  - Confirmar mensagem de erro clara

- [ ] **Teste 9: NFT com Collection Não Verificada**
  - Tentar usar NFT com collection.verified = false
  - Verificar rejeição

- [ ] **Teste 10: Manipulação de Dados**
  - Tentar modificar atributos via console do navegador
  - Verificar que validação on-chain impede exploit
  - Confirmar que valores default são usados se validação falhar

- [ ] **Teste 11: URLs Maliciosas**
  - Criar NFT com imageUrl maliciosa
  - Verificar que sanitização bloqueia
  - Confirmar fallback para nave padrão

#### 7.3. Testes de Performance

- [ ] **Teste 12: Tempo de Loading**
  - Medir tempo para buscar NFTs (meta: <3s)
  - Medir tempo para carregar sprite IPFS (meta: <5s)
  - Medir tempo total até jogo iniciar (meta: <10s)

- [ ] **Teste 13: IPFS Offline**
  - Desconectar internet
  - Tentar carregar sprite do IPFS
  - Verificar timeout funciona (30s)
  - Verificar fallback para nave padrão

- [ ] **Teste 14: RPC Lento**
  - Simular RPC lento (throttle network)
  - Verificar que loading indicator aparece
  - Verificar que timeout funciona
  - Confirmar retry logic funciona

- [ ] **Teste 15: Cache**
  - Carregar NFTs pela primeira vez (sem cache)
  - Desconectar e reconectar (com cache)
  - Verificar que carregamento é mais rápido
  - Confirmar que cache expira após 5 minutos

#### 7.4. Testes de UX

- [ ] **Teste 16: Mensagens de Erro**
  - Testar todas as condições de erro
  - Verificar que mensagens são claras e em português
  - Confirmar que não mostra stack traces para usuário

- [ ] **Teste 17: Loading States**
  - Verificar loading ao buscar NFTs
  - Verificar loading ao carregar sprite IPFS
  - Confirmar que loading não trava interface

- [ ] **Teste 18: Tutorial/Onboarding**
  - Primeiro acesso sem carteira
  - Primeiro acesso com carteira mas sem NFTs
  - Primeiro acesso com NFTs
  - Verificar que instruções são claras

- [ ] **Teste 19: Mobile (opcional)**
  - Testar em navegador mobile com Phantom app
  - Verificar responsividade da UI
  - Testar controles touch

#### 7.5. Regression Testing

- [ ] **Teste 20: Funcionalidades Existentes**
  - Movimento da nave
  - Sistema de tiro
  - Colisões
  - Mineração de planetas
  - Inimigos
  - Explosões
  - Áudio
  - Partículas
  - Confirmar que nada quebrou

#### 7.6. Documentação de Bugs

**Template de Bug Report:**
```markdown
### Bug #XX: [Título]

**Severidade:** Crítico / Alto / Médio / Baixo

**Descrição:**
[O que aconteceu]

**Reprodução:**
1. Passo 1
2. Passo 2
3. Passo 3

**Resultado Esperado:**
[O que deveria acontecer]

**Resultado Atual:**
[O que aconteceu]

**Screenshots/Logs:**
[Se aplicável]

**Ambiente:**
- Browser: [Chrome/Firefox/etc]
- OS: [Windows/Mac/Linux]
- Phantom Version: [x.x.x]
```

**Deliverables:**
- ✅ Todos os 20 testes executados
- ✅ Bugs documentados e priorizados
- ✅ Bugs críticos corrigidos
- ✅ Regression testing aprovado

---

## 📊 CRONOGRAMA E ESTIMATIVAS

### Timeline de Implementação (Devnet)

| Semana | Fases | Tempo Estimado | Status |
|--------|-------|----------------|--------|
| **Semana 1** | Fase 1 + Fase 2 + Fase 3 | 3-4 dias | ⏳ Pendente |
| **Semana 2** | Fase 4 | 2-3 dias | ⏳ Pendente |
| **Semana 3** | Fase 5 (parte 1) | 3 dias | ⏳ Pendente |
| **Semana 4** | Fase 5 (parte 2) + Fase 6 | 4 dias | ⏳ Pendente |
| **Semana 5** | Fase 7 (testing) + refinamento | 3 dias | ⏳ Pendente |

**Total: 15-18 dias úteis (~3-4 semanas)**

### Divisão de Esforço

```
Preparação e Setup:     ████░░░░░░  25%  (4 dias)
Criação da Coleção:     ███░░░░░░░  20%  (3 dias)
Integração com Jogo:    ██████░░░░  40%  (6 dias)
Segurança e Testing:    ███░░░░░░░  15%  (3 dias)
```

---

## 💰 CUSTOS

### Devnet (110 NFTs)

| Item | Custo |
|------|-------|
| SOL Devnet | **GRÁTIS** (airdrop) |
| Filebase IPFS | **GRÁTIS** (5GB free tier) |
| RPC Calls (Helius) | **GRÁTIS** (500K/dia free) |
| Metaplex Sugar CLI | **GRÁTIS** (open source) |
| **TOTAL DEVNET** | **R$ 0,00** |

### Mainnet (3.777 NFTs) - Estimativa Futura

| Item | Custo (SOL) | Custo (BRL)* |
|------|-------------|--------------|
| Mint 3.777 NFTs | ~15-20 SOL | ~R$ 2.000-2.700 |
| Storage IPFS (1 ano) | - | ~R$ 60-120/ano |
| RPC Calls (médio tráfego) | - | ~R$ 0-300/mês |
| Royalties wallet | **RECEITA** | - |
| **TOTAL INICIAL** | ~15-20 SOL | **~R$ 2.500-3.500** |
| **TOTAL MENSAL** | - | **~R$ 50-300/mês** |

*Considerando 1 SOL = ~R$ 135 (variável)

---

## 🛠️ FERRAMENTAS E DEPENDÊNCIAS

### Software Necessário

```bash
# Node.js (versão 18+)
node --version

# NPM (vem com Node.js)
npm --version

# Solana CLI (opcional, mas recomendado)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
solana --version

# Metaplex Sugar CLI
bash <(curl -sSf https://sugar.metaplex.com/install.sh)
sugar --version
```

### Extensões de Browser

- Phantom Wallet (Chrome/Firefox/Brave)
- Solana Explorer bookmarklet

### Contas Necessárias

- [ ] Filebase (filebase.com) - Storage IPFS
- [ ] Helius (helius.dev) - RPC endpoint (opcional)
- [ ] Solana Devnet wallet com ~5 SOL

### Dependências NPM

```json
{
  "dependencies": {
    "@solana/web3.js": "^1.98.4",
    "@metaplex-foundation/js": "^0.19.4",
    "@metaplex-foundation/mpl-token-metadata": "^3.2.1",
    "@solana/spl-token": "^0.3.9",
    "phaser": "^3.90.0",
    "bs58": "^5.0.0"
  },
  "devDependencies": {
    "vite": "^7.1.5"
  }
}
```

---

## 📁 ESTRUTURA FINAL DO PROJETO

```
SPACE_CRYPTO_MINER/
├── nft_collection/
│   ├── devnet/
│   │   ├── images/
│   │   │   ├── 0.png ... 109.png           (110 sprites)
│   │   ├── metadata/
│   │   │   ├── 0.json ... 109.json         (110 metadata)
│   │   ├── collection.json                 (Collection metadata)
│   │   ├── collection.png                  (Collection image)
│   │   ├── config.json                     (Sugar config)
│   │   └── .cache/                         (Sugar cache - NÃO versionar)
│   ├── mainnet/
│   │   └── (futuro - 3.777 NFTs)
│   └── scripts/
│       ├── generate_metadata.js            (Gera JSONs)
│       ├── validate_assets.js              (Valida antes de upload)
│       ├── distribute_rarities.js          (Distribui raridades)
│       └── update_collection_address.js    (Atualiza config do jogo)
├── src/
│   ├── scenes/
│   │   ├── GameScene.js                    (ATUALIZAR)
│   │   ├── MenuScene.js                    (existente)
│   │   ├── ConfigScene.js                  (existente)
│   │   └── ShipSelectionScene.js           (NOVO)
│   ├── managers/
│   │   ├── AudioManager.js                 (existente)
│   │   ├── JuiceManager.js                 (existente)
│   │   └── NFTManager.js                   (NOVO)
│   ├── utils/
│   │   ├── nft_validator.js                (NOVO)
│   │   ├── ipfs_loader.js                  (NOVO)
│   │   └── rate_limiter.js                 (NOVO)
│   ├── effects/
│   │   └── (existentes)
│   ├── solana_nft.js                       (ATUALIZAR)
│   └── main.js                             (ATUALIZAR)
├── index.html                               (ATUALIZAR)
├── package.json                             (ATUALIZAR)
├── .env.example                             (NOVO)
├── .gitignore                               (ATUALIZAR)
├── NFT_COLLECTION_PLAN.md                   (este arquivo)
└── README.md                                (ATUALIZAR)
```

---

## 🔐 SEGURANÇA E BOAS PRÁTICAS

### ⚠️ NUNCA Versionar no Git

```gitignore
# Adicionar ao .gitignore

# Keypairs e wallets
*.json
!package.json
!package-lock.json
!tsconfig.json
!*.config.json

# Sugar CLI cache
nft_collection/**/.cache/
.sugar_cache/

# Environment variables
.env
.env.local
.env.production

# API Keys
**/api-keys.txt
**/secrets.txt
```

### ✅ Checklist de Segurança

- [ ] Keypair da wallet **NUNCA** commitado no Git
- [ ] Seed phrase guardada **offline** (papel ou hardware wallet)
- [ ] API keys do Filebase em variáveis de ambiente
- [ ] Collection Address hardcoded no código (public, ok)
- [ ] Validação on-chain em todas as operações críticas
- [ ] Sanitização de URLs de IPFS
- [ ] Rate limiting implementado
- [ ] Error handling robusto (sem expor internals)
- [ ] HTTPS obrigatório em produção
- [ ] Auditoria de código antes do mainnet

### 🔑 Variáveis de Ambiente

**Criar arquivo `.env.example`:**
```bash
# Solana
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_COLLECTION_ADDRESS=PREENCHER_APOS_DEPLOY

# Filebase (NÃO commitar .env real!)
FILEBASE_ACCESS_KEY=your_access_key_here
FILEBASE_SECRET_KEY=your_secret_key_here
FILEBASE_BUCKET=space-crypto-miner-devnet

# IPFS Gateway
VITE_IPFS_GATEWAY=https://ipfs.filebase.io/ipfs/
```

**Usar no código:**
```javascript
const COLLECTION_ADDRESS = import.meta.env.VITE_COLLECTION_ADDRESS;
const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
```

---

## 📚 RECURSOS E DOCUMENTAÇÃO

### Documentação Oficial

- [Metaplex Docs](https://docs.metaplex.com/)
- [Sugar CLI Guide](https://docs.metaplex.com/tools/sugar/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Phantom Wallet Docs](https://docs.phantom.app/)
- [Filebase IPFS Docs](https://docs.filebase.com/)

### Tutoriais Recomendados

- [Creating NFTs on Solana](https://learn.figment.io/tutorials/create-nfts-on-solana)
- [Metaplex NFT Collections](https://www.youtube.com/watch?v=35RO0lAEIxE)
- [Sugar CLI Walkthrough](https://www.youtube.com/watch?v=XdJNPP10eDA)

### Ferramentas Úteis

- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)
- [Magic Eden Devnet](https://devnet.magiceden.io/)
- [IPFS Gateway Checker](https://ipfs.github.io/public-gateway-checker/)
- [JSON Validator](https://jsonlint.com/)

### Comunidades

- [Metaplex Discord](https://discord.gg/metaplex)
- [Solana Discord](https://discord.gg/solana)
- [Solana Stack Exchange](https://solana.stackexchange.com/)

---

## 🚀 PRÓXIMOS PASSOS APÓS DEVNET

### Roadmap Mainnet

1. **Validação Completa em Devnet** (2 semanas)
   - Testar todos os cenários
   - Coletar feedback de beta testers
   - Ajustar balanceamento de atributos se necessário

2. **Preparação dos 3.777 Sprites** (1-2 semanas)
   - Gerar/organizar todas as artes
   - Distribuir raridades proporcionalmente
   - Criar metadata completa

3. **Auditoria de Segurança** (1 semana)
   - Code review completo
   - Testes de penetração
   - Validação de smart contracts

4. **Setup Mainnet** (3 dias)
   - Criar wallet Mainnet
   - Comprar SOL necessário (~15-20 SOL)
   - Configurar RPC produção (Helius/QuickNode)

5. **Deploy Mainnet** (2 dias)
   - Upload de 3.777 assets para IPFS
   - Deploy Candy Machine
   - Mint coleção completa

6. **Launch e Marketing** (ongoing)
   - Anunciar coleção
   - Listar em marketplaces (Magic Eden, Tensor)
   - Promover jogo

### Funcionalidades Futuras (Pós-Launch)

#### Sistema de Marketplace In-Game
- Comprar/vender naves entre jogadores
- Leilões de naves raras
- Integração com marketplaces externos

#### Sistema de Upgrade
- Queimar múltiplos NFTs para criar um de maior raridade
- Consumir recursos in-game para melhorar atributos
- Crafting de naves customizadas

#### Breeding/Fusion
- Combinar 2 naves para gerar nova (herdar atributos)
- Randomização de raridade baseada nos pais
- Cooldown entre breeding

#### Staking
- Stakear naves para ganhar tokens de jogo
- Recompensas baseadas em raridade
- Eventos com multiplicadores de recompensa

#### Leaderboards
- Rankings por pontuação
- Rankings por raridade de frota
- Eventos competitivos com prêmios em SOL

#### Expansão de Atributos
- Sistema de tripulação (NFTs de personagens)
- Equipamentos e módulos (NFTs de itens)
- Skins sazonais (NFTs cosméticos)

---

## 📊 MÉTRICAS DE SUCESSO

### KPIs Técnicos

- [ ] 100% dos NFTs mintados com sucesso
- [ ] 0 erros de metadata
- [ ] Tempo médio de loading < 10s
- [ ] Taxa de sucesso de validação > 99%
- [ ] Uptime IPFS > 99.9%

### KPIs de Produto

- [ ] > 80% dos jogadores com NFT usam no jogo
- [ ] > 50% dos jogadores sem NFT consideram comprar
- [ ] Taxa de retenção D7 > 30%
- [ ] Feedback positivo > 4.0/5.0

### KPIs de Negócio (Mainnet)

- [ ] 100% da coleção mintada em X semanas
- [ ] Floor price mantém > 0.X SOL
- [ ] Volume de royalties > Y SOL/mês
- [ ] Jogadores ativos diários > Z

---

## ✅ APROVAÇÃO E PRÓXIMAS AÇÕES

### Plano Aprovado? ✅

Se este plano está aprovado, as próximas ações imediatas são:

1. **Criar estrutura de pastas** (`nft_collection/devnet/`)
2. **Implementar script de geração de metadata** (`generate_metadata.js`)
3. **Preparar os 110 sprites** (renomear e organizar)
4. **Instalar Sugar CLI** e configurar ambiente
5. **Começar Fase 1** (Preparação dos Assets)

### Comandos Iniciais

```bash
# 1. Criar estrutura de pastas
mkdir -p nft_collection/devnet/{images,metadata}
mkdir -p nft_collection/scripts

# 2. Instalar Sugar CLI
bash <(curl -sSf https://sugar.metaplex.com/install.sh)

# 3. Instalar dependências do projeto
npm install @metaplex-foundation/js @metaplex-foundation/mpl-token-metadata bs58

# 4. Criar .env
cp .env.example .env

# 5. Gerar metadata (após criar o script)
node nft_collection/scripts/generate_metadata.js
```

---

## 📝 NOTAS FINAIS

### Considerações Importantes

1. **Balanceamento de Gameplay:**
   - Naves Lendárias (velocidade 500) podem ser muito OP
   - Considere ajustar custos (combustível, oxigênio) para balancear
   - Teste extensivamente antes do mainnet

2. **IPFS Performance:**
   - Filebase é confiável, mas considere backup em outro provider
   - Pinner services como Pinata ou NFT.Storage
   - CDN para acelerar loading (Cloudflare IPFS Gateway)

3. **Escalabilidade:**
   - Código atual suporta coleção pequena (110)
   - Para 3.777, otimizar busca de NFTs (indexing)
   - Considerar usar Helius Digital Asset API (mais rápido)

4. **Experiência do Usuário:**
   - Jogadores sem NFT devem ter experiência completa
   - Não criar "pay-to-win", apenas "pay-to-customize"
   - Oferecer formas de ganhar NFTs jogando (airdrops, eventos)

5. **Manutenibilidade:**
   - Documentar bem o código
   - Criar README para cada módulo
   - Manter testes atualizados

### Contato e Suporte

- **Metaplex Discord:** Para dúvidas sobre Sugar CLI
- **Solana Discord:** Para dúvidas sobre Solana
- **Filebase Support:** support@filebase.com

---

**Documento criado em:** 01/10/2025  
**Versão:** 1.0  
**Próxima revisão:** Após conclusão da Fase 4 (deploy em Devnet)

---

**🚀 Bora criar essa coleção NFT épica! 🌟**

