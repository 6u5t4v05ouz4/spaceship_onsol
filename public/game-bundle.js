// Game Bundle - MVP simples inline
console.log('🎮 Game Bundle carregado');

// Configuração do jogo
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: {
        key: 'GameScene',
        create: function() {
            console.log('🎮 Cena do jogo criada');
            
            // Adicionar texto simples
            this.add.text(400, 300, 'Space Crypto Miner', {
                fontSize: '32px',
                fill: '#00ff00',
                fontFamily: 'Courier New'
            }).setOrigin(0.5);
            
            this.add.text(400, 350, 'MVP Funcionando!', {
                fontSize: '16px',
                fill: '#ffffff',
                fontFamily: 'Courier New'
            }).setOrigin(0.5);
            
            // Adicionar nave simples
            this.ship = this.add.rectangle(400, 400, 20, 20, 0x00ff00);
            this.physics.add.existing(this.ship);
            this.ship.body.setVelocity(0, 0);
            
            // Controles simples
            this.cursors = this.input.keyboard.createCursorKeys();
            
            console.log('✅ Jogo MVP inicializado');
        },
        update: function() {
            // Movimento simples
            if (this.cursors.left.isDown) {
                this.ship.x -= 5;
            }
            if (this.cursors.right.isDown) {
                this.ship.x += 5;
            }
            if (this.cursors.up.isDown) {
                this.ship.y -= 5;
            }
            if (this.cursors.down.isDown) {
                this.ship.y += 5;
            }
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Inicializar o jogo
function initializeGame() {
    console.log('🚀 Inicializando jogo MVP...');
    
    if (typeof Phaser === 'undefined') {
        console.error('❌ Phaser não está disponível!');
        return;
    }
    
    console.log('✅ Phaser disponível:', Phaser.VERSION);
    
    try {
        const game = new Phaser.Game(config);
        console.log('✅ Jogo MVP criado:', game);
        
        // Ocultar loading
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        console.log('🎉 Jogo MVP funcionando!');
        
    } catch (error) {
        console.error('❌ Erro ao criar o jogo:', error);
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}
