import Phaser from 'phaser';
import { track } from '@vercel/analytics';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
        this.playerName = '';
        this.menuOptions = ['PLAY', 'CONFIG', 'CREDITS'];
        this.selectedOption = 0;
        this.menuTexts = [];
        this.selectedUnderline = null;
        this.inputActive = true;
    }

    preload() {
        // Carrega assets do menu
        this.load.image('phantom_logo', '/assets/icones/phantom_logo.png');
        this.load.image('astronauta', '/assets/icones/astronauta.png');
        this.load.image('nave1', '/assets/icones/nave1.png');
        this.load.image('nave2', '/assets/icones/nave2.png');
        this.load.image('stars', '/assets/background/stars.png');
        
        // Sons do menu
        this.load.audio('menu_select', '/assets/sounds_effects/bullet.mp3');
        this.load.audio('menu_confirm', '/assets/sounds_effects/rocket-launch.mp3');
    }

    create() {
        console.log('🎬 MenuScene create() called');
        
        // Track menu scene load
        track('menu_scene_loaded', {
            screen_width: this.cameras.main.width,
            screen_height: this.cameras.main.height
        });
        
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        
        console.log(`📐 Screen size: ${W}x${H}`);
        
        // Cria background animado
        this.createAnimatedBackground(W, H);
        
        // Título principal com efeitos
        this.createTitle(W, H);
        
        // Logo Phantom
        this.createPhantomLogo(W, H);
        
        // Elementos decorativos
        this.createDecorations(W, H);
        
        // Menu principal
        this.createMainMenu(W, H);
        
        // Controles
        this.createControls(W, H);
        
        // Configura inputs
        this.setupInputs();
        
        // Efeito de entrada
        this.entranceAnimation();
        
        console.log('✅ MenuScene created successfully');
    }
    
    createAnimatedBackground(W, H) {
        // Fundo gradiente espacial
        this.add.rectangle(0, 0, W, H, 0x000011).setOrigin(0).setDepth(-10);
        
        // Background de estrelas
        this.starsBg = this.add.image(W/2, H/2, 'stars').setOrigin(0.5).setScale(1.2).setDepth(-9);
        this.starsBg.setAlpha(0.3);
        
        // Estrelas animadas
        this.createStarField(W, H);
        
        // Nebulosa colorida
        this.nebula = this.add.rectangle(W/2, H/2, W*0.8, H*0.6, 0x001122);
        this.nebula.setDepth(-8);
        this.nebula.setAlpha(0.2);
        
        // Animação de parallax
        this.tweens.add({
            targets: this.starsBg,
            x: W/2 + 50,
            duration: 20000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createStarField(W, H) {
        this.stars = this.add.group();
        
        // Estrelas distantes
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, W);
            const y = Phaser.Math.Between(0, H);
            const size = Phaser.Math.Between(1, 3);
            const star = this.add.rectangle(x, y, size, size, 0xffffff);
            star.setDepth(-7);
            star.setAlpha(Phaser.Math.FloatBetween(0.3, 1));
            this.stars.add(star);
        }
        
        // Estrelas brilhantes
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, W);
            const y = Phaser.Math.Between(0, H);
            const star = this.add.rectangle(x, y, 2, 2, 0x00ffff);
            star.setDepth(-6);
            star.setAlpha(Phaser.Math.FloatBetween(0.5, 1));
            this.stars.add(star);
            
            // Efeito de pulsação
            this.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    createTitle(W, H) {
        // Título principal com efeito de brilho
        this.title = this.add.text(W/2, H*0.25, 'SPACE CRYPTO MINER', {
            fontFamily: 'Arial',
            fontSize: '52px',
            color: '#00ffcc',
            stroke: '#001a18',
            strokeThickness: 6,
            fontStyle: 'bold',
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#00ffcc',
                blur: 20,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);
        
        // Subtítulo
        this.subtitle = this.add.text(W/2, H*0.32, 'Mine Crypto in the Stars', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#aef7ee',
            stroke: '#001a18',
            strokeThickness: 3,
            fontStyle: 'italic'
        }).setOrigin(0.5);
        
        // Efeito de pulsação no título
        this.tweens.add({
            targets: this.title,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Efeito de brilho
        this.tweens.add({
            targets: this.title,
            alpha: 0.8,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createPhantomLogo(W, H) {
        // Logo Phantom com efeito
        this.phantomLogo = this.add.image(W/2, H*0.12, 'phantom_logo')
            .setOrigin(0.5)
            .setScale(0.5)
            .setAlpha(0.9);
        
        // Efeito de flutuação
        this.tweens.add({
            targets: this.phantomLogo,
            y: H*0.12 + 5,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createDecorations(W, H) {
        // Astronauta à esquerda
        this.astronaut = this.add.image(W*0.15, H*0.65, 'astronauta')
            .setOrigin(0.5)
            .setScale(0.5)
            .setAlpha(0.8);
        
        // Nave à direita
        this.ship = this.add.image(W*0.85, H*0.65, 'nave1')
            .setOrigin(0.5)
            .setScale(0.5)
            .setAlpha(0.8);
        
        // Efeito de flutuação
        this.tweens.add({
            targets: [this.astronaut, this.ship],
            y: '+=15',
            duration: 4000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Efeito de rotação sutil
        this.tweens.add({
            targets: this.ship,
            angle: 5,
            duration: 6000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createMainMenu(W, H) {
        const startY = H*0.5;
        const spacing = 70;
        
        // Underline para seleção
        this.selectedUnderline = this.add.rectangle(W/2, startY + 15, 120, 4, 0x00ffcc);
        this.selectedUnderline.setDepth(1);
        
        // Opções do menu
        this.menuTexts = [];
        this.menuOptions.forEach((option, index) => {
            const y = startY + (index * spacing);
            const text = this.add.text(W/2, y, option, {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: index === 0 ? '#00ffcc' : '#d9ffff',
                stroke: '#001010',
                strokeThickness: 4,
                fontStyle: 'bold',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 5,
                    stroke: true,
                    fill: true
                }
            }).setOrigin(0.5);
            
            this.menuTexts.push(text);
        });
        
        this.updateUnderlinePosition();
    }
    
    createControls(W, H) {
        // Instruções de controle
        this.add.text(W/2, H*0.85, 'Use ↑↓ Arrow Keys or Mouse to Navigate', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#888888',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'italic'
        }).setOrigin(0.5);
        
        this.add.text(W/2, H*0.9, 'Press ENTER or Click to Select', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#888888',
                stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'italic'
        }).setOrigin(0.5);
    }
    
    setupInputs() {
        // Teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Mouse
        this.menuTexts.forEach((text, index) => {
            text.setInteractive({ useHandCursor: true });
            text.on('pointerover', () => {
                if (this.inputActive) {
                    this.selectedOption = index;
                    this.updateMenuSelection();
                    this.playSound('menu_select');
                }
            });
            text.on('pointerdown', () => {
                if (this.inputActive) {
                    this.selectOption(index);
                }
            });
        });
    }
    
    entranceAnimation() {
        // Animação de entrada
        this.cameras.main.fadeIn(1500, 0, 0, 0);
        
        // Elementos aparecem com delay
        this.tweens.add({
            targets: [this.title, this.subtitle],
            alpha: 0,
            duration: 0,
            onComplete: () => {
                this.tweens.add({
                    targets: [this.title, this.subtitle],
                    alpha: 1,
                    duration: 1200,
                    ease: 'Power2'
                });
            }
        });
        
        this.tweens.add({
            targets: this.menuTexts,
            alpha: 0,
            duration: 0,
            delay: 800,
            onComplete: () => {
                this.tweens.add({
                    targets: this.menuTexts,
                    alpha: 1,
                    duration: 1000,
                    ease: 'Power2'
                });
            }
        });
    }
    
    update() {
        if (!this.inputActive) return;
        
        // Navegação por teclado
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
            this.updateMenuSelection();
            this.playSound('menu_select');
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
            this.updateMenuSelection();
            this.playSound('menu_select');
        }
        
        // Seleção
        if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.selectOption(this.selectedOption);
        }
    }
    
    updateMenuSelection() {
        // Atualiza cores das opções
        this.menuTexts.forEach((text, index) => {
            text.setStyle({
                fontFamily: 'Arial',
                fontSize: '32px',
                color: index === this.selectedOption ? '#00ffcc' : '#d9ffff',
                stroke: '#001010',
                strokeThickness: 4,
                fontStyle: 'bold',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 5,
                    stroke: true,
                    fill: true
                }
            });
        });
        
        this.updateUnderlinePosition();
    }

    updateUnderlinePosition() {
        if (!this.menuTexts || !this.selectedUnderline) return;
        const sel = this.menuTexts[this.selectedOption];
        if (!sel) return;
        
        const targetX = sel.x;
        const targetY = sel.y + 15;
        const targetW = Math.max(100, sel.width + 30);
        
        this.tweens.add({
            targets: this.selectedUnderline,
            x: targetX,
            y: targetY,
            width: targetW,
            duration: 250,
            ease: 'Power2'
        });
    }
    
    selectOption(index) {
        this.inputActive = false;
        this.playSound('menu_confirm');
        
        // Track menu selection
        const optionName = this.menuOptions[index];
        track('menu_option_selected', {
            option: optionName,
            option_index: index
        });
        
        // Efeito visual de seleção
        this.menuTexts[index].setStyle({
                fontFamily: 'Arial',
            fontSize: '36px',
            color: '#ffffff',
                stroke: '#001010',
            strokeThickness: 5,
            fontStyle: 'bold',
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#00ffcc',
                blur: 10,
                stroke: true,
                fill: true
            }
        });
        
        // Animação de saída
        this.cameras.main.fadeOut(800, 0, 0, 0);
        
        this.time.delayedCall(800, () => {
            switch (index) {
                case 0: // PLAY
                    this.startGame();
                    break;
                case 1: // CONFIG
                    this.openConfig();
                    break;
                case 2: // CREDITS
                    this.showCredits();
                    break;
            }
        });
    }
    
    startGame() {
        const cfg = window.__GAME_CONFIG__ || {
            playerName: localStorage.getItem('playerName') || 'Pilot',
            walletAddress: null,
            nftImage: null
        };
        
        // Track game start
        track('game_started', {
            player_name: cfg.playerName,
            has_wallet: !!cfg.walletAddress,
            has_nft: !!cfg.nftImage
        });
        
        this.scene.start('GameScene', cfg);
    }
    
    openConfig() {
        const payload = { playerName: this.playerName };
        
        // Tenta obter wallet se conectada
            if (window && window.solana && window.solana.isPhantom) {
                try {
                    const pubKey = window.solana.publicKey ? window.solana.publicKey.toString() : null;
                    if (pubKey) payload.walletAddress = pubKey;
                } catch (e) { /* ignore */ }
            }
        
            this.scene.start('ConfigScene', payload);
    }
    
    showCredits() {
        // Implementar tela de créditos
        this.showTemporaryMessage('Credits coming soon!', 2000);
        this.time.delayedCall(2000, () => {
            this.inputActive = true;
            this.cameras.main.fadeIn(500, 0, 0, 0);
        });
    }
    
    playSound(soundKey) {
        try {
            if (this.sound && this.sound.get(soundKey)) {
                this.sound.play(soundKey, { volume: 0.2 });
            }
        } catch (e) {
            // Ignora erros de áudio
        }
    }
    
    showTemporaryMessage(text, duration = 2000) {
        if (this._tempMsg) {
            this._tempMsg.destroy();
        }
        
        this._tempMsg = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 200,
            text,
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ff4444',
                stroke: '#000000',
                strokeThickness: 4,
                fontStyle: 'bold',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 5,
                    stroke: true,
                    fill: true
                }
            }
        ).setOrigin(0.5);
        
        // Animação de entrada
        this._tempMsg.setAlpha(0);
        this.tweens.add({
            targets: this._tempMsg,
            alpha: 1,
            duration: 400,
            ease: 'Power2'
        });
        
        this.time.delayedCall(duration, () => {
            if (this._tempMsg) {
                this.tweens.add({
                    targets: this._tempMsg,
                    alpha: 0,
                    duration: 400,
                    ease: 'Power2',
                    onComplete: () => {
                        this._tempMsg.destroy();
                        this._tempMsg = null;
                    }
                });
            }
        });
    }
}