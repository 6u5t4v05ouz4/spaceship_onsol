import Phaser from 'phaser';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';

// Obtém as dimensões da tela
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const config = {
    type: Phaser.AUTO,
    width: screenWidth,
    height: screenHeight,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene],
    // Faz o jogo redimensionar quando a janela é redimensionada
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

// Atualiza o tamanho do jogo quando a janela é redimensionada
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});