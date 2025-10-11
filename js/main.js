// Immediate test - this should run first
console.log('🚀 SCRIPT STARTED - JavaScript is working!');

// Test if we can find tabs immediately
try {
    const tabs = document.querySelectorAll('.nav-tab');
    console.log('Immediate tab check - Found:', tabs.length);
} catch (error) {
    console.error('Error in immediate tab check:', error);
}

// Create simple test function immediately
window.simpleTabTest = function() {
    console.log('🧪 Simple tab test...');
    const tabs = document.querySelectorAll('.nav-tab');
    console.log('Found tabs:', tabs.length);
    return tabs.length;
};
console.log('✅ simpleTabTest function created!');

// Initialize tabs immediately and also when DOM is ready
function initTabsNow() {
    console.log('🚀 Initializing tabs NOW...');
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    console.log('Found tabs:', tabs.length);
    console.log('Found contents:', contents.length);

    // Debug: log each tab element
    tabs.forEach((tab, index) => {
        console.log(`Tab ${index}:`, {
            element: tab,
            dataTab: tab.getAttribute('data-tab'),
            classes: tab.className,
            text: tab.textContent.trim()
        });
    });

    // Debug: log each content element
    contents.forEach((content, index) => {
        console.log(`Content ${index}:`, {
            element: content,
            id: content.id,
            classes: content.className
        });
    });

    function switchTab(tabName) {
        console.log('Switching to tab:', tabName);

        // Remove active from all tabs and contents
        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none'; // Force hide all content
        });

        // Add active to selected tab and content
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}-content`);

        console.log('Active tab found:', !!activeTab);
        console.log('Active content found:', !!activeContent);
        console.log('Content element:', activeContent);

        if (activeTab) {
            activeTab.classList.add('active');
            console.log('Added active class to tab');
        } else {
            console.error('Tab not found:', tabName);
        }

        if (activeContent) {
            activeContent.classList.add('active');
            activeContent.style.display = 'block'; // Force show selected content
            console.log('Added active class to content and forced display');
        } else {
            console.error('Content not found:', `${tabName}-content`);
        }

        console.log('Switched to:', tabName);
    }

    // Add click listeners
    tabs.forEach(tab => {
        const tabName = tab.getAttribute('data-tab');
        console.log('Adding listener to tab:', tabName);

        tab.addEventListener('click', (e) => {
            console.log('Tab clicked:', tabName);
            e.preventDefault();
            e.stopPropagation();
            switchTab(tabName);
        });
    });

    // Set initial tab
    switchTab('profile');

    // Make functions available globally
    window.switchTab = switchTab;
    window.testTabClick = function(name) {
        console.log('Testing click on:', name);
        switchTab(name);
    };

    // Debug function to check all content elements
    window.debugContent = function() {
        console.log('🔍 Debugging content elements...');
        const allContents = document.querySelectorAll('.tab-content');
        console.log('All tab-content elements:', allContents.length);

        allContents.forEach((content, index) => {
            console.log(`Content ${index}:`, {
                id: content.id,
                classes: content.className,
                isActive: content.classList.contains('active'),
                visible: content.style.display !== 'none'
            });
        });

        // Check specific content IDs
        ['profile-content', 'roadmap-content', 'config-content'].forEach(id => {
            const element = document.getElementById(id);
            console.log(`${id}:`, {
                exists: !!element,
                classes: element ? element.className : 'N/A',
                isActive: element ? element.classList.contains('active') : 'N/A'
            });
        });
    };

    console.log('✅ Tabs initialized successfully!');
}

// Load header component dynamically
async function loadHeaderComponent() {
    try {
        // Header is now inline in HTML, just log success
        console.log('✅ Header component loaded successfully');
    } catch (error) {
        console.error('❌ Error loading header component:', error);
    }
}

// Load profile tab component dynamically
async function loadProfileTabComponent() {
    try {
        // Profile tab is now inline in HTML, just log success
        console.log('✅ Profile tab component loaded successfully');
    } catch (error) {
        console.error('❌ Error loading profile tab component:', error);
    }
}

// Load roadmap tab component dynamically
async function loadRoadmapTabComponent() {
    try {
        console.log('🚀 Starting roadmap component loading...');
        const roadmapHTML = `
<!-- Roadmap tab content -->
<div class="tab-content" id="roadmap-content">
    <div class="roadmap-container">
        <!-- Header -->
        <div class="roadmap-header">
            <h1 class="roadmap-title">🗺️ ROADMAP</h1>
            <p class="roadmap-subtitle">SPACE CRYPTO MINER - Development and Expansion</p>
            <div class="roadmap-status">Active Development</div>
        </div>

        <!-- Timeline Overview -->
        <div class="timeline-container">
            <h2 class="timeline-title">📅 Development Timeline</h2>
            <div class="timeline-visual">
                <div class="timeline-phase">
                    <div class="timeline-phase-header">
                        <div class="timeline-phase-title">🚀 PHASE 1 - MVP CORE</div>
                        <div class="timeline-phase-duration">8-10 weeks</div>
                    </div>
                    <div class="timeline-phase-tasks">
                        <div class="timeline-task">
                            <div class="timeline-task-weeks">Weeks 1-2:</div>
                            <div class="timeline-task-desc">Setup + NFT Collection (110)</div>
                        </div>
                        <div class="timeline-task">
                            <div class="timeline-task-weeks">Weeks 3-4:</div>
                            <div class="timeline-task-desc">Core PvE Gameplay</div>
                        </div>
                        <div class="timeline-task">
                            <div class="timeline-task-weeks">Weeks 5-10:</div>
                            <div class="timeline-task-desc">Integration + Testing</div>
                        </div>
                    </div>
                </div>

                <div class="timeline-phase">
                    <div class="timeline-phase-header">
                        <div class="timeline-phase-title">⚔️ PHASE 2 - PvP AND ECONOMY</div>
                        <div class="timeline-phase-duration">6-8 weeks</div>
                    </div>
                    <div class="timeline-phase-tasks">
                        <div class="timeline-task">
                            <div class="timeline-task-weeks">Weeks 11-12:</div>
                            <div class="timeline-task-desc">PvP System</div>
                        </div>
                        <div class="timeline-task">
                            <div class="timeline-task-weeks">Weeks 13-14:</div>
                            <div class="timeline-task-desc">Token Economy</div>
                        </div>
                        <div class="timeline-task">
                            <div class="timeline-task-weeks">Weeks 15-18:</div>
                            <div class="timeline-task-desc">Crew System</div>
                        </div>
                    </div>
                </div>

                <div class="timeline-phase">
                    <div class="timeline-phase-header">
                        <div class="timeline-phase-title">🌟 PHASE 3 - EXPANSION</div>
                        <div class="timeline-phase-duration">8-10 weeks</div>
                    </div>
                    <div class="timeline-phase-tasks">
                        <div class="timeline-task">
                            <div class="timeline-task-weeks">Weeks 19-20:</div>
                            <div class="timeline-task-desc">New Content</div>
                        </div>
                        <div class="timeline-task">
                            <div class="timeline-task-weeks">Weeks 21-22:</div>
                            <div class="timeline-task-desc">Social Features</div>
                        </div>
                        <div class="timeline-task">
                            <div class="timeline-task-weeks">Weeks 23-28:</div>
                            <div class="timeline-task-desc">Mainnet Preparation</div>
                        </div>
                    </div>
                </div>

                <div class="timeline-phase">
                    <div class="timeline-phase-header">
                        <div class="timeline-phase-title">🎯 PHASE 4 - MAINNET</div>
                        <div class="timeline-phase-duration">6-8 weeks</div>
                    </div>
                    <div class="timeline-phase-tasks">
                        <div class="timeline-task">
                            <div class="timeline-task-weeks">Weeks 29-30:</div>
                            <div class="timeline-task-desc">Mainnet Deploy</div>
                        </div>
                        <div class="timeline-task">
                            <div class="timeline-task-weeks">Weeks 31-32:</div>
                            <div class="timeline-task-desc">Official Launch</div>
                        </div>
                        <div class="timeline-task">
                            <div class="timeline-task-weeks">Weeks 33-36:</div>
                            <div class="timeline-task-desc">Post-Launch</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Current Phase Highlight -->
        <div class="card" style="margin-bottom: 30px; border: 2px solid var(--accent); background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(78, 205, 196, 0.1));">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <div style="font-size: 2rem;">🚀</div>
                <div>
                    <h3 style="margin: 0; color: var(--accent); font-family: var(--font-primary);">CURRENT PHASE</h3>
                    <p style="margin: 5px 0 0 0; color: var(--text-secondary);">Phase 1: MVP Core - Weeks 3-4</p>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="text-align: center; padding: 15px; background: rgba(0, 212, 255, 0.05); border-radius: 8px;">
                    <div style="font-size: 1.5rem; color: var(--success); margin-bottom: 5px;">✅</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">Setup Complete</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(0, 212, 255, 0.05); border-radius: 8px;">
                    <div style="font-size: 1.5rem; color: var(--accent); margin-bottom: 5px;">🔄</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">NFT System</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(0, 212, 255, 0.05); border-radius: 8px;">
                    <div style="font-size: 1.5rem; color: var(--muted); margin-bottom: 5px;">⏳</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">Core Gameplay</div>
                </div>
            </div>
        </div>

        <!-- Detailed Phases -->
        <div class="roadmap-phases">
            <!-- Phase 1 -->
            <div class="phase-card">
                <div class="phase-header">
                    <h3 class="phase-title">🚀 PHASE 1: MVP CORE</h3>
                    <div class="phase-duration">8-10 weeks</div>
                </div>
                <p class="phase-objective">
                    <strong>Objective:</strong> Functional game with basic mechanics and NFT integration
                </p>
                <div class="phase-tasks">
                    <div class="task-group">
                        <div class="task-group-title">Weeks 1-2: Preparation and Setup</div>
                        <div class="task-list">
                            <div class="task-item">
                                <div class="task-status completed">✅</div>
                                <span>Folder structure and initial configuration</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status completed">✅</div>
                                <span>Development environment setup</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status completed">✅</div>
                                <span>IPFS configuration (Filebase)</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status completed">✅</div>
                                <span>110 sprites preparation for devnet</span>
                            </div>
                        </div>
                    </div>
                    <div class="task-group">
                        <div class="task-group-title">Weeks 3-4: NFT System</div>
                        <div class="task-list">
                            <div class="task-item">
                                <div class="task-status in-progress">🔄</div>
                                <span>NFT collection creation (110 units)</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Solana Devnet deployment</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Phantom Wallet integration</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Ownership validation system</span>
                            </div>
                        </div>
                    </div>
                    <div class="task-group">
                        <div class="task-group-title">Weeks 5-10: Core Gameplay and Integration</div>
                        <div class="task-list">
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Navigation and control system</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Procedural map generation</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Resource system (fuel, oxygen, shield)</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Basic mining mechanics</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Phase 2 -->
            <div class="phase-card">
                <div class="phase-header">
                    <h3 class="phase-title">⚔️ PHASE 2: PvP AND ECONOMY</h3>
                    <div class="phase-duration">6-8 weeks</div>
                </div>
                <p class="phase-objective">
                    <strong>Objective:</strong> Competitive system with token economy
                </p>
                <div class="phase-tasks">
                    <div class="task-group">
                        <div class="task-group-title">Weeks 11-12: PvP System</div>
                        <div class="task-list">
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Player vs player combat mechanics</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Special resource system (PvP only)</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Basic matchmaking</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Reward system</span>
                            </div>
                        </div>
                    </div>
                    <div class="task-group">
                        <div class="task-group-title">Weeks 13-14: Token Economy</div>
                        <div class="task-list">
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>In-game token (SPACE)</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>SOL conversion system</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Basic marketplace</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Royalty system</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Phase 3 -->
            <div class="phase-card">
                <div class="phase-header">
                    <h3 class="phase-title">🌟 PHASE 3: EXPANSION</h3>
                    <div class="phase-duration">8-10 weeks</div>
                </div>
                <p class="phase-objective">
                    <strong>Objective:</strong> Additional content and social features
                </p>
                <div class="phase-tasks">
                    <div class="task-group">
                        <div class="task-group-title">Weeks 19-20: New Content</div>
                        <div class="task-list">
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>New planet types</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Mission/quest system</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Seasonal events</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Achievement system</span>
                            </div>
                        </div>
                    </div>
                    <div class="task-group">
                        <div class="task-group-title">Weeks 21-22: Social Features</div>
                        <div class="task-list">
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Guild/clan system</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>In-game chat</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Friend system</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Global leaderboards</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Phase 4 -->
            <div class="phase-card">
                <div class="phase-header">
                    <h3 class="phase-title">🎯 PHASE 4: MAINNET</h3>
                    <div class="phase-duration">6-8 weeks</div>
                </div>
                <p class="phase-objective">
                    <strong>Objective:</strong> Official launch and optimizations
                </p>
                <div class="phase-tasks">
                    <div class="task-group">
                        <div class="task-group-title">Weeks 29-30: Mainnet Deploy</div>
                        <div class="task-list">
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>3,777 NFT collection creation</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Solana Mainnet deployment</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Production configuration</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Final testing</span>
                            </div>
                        </div>
                    </div>
                    <div class="task-group">
                        <div class="task-group-title">Weeks 31-32: Launch</div>
                        <div class="task-list">
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Marketing campaign</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Launch event</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>User support</span>
                            </div>
                            <div class="task-item">
                                <div class="task-status pending">⏳</div>
                                <span>Metrics monitoring</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Success Metrics -->
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">99.5%</div>
                <div class="metric-label">Uptime Target</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">&lt; 10s</div>
                <div class="metric-label">Loading Time</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">1,000+</div>
                <div class="metric-label">Daily Active Users</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">3,777</div>
                <div class="metric-label">NFTs Mainnet</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">$50K+</div>
                <div class="metric-label">Monthly Revenue</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">5K+</div>
                <div class="metric-label">Community Size</div>
            </div>
        </div>
    </div>
</div>`;

        const roadmapTabContainer = document.getElementById('roadmap-tab-container');
        console.log('🔍 Roadmap container found:', !!roadmapTabContainer);

        if (roadmapTabContainer) {
            console.log('📝 Setting roadmap HTML content...');
            roadmapTabContainer.innerHTML = roadmapHTML;
            console.log('✅ Roadmap tab component loaded successfully');
            console.log('📊 Roadmap content length:', roadmapHTML.length);

            // Force display immediately
            roadmapTabContainer.style.display = 'block';
            console.log('🔧 Roadmap container forced visible');

            // Also force the content visible
            setTimeout(() => {
                const roadmapContent = document.getElementById('roadmap-content');
                if (roadmapContent) {
                    roadmapContent.style.display = 'block';
                    console.log('✅ Roadmap content forced visible');
                } else {
                    console.error('❌ Roadmap content element not found after loading!');
                }
            }, 50);
        } else {
            console.error('❌ Roadmap tab container not found!');
        }
    } catch (error) {
        console.error('❌ Error loading roadmap tab component:', error);
    }
}

// Load config tab component dynamically
async function loadConfigTabComponent() {
    try {
        const configHTML = `
<!-- Config tab content -->
<div class="tab-content" id="config-content">
    <div class="layout">
        <aside class="card profile">
            <div class="avatar" id="nftAvatar">
                <img id="avatarImg" src="/assets/icones/astronauta.png" alt="avatar">
            </div>
            <div class="ship-preview" id="shipPreview">
                <div class="ship-label">🚀 Ship</div>
                <img id="shipImg" src="/assets/images/idle.png" alt="ship" class="ship-image">
                <div id="shipName" class="ship-name">Nave Padrão</div>
                <div class="ship-stats" id="shipStats">
                    <div class="stats-title" id="statsTitle">Nave Padrão</div>
                    <div class="stats-attributes" id="statsAttributes">
                        <!-- Attributes will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        </aside>

        <main class="card">
            <h2>⚙️ Configuration</h2>
            <div class="field">
                <label>SpaceShipOnSol</label>
                <div class="small">Space Crypto Miner</div>
            </div>
            <div class="field">
                <label>Player name</label>
                <input id="playerName" placeholder="Type your name (ex: Pilot123)">
            </div>
            <div class="field">
                <label>Wallet</label>
                <div id="walletAddr" class="small">No wallet connected</div>
            </div>
            <div class="field">
                <label>NFT Status</label>
                <div id="nftStatus" class="small">No NFT detected</div>
            </div>
            <div class="field">
                <label>Login Status</label>
                <div id="loginStatusText" class="small">Not logged in</div>
            </div>
            <div class="field" id="googleInfoField" style="display:none;">
                <label>Google Account</label>
                <div id="googleInfo" class="small">
                    <div id="googleName" class="google-name"></div>
                    <div id="googleEmail" class="google-email"></div>
                </div>
            </div>

            <!-- Wallet Connection Section -->
            <div class="field" id="walletSection">
                <label>Web3 Wallet</label>
                <div id="walletStatus" class="small">Not connected</div>
                <button id="connectWalletBtn" class="btn" style="margin-top:8px;">👻 Connect Phantom Wallet</button>
            </div>

            <!-- Google Connection Section -->
            <div class="field" id="googleSection">
                <label>Google Account</label>
                <div id="googleStatus" class="small">Not connected</div>
                <button id="connectGoogleBtn" class="btn" style="margin-top:8px;">🔍 Connect Google Account</button>
            </div>

            <div style="margin-top:20px;display:flex;gap:12px;">
                <button id="saveBtn" class="btn">💾 Save</button>
                <button id="disconnectWalletBtn" class="btn ghost" style="display:none;">🔌 Disconnect Wallet</button>
                <button id="disconnectGoogleBtn" class="btn ghost" style="display:none;">🚪 Logout Google</button>
            </div>
        </main>
    </div>
</div>`;

        const configTabContainer = document.getElementById('config-tab-container');
        if (configTabContainer) {
            configTabContainer.innerHTML = configHTML;
            console.log('✅ Config tab component loaded successfully');
        }
    } catch (error) {
        console.error('❌ Error loading config tab component:', error);
    }
}

// Load config tab component immediately
loadConfigTabComponent();

// Load components immediately after basic setup
loadHeaderComponent();
loadProfileTabComponent();
loadRoadmapTabComponent();
loadConfigTabComponent();

// Also run when DOM is ready (in case elements weren't ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM ready, reinitializing tabs...');
        setTimeout(initTabsNow, 100);
    });
}

// Criar partículas flutuantes
function createFloatingParticles() {
    const container = document.getElementById('particles');

    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const size = Math.random() * 4 + 1;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 10 + 10;

        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = left + '%';
        particle.style.animationDuration = animationDuration + 's';
        particle.style.animationDelay = Math.random() * 2 + 's';

        container.appendChild(particle);

        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, (animationDuration + 2) * 1000);
    }

    // Create particles periodically
    setInterval(createParticle, 2000);

    // Create initial particles
    for (let i = 0; i < 5; i++) {
        setTimeout(createParticle, i * 400);
    }
}

// Supabase configuration - use centralized config if available
const supabaseConfig = window.appConfig ? window.appConfig.getSupabaseConfig() : {
    url: "https://cjrbhqlwfjebnjoyfjnc.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcmJocWx3ZmplYm5qb3lmam5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDIwNTMsImV4cCI6MjA3NTI3ODA1M30.X4uaKnfrmHYYSkVXz1qWYF0wmy-bkjHgbvonubYUTA4"
};

// Initialize Supabase
console.log('Initializing Supabase...');
console.log('Supabase available:', !!window.supabase);
console.log('Supabase config:', supabaseConfig);

let supabase = null;
if (window.supabase) {
    try {
        supabase = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
        console.log('Supabase initialized successfully');
        console.log('Supabase client:', supabase);
    } catch (error) {
        console.error('Error initializing Supabase:', error);
    }
} else {
    console.log('Supabase not available, continuing without auth');
}

// Check initial session on page load
async function checkInitialSession() {
    console.log('🔍 Starting checkInitialSession...');
    console.log('DOM ready state:', document.readyState);
    console.log('Supabase available:', !!supabase);

    // First, try to restore wallet connection from localStorage
    try {
        const savedWalletAddress = localStorage.getItem('walletAddress');
        if (savedWalletAddress) {
            console.log('Restoring wallet from localStorage:', savedWalletAddress);
            walletAddress = savedWalletAddress;
            isWalletConnected = true;

            // Update wallet UI
            if (walletAddrEl) {
                walletAddrEl.textContent = walletAddress.substring(0, 8) + '...' + walletAddress.substring(walletAddress.length - 8);
            }
        }
    } catch (error) {
        console.error('Error restoring wallet from localStorage:', error);
    }

    if (supabase && supabase.auth) {
        try {
            console.log('Checking initial session...');
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error getting session:', error);
                return;
            }

            if (session) {
                console.log('✅ Initial session found:', session);
                console.log('Session user:', session.user);
                currentUser = session.user;
                isGoogleLoggedIn = true;

                console.log('Current user set:', {
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    userMetadata: currentUser.user_metadata
                });

                // Load user profile
                console.log('Loading user profile...');
                const profile = await createOrUpdateUserProfile(
                    currentUser.email,
                    walletAddress,
                    currentUser.user_metadata?.full_name || currentUser.displayName
                );

                if (profile) {
                    console.log('✅ Initial profile loaded:', profile);
                    userProfile = profile;

                    // If profile has wallet address, restore wallet connection
                    if (profile.wallet_address && !walletAddress) {
                        console.log('Restoring wallet connection from profile:', profile.wallet_address);
                        walletAddress = profile.wallet_address;
                        isWalletConnected = true;

                        // Update wallet UI
                        if (walletAddrEl) {
                            walletAddrEl.textContent = walletAddress.substring(0, 8) + '...' + walletAddress.substring(walletAddress.length - 8);
                        }
                    }
                } else {
                    console.log('❌ No profile loaded');
                }

                // Update UI
                console.log('🔄 Updating dual login UI...');
                updateDualLoginUI();

                // Show main content
                console.log('🔍 Looking for main content elements...');
                const mainContent = document.querySelector('.wrap');
                console.log('Main content element (.wrap):', mainContent);
                if (mainContent) {
                    mainContent.style.display = 'block';
                    console.log('✅ Main content displayed');
                } else {
                    console.error('❌ Main content element (.wrap) not found!');
                }

                // Ativar aba profile após restaurar sessão
                console.log('🔧 Activating profile tab after session restore...');
                setTimeout(() => {
                    if (typeof switchTab === 'function') {
                        switchTab('profile');
                        console.log('✅ Profile tab activated after session restore');
                    } else {
                        console.error('❌ switchTab function not available');
                    }
                }, 100);

                // Also show the main container
                const mainContainer = document.querySelector('.main-container');
                console.log('Main container element (.main-container):', mainContainer);
                if (mainContainer) {
                    mainContainer.style.display = 'block';
                    console.log('✅ Main container displayed');
                } else {
                    console.log('ℹ️ Main container (.main-container) not found (this is normal)');
                }

                // Try to show the entire body content
                const body = document.body;
                console.log('Body element:', body);
                if (body) {
                    body.style.display = 'block';
                    console.log('✅ Body displayed');
                }

                console.log('✅ Initial session restored successfully');

                // Profile tab will be activated by the setTimeout above
            } else {
                console.log('No initial session found');
                // Show login overlay if no session
                showLoginOverlay();
            }
        } catch (error) {
            console.error('Error checking initial session:', error);
            // Show login overlay on error
            showLoginOverlay();
        }
    } else {
        console.log('Supabase not available, showing login overlay');
        showLoginOverlay();
    }
}

// Basic UI wiring
const loginBtn = document.getElementById('loginBtn');
const playerNameInput = document.getElementById('playerName');
const walletAddrEl = document.getElementById('walletAddr');
const nftStatusEl = document.getElementById('nftStatus');
const avatarImg = document.getElementById('avatarImg');
const saveBtn = document.getElementById('saveBtn');
const playBtn = document.getElementById('playBtn');
const loginStatus = document.getElementById('loginStatus');

// New dual login elements
const connectWalletBtn = document.getElementById('connectWalletBtn');
const connectGoogleBtn = document.getElementById('connectGoogleBtn');
const disconnectWalletBtn = document.getElementById('disconnectWalletBtn');
const disconnectGoogleBtn = document.getElementById('disconnectGoogleBtn');
const walletStatus = document.getElementById('walletStatus');
const googleStatus = document.getElementById('googleStatus');

// Login state tracking
let isGoogleLoggedIn = false;
let isWalletConnected = false;
let walletAddress = null;
const loginStatusText = document.getElementById('loginStatusText');
const googleInfoField = document.getElementById('googleInfoField');
const googleName = document.getElementById('googleName');
const googleEmail = document.getElementById('googleEmail');

// Load saved name
try {
    const saved = localStorage.getItem('playerName');
    if (saved) playerNameInput.value = saved;
} catch(e){}

// Supabase Auth functions
let currentUser = null;
let userProfile = null;

// User Profile Management Functions
async function createOrUpdateUserProfile(googleEmail = null, walletAddress = null, displayName = null) {
    try {
        console.log('Creating/updating user profile:', {
            googleEmail,
            walletAddress,
            displayName,
            currentUserEmail: currentUser?.email,
            hasCurrentUser: !!currentUser
        });

        if (!supabase) {
            console.error('Supabase not available');
            return null;
        }

        // Check if profile already exists with this email or wallet
        let existingProfile = null;

        // First, try to find by email if provided
        if (googleEmail) {
            const { data: emailProfile, error: emailError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('google_email', googleEmail)
                .single();

            if (emailProfile && !emailError) {
                existingProfile = emailProfile;
                console.log('Found existing profile by email:', existingProfile);
            }
        }

        // If not found by email, try to find by wallet address if provided
        if (!existingProfile && walletAddress) {
            const { data: walletProfile, error: walletError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('wallet_address', walletAddress)
                .single();

            if (walletProfile && !walletError) {
                existingProfile = walletProfile;
                console.log('Found existing profile by wallet:', existingProfile);
            }
        }

        // If still not found, try to find by current user's email (if available)
        if (!existingProfile && currentUser && currentUser.email) {
            const { data: currentUserProfile, error: currentUserError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('google_email', currentUser.email)
                .single();

            if (currentUserProfile && !currentUserError) {
                existingProfile = currentUserProfile;
                console.log('Found existing profile by current user email:', existingProfile);
            }
        }

        if (existingProfile) {
            // Update existing profile
            const updateData = {};
            if (googleEmail && !existingProfile.google_email) {
                updateData.google_email = googleEmail;
            }
            if (walletAddress && !existingProfile.wallet_address) {
                updateData.wallet_address = walletAddress;
            }
            if (displayName && !existingProfile.display_name) {
                updateData.display_name = displayName;
            }
            updateData.updated_at = new Date().toISOString();

            const { data: updatedProfile, error: updateError } = await supabase
                .from('user_profiles')
                .update(updateData)
                .eq('id', existingProfile.id)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating profile:', updateError);
                return null;
            }

            userProfile = updatedProfile;
            console.log('Profile updated:', userProfile);
            return userProfile;
        } else {
            // Create new profile
            const profileData = {
                google_email: googleEmail,
                wallet_address: walletAddress,
                display_name: displayName || 'Space Pilot',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .insert(profileData)
                .select()
                .single();

            if (createError) {
                console.error('Error creating profile:', createError);
                return null;
            }

            userProfile = newProfile;
            console.log('Profile created:', userProfile);
            return userProfile;
        }
    } catch (error) {
        console.error('Error in createOrUpdateUserProfile:', error);
        return null;
    }
}

async function getUserProfile(googleEmail = null, walletAddress = null) {
    try {
        if (!supabase) return null;

        let query = supabase.from('user_profiles').select('*');

        if (googleEmail) {
            query = query.eq('google_email', googleEmail);
        } else if (walletAddress) {
            query = query.eq('wallet_address', walletAddress);
        } else {
            return null;
        }

        const { data, error } = await query.single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error fetching profile:', error);
            return null;
        }

        userProfile = data;
        return data;
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        return null;
    }
}

async function validateAccountLinking(googleEmail, walletAddress) {
    try {
        if (!supabase) return { valid: true };

        // Check if this email is already linked to another wallet
        const { data: emailProfile, error: emailError } = await supabase
            .from('user_profiles')
            .select('wallet_address')
            .eq('google_email', googleEmail)
            .single();

        if (emailProfile && emailProfile.wallet_address && emailProfile.wallet_address !== walletAddress) {
            return {
                valid: false,
                error: 'Este email já está vinculado a outra carteira'
            };
        }

        // Check if this wallet is already linked to another email
        const { data: walletProfile, error: walletError } = await supabase
            .from('user_profiles')
            .select('google_email')
            .eq('wallet_address', walletAddress)
            .single();

        if (walletProfile && walletProfile.google_email && walletProfile.google_email !== googleEmail) {
            return {
                valid: false,
                error: 'Esta carteira já está vinculada a outro email'
            };
        }

        return { valid: true };
    } catch (error) {
        console.error('Error in validateAccountLinking:', error);
        return { valid: true }; // Allow on error to not block user
    }
}

// Login with Google using Supabase
async function loginWithGoogle() {
    try {
        console.log('Starting Google login...');

        // Update button text if it exists
        if (loginBtn) {
            loginBtn.textContent = 'Logging in...';
            loginBtn.disabled = true;
        }

        // Use centralized configuration for redirect URL
        const redirectUrl = window.appConfig ? window.appConfig.getRedirectUrl() : window.location.origin;
        
        console.log('OAuth redirect URL:', redirectUrl);
        console.log('Environment info:', window.appConfig ? window.appConfig.getEnvironmentInfo() : 'Config not available');
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl
            }
        });

        if (error) {
            console.error('Login error:', error);
            alert('Erro no login: ' + error.message);
            updateLoginUI(false);
        } else {
            console.log('Login initiated:', data);
        }

    } catch (error) {
        console.error('Login error:', error);
        alert('Erro no login: ' + error.message);
        updateLoginUI(false);
    } finally {
        if (loginBtn) {
            loginBtn.textContent = 'LOGIN';
            loginBtn.disabled = false;
        }
    }
}

// Logout
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
            return;
        }
        currentUser = null;
        updateLoginUI(false);
        console.log('Logout successful');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Update login UI
function updateLoginUI(isLoggedIn) {
    if (isLoggedIn && currentUser) {
        // Hide login button and show play button
        loginBtn.style.display = 'none';
        playBtn.style.display = 'block';

        // Update login status text
        loginStatusText.textContent = '✅ Logged in with Google';
        loginStatusText.style.color = 'var(--success)';

        // Show logout button
        logoutBtn.style.display = 'block';

        // Show Google account info
        googleInfoField.style.display = 'block';
        googleName.textContent = currentUser.displayName || 'Google User';
        googleEmail.textContent = currentUser.email || '';

        // Update player name if empty
        if (!playerNameInput.value.trim()) {
            playerNameInput.value = currentUser.displayName || 'Pilot';
        }

    } else {
        // Show login button and hide play button
        loginBtn.style.display = 'block';
        playBtn.style.display = 'none';

        // Update login status text
        loginStatusText.textContent = '❌ Not logged in';
        loginStatusText.style.color = 'var(--muted)';

        // Hide logout button
        logoutBtn.style.display = 'none';

        // Hide Google account info
        googleInfoField.style.display = 'none';
    }
}

// Supabase auth state listener
if (supabase && supabase.auth) {
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session);
        currentUser = session?.user || null;
        isGoogleLoggedIn = !!currentUser;

        if (currentUser) {
            console.log('User logged in:', currentUser);

            // Create or update user profile with Google info
            const profile = await createOrUpdateUserProfile(
                currentUser.email,
                walletAddress,
                currentUser.user_metadata?.full_name || currentUser.displayName
            );

            if (profile) {
                console.log('User profile loaded:', profile);
                userProfile = profile;
            }

            // Update Google account info
            if (googleName) googleName.textContent = currentUser.user_metadata?.full_name || 'Google User';
            if (googleEmail) googleEmail.textContent = currentUser.email || 'No email';

            // Update player name if empty
            if (playerNameInput && !playerNameInput.value.trim()) {
                playerNameInput.value = currentUser.user_metadata?.full_name || 'Pilot';
            }
        } else {
            console.log('User logged out');
            userProfile = null;
        }

        updateDualLoginUI();
    });
} else {
    console.log('Supabase auth not available, skipping auth listener');
}

// Login overlay functions
function showLoginOverlay() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) {
        overlay.classList.add('show');
        console.log('Login overlay shown');
    }
}

function hideLoginOverlay() {
    const overlay = document.getElementById('login-overlay');
    console.log('hideLoginOverlay called, overlay element:', overlay);
    if (overlay) {
        overlay.classList.remove('show');
        overlay.style.display = 'none';
        console.log('✅ Login overlay hidden and display set to none');
    } else {
        console.error('❌ Login overlay element not found!');
    }
}

// Login with Solana (Phantom Wallet)
async function loginWithSolana() {
    try {
        console.log('Starting Solana login...');
        await connectPhantomWithSupabase();
        // After connecting wallet, we can consider user "logged in"
        hideLoginOverlay();
        updateDualLoginUI();
        console.log('Solana login completed successfully');
    } catch (error) {
        console.error('Solana login error:', error);
        alert('Erro ao conectar carteira: ' + error.message);
    }
}

// Connect wallet from config
async function connectWalletFromConfig() {
    try {
        connectWalletBtn.textContent = 'Connecting...';
        connectWalletBtn.disabled = true;

        await connectPhantomWithSupabase();

        // After successful wallet connection, update profile
        if (walletAddress && currentUser) {
            const validation = await validateAccountLinking(currentUser.email, walletAddress);
            if (!validation.valid) {
                alert(validation.error);
                return;
            }

            const profile = await createOrUpdateUserProfile(
                currentUser.email,
                walletAddress,
                currentUser.user_metadata?.full_name || currentUser.displayName
            );

            if (profile) {
                console.log('Profile updated with wallet:', profile);
            }
        }

        updateDualLoginUI();

    } catch (error) {
        console.error('Wallet connection error:', error);
        alert('Erro ao conectar carteira: ' + error.message);
    } finally {
        connectWalletBtn.textContent = '👻 Connect Phantom Wallet';
        connectWalletBtn.disabled = false;
    }
}

// Connect Phantom with Supabase Web3 Auth
async function connectPhantomWithSupabase() {
    console.log('Checking Phantom availability...');
    if (!(window && window.solana && window.solana.isPhantom)) {
        console.log('Phantom not available');
        alert('Instale Phantom ou abra o site num navegador com a extensão Phantom');
        return;
    }

    try {
        console.log('Connecting to Phantom...');
        // First connect to the wallet
        const resp = await window.solana.connect();
        const pub = resp.publicKey ? resp.publicKey.toString() : (window.solana.publicKey && window.solana.publicKey.toString());

        console.log('Connected to Phantom:', pub);

        // Now authenticate with Supabase using Web3
        if (supabase && supabase.auth) {
            console.log('Authenticating with Supabase Web3...');
            const { data, error } = await supabase.auth.signInWithWeb3({
                chain: 'solana',
                statement: 'I accept the Space Crypto Miner Terms of Service at https://spacecryptominer.com/tos'
            });

            if (error) {
                console.error('Supabase Web3 auth error:', error);
                alert('Erro na autenticação: ' + error.message);
                return;
            }

            console.log('Supabase Web3 auth successful:', data);
        } else {
            console.log('Supabase not available, using local wallet connection');
        }

        // Update dual login state
        walletAddress = pub;
        isWalletConnected = true;

        // Save wallet address to localStorage
        try {
            localStorage.setItem('walletAddress', pub);
            console.log('Wallet address saved to localStorage');
        } catch (error) {
            console.error('Error saving wallet to localStorage:', error);
        }

        // Create or update user profile with wallet
        const profile = await createOrUpdateUserProfile(
            currentUser?.email || null,
            pub,
            currentUser?.user_metadata?.full_name || currentUser?.displayName || null
        );

        if (profile) {
            console.log('User profile updated with wallet:', profile);
        }

        // Update UI
        if (walletAddrEl) {
            walletAddrEl.textContent = pub.substring(0, 8) + '...' + pub.substring(pub.length - 8);
        }

        // try to find NFT image and metadata (devnet by default)
        if (nftStatusEl) {
            nftStatusEl.textContent = 'Searching NFT...';
            const { findFirstNftImageForOwner, findFirstNftMetadataForOwner } = await import('/src/solana_nft.js');
            const [imageUrl, nftMetadata] = await Promise.all([
                findFirstNftImageForOwner(pub, { network: 'devnet' }),
                findFirstNftMetadataForOwner(pub, { network: 'devnet' })
            ]);

            if (imageUrl) {
                nftStatusEl.textContent = '✅ NFT found';
                nftStatusEl.style.color = 'var(--success)';
                if (avatarImg) avatarImg.src = imageUrl;

                // Update ship image and name
                const shipImg = document.getElementById('shipImg');
                const shipName = document.getElementById('shipName');

                if (shipImg) {
                    shipImg.src = imageUrl;
                    // Remove all rarity classes first
                    shipImg.classList.remove('rarity-comum', 'rarity-incomum', 'rarity-raro', 'rarity-epico', 'rarity-lendario');
                }

                if (shipName && nftMetadata && nftMetadata.name) {
                    shipName.textContent = nftMetadata.name;
                    // Apply rarity color if available
                    if (nftMetadata.attributes) {
                        const rarity = nftMetadata.attributes.find(attr =>
                            attr.trait_type === 'Raridade' || attr.trait_type === 'raridade'
                        );
                        if (rarity) {
                            const rarityValue = rarity.value.toLowerCase();
                            shipName.style.color = getRarityColor(rarityValue);

                            // Apply rarity class to ship image
                            if (shipImg) {
                                shipImg.classList.add(`rarity-${rarityValue}`);
                            }
                        }
                    }
                }

                // Update stats with NFT data
                updateShipStats(nftMetadata);
            } else {
                nftStatusEl.textContent = '❌ No NFT found';
                nftStatusEl.style.color = 'var(--muted)';

                // Reset ship to default
                const shipImg = document.getElementById('shipImg');
                const shipName = document.getElementById('shipName');

                if (shipImg) {
                    shipImg.src = '/assets/images/idle.png';
                    shipImg.classList.remove('rarity-comum', 'rarity-incomum', 'rarity-raro', 'rarity-epico', 'rarity-lendario');
                    shipImg.classList.add('rarity-comum');
                }

                if (shipName) {
                    shipName.textContent = 'Nave Padrão';
                    shipName.style.color = '#CCCCCC';
                }

                // Reset stats to default
                updateShipStats(null);
            }
        }

        window.__GAME_CONFIG__ = {
            playerName: playerNameInput.value || 'Pilot',
            walletAddress: pub,
            nftImage: imageUrl || null
        };

    } catch(e) {
        console.error('connect error', e);
        alert('Failed to connect Phantom');
        throw e;
    }
}

// Connect Google from config
async function connectGoogleFromConfig() {
    try {
        connectGoogleBtn.textContent = 'Connecting...';
        connectGoogleBtn.disabled = true;

        await loginWithGoogle();

        // After successful Google login, update profile
        if (currentUser && walletAddress) {
            const validation = await validateAccountLinking(currentUser.email, walletAddress);
            if (!validation.valid) {
                alert(validation.error);
                return;
            }

            const profile = await createOrUpdateUserProfile(
                currentUser.email,
                walletAddress,
                currentUser.user_metadata?.full_name || currentUser.displayName
            );

            if (profile) {
                console.log('Profile updated with Google:', profile);
            }
        }

        updateDualLoginUI();

    } catch (error) {
        console.error('Google connection error:', error);
        alert('Erro ao conectar Google: ' + error.message);
    } finally {
        connectGoogleBtn.textContent = '🔍 Connect Google Account';
        connectGoogleBtn.disabled = false;
    }
}

// Disconnect wallet
async function disconnectWallet() {
    try {
        if (window && window.solana && window.solana.isPhantom) {
            await window.solana.disconnect();
        }
        isWalletConnected = false;
        walletAddress = null;

        // Clear wallet from localStorage
        try {
            localStorage.removeItem('walletAddress');
            console.log('Wallet address removed from localStorage');
        } catch (error) {
            console.error('Error removing wallet from localStorage:', error);
        }

        // Clear wallet UI
        if (walletAddrEl) {
            walletAddrEl.textContent = 'No wallet connected';
        }
        if (nftStatusEl) {
            nftStatusEl.textContent = 'No NFT detected';
            nftStatusEl.style.color = 'var(--muted)';
        }

        // Reset avatar and ship to default
        if (avatarImg) {
            avatarImg.src = '/assets/icones/astronauta.png';
        }

        const shipImg = document.getElementById('shipImg');
        const shipName = document.getElementById('shipName');

        if (shipImg) {
            shipImg.src = '/assets/images/idle.png';
            shipImg.classList.remove('rarity-comum', 'rarity-incomum', 'rarity-raro', 'rarity-epico', 'rarity-lendario');
            shipImg.classList.add('rarity-comum');
        }

        if (shipName) {
            shipName.textContent = 'Nave Padrão';
            shipName.style.color = '#CCCCCC';
        }

        // Reset ship stats
        updateShipStats(null);

        updateDualLoginUI();
        console.log('Wallet disconnected');
    } catch (error) {
        console.error('Wallet disconnect error:', error);
    }
}

// Disconnect Google
async function disconnectGoogle() {
    try {
        if (supabase && supabase.auth) {
            await supabase.auth.signOut();
        }
        isGoogleLoggedIn = false;
        currentUser = null;

        // Clear Google UI
        if (googleName) googleName.textContent = '';
        if (googleEmail) googleEmail.textContent = '';

        // Mostrar overlay de login após desconexão
        showLoginOverlay();

        // Redirecionar para a página inicial
        window.location.href = window.location.origin;

        updateDualLoginUI();
        console.log('Google disconnected');
    } catch (error) {
        console.error('Google disconnect error:', error);
    }
}

// Update dual login UI
function updateDualLoginUI() {
    console.log('updateDualLoginUI called with:', {
        isWalletConnected,
        walletAddress,
        isGoogleLoggedIn,
        currentUser: !!currentUser
    });

    // Update wallet status
    if (isWalletConnected && walletAddress) {
        if (walletStatus) {
            walletStatus.textContent = `Connected: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`;
            walletStatus.style.color = 'var(--success)';
        }
        if (connectWalletBtn) connectWalletBtn.style.display = 'none';
        if (disconnectWalletBtn) disconnectWalletBtn.style.display = 'inline-block';
    } else {
        if (walletStatus) {
            walletStatus.textContent = 'Not connected';
            walletStatus.style.color = 'var(--muted)';
        }
        if (connectWalletBtn) connectWalletBtn.style.display = 'inline-block';
        if (disconnectWalletBtn) disconnectWalletBtn.style.display = 'none';
    }

    // Update Google status
    if (isGoogleLoggedIn && currentUser) {
        if (googleStatus) {
            googleStatus.textContent = `Connected: ${currentUser.email}`;
            googleStatus.style.color = 'var(--success)';
        }
        if (connectGoogleBtn) connectGoogleBtn.style.display = 'none';
        if (disconnectGoogleBtn) disconnectGoogleBtn.style.display = 'inline-block';
    } else {
        if (googleStatus) {
            googleStatus.textContent = 'Not connected';
            googleStatus.style.color = 'var(--muted)';
        }
        if (connectGoogleBtn) connectGoogleBtn.style.display = 'inline-block';
        if (disconnectGoogleBtn) disconnectGoogleBtn.style.display = 'none';
    }

    // Check if user is completely disconnected
    const hasAnyLogin = isGoogleLoggedIn || isWalletConnected;
    console.log('hasAnyLogin:', hasAnyLogin);

    if (hasAnyLogin) {
        // User is logged in with at least one method
        console.log('User is logged in, showing main content');
        if (loginStatusText) {
            loginStatusText.textContent = '✅ Logged in';
            loginStatusText.style.color = 'var(--success)';
        }
        if (loginBtn) loginBtn.style.display = 'none';
        if (playBtn) playBtn.style.display = 'inline-block';

        // Hide login overlay
        console.log('Hiding login overlay...');
        hideLoginOverlay();

        // Show main content
        const mainContent = document.querySelector('.wrap');
        console.log('Main content in updateDualLoginUI:', mainContent);
        if (mainContent) {
            mainContent.style.display = 'block';
            console.log('Main content displayed in updateDualLoginUI');
        } else {
            console.error('Main content not found in updateDualLoginUI!');
        }

        // Ativar aba profile na updateDualLoginUI
        console.log('🔧 Activating profile tab in updateDualLoginUI...');
        setTimeout(() => {
            if (typeof switchTab === 'function') {
                switchTab('profile');
                console.log('✅ Profile tab activated in updateDualLoginUI');
            } else {
                console.error('❌ switchTab function not available in updateDualLoginUI');
            }
        }, 100);

        // Also ensure body is visible
        if (document.body) {
            document.body.style.display = 'block';
            console.log('Body made visible in updateDualLoginUI');
        }

        // Profile tab will be activated by the setTimeout above

    } else {
        // User is completely disconnected
        console.log('User is not logged in, showing login overlay');
        if (loginStatusText) {
            loginStatusText.textContent = 'Not logged in';
            loginStatusText.style.color = 'var(--muted)';
        }
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (playBtn) playBtn.style.display = 'none';

        // Show login overlay
        showLoginOverlay();

        // Hide main content
        const mainContent = document.querySelector('.wrap');
        if (mainContent) {
            mainContent.style.display = 'none';
        }

        console.log('User completely disconnected, showing login overlay');
    }
}

async function connectPhantom() {
    if (!(window && window.solana && window.solana.isPhantom)) {
        alert('Instale Phantom ou abra o site num navegador com a extensão Phantom');
        return;
    }

    try {
        const resp = await window.solana.connect();
        const pub = resp.publicKey ? resp.publicKey.toString() : (window.solana.publicKey && window.solana.publicKey.toString());

        // Update dual login state
        walletAddress = pub;
        isWalletConnected = true;

        // Update UI
        if (walletAddrEl) {
            walletAddrEl.textContent = pub.substring(0, 8) + '...' + pub.substring(pub.length - 8);
        }

        // try to find NFT image and metadata (devnet by default)
        nftStatusEl.textContent = 'Searching NFT...';
        const { findFirstNftImageForOwner, findFirstNftMetadataForOwner } = await import('/src/solana_nft.js');
        const [imageUrl, nftMetadata] = await Promise.all([
            findFirstNftImageForOwner(pub, { network: 'devnet' }),
            findFirstNftMetadataForOwner(pub, { network: 'devnet' })
        ]);

        if (imageUrl) {
            nftStatusEl.textContent = '✅ NFT found';
            nftStatusEl.style.color = 'var(--success)';
            avatarImg.src = imageUrl;

            // Update ship image and name
            const shipImg = document.getElementById('shipImg');
            const shipName = document.getElementById('shipName');

            if (shipImg) {
                shipImg.src = imageUrl;
                // Remove all rarity classes first
                shipImg.classList.remove('rarity-comum', 'rarity-incomum', 'rarity-raro', 'rarity-epico', 'rarity-lendario');
            }

            if (shipName && nftMetadata && nftMetadata.name) {
                shipName.textContent = nftMetadata.name;
                // Apply rarity color if available
                if (nftMetadata.attributes) {
                    const rarity = nftMetadata.attributes.find(attr =>
                        attr.trait_type === 'Raridade' || attr.trait_type === 'raridade'
                    );
                    if (rarity) {
                        const rarityColors = {
                            'Comum': '#CCCCCC',
                            'Incomum': '#00FF00',
                            'Raro': '#0080FF',
                            'Épico': '#A020F0',
                            'Lendário': '#FFD700'
                        };
                        shipName.style.color = rarityColors[rarity.value] || '#CCCCCC';

                        // Apply rarity class to ship image
                        if (shipImg) {
                            const rarityClass = `rarity-${rarity.value.toLowerCase()}`;
                            shipImg.classList.add(rarityClass);
                        }
                    }
                }
            }

            // Update stats with NFT data
            updateShipStats(nftMetadata);
        } else {
            nftStatusEl.textContent = '❌ No NFT found';
            nftStatusEl.style.color = 'var(--muted)';

            // Reset ship to default
            const shipImg = document.getElementById('shipImg');
            const shipName = document.getElementById('shipName');

            if (shipImg) {
                shipImg.src = '/assets/images/idle.png';
            }

            if (shipName) {
                shipName.textContent = 'Nave Padrão';
                shipName.style.color = '#CCCCCC';
            }
        }

        window.__GAME_CONFIG__ = {
            playerName: playerNameInput.value || 'Pilot',
            walletAddress: pub,
            nftImage: imageUrl || null
        };

        connectBtn.innerHTML = '<span class="status-indicator connected"></span>Connected';
        connectBtn.disabled = false;

    } catch(e) {
        console.error('connect error', e);
        alert('Failed to connect Phantom');
        connectBtn.textContent = 'Connect Phantom';
        connectBtn.disabled = false;
    }
}

// Ship stats functionality
let currentShipData = null;

function updateShipStats(shipData) {
    console.log('updateShipStats called with:', shipData);
    currentShipData = shipData;
    const statsTitle = document.getElementById('statsTitle');
    const statsAttributes = document.getElementById('statsAttributes');
    const statsRarity = document.getElementById('statsRarity');

    console.log('Stats elements found:', {
        statsTitle: !!statsTitle,
        statsAttributes: !!statsAttributes,
        statsRarity: !!statsRarity
    });

    if (!shipData) {
        console.log('Updating with default ship data');
        // Default ship data
        if (statsTitle) statsTitle.textContent = 'Nave Padrão';
        if (statsAttributes) statsAttributes.innerHTML = `
            <div class="stats-attr">
                <span class="stats-attr-label">Velocidade</span>
                <span class="stats-attr-value">100</span>
            </div>
            <div class="stats-attr">
                <span class="stats-attr-label">Carga</span>
                <span class="stats-attr-value">50 kg</span>
            </div>
            <div class="stats-attr">
                <span class="stats-attr-label">Combustível</span>
                <span class="stats-attr-value">100</span>
            </div>
            <div class="stats-attr">
                <span class="stats-attr-label">Oxigênio</span>
                <span class="stats-attr-value">100</span>
            </div>
            <div class="stats-attr">
                <span class="stats-attr-label">Escudo</span>
                <span class="stats-attr-value">100</span>
            </div>
            <div class="stats-attr">
                <span class="stats-attr-label">Tipo</span>
                <span class="stats-attr-value">Padrão</span>
            </div>
        `;
        if (statsRarity) {
            statsRarity.textContent = 'COMUM';
            statsRarity.className = 'stats-rarity rarity-comum';
        }
    } else {
        // NFT ship data
        if (statsTitle) statsTitle.textContent = shipData.name || 'NFT Ship';

        const attributes = shipData.attributes || [];
        const attrMap = {};
        attributes.forEach(attr => {
            attrMap[attr.trait_type.toLowerCase()] = attr.value;
        });

        if (statsAttributes) statsAttributes.innerHTML = `
            <div class="stats-attr">
                <span class="stats-attr-label">Velocidade</span>
                <span class="stats-attr-value">${attrMap.velocidade || 'N/A'}</span>
            </div>
            <div class="stats-attr">
                <span class="stats-attr-label">Carga</span>
                <span class="stats-attr-value">${attrMap.carga || 'N/A'} kg</span>
            </div>
            <div class="stats-attr">
                <span class="stats-attr-label">Combustível</span>
                <span class="stats-attr-value">${attrMap.combustível || 'N/A'}</span>
            </div>
            <div class="stats-attr">
                <span class="stats-attr-label">Oxigênio</span>
                <span class="stats-attr-value">${attrMap.oxigênio || 'N/A'}</span>
            </div>
            <div class="stats-attr">
                <span class="stats-attr-label">Escudo</span>
                <span class="stats-attr-value">${attrMap.escudo || 'N/A'}</span>
            </div>
            <div class="stats-attr">
                <span class="stats-attr-label">Modelo</span>
                <span class="stats-attr-value">${attrMap.modelo || 'N/A'}</span>
            </div>
        `;

        const rarity = attrMap.raridade || 'Comum';
        if (statsRarity) {
            statsRarity.textContent = rarity.toUpperCase();
            statsRarity.className = `stats-rarity rarity-${rarity.toLowerCase()}`;
        }
    }

    console.log('updateShipStats completed successfully');
}

// Initialize dual login UI
updateDualLoginUI();

// Check initial login states
function checkInitialLoginStates() {
    // Check if wallet is already connected
    if (window.solana && window.solana.isPhantom && window.solana.publicKey) {
        walletAddress = window.solana.publicKey.toString();
        isWalletConnected = true;
    }

    // Check if Google is already logged in (will be handled by Supabase listener)
    updateDualLoginUI();

    // If no login method is active, show overlay immediately
    if (!isGoogleLoggedIn && !isWalletConnected) {
        console.log('No login methods active, showing overlay');
        showLoginOverlay();
    }
}

// Run initial check
checkInitialLoginStates();

// Initialize ship stats
console.log('Initializing ship stats...');
updateShipStats(null);

// Apply default rarity class to ship image
const shipImg = document.getElementById('shipImg');
if (shipImg) {
    shipImg.classList.add('rarity-comum');
    console.log('Applied default rarity class to ship image');
} else {
    console.error('Ship image element not found!');
}

// Login and logout event listeners
loginBtn.addEventListener('click', loginWithGoogle);

// Dual login event listeners
if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', connectWalletFromConfig);
}
if (connectGoogleBtn) {
    connectGoogleBtn.addEventListener('click', connectGoogleFromConfig);
}
if (disconnectWalletBtn) {
    disconnectWalletBtn.addEventListener('click', disconnectWallet);
}
if (disconnectGoogleBtn) {
    disconnectGoogleBtn.addEventListener('click', disconnectGoogle);
}

// Wait for DOM to be fully loaded before registering overlay button events
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, registering overlay button events...');

    // Check initial session after a small delay to ensure all elements are ready
    setTimeout(() => {
        console.log('Checking initial session after DOM load...');
        checkInitialSession();
    }, 100);

    // Reinitialize tabs after DOM is loaded
    console.log('Reinitializing tabs after DOM load...');
    initTabsNow();

    // Try to register events immediately
    registerOverlayButtonEvents();

    // Also try after a short delay in case elements are added dynamically
    setTimeout(registerOverlayButtonEvents, 100);
    setTimeout(registerOverlayButtonEvents, 500);
});

function registerOverlayButtonEvents() {
    console.log('Attempting to register overlay button events...');

    // Login overlay event listeners
    const loginGoogleBtn = document.getElementById('loginGoogleBtn');
    const loginSolanaBtn = document.getElementById('loginSolanaBtn');

    console.log('Login overlay buttons:', { loginGoogleBtn, loginSolanaBtn });
    console.log('Button elements found:', {
        google: !!loginGoogleBtn,
        solana: !!loginSolanaBtn
    });

    if (loginGoogleBtn) {
        console.log('Registering Google login button event listener');
        // Remove any existing listeners first
        loginGoogleBtn.removeEventListener('click', handleGoogleClick);
        loginGoogleBtn.addEventListener('click', handleGoogleClick);
    } else {
        console.error('Google login button not found!');
    }

    if (loginSolanaBtn) {
        console.log('Registering Solana login button event listener');
        // Remove any existing listeners first
        loginSolanaBtn.removeEventListener('click', handleSolanaClick);
        loginSolanaBtn.addEventListener('click', handleSolanaClick);
    } else {
        console.error('Solana login button not found!');
    }
}

function handleGoogleClick(e) {
    console.log('Google button clicked!');
    e.preventDefault();
    e.stopPropagation();

    if (typeof loginWithGoogle === 'function') {
        console.log('Calling loginWithGoogle function...');
        loginWithGoogle();
    } else {
        console.error('loginWithGoogle function not found!');
        alert('Erro: Função de login Google não encontrada');
    }
}

function handleSolanaClick(e) {
    console.log('Solana button clicked!');
    e.preventDefault();
    e.stopPropagation();

    if (typeof loginWithSolana === 'function') {
        console.log('Calling loginWithSolana function...');
        loginWithSolana();
    } else {
        console.error('loginWithSolana function not found!');
        alert('Erro: Função de login Solana não encontrada');
    }
}

// Play button event listener
playBtn.addEventListener('click', () => {
    // Start the game
    const gameConfig = window.__GAME_CONFIG__ || {
        playerName: playerNameInput.value || 'Pilot',
        walletAddress: null,
        nftImage: null
    };

    // Show game container
    const gameLaunch = document.getElementById('game-launch');
    if (gameLaunch) {
        gameLaunch.style.display = 'block';
    }

    // Start Phaser game
    if (window.game) {
        window.game.destroy(true);
    }

    // Import and start game
    import('/src/main.js').then(() => {
        console.log('Game started successfully');
    }).catch(error => {
        console.error('Error starting game:', error);
    });
});

disconnectBtn.addEventListener('click', async () => {
    if (window && window.solana && window.solana.isPhantom) {
        try { await window.solana.disconnect(); } catch(e){}
    }

    walletAddrEl.textContent = 'No wallet connected';
    nftStatusEl.textContent = 'No NFT detected';
    nftStatusEl.style.color = 'var(--text-secondary)';
    avatarImg.src = '/assets/icones/astronauta.png';

    // Reset ship to default
    const shipImg = document.getElementById('shipImg');
    const shipName = document.getElementById('shipName');

    if (shipImg) {
        shipImg.src = '/assets/images/idle.png';
        // Remove all rarity classes and add common
        shipImg.classList.remove('rarity-comum', 'rarity-incomum', 'rarity-raro', 'rarity-epico', 'rarity-lendario');
        shipImg.classList.add('rarity-comum');
    }

    if (shipName) {
        shipName.textContent = 'Nave Padrão';
        shipName.style.color = '#CCCCCC';
    }

    // Reset stats to default
    updateShipStats(null);

    window.__GAME_CONFIG__ = null;
    connectBtn.innerHTML = '<span class="status-indicator disconnected"></span>Connect Phantom';
    walletStatus.className = 'status-indicator disconnected';
});

saveBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (!name) {
        // Add shake animation to input
        playerNameInput.style.animation = 'shake 0.5s';
        setTimeout(() => playerNameInput.style.animation = '', 500);
        return;
    }

    try { localStorage.setItem('playerName', name); } catch(e){}
    window.__GAME_CONFIG__ = window.__GAME_CONFIG__ || {};
    window.__GAME_CONFIG__.playerName = name;

    // Success feedback
    saveBtn.textContent = '✅ Saved!';
    saveBtn.style.background = 'var(--success)';
    setTimeout(() => {
        saveBtn.textContent = '💾 Save';
        saveBtn.style.background = '';
    }, 2000);
});

openPlay.addEventListener('click', () => {
    // Prepare config and show phaser container
    const cfg = window.__GAME_CONFIG__ || {
        playerName: playerNameInput.value || 'Pilot',
        walletAddress: null,
        nftImage: null
    };
    window.__GAME_CONFIG__ = cfg;

    // Smooth transition
    document.getElementById('game-launch').style.display = 'flex';
    document.getElementById('game-launch').style.opacity = '0';

    setTimeout(() => {
        document.getElementById('game-launch').style.transition = 'opacity 0.5s';
        document.getElementById('game-launch').style.opacity = '1';
    }, 10);

    // mount phaser (main.js uses #game-container)
    import('/src/main.js');
});

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize particles
createFloatingParticles();

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing ship stats...');

    // Initialize ship stats and apply default rarity
    updateShipStats(null);

    // Apply default rarity class to ship image
    const shipImg = document.getElementById('shipImg');
    if (shipImg) {
        shipImg.classList.add('rarity-comum');
        console.log('Applied default rarity class to ship image');
    } else {
        console.error('Ship image element not found!');
    }

    // Initialize login UI
    updateLoginUI(false);

    // Test function to force update ship stats
    window.testShipStats = function() {
        console.log('Testing ship stats update...');
        updateShipStats(null);
    };

    // Debug function to check ship elements
    window.debugShipElements = function() {
        console.log('🔍 Debugging ship elements...');
        const statsTitle = document.getElementById('statsTitle');
        const statsAttributes = document.getElementById('statsAttributes');
        const statsRarity = document.getElementById('statsRarity');
        const shipImg = document.getElementById('shipImg');
        const shipName = document.getElementById('shipName');

        console.log('Ship elements found:', {
            statsTitle: !!statsTitle,
            statsAttributes: !!statsAttributes,
            statsRarity: !!statsRarity,
            shipImg: !!shipImg,
            shipName: !!shipName
        });

        if (statsTitle) console.log('statsTitle text:', statsTitle.textContent);
        if (statsAttributes) console.log('statsAttributes HTML:', statsAttributes.innerHTML);
        if (statsRarity) console.log('statsRarity text:', statsRarity.textContent);

        return {
            statsTitle: !!statsTitle,
            statsAttributes: !!statsAttributes,
            statsRarity: !!statsRarity,
            shipImg: !!shipImg,
            shipName: !!shipName
        };
    };

    // Function to force complete logout (for testing)
    window.forceCompleteLogout = function() {
        console.log('🔄 Forcing complete logout...');
        isGoogleLoggedIn = false;
        isWalletConnected = false;
        currentUser = null;
        walletAddress = null;
        updateDualLoginUI();
    };

    // Debug: Check if stats elements exist
    const statsTitle = document.getElementById('statsTitle');
    const statsAttributes = document.getElementById('statsAttributes');
    const statsRarity = document.getElementById('statsRarity');

    console.log('Stats elements check:', {
        statsTitle: !!statsTitle,
        statsAttributes: !!statsAttributes,
        statsRarity: !!statsRarity
    });
});

// Navegação por abas - removida função duplicada, usando apenas initTabsNow

// Função de teste para debug
window.testTabs = function() {
    console.log('🧪 Testing tabs...');
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    console.log('Tabs found:', tabs.length);
    console.log('Contents found:', contents.length);
    return { tabs: tabs.length, contents: contents.length };
};

// Função de teste para mostrar overlay de login
window.showLoginOverlayTest = function() {
    console.log('🧪 Testing login overlay...');
    showLoginOverlay();
};

// Função de teste para navegação de abas
window.testTabNavigation = function() {
    console.log('🧪 Testing tab navigation...');
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    console.log('Found tabs:', tabs.length);
    console.log('Found contents:', contents.length);

    tabs.forEach((tab, index) => {
        const tabName = tab.getAttribute('data-tab');
        const contentId = tabName + '-content';
        const content = document.getElementById(contentId);

        console.log(`Tab ${index + 1}:`, {
            name: tabName,
            hasContent: !!content,
            isActive: tab.classList.contains('active'),
            contentActive: content ? content.classList.contains('active') : false
        });
    });

    return { tabs: tabs.length, contents: contents.length };
};

// Função para testar clique manual nas abas
window.testTabClick = function(tabName) {
    console.log(`🧪 Testing click on tab: ${tabName}`);
    const tab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    if (tab) {
        console.log('Found tab, clicking...');
        tab.click();
    } else {
        console.error(`Tab not found: ${tabName}`);
    }
};

// Função para reinicializar as abas
window.reinitTabs = function() {
    console.log('🔄 Reinitializing tabs...');
    initTabsNow();
};

// Expose quick helper for debugging
window.__connectPhantom = connectPhantom;

// Simple test function that doesn't depend on other functions
try {
    window.simpleTabTest = function() {
        console.log('🧪 Simple tab test...');
        const tabs = document.querySelectorAll('.nav-tab');
        console.log('Found tabs:', tabs.length);

        tabs.forEach((tab, index) => {
            console.log(`Tab ${index}:`, {
                element: tab,
                dataTab: tab.getAttribute('data-tab'),
                text: tab.textContent.trim()
            });
        });

        return tabs.length;
    };
    console.log('✅ simpleTabTest function created successfully');
} catch (error) {
    console.error('❌ Error creating simpleTabTest:', error);
}

// Immediate test to check if script is running
console.log('🚀 Script is running - checking tabs immediately...');
try {
    const tabs = document.querySelectorAll('.nav-tab');
    console.log('Immediate check - Found tabs:', tabs.length);
    if (tabs.length === 0) {
        console.log('⚠️ No tabs found - DOM might not be ready');
    }
} catch (error) {
    console.error('❌ Error in immediate check:', error);
}
