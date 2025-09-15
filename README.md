# SPACE_CRYPTO_MINER

A space exploration game with cryptocurrency mining mechanics built with Phaser.js and Vite.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Game Controls](#game-controls)
- [Game Mechanics](#game-mechanics)
- [Assets](#assets)
- [Contributing](#contributing)
- [License](#license)

## Overview

SPACE_CRYPTO_MINER is an interactive web-based game that combines space exploration with cryptocurrency mining simulation. Players control a spaceship, navigate through an infinite space environment, and mine cryptocurrencies by flying near special mining planets.

## Features

### Core Gameplay
- Spaceship navigation with mouse aiming and spacebar propulsion
- Infinite space environment with procedurally generated background
- Cryptocurrency mining mechanics
- Dynamic camera system with zoom controls
- Crosshair targeting system

### Visual Features
- Fullscreen game viewport with no borders or margins
- Animated spaceship with idle and propulsion states
- Procedurally generated starfield background
- Multiple planet types with unique visual styles
- Real-time cryptocurrency balance display

### Technical Features
- Responsive design that adapts to window resizing
- Disabled right-click context menu for uninterrupted gameplay
- Physics-based movement with acceleration and drag
- Smooth camera following system

## Technology Stack

- **Frontend Framework**: [Phaser.js](https://phaser.io/) v3.90.0
- **Build Tool**: [Vite](https://vitejs.dev/) v7.1.5
- **Module System**: CommonJS
- **Language**: JavaScript (ES6+)
- **Package Manager**: npm

## Project Structure

```
SPACE_CRYPTO_MINER/
├── assets/
│   ├── aseprite/          # Original Aseprite source files
│   ├── background/        # Background planet images
│   └── images/            # Game sprites and assets
├── src/
│   ├── scenes/
│   │   └── GameScene.js   # Main game logic
│   └── main.js            # Entry point
├── index.html             # Main HTML file
├── package.json           # Project dependencies and scripts
└── README.md              # This file
```

## Installation

1. **Prerequisites**:
   - Node.js (v14 or higher recommended)
   - npm (comes with Node.js)

2. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd SPACE_CRYPTO_MINER
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

## Development

To start the development server with hot reloading:

```bash
npm run dev
```

The game will be available at `http://localhost:5173` (or another port if 5173 is busy).

## Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run serve
```

## Game Controls

- **Movement**: 
  - Mouse: Aim the spaceship
  - Spacebar: Activate propulsion (hold to accelerate)
  
- **Camera**:
  - Mouse Wheel: Zoom in/out
  - The camera automatically follows the spaceship

- **Interface**:
  - Right-click menu is disabled for uninterrupted gameplay

## Game Mechanics

### Spaceship Controls
- The spaceship always points toward the mouse cursor
- Press and hold SPACEBAR to activate propulsion
- Release SPACEBAR to return to idle mode
- The ship has momentum and will coast when propulsion is not active

### Mining System
- Special mining planets (labeled planets01 and planets02) generate cryptocurrency
- Fly near these planets to mine crypto
- The closer you are to a planet, the higher your mining rate
- Your cryptocurrency balance increases in real-time and is displayed in the top-left corner

### Space Environment
- Infinite space with no boundaries
- Procedurally generated background with stars and planets
- Camera follows the spaceship as it moves
- Zoom in/out to change perspective

## Assets

### Spaceship Sprites
- `01.png` / `01.json`: Main spaceship sprite sheet with animation frames
- `idle.png`: Static image for spaceship idle state

### Background Assets
- `planeta_azul.png`: Blue planet background element
- `planets01.png`: Mining planet type 1
- `planets02.png`: Mining planet type 2

### Aseprite Files
- Original source files for all sprites are available in the `assets/aseprite/` directory

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details if it exists.

---

*SPACE_CRYPTO_MINER - Explore space and mine cryptocurrency!*