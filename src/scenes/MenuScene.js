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
        this.load.image('ship_idle', '/assets/images/idle.png');
    }

    create() {
        // Adiciona o background (mesmo da gameplay)
        this.createBackground();
        // Layout responsivo: usa porcentagens da viewport para evitar sobreposição
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const scaleFactor = Phaser.Math.Clamp(W / 900, 0.8, 1.2);

        // Título estilizado (look digital)
        const titleY = H * 0.08;
        this.add.text(W / 2, titleY, 'SPACE CRYPTO MINER', {
            fontFamily: 'Arial',
            fontSize: Math.round(44 * scaleFactor) + 'px',
            color: '#00ffcc',
            stroke: '#00222a',
            strokeThickness: Math.round(6 * scaleFactor),
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4 }
        }).setOrigin(0.5).setDepth(5);

        // Subtítulo / efeito digital
        this.add.text(W / 2, titleY + (36 * scaleFactor), 'CONQUISTE O ESPAÇO COM SUA CARTEIRA', {
            fontFamily: 'Arial',
            fontSize: Math.round(16 * scaleFactor) + 'px',
            color: '#99ffe6'
        }).setOrigin(0.5).setDepth(5).setAlpha(0.95);

        // Adiciona a nave mais acima para liberar espaço para input e opções
        const shipY = H * 0.28;
        this.ship = this.add.image(W / 2, shipY, 'ship_idle');
        this.ship.setScale(0.45 * scaleFactor).setDepth(4);
        this.tweens.add({
            targets: this.ship,
            y: this.ship.y - (6 * scaleFactor),
            duration: 2200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Cria o input de nome de usuário
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 150,
            'DIGITE SEU NOME:',
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Cria um retângulo para o fundo do input com estilo digital (posicionado responsivamente)
        const inputY = H * 0.46;
        const inputW = Math.round(W * 0.42);
        const inputH = Math.round(56 * scaleFactor);
        const inputFontSize = Math.round(18 * scaleFactor);

        const inputBg = this.add.rectangle(W / 2, inputY, inputW, inputH, 0x041017, 0.88);
        inputBg.setStrokeStyle(Math.max(1, Math.round(2 * scaleFactor)), 0x00ffcc);

        // Placeholder e texto do nome do jogador
        this.playerNameText = this.add.text(W / 2, inputY, 'DIGITE AQUI (EX: NOME123)', {
            fontFamily: 'Arial',
            fontSize: inputFontSize + 'px',
            color: '#66fff0',
            align: 'center',
            fixedWidth: inputW - 40
        }).setOrigin(0.5).setAlpha(0.75);

        // Configura o input de texto
        this.input.keyboard.on('keydown', event => {
            if (event.keyCode === 8 && this.playerName.length > 0) {
                // Backspace
                this.playerName = this.playerName.slice(0, -1);
            } else if (event.keyCode === 13) {
                // Enter - só inicia se tiver nome
                if (this.playerName.trim() !== '') {
                    this.scene.start('GameScene', { playerName: this.playerName });
                }
            } else if (event.key.length === 1 && this.playerName.length < 15) {
                // Letras e números
                this.playerName += event.key;
            }
            // Atualiza o texto / placeholder
            if (this.playerName.length === 0) {
                this.playerNameText.setText('DIGITE AQUI (EX: NOME123)').setAlpha(0.7);
                if (this.playerNameUnderShip) this.playerNameUnderShip.setText('');
            } else {
                this.playerNameText.setText(this.playerName).setAlpha(1);
                if (this.playerNameUnderShip) this.playerNameUnderShip.setText(this.playerName);
            }
        });

    // Adiciona as opções de menu como texto (posicionadas no topo em horizontal)
        this.menuTexts = [];
        const topMenuY = Math.round(H * 0.16);
        const topMenuGap = Math.round(Math.max(80, W * 0.08));
        const startX = Math.round(W / 2 - topMenuGap);
        for (let i = 0; i < this.menuOptions.length; i++) {
            const option = this.menuOptions[i];
            const x = startX + i * topMenuGap;
            const text = this.add.text(x, topMenuY, option, {
                fontFamily: 'Arial',
                fontSize: Math.round(20 * scaleFactor) + 'px',
                color: i === this.selectedOption ? '#00ffcc' : '#d9ffff',
                stroke: '#001010',
                strokeThickness: Math.max(2, Math.round(2 * scaleFactor))
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            text.setDepth(6);

            // hover effect
            text.on('pointerover', () => text.setStyle({ color: '#88fff0' }));
            text.on('pointerout', () => text.setStyle({ color: i === this.selectedOption ? '#00ffcc' : '#d9ffff' }));
            text.on('pointerdown', () => this.selectOption(i));

            this.menuTexts.push(text);
        }

        // underline para a opção selecionada
        const underlineW = Math.round(80 * scaleFactor);
        this.selectedUnderline = this.add.rectangle(W / 2, topMenuY + Math.round(26 * scaleFactor), underlineW, 4, 0x00ffcc).setOrigin(0.5).setDepth(6);
        this.updateUnderlinePosition();

        // Texto de instrução
        this.instructionText = this.add.text(W / 2, H * 0.92, 'NOME OBRIGATÓRIO • USE SUA CARTEIRA PHANTOM PARA RECOMPENSAS', {
            fontFamily: 'Arial',
            fontSize: Math.round(14 * scaleFactor) + 'px',
            color: '#88fff0'
        }).setOrigin(0.5).setAlpha(0.9).setDepth(5);

        // Botões de GUEST e PHANTOM (empilamento em mobile)
    const isMobileLayout = H < 660 || W < 500;
    const btnWidth = isMobileLayout ? Math.round(W * 0.7) : Math.round(W * 0.34);
    const btnHeight = Math.round(56 * scaleFactor);
    const centerX = W / 2;
    const baseY = isMobileLayout ? H * 0.70 : H * 0.78;
    const mobileGap = Math.round(14 * scaleFactor);

        // Botão Guest
        const guestBg = this.add.rectangle(centerX - Math.round(W * 0.22), baseY, btnWidth, btnHeight, 0x022628, 0.95)
            .setStrokeStyle(2, 0x00ffcc)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(6);
        const guestText = this.add.text(centerX - Math.round(W * 0.22), baseY, 'ENTRAR COMO GUEST', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ccfff6'
        }).setOrigin(0.5).setDepth(7);

        // hover/pulse
        guestBg.on('pointerover', () => {
            this.tweens.add({ targets: guestBg, scaleX: 1.03, scaleY: 1.03, duration: 120, ease: 'Power1' });
        });
        guestBg.on('pointerout', () => {
            this.tweens.add({ targets: guestBg, scaleX: 1, scaleY: 1, duration: 120, ease: 'Power1' });
        });

        guestBg.on('pointerdown', () => {
            // Não permite entrar sem nome
            const name = this.playerName.trim();
            if (name === '') {
                this.showTemporaryMessage('DIGITE SEU NOME ANTES DE ENTRAR');
                return;
            }
            this.scene.start('GameScene', { playerName: name });
        });

        // Ajusta posição se mobile
        if (isMobileLayout) {
            guestBg.setPosition(centerX, baseY - (btnHeight / 2) - (mobileGap / 2));
            guestText.setPosition(centerX, baseY - (btnHeight / 2) - (mobileGap / 2));
        }

        // Botão Phantom
        const phantomBg = this.add.rectangle(centerX + Math.round(W * 0.22), baseY, btnWidth, btnHeight, 0x022628, 0.95)
            .setStrokeStyle(2, 0x00ffcc)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(6);
        const phantomText = this.add.text(centerX + Math.round(W * 0.22), baseY, 'CONECTAR PHANTOM', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ccfff6'
        }).setOrigin(0.5).setDepth(7);

        phantomBg.on('pointerover', () => {
            this.tweens.add({ targets: phantomBg, scaleX: 1.03, scaleY: 1.03, duration: 120, ease: 'Power1' });
        });
        phantomBg.on('pointerout', () => {
            this.tweens.add({ targets: phantomBg, scaleX: 1, scaleY: 1, duration: 120, ease: 'Power1' });
        });

        phantomBg.on('pointerdown', async () => {
            // Não permite conectar sem nome
            const name = this.playerName.trim();
            if (name === '') {
                this.showTemporaryMessage('DIGITE SEU NOME ANTES DE CONECTAR A CARTEIRA');
                return;
            }

            // Tenta conectar à carteira Phantom via window.solana
            if (window && window.solana && window.solana.isPhantom) {
                try {
                    const resp = await window.solana.connect();
                    const pubKey = resp.publicKey ? resp.publicKey.toString() : (window.solana.publicKey && window.solana.publicKey.toString());
                    // Mantém o nome do jogador digitado, mas anexa informação da carteira
                    this.scene.start('GameScene', { playerName: name, walletAddress: pubKey });
                } catch (err) {
                    console.error('Phantom connection failed', err);
                    this.showTemporaryMessage('FALHA AO CONECTAR PHANTOM');
                }
            } else {
                this.showTemporaryMessage('PHANTOM NÃO ENCONTRADO');
            }
        });

        if (isMobileLayout) {
            phantomBg.setPosition(centerX, baseY + (btnHeight / 2) + (mobileGap / 2));
            phantomText.setPosition(centerX, baseY + (btnHeight / 2) + (mobileGap / 2));
        }

        // Nome do jogador sob a nave
        const nameUnderShipY = shipY + Math.round(48 * scaleFactor);
        this.playerNameUnderShip = this.add.text(W / 2, nameUnderShipY, '', {
            fontFamily: 'Arial',
            fontSize: Math.round(18 * scaleFactor) + 'px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(6);

        // Efeito de fade in
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Animação sutil das estrelas (twinkle)
        this.time.add.event({
            delay: 300,
            loop: true,
            callback: () => {
                this.distantStars.getChildren().forEach((s, i) => {
                    if (Phaser.Math.Between(0, 100) > 97) {
                        this.tweens.add({ targets: s, alpha: 0.2, duration: 200, yoyo: true, ease: 'Sine.easeInOut' });
                    }
                });
                this.brightStars.getChildren().forEach((s, i) => {
                    if (Phaser.Math.Between(0, 100) > 85) {
                        this.tweens.add({ targets: s, alpha: 0.1, duration: 150, yoyo: true, ease: 'Sine.easeInOut' });
                    }
                });
            }
        });

        // Digital overlay lines
        const linesCount = 6;
        for (let i = 0; i < linesCount; i++) {
            const x = Phaser.Math.Between(30, this.cameras.main.width - 30);
            const line = this.add.rectangle(x, Phaser.Math.Between(120, this.cameras.main.height - 80), 2, Phaser.Math.Between(60, 220), 0x003f35, 0.18).setDepth(3);
            this.tweens.add({ targets: line, alpha: 0.05, duration: 1500 + i * 120, yoyo: true, repeat: -1 });
        }

        // After creating guestButton and phantomButton, add mobile stacking logic
        if (this.guestButton && this.phantomButton) {
            // For mobile screens, stack buttons vertically
            if (this.scale.width < 480) {
                const centerX = this.cameras.main.centerX;
                this.guestButton.setPosition(centerX, this.guestButton.y);
                this.phantomButton.setPosition(centerX, this.guestButton.y + this.guestButton.displayHeight + 10);
            }
        }

        // Add player name text below the ship if not already created
        if (this.ship && !this.playerNameUnderShip) {
            this.playerNameUnderShip = this.add.text(
                this.ship.x,
                this.ship.y + this.ship.displayHeight + 20,
                "",
                { font: "20px digitalFont", fill: "#FFFFFF" }
            ).setOrigin(0.5, 0).setDepth(10);
        }

        // Listen to changes in the input field and update the player's name under the ship
        if (this.nameInput && this.playerNameUnderShip) {
            // Ensure the DOM element has been created; for Phaser DOM element use node property
            this.nameInput.node.addEventListener('input', (e) => {
                this.playerNameUnderShip.setText(e.target.value);
            });
        }
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
                'MODO PVP EM BREVE!',
                {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    color: '#ff0000',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            ).setOrigin(0.5);
        } else if (index === 2) { // CONFIG
            // Futuramente implementar configurações
            this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 250,
                'CONFIGURAÇÕES EM BREVE!',
                {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    color: '#00ff00',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            ).setOrigin(0.5);
        }
    }

    // Ensure player's name text stays under the ship during gameplay
    update() {
        if (this.ship && this.playerNameUnderShip) {
            this.playerNameUnderShip.setPosition(this.ship.x, this.ship.y + this.ship.displayHeight + 20);
        }
    }
}