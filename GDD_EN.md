# 🚀 GAME DESIGN DOCUMENT (GDD)
## SPACE CRYPTO MINER

**Version:** 1.0  
**Date:** January 2025  
**Status:** In Development  

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Concept and Target Audience](#concept-and-target-audience)
3. [Game Mechanics](#game-mechanics)
4. [NFT System](#nft-system)
5. [Game Economy](#game-economy)
6. [Content and Progression](#content-and-progression)
7. [Technology and Platform](#technology-and-platform)
8. [Roadmap](#roadmap)
9. [Community and Marketing](#community-and-marketing)
10. [Sustainability](#sustainability)

---

## 🎯 OVERVIEW

### Core Concept
**SPACE CRYPTO MINER** is a space exploration game that combines mining, combat, and unique NFT collection elements. The game offers two distinct experiences:

- **PvE (Player vs Environment)**: Exploration, NPC hunting, and resource gathering
- **PvP (Player vs Player)**: Competitive mining of special resources with real gains

### Value Proposition
- **Unique NFTs**: Each ship is a unique NFT with its own characteristics
- **Competitive Gameplay**: Real competition for valuable resources
- **Hybrid Economy**: In-game tokens that can be converted to SOL
- **Immersive Experience**: Space exploration with survival mechanics

---

## 👥 CONCEPT AND TARGET AUDIENCE

### Primary Target Audience
- **Crypto Enthusiasts**: Players interested in blockchain and NFTs
- **Traditional Gamers**: Players seeking unique experiences
- **Collectors**: Interested in unique and rare NFTs
- **Competitors**: Players who enjoy PvP and competition

### Competitive Advantage
- **Native NFT Integration**: NFTs are not just cosmetic but affect gameplay
- **Real Economy**: Possibility to earn real tokens through gameplay
- **Unique Mechanics**: Combination of exploration, mining, and combat
- **Crew System**: Hiring crew members that affect performance

---

## 🎮 GAME MECHANICS

### Main Game Loop

#### PvE Mode (Player vs Environment)
```
Explore → Find Planets/NPCs → Collect Resources → Craft → Repair/Upgrade → Explore
```

**PvE Mechanics:**
- **Exploration**: Map navigation in search of planets and NPC ships
- **Hunting**: Combat against NPC ships (non-NFTs) to obtain resources
- **Collection**: Mining resources on planets of different rarities
- **Crafting**: Transforming resources into useful items (missiles, projectiles, etc.)
- **Survival**: Managing fuel, oxygen, shield, and integrity

#### PvP Mode (Player vs Player)
```
Explore → Find Special Resources → Compete with Other Players → Mine → Convert to Tokens
```

**PvP Mechanics:**
- **Competitive Mining**: Special rare resources that generate real tokens
- **Intense Competition**: Direct combat between players for resources
- **On-Chain Conversion**: Tokens can be traded for SOL on the blockchain

### Resource System

#### Mineable Resources
- **Metals**: For repair and equipment crafting
- **Fuel**: Required for navigation
- **Oxygen**: Essential for survival
- **Projectiles**: For combat and defense
- **Special Resources**: PvP only, convertible to tokens

#### Non-Mineable Resources (Purchased from NPCs)
- **Crew Members**: Hired with in-game tokens
- **Special Equipment**: Advanced modules and upgrades
- **Supplies**: Survival and maintenance items

### Crew System
- **Capacity**: 3 to 10 crew members per ship
- **Hiring**: With in-game tokens
- **Characteristics**: Each crew member adds bonuses to ship statistics
- **Non-NFTs**: Crew members are in-game items, not NFTs

---

## 🎨 NFT SYSTEM

### Ship Collection
- **Devnet**: 110 NFTs for testing
- **Mainnet**: 3,777 NFTs for production
- **Models**: Fixed, no combination - each ship is unique
- **Sprites**: Already created and identical to current project assets

### Rarity Distribution

| Rarity | Quantity (Mainnet) | % | Speed | Cargo | Fuel | Oxygen | Shield |
|--------|-------------------|---|-------|-------|------|--------|--------|
| **Common** | 1,889 | 50% | 100 | 50 | 100 | 100 | 100 |
| **Uncommon** | 944 | 25% | 200 | 100 | 150 | 150 | 200 |
| **Rare** | 567 | 15% | 300 | 150 | 200 | 200 | 300 |
| **Epic** | 302 | 8% | 400 | 175 | 250 | 250 | 400 |
| **Legendary** | 75 | 2% | 500 | 200 | 300 | 300 | 500 |

### Planet Types
- **Common**: Basic resources
- **Uncommon**: Intermediate resources
- **Rare**: Advanced resources
- **Epic**: Special resources
- **Legendary**: Unique resources
- **Mythic**: Legendary resources (PvP only)

### Gameplay Impact
- **Real Advantages**: NFTs directly affect ship performance
- **Unique Characteristics**: Each rarity has specific statistics
- **Unique Aesthetics**: Visual differentiation by rarity
- **Competitiveness**: Rarer ships have significant advantages

---

## 💰 GAME ECONOMY

### Token System
- **In-Game Token**: Main currency for internal purchases
- **On-Chain Conversion**: Tokens can be traded for SOL
- **Special Resources**: PvP only, convertible to tokens

### Revenue Sources
- **NFT Sales**: Initial collection revenue
- **Royalties**: 5% on NFT resales
- **Marketplace Fees**: Fees on in-game transactions
- **Future VCs**: Investment for expansion

### Economic Mechanics
- **PvE Mining**: Resources for crafting and maintenance
- **PvP Mining**: Special resources for conversion
- **NPC Trading**: Purchase of non-mineable resources
- **Crew System**: Hiring with in-game tokens

### Balancing
- **Not Pay-to-Win**: Focus on skill and strategy
- **Pay-to-Customize**: NFTs offer advantages but don't guarantee victory
- **Democratic Access**: Players without NFTs can play with default ship

---

## 🌍 CONTENT AND PROGRESSION

### Exploration System
- **Infinite Map**: Procedural generation of areas
- **Varied Planets**: Different rarities and resources
- **NPC Ships**: Non-NFT enemies for combat
- **Special Areas**: Locations with unique resources

### Crafting System
- **Missiles**: Combat weapons
- **Projectiles**: Ammunition for weapons
- **Repairs**: Ship maintenance
- **Equipment**: Upgrades and modules

### Survival System
- **Fuel**: Required for navigation
- **Oxygen**: Essential for survival
- **Shield**: Protection against damage
- **Integrity**: Overall ship condition

### Progression
- **No Levels**: Focus on collection and crafting
- **Equipment Improvement**: Through resources
- **Crew Expansion**: More crew = more advantages
- **Area Discovery**: New locations with better resources

---

## 💻 TECHNOLOGY AND PLATFORM

### Technology Stack
- **Engine**: Phaser.js v3.90.0
- **Build Tool**: Vite v7.1.5
- **Blockchain**: Solana
- **NFT Standard**: Metaplex Token Metadata
- **Storage**: IPFS via Filebase
- **Wallet**: Phantom Wallet

### Platforms
- **Web**: Browser (desktop and mobile)
- **Mobile**: PWA (Progressive Web App)
- **Future**: Native app (considering)

### Save System
- **Hybrid**: Combination of on-chain and off-chain
- **NFTs**: On-chain data (ownership and characteristics)
- **Progress**: Off-chain data (resources, crew)
- **Synchronization**: Periodic backup to blockchain

### Multiplayer
- **PvP**: Direct competition between players
- **Co-op**: Not planned initially
- **Guilds**: Future (expansion)

---

## 🗺️ ROADMAP

### MVP (Minimum Viable Product)

#### PvE - Essential Features
- ✅ Basic map exploration
- ✅ Navigation and control system
- ✅ NPC ship hunting
- ✅ Resource collection on planets
- ✅ Basic crafting system
- ✅ Resource management (fuel, oxygen, shield)

#### PvP - Essential Features
- ✅ Competitive exploration
- ✅ Special resource mining
- ✅ PvP competition system
- ✅ Resource to token conversion
- ✅ On-chain swap to SOL

#### NFT Integration
- ✅ Phantom Wallet connection
- ✅ NFT ownership validation
- ✅ Ship characteristics application
- ✅ Ship selection system

### Development Phases

#### Phase 1: Core Gameplay (MVP)
- Basic navigation system
- PvE mining mechanics
- Basic NFT integration
- Resource system

#### Phase 2: PvP and Economy
- Competitive mining system
- Token conversion
- Basic marketplace
- Crew system

#### Phase 3: Expansion
- New planet types
- Guild system
- Seasonal events
- New game modes

#### Phase 4: Optimization
- Performance improvements
- New maps
- Achievement system
- Mobile integration

---

## 📢 COMMUNITY AND MARKETING

### Community Strategy
- **Twitter**: Profile already created for promotion
- **Discord**: Community for beta testers
- **Social Media**: Expansion to other platforms
- **Collaborations**: Partnerships with influencers

### Beta Program
- **Testnet**: 110 NFTs for testing
- **Beta Testers**: Selected community
- **Feedback**: Collection of opinions and suggestions
- **Iteration**: Improvements based on feedback

### Collection Marketing
- **Social Media**: Organic promotion
- **Influencers**: Collaborations with large profiles
- **Crypto Community**: Engagement in specialized groups
- **Events**: Participation in blockchain events

---

## 🔮 SUSTAINABILITY

### Future Expansions
- **Guilds**: Clan and alliance system
- **New Maps**: Universe expansion
- **New Modes**: Different game experiences
- **Seasonal Events**: Limited and exclusive content

### Long-term Vision (1-2 years)
- **Consolidated Game**: Solid player base
- **Stable Economy**: Token with established value
- **Active Community**: Constant engagement
- **Regular Expansions**: Periodic new content

### Success Metrics
- **Active Players**: Consistent user base
- **Retention**: Players returning regularly
- **Economy**: Healthy transaction volume
- **Community**: Social media engagement

---

## 📊 TECHNICAL ANALYSIS

### Scalability
- **Modular Architecture**: Easy addition of new features
- **Cache System**: Performance optimization
- **CDN**: Global asset distribution
- **Load Balancing**: Support for multiple users

### Security
- **On-Chain Validation**: NFT ownership verification
- **Sanitization**: Protection against exploits
- **Rate Limiting**: Spam prevention
- **Audit**: Code review before mainnet

### Performance
- **Asset Optimization**: Image and audio compression
- **Lazy Loading**: On-demand loading
- **Culling**: Rendering only visible objects
- **Pooling**: Object reuse to reduce garbage collection

---

## 🎯 CONCLUSION

**SPACE CRYPTO MINER** represents an innovative fusion between traditional gaming and blockchain, offering a unique experience where NFTs are not just collectibles but essential tools for gameplay.

The game differentiates itself through:
- **Native NFT Integration** with real gameplay impact
- **Hybrid Economy** that allows real gains
- **Competitive Mechanics** that reward skill
- **Survival System** that adds strategic depth

With a solid foundation already developed and a clear expansion plan, the game is positioned to become a reference in the Web3 gaming space.

---

**Document created on:** January 2025  
**Next review:** After MVP completion  
**Status:** In active development  

---

*🚀 "Explore, Mine, Conquer - Space is yours to dominate!" 🌟*
