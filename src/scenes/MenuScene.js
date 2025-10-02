import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
        this.playerName = '';
        this.menuOptions = ['PVE', 'PVP', 'CONFIG'];
        this.selectedOption = 0;
    }

    preload() {
        // Carrega os assets do menu
        this.load.image('phantom_logo', '/assets/icones/phantom_logo.png'); // Assumindo que o logo está aqui
        this.load.image('input_bg', '/assets/icones/input_bg.png'); // Assumindo que existe uma imagem para o fundo do input
        // Removidas as cargas de astronaut_icon e naves para a tela inicial
    }

    create() {
        // Minimal Play-only menu (main UI moved to index.html)
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        this.createBackground();
        const title = this.add.text(W/2, H*0.22, 'SPACE CRYPTO MINER', { fontFamily:'Arial', fontSize: '36px', color:'#00ffcc' }).setOrigin(0.5);
        this.add.text(W/2, H*0.28, 'Click PLAY on the home page to start', { fontFamily:'Arial', fontSize: '16px', color:'#aef7ee' }).setOrigin(0.5);

        // Play button (starts the game using window.__GAME_CONFIG__ or localStorage)
        const playBtn = this.add.rectangle(W/2, H/2, 260, 84, 0x00ffcc).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const playText = this.add.text(W/2, H/2, 'PLAY', { fontFamily:'Arial', fontSize: '28px', color:'#001a18', fontStyle:'bold' }).setOrigin(0.5);
        playBtn.on('pointerdown', () => {
            const cfg = window.__GAME_CONFIG__ || { playerName: localStorage.getItem('playerName') || 'Pilot', walletAddress: null, nftImage: null };
            this.scene.start('GameScene', cfg);
        });
    }
    
    createBackground() {
        // Cria um fundo preto para o espaço
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.rectangle(
            0, 
            0, 
            width, 
            height, 
            0x000000
        ).setOrigin(0).setDepth(-10);
        
        // Cria estrelas distantes (camada 1 - parallax lento)
        this.distantStars = this.add.group();
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const star = this.add.rectangle(x, y, 1, 1, 0xffffff);
            star.setDepth(-9);
            this.distantStars.add(star);
        }
        
        // Cria estrelas brilhantes (camada 2 - parallax mais rápido)
        this.brightStars = this.add.group();
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const star = this.add.rectangle(x, y, 2, 2, 0xffffff);
            star.setDepth(-8);
            this.brightStars.add(star);
        }
    }

    showTemporaryMessage(text, duration = 2000) {
        if (this._tempMsg) {
            this._tempMsg.destroy();
        }
        this._tempMsg = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 260,
            text,
            {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ff4444',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        this.time.delayedCall(duration, () => {
            if (this._tempMsg) {
                this._tempMsg.destroy();
                this._tempMsg = null;
            }
        });
    }

    updateUnderlinePosition() {
        if (!this.menuTexts || !this.selectedUnderline) return;
        const sel = this.menuTexts[this.selectedOption];
        if (!sel) return;
        const targetX = sel.x;
        const targetW = Math.max(40, sel.width + 20);
        this.tweens.add({ targets: this.selectedUnderline, x: targetX, width: targetW, duration: 180, ease: 'Power2' });
    }
    
    selectOption(index) {
        // Só permite selecionar se o nome foi digitado
        if (this.playerName.trim() === '' && index === 0) {
            return;
        }
        
        this.selectedOption = index;
        
        // Atualiza as cores das opções e underline
        for (let i = 0; i < this.menuTexts.length; i++) {
            this.menuTexts[i].setStyle({
                fontFamily: 'Arial',
                fontSize: '24px',
                color: i === this.selectedOption ? '#00ffcc' : '#d9ffff',
                stroke: '#001010',
                strokeThickness: 3
            });
        }
        this.updateUnderlinePosition();
        
        // Ação baseada na opção selecionada
        if (index === 0) { // PVE
            this.scene.start('GameScene', { playerName: this.playerName });
        } else if (index === 1) { // PVP
            // Futuramente implementar modo PVP
            this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 250,
                'PVP MODE COMING SOON!',
                {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    color: '#ff0000',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            ).setOrigin(0.5);
        } else if (index === 2) { // CONFIG
            // Open configuration scene and pass current playerName and wallet if available
            const payload = { playerName: this.playerName };
            // If a wallet was connected via the phantom button earlier, try to pass it
            if (window && window.solana && window.solana.isPhantom) {
                try {
                    const pubKey = window.solana.publicKey ? window.solana.publicKey.toString() : null;
                    if (pubKey) payload.walletAddress = pubKey;
                } catch (e) { /* ignore */ }
            }
            this.scene.start('ConfigScene', payload);
        }
    }

    // update vazio pois a nave foi removida da tela inicial
    update() {
        // nada para atualizar aqui no menu por enquanto
    }
}