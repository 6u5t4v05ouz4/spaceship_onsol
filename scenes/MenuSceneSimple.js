// import { track } from '@vercel/analytics';

export default class MenuSceneSimple extends Phaser.Scene {
    constructor() {
        super('MenuSceneSimple');
        this.playerName = '';
        this.menuOptions = ['PLAY', 'CONFIG', 'CREDITS'];
        this.selectedOption = 0;
        this.menuTexts = [];
        this.selectedUnderline = null;
        this.inputActive = true;
    }

    preload() {
        console.log('🎬 MenuSceneSimple preload() - sem assets');
    }

    create() {
        console.log('🎬 MenuSceneSimple create() called');
        
        // Track menu scene load
        try {
            // track('menu_scene_loaded');
            console.log('Menu scene loaded');
        } catch (error) {
            console.warn('Analytics track failed:', error);
        }
        
        // Configuração da câmera
        this.cameras.main.setBackgroundColor('#000011');
        
        // Título do jogo
        this.add.text(this.cameras.main.centerX, 150, 'SPACE CRYPTO MINER', {
            fontSize: '48px',
            fill: '#00ffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#0066cc',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Subtítulo
        this.add.text(this.cameras.main.centerX, 200, 'Mine Crypto in Space!', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Instrução de uso
        this.add.text(this.cameras.main.centerX, 250, 'Use o mouse para navegar', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Menu options
        this.menuTexts = [];
        this.menuOptions.forEach((option, index) => {
            const text = this.add.text(this.cameras.main.centerX, 320 + (index * 60), option, {
                fontSize: '32px',
                fill: index === this.selectedOption ? '#ffff00' : '#ffffff',
                fontFamily: 'Arial, sans-serif',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            
            this.menuTexts.push(text);
        });
        
        // Underline para opção selecionada
        this.selectedUnderline = this.add.rectangle(
            this.cameras.main.centerX, 
            320 + (this.selectedOption * 60) + 20, 
            200, 3, 0xffff00
        );
        
        // Controles com mouse (melhor UX)
        this.setupMouseControls();
        
        console.log('🎮 Controles de mouse configurados');
        console.log('🔍 inputActive:', this.inputActive);
        
        console.log('✅ MenuSceneSimple criado com sucesso');
    }

    setupMouseControls() {
        // Configura interação com mouse para cada opção do menu
        this.menuTexts.forEach((text, index) => {
            // Torna o texto interativo
            text.setInteractive();
            
            // Efeito hover
            text.on('pointerover', () => {
                if (this.inputActive) {
                    this.selectedOption = index;
                    this.updateMenuDisplay();
                    console.log(`🖱️ Mouse sobre: ${this.menuOptions[index]}`);
                    // Efeito visual no hover
                    text.setScale(1.1);
                }
            });
            
            // Efeito quando sai do hover
            text.on('pointerout', () => {
                text.setScale(1.0);
            });
            
            // Clique para selecionar
            text.on('pointerdown', () => {
                if (this.inputActive) {
                    console.log(`🖱️ Clique em: ${this.menuOptions[index]}`);
                    this.selectedOption = index;
                    this.updateMenuDisplay();
                    this.selectOption();
                }
            });
        });
    }
    
    updateMenuDisplay() {
        this.menuTexts.forEach((text, index) => {
            text.setFill(index === this.selectedOption ? '#ffff00' : '#ffffff');
        });
        
        // Atualiza underline
        this.selectedUnderline.setY(320 + (this.selectedOption * 60) + 20);
    }
    
    selectOption() {
        const option = this.menuOptions[this.selectedOption];
        console.log(`🎯 Opção selecionada: ${option}`);
        
        try {
            // track('menu_option_selected', { option });
            console.log(`Menu option selected: ${option}`);
        } catch (error) {
            console.warn('Analytics track failed:', error);
        }
        
        switch (option) {
            case 'PLAY':
                this.scene.start('GameSceneModular');
                break;
            case 'CONFIG':
                console.log('Config não implementado ainda');
                break;
            case 'CREDITS':
                console.log('Credits não implementado ainda');
                break;
        }
    }
}
