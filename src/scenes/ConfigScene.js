import Phaser from 'phaser';

import { findFirstNftImageForOwner } from '../solana_nft.js';

export default class ConfigScene extends Phaser.Scene {
    constructor() {
        super('ConfigScene');
        this.playerName = '';
        this.walletAddress = null;
        this.nftImageUrl = null;
    }

    preload() {
        // Reuse phantom logo
        this.load.image('phantom_logo', '/assets/icones/phantom_logo.png');
    }

    create(data) {
        const W = this.cameras.main.width;
        const H = this.cameras.main.height;
        const scaleFactor = Phaser.Math.Clamp(W / 900, 0.8, 1.2);

        // Background panel
        this.add.rectangle(W/2, H/2, Math.min(W*0.9, 800), Math.min(H*0.85, 600), 0x001a18, 0.95).setOrigin(0.5);

        // Title
        this.add.text(W/2, H*0.12, 'CONFIGURAÇÕES', { fontFamily: 'Arial', fontSize: Math.round(28*scaleFactor)+'px', color: '#00ffcc' }).setOrigin(0.5);

        // Wallet section
        const sectionY = H*0.22;
        this.add.text(W*0.12, sectionY, 'CARTEIRA', { fontFamily: 'Arial', fontSize: Math.round(18*scaleFactor)+'px', color: '#aef7ee' }).setOrigin(0,0.5);

        // Wallet address display
        this.walletText = this.add.text(W*0.12, sectionY+40, 'Nenhuma carteira conectada', { fontFamily: 'Arial', fontSize: Math.round(14*scaleFactor)+'px', color: '#cfeff0' }).setOrigin(0,0);

        // Connect / Disconnect button
        const btnW = Math.round(W*0.24);
        const btnH = Math.round(44*scaleFactor);
        this.connectBtn = this.add.rectangle(W*0.78, sectionY+20, btnW, btnH, 0x022628, 0.98).setOrigin(0.5).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x00ffcc);
        this.connectBtnText = this.add.text(this.connectBtn.x, this.connectBtn.y, 'CONECTAR PHANTOM', { fontFamily: 'Arial', fontSize: Math.round(14*scaleFactor)+'px', color: '#ccfff6' }).setOrigin(0.5);

        this.connectBtn.on('pointerdown', async () => {
            if (window && window.solana && window.solana.isPhantom) {
                try {
                    if (!this.walletAddress) {
                        const resp = await window.solana.connect();
                        this.walletAddress = resp.publicKey ? resp.publicKey.toString() : (window.solana.publicKey && window.solana.publicKey.toString());
                        this.connectBtnText.setText('DESCONECTAR');
                        this.walletText.setText(this.walletAddress);
                        await this.fetchAndShowNft();
                    } else {
                        // disconnect
                        try { await window.solana.disconnect(); } catch(e) { /* some wallets may not support */ }
                        this.walletAddress = null;
                        this.nftImageUrl = null;
                        this.walletText.setText('Nenhuma carteira conectada');
                        this.connectBtnText.setText('CONECTAR PHANTOM');
                        if (this.nftPreview) { this.nftPreview.destroy(); this.nftPreview = null; }
                    }
                } catch (err) {
                    console.error('Phantom connection error', err);
                    this.showTempMessage('Erro ao conectar/desconectar carteira');
                }
            } else {
                this.showTempMessage('PHANTOM NÃO ENCONTRADO NO NAVEGADOR');
            }
        });

        // Player name input (simple text entry via keyboard events)
        const nameY = H*0.45;
        this.add.text(W*0.12, nameY, 'NOME DO JOGADOR', { fontFamily: 'Arial', fontSize: Math.round(18*scaleFactor)+'px', color: '#aef7ee' }).setOrigin(0,0.5);
        this.nameDisplay = this.add.text(W*0.12, nameY+40, data && data.playerName ? data.playerName : 'Clique e digite...', { fontFamily: 'Arial', fontSize: Math.round(16*scaleFactor)+'px', color: '#66fff0' }).setOrigin(0,0).setInteractive();
        this.nameDisplay.on('pointerdown', () => { this.startNameInput(); });

        // Save and Back buttons
        this.saveBtn = this.add.rectangle(W*0.4, H*0.78, Math.round(160*scaleFactor), Math.round(52*scaleFactor), 0x022628, 0.98).setOrigin(0.5).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x00ffcc);
        this.saveText = this.add.text(this.saveBtn.x, this.saveBtn.y, 'SALVAR', { fontFamily: 'Arial', fontSize: Math.round(16*scaleFactor)+'px', color: '#ccfff6' }).setOrigin(0.5);
        this.saveBtn.on('pointerdown', () => { this.saveConfig(); });

        this.disconnectBtn = this.add.rectangle(W*0.6, H*0.78, Math.round(160*scaleFactor), Math.round(52*scaleFactor), 0x330000, 0.98).setOrigin(0.5).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xff6666);
        this.disconnectText = this.add.text(this.disconnectBtn.x, this.disconnectBtn.y, 'DESCONECTAR', { fontFamily: 'Arial', fontSize: Math.round(14*scaleFactor)+'px', color: '#ff9999' }).setOrigin(0.5);
        this.disconnectBtn.on('pointerdown', async () => {
            if (this.walletAddress && window && window.solana && window.solana.isPhantom) {
                try { await window.solana.disconnect(); } catch(e) {}
            }
            this.walletAddress = null;
            this.nftImageUrl = null;
            this.walletText.setText('Nenhuma carteira conectada');
            this.connectBtnText.setText('CONECTAR PHANTOM');
            if (this.nftPreview) { this.nftPreview.destroy(); this.nftPreview = null; }
        });

        // small helper message area
        this.msgText = this.add.text(W/2, H*0.92, '', { fontFamily: 'Arial', fontSize: Math.round(14*scaleFactor)+'px', color: '#ffd6d6' }).setOrigin(0.5);
    }

    startNameInput() {
        this.playerName = this.playerName || '';
        // Simple keyboard listener for typing
        if (this.nameKeyListener) return; // already active
        this.nameDisplay.setText(this.playerName + '|');
        this.nameKeyListener = (event) => {
            if (event.key === 'Enter') {
                this.nameDisplay.setText(this.playerName || '');
                this.input.keyboard.off('keydown', this.nameKeyListener);
                this.nameKeyListener = null;
                return;
            }
            if (event.key === 'Backspace') {
                this.playerName = this.playerName.slice(0, -1);
            } else if (event.key.length === 1 && this.playerName.length < 20) {
                this.playerName += event.key;
            }
            this.nameDisplay.setText(this.playerName + '|');
        };
        this.input.keyboard.on('keydown', this.nameKeyListener);
    }

    async fetchAndShowNft() {
        if (!this.walletAddress) return;
        this.msgText.setText('Buscando NFT...');
        try {
            const imageUrl = await findFirstNftImageForOwner(this.walletAddress, { network: 'devnet' });
            if (imageUrl) {
                this.nftImageUrl = imageUrl;
                // load and show small preview
                if (this.nftPreview) this.nftPreview.destroy();
                this.load.image('cfg_nft', imageUrl);
                this.load.once('complete', () => {
                    try {
                        this.nftPreview = this.add.image(this.cameras.main.width*0.85, this.cameras.main.height*0.35, 'cfg_nft').setOrigin(0.5).setScale(0.18).setDepth(10);
                    } catch (e) { console.warn('Failed nft preview', e); }
                });
                this.load.start();
                this.msgText.setText('NFT encontrado');
            } else {
                this.msgText.setText('Nenhum NFT encontrado');
            }
        } catch (e) {
            console.error('fetchAndShowNft error', e);
            this.msgText.setText('Erro ao buscar NFT');
        }
        this.time.delayedCall(2500, () => { this.msgText.setText(''); });
    }

    saveConfig() {
        // Save name locally as simple persistence (localStorage)
        if (this.playerName) {
            try { localStorage.setItem('playerName', this.playerName); } catch (e) {}
            this.showTempMessage('Configurações salvas');
        } else {
            this.showTempMessage('Insira um nome antes de salvar');
        }
    }

    showTempMessage(msg, duration = 2000) {
        if (this.msgText) this.msgText.setText(msg);
        this.time.delayedCall(duration, () => { if (this.msgText) this.msgText.setText(''); });
    }
}
