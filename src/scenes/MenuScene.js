import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        // Carrega os assets do menu
        this.load.image('background', '/assets/background/planeta_azul.png');
        this.load.image('playButton', '/assets/icones/icone.png');
        this.load.image('title', '/assets/icones/banner.png');
    }

    create() {
        // Adiciona o background
        const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);

        // Adiciona o título
        const title = this.add.image(this.cameras.main.width / 2, 150, 'title');
        title.setScale(0.6);

        // Adiciona o botão de jogar
        const playButton = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'playButton')
            .setInteractive()
            .setScale(0.3);

        // Efeito de hover no botão
        playButton.on('pointerover', () => {
            playButton.setScale(0.32);
            this.tweens.add({
                targets: playButton,
                scale: 0.35,
                duration: 200,
                ease: 'Power2'
            });
        });

        playButton.on('pointerout', () => {
            this.tweens.add({
                targets: playButton,
                scale: 0.3,
                duration: 200,
                ease: 'Power2'
            });
        });

        // Inicia o jogo ao clicar
        playButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Texto de instrução
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            'Clique no ícone para começar!',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Efeito de fade in
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }
}
