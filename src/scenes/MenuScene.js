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
        this.load.image('stars', '/assets/background/stars.png');
        this.load.image('planets', '/assets/images/planets.png');
        this.load.image('ship_idle', '/assets/images/idle.png');
    }

    create() {
        // Adiciona o background (mesmo da gameplay)
        this.createBackground();
        
        // Adiciona a nave no centro
        this.ship = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'ship_idle');
        this.ship.setScale(0.5);

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

        // Cria um retângulo para o fundo do input
        const inputBg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            300,
            50,
            0x000000,
            0.7
        );
        inputBg.setStrokeStyle(2, 0xffffff);

        // Cria o texto do nome do jogador
        this.playerNameText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            this.playerName,
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center',
                fixedWidth: 280
            }
        ).setOrigin(0.5);

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
            this.playerNameText.setText(this.playerName);
        });

        // Adiciona as opções de menu como texto
        this.menuTexts = [];
        for (let i = 0; i < this.menuOptions.length; i++) {
            const option = this.menuOptions[i];
            const text = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 50 + i * 60,
                option,
                {
                    fontFamily: 'Arial',
                    fontSize: '28px',
                    color: i === this.selectedOption ? '#ffff00' : '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            ).setOrigin(0.5).setInteractive();
            
            text.on('pointerdown', () => {
                this.selectOption(i);
            });
            
            this.menuTexts.push(text);
        }

        // Texto de instrução
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            'DIGITE SEU NOME E CLIQUE EM PVE PARA COMEÇAR',
            {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Efeito de fade in
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }
    
    createBackground() {
        // Configuração do efeito parallax (mesmo da gameplay)
        const worldWidth = this.cameras.main.width;
        const worldHeight = this.cameras.main.height;
        
        // Camada de fundo (estrelas)
        this.stars = this.add.tileSprite(0, 0, worldWidth, worldHeight, 'stars');
        this.stars.setOrigin(0);
        this.stars.setScale(2);
        this.stars.setDepth(-10);
        
        // Camada de planetas
        this.planets = this.add.tileSprite(0, 0, worldWidth, worldHeight, 'planets');
        this.planets.setOrigin(0);
        this.planets.setScale(1.5);
        this.planets.setDepth(-5);
    }
    
    selectOption(index) {
        // Só permite selecionar se o nome foi digitado
        if (this.playerName.trim() === '' && index === 0) {
            return;
        }
        
        this.selectedOption = index;
        
        // Atualiza as cores das opções
        for (let i = 0; i < this.menuTexts.length; i++) {
            this.menuTexts[i].setStyle({
                fontFamily: 'Arial',
                fontSize: '28px',
                color: i === this.selectedOption ? '#ffff00' : '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            });
        }
        
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
}