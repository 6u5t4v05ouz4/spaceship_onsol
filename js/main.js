// Tab navigation with URL hash support
function initTabsNow() {
    const tabs = document.querySelectorAll('.nav-tab');

    function switchTab(tabName) {
        // Update URL hash
        window.location.hash = tabName;
        
        // Remove active from all tabs
        tabs.forEach(tab => tab.classList.remove('active'));
        
        // Hide ALL tab containers
        const allContainers = document.querySelectorAll('[id$="-tab-container"]');
        allContainers.forEach(container => {
            container.style.display = 'none';
        });

        // Remove active class from all tab contents
        const allTabContents = document.querySelectorAll('.tab-content');
        allTabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Add active to selected tab
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Show the selected tab container
        const activeContainer = document.getElementById(`${tabName}-tab-container`);
        if (activeContainer) {
            activeContainer.style.display = 'block';
            
            // Add active class to the tab content inside the container
            const tabContent = activeContainer.querySelector('.tab-content');
            if (tabContent) {
                tabContent.classList.add('active');
            }
            
            console.log(`Switched to ${tabName} tab`);
        } else {
            console.error(`Container not found for tab: ${tabName}`);
        }
    }

    // Handle URL hash changes
    function handleHashChange() {
        const hash = window.location.hash.substring(1) || 'profile';
        switchTab(hash);
    }

    // Add click listeners
    tabs.forEach(tab => {
        const tabName = tab.getAttribute('data-tab');
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            switchTab(tabName);
        });
    });

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Set initial tab based on URL hash
    handleHashChange();

    // Make functions available globally
    window.switchTab = switchTab;
}

// Load header component dynamically
async function loadHeaderComponent() {
    // Header is now inline in HTML
}

// Load profile tab component dynamically
async function loadProfileTabComponent() {
    try {
        const response = await fetch('components/profile-tab.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const profileHTML = await response.text();
        
        const profileTabContainer = document.getElementById('profile-tab-container');
        if (profileTabContainer) {
            profileTabContainer.innerHTML = profileHTML;
            profileTabContainer.style.display = 'none'; // Hidden by default
            console.log('Profile tab loaded successfully');
        } else {
            console.error('Profile tab container not found');
        }
    } catch (error) {
        console.error('Error loading profile tab component:', error);
    }
}

// Load roadmap tab component dynamically
async function loadRoadmapTabComponent() {
    try {
        const response = await fetch('components/roadmap-tab.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const roadmapHTML = await response.text();
        
        const roadmapTabContainer = document.getElementById('roadmap-tab-container');
        if (roadmapTabContainer) {
            roadmapTabContainer.innerHTML = roadmapHTML;
            roadmapTabContainer.style.display = 'none'; // Hidden by default
            console.log('Roadmap tab loaded successfully');
        } else {
            console.error('Roadmap tab container not found');
        }
    } catch (error) {
        console.error('Error loading roadmap tab component:', error);
    }
}

// Load config tab component dynamically
async function loadConfigTabComponent() {
    try {
        const response = await fetch('components/config-tab.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const configHTML = await response.text();
        
        const configTabContainer = document.getElementById('config-tab-container');
        if (configTabContainer) {
            configTabContainer.innerHTML = configHTML;
            configTabContainer.style.display = 'none'; // Hidden by default
            console.log('Config tab loaded successfully');
        } else {
            console.error('Config tab container not found');
        }
    } catch (error) {
        console.error('Error loading config tab component:', error);
    }
}

// Load components immediately after basic setup
loadHeaderComponent();

// Wait for DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(async () => {
            console.log('Loading tabs...');
            await loadProfileTabComponent();
            await loadConfigTabComponent();
            await loadRoadmapTabComponent();
            console.log('All tabs loaded, initializing...');
            initTabsNow();
        }, 100);
    });
} else {
    // DOM is already ready
    setTimeout(async () => {
        console.log('Loading tabs...');
        await loadProfileTabComponent();
        await loadConfigTabComponent();
        await loadRoadmapTabComponent();
        console.log('All tabs loaded, initializing...');
        initTabsNow();
    }, 100);
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

        container.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, animationDuration * 1000);
    }

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
let supabase = null;
if (window.supabase) {
    try {
        supabase = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
    } catch (error) {
        console.error('Error initializing Supabase:', error);
    }
}

// Check initial session on page load
async function checkInitialSession() {
    // First, try to restore wallet connection from localStorage
    try {
        const savedWalletAddress = localStorage.getItem('walletAddress');
        if (savedWalletAddress) {
            walletAddress = savedWalletAddress;
            isWalletConnected = true;
        }
    } catch (error) {
        console.error('Error restoring wallet connection:', error);
    }

    // Then check Supabase session
    if (supabase && supabase.auth) {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error getting session:', error);
            } else if (session) {
                currentUser = session.user;
                updateLoginUI(true);
                
                // Try to get user profile
                try {
                    userProfile = await getUserProfile(currentUser.email, walletAddress);
                    if (userProfile) {
                        updateProfileUI(userProfile);
                    }
                } catch (profileError) {
                    console.error('Error loading user profile:', profileError);
                }
                
                updateDualLoginUI();
                } else {
                updateDualLoginUI();
            }
        } catch (error) {
            console.error('Error checking session:', error);
            updateDualLoginUI();
        }
    } else {
        updateDualLoginUI();
    }
}

// Basic UI wiring
const loginBtn = document.getElementById('loginBtn');
const playerNameInput = document.getElementById('playerName');
const walletAddrEl = document.getElementById('walletAddr');

// Global variables
let currentUser = null;
let userProfile = null;
let walletAddress = null;
let isWalletConnected = false;

// Dual login UI elements
const connectWalletBtn = document.getElementById('connectWalletBtn');
const connectGoogleBtn = document.getElementById('connectGoogleBtn');
const disconnectWalletBtn = document.getElementById('disconnectWalletBtn');
const disconnectGoogleBtn = document.getElementById('disconnectGoogleBtn');

// Create or update user profile
async function createOrUpdateUserProfile(googleEmail, walletAddress, playerName) {
    try {
        if (!supabase) return null;

        const profileData = {
            google_email: googleEmail,
            wallet_address: walletAddress,
            player_name: playerName,
            updated_at: new Date().toISOString()
        };

        // Try to update existing profile first
        const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('google_email', googleEmail)
                .single();

        if (existingProfile) {
            // Update existing profile
            const { data, error } = await supabase
                .from('user_profiles')
                .update(profileData)
                .eq('google_email', googleEmail)
                .select()
                .single();

            if (error) {
                console.error('Error updating profile:', error);
                return null;
            }
            return data;
        } else {
            // Create new profile
            const { data, error } = await supabase
                .from('user_profiles')
                .insert([profileData])
                .select()
                .single();

            if (error) {
                console.error('Error creating profile:', error);
                return null;
            }
            return data;
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

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        return null;
    }
}

async function validateAccountLinking(googleEmail, walletAddress) {
    try {
        if (!supabase) return { valid: true };

        // Check if wallet is already linked to another Google account
        const { data: existingWalletProfile } = await supabase
            .from('user_profiles')
            .select('google_email')
            .eq('wallet_address', walletAddress)
            .neq('google_email', googleEmail)
            .single();

        if (existingWalletProfile) {
            return {
                valid: false,
                message: 'This wallet is already linked to another Google account' 
            };
        }

        // Check if Google account is already linked to another wallet
        const { data: existingGoogleProfile } = await supabase
            .from('user_profiles')
            .select('wallet_address')
            .eq('google_email', googleEmail)
            .neq('wallet_address', walletAddress)
            .single();

        if (existingGoogleProfile) {
            return {
                valid: false,
                message: 'This Google account is already linked to another wallet' 
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
        // Update button text if it exists
        if (loginBtn) {
            loginBtn.textContent = 'CONNECTING...';
            loginBtn.disabled = true;
        }

        // Use centralized config for redirect URL
        const redirectUrl = window.appConfig ? window.appConfig.getRedirectUrl() : window.location.origin;

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl
            }
        });

        if (error) {
            console.error('Google login error:', error);
            alert('Erro no login: ' + error.message);
        }
    } catch (error) {
        console.error('Google login error:', error);
        alert('Erro no login: ' + error.message);
    } finally {
        // Reset button text if it exists
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
        }
        
        currentUser = null;
        updateLoginUI(false);
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Update login UI
function updateLoginUI(isLoggedIn) {
    if (isLoggedIn && currentUser) {
        // Hide login button and show play button
        if (loginBtn) {
        loginBtn.style.display = 'none';
        }

        // Show logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
        logoutBtn.style.display = 'block';
        }

        // Show Google account info
        const googleInfoField = document.getElementById('googleInfo');
        if (googleInfoField) {
        googleInfoField.style.display = 'block';
            googleInfoField.textContent = `Logged in as: ${currentUser.email}`;
        }
    } else {
        // Show login button and hide play button
        if (loginBtn) {
        loginBtn.style.display = 'block';
        }

        // Hide logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
        logoutBtn.style.display = 'none';
        }

        // Hide Google account info
        const googleInfoField = document.getElementById('googleInfo');
        if (googleInfoField) {
        googleInfoField.style.display = 'none';
        }
    }
}

// Supabase auth state listener
if (supabase && supabase.auth) {
    supabase.auth.onAuthStateChange(async (event, session) => {
        currentUser = session?.user || null;
        
        if (event === 'SIGNED_IN' && currentUser) {
            updateLoginUI(true);
            
            // Try to get user profile
            try {
                userProfile = await getUserProfile(currentUser.email, walletAddress);
                if (userProfile) {
                    updateProfileUI(userProfile);
                }
            } catch (profileError) {
                console.error('Error loading user profile:', profileError);
            }
        } else if (event === 'SIGNED_OUT') {
            updateLoginUI(false);
            userProfile = null;
        }

        updateDualLoginUI();
    });
}

// Login overlay functions removed - using direct button login

// Login with Solana (Phantom Wallet)
async function loginWithSolana() {
    try {
        await connectPhantom();
        updateDualLoginUI();
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

        if (!(window && window.solana && window.solana.isPhantom)) {
            alert('Instale Phantom ou abra o site num navegador com a extensão Phantom');
                return;
            }

        const response = await window.solana.connect();
        walletAddress = response.publicKey.toString();
        isWalletConnected = true;

        // Save to localStorage
        localStorage.setItem('walletAddress', walletAddress);

        // Update UI
        updateDualLoginUI();

        console.log('Wallet connected:', walletAddress);
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
    if (!(window && window.solana && window.solana.isPhantom)) {
        alert('Instale Phantom ou abra o site num navegador com a extensão Phantom');
        return;
    }

    try {
        const response = await window.solana.connect();
        const publicKey = response.publicKey.toString();
        
        // Use Supabase Web3 Auth
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'solana',
            options: {
                redirectTo: window.location.origin,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            }
            });

            if (error) {
            console.error('Supabase Web3 Auth error:', error);
            throw error;
        }

        walletAddress = publicKey;
        isWalletConnected = true;

        // Save to localStorage
        localStorage.setItem('walletAddress', walletAddress);
        
        updateDualLoginUI();
        console.log('Phantom connected with Supabase:', publicKey);

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

        // Use centralized config for redirect URL
        const redirectUrl = window.appConfig ? window.appConfig.getRedirectUrl() : window.location.origin;
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl
            }
        });

        if (error) {
            console.error('Google login error:', error);
            throw error;
        }

        console.log('Google login initiated');
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
            try {
            await window.solana.disconnect();
            } catch (disconnectError) {
                console.log('Phantom disconnect error (non-critical):', disconnectError);
        }
        }

        // Clear local state
        walletAddress = null;
        isWalletConnected = false;

        // Remove from localStorage
            localStorage.removeItem('walletAddress');
        
        // Update UI
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
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Google logout error:', error);
        }
        }

        // Clear local state
        currentUser = null;
        userProfile = null;
        
        // Update UI
        updateDualLoginUI();
        console.log('Google disconnected');
    } catch (error) {
        console.error('Google disconnect error:', error);
    }
}

// Update dual login UI
function updateDualLoginUI() {

    // Update wallet status
    if (isWalletConnected && walletAddress) {
        if (connectWalletBtn) {
            connectWalletBtn.style.display = 'none';
        }
        if (disconnectWalletBtn) {
            disconnectWalletBtn.style.display = 'inline-block';
        }
        
        // Update wallet address display
        const walletAddrEl = document.getElementById('walletAddr');
        if (walletAddrEl) {
            walletAddrEl.textContent = `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`;
        }
    } else {
        if (connectWalletBtn) {
            connectWalletBtn.style.display = 'inline-block';
        }
        if (disconnectWalletBtn) {
            disconnectWalletBtn.style.display = 'none';
        }
        
        // Clear wallet address display
        const walletAddrEl = document.getElementById('walletAddr');
        if (walletAddrEl) {
            walletAddrEl.textContent = 'Not connected';
        }
    }

    // Update Google status
    if (currentUser) {
        if (connectGoogleBtn) {
            connectGoogleBtn.style.display = 'none';
        }
        if (disconnectGoogleBtn) {
            disconnectGoogleBtn.style.display = 'inline-block';
        }
        
        // Update player name display
        const playerNameEl = document.getElementById('playerName');
        if (playerNameEl) {
            playerNameEl.textContent = currentUser.user_metadata?.full_name || currentUser.email || 'Player';
        }
            } else {
        if (connectGoogleBtn) {
            connectGoogleBtn.style.display = 'inline-block';
        }
        if (disconnectGoogleBtn) {
            disconnectGoogleBtn.style.display = 'none';
        }
        
        // Clear player name display
        const playerNameEl = document.getElementById('playerName');
        if (playerNameEl) {
            playerNameEl.textContent = 'Player Name';
        }
    }

    // Show/hide main content based on login status
    if (isWalletConnected || currentUser) {
        const mainContent = document.querySelector('.wrap');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
    } else {
        const mainContent = document.querySelector('.wrap');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
    }
}

async function connectPhantom() {
    if (!(window && window.solana && window.solana.isPhantom)) {
        alert('Instale Phantom ou abra o site num navegador com a extensão Phantom');
        return;
    }

    try {
        const response = await window.solana.connect();
        const publicKey = response.publicKey.toString();

        walletAddress = publicKey;
        isWalletConnected = true;

        // Save to localStorage
        localStorage.setItem('walletAddress', walletAddress);
        
        // Update UI elements
        const walletAddrEl = document.getElementById('walletAddr');
        if (walletAddrEl) {
            walletAddrEl.textContent = `${publicKey.slice(0, 8)}...${publicKey.slice(-8)}`;
        }
        
        // Hide connect button and show disconnect button
        const connectBtn = document.getElementById('connectBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        
        if (connectBtn) {
            connectBtn.style.display = 'none';
        }
        if (disconnectBtn) {
            disconnectBtn.style.display = 'block';
        }
        
        console.log('Phantom connected:', publicKey);

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
    currentShipData = shipData;
    
    // Update ship image
    const shipImg = document.getElementById('shipImg');
    if (shipImg && shipData.image) {
        shipImg.src = shipData.image;
        shipImg.alt = shipData.name || 'Ship';
    }
    
    // Update ship name
    const shipName = document.getElementById('shipName');
    if (shipName) {
        shipName.textContent = shipData.name || 'Unknown Ship';
    }
    
    // Update ship stats
    const stats = [
        { id: 'statsAttack', value: shipData.attack },
        { id: 'statsDefense', value: shipData.defense },
        { id: 'statsSpeed', value: shipData.speed },
        { id: 'statsMining', value: shipData.mining }
    ];
    
    stats.forEach(stat => {
        const element = document.getElementById(stat.id);
        if (element) {
            element.textContent = stat.value || '0';
        }
    });
    
    // Update rarity
    const rarity = shipData.rarity || 'common';
    const statsRarity = document.getElementById('statsRarity');
        if (statsRarity) {
            statsRarity.textContent = rarity.toUpperCase();
            statsRarity.className = `stats-rarity rarity-${rarity.toLowerCase()}`;
        }
}

// Initialize dual login UI
updateDualLoginUI();

// Check initial login states
function checkInitialLoginStates() {
    // Check if wallet is already connected from localStorage
    const savedWalletAddress = localStorage.getItem('walletAddress');
    if (savedWalletAddress) {
        walletAddress = savedWalletAddress;
        isWalletConnected = true;
    }

    // Check if Google is already logged in (will be handled by Supabase listener)
    updateDualLoginUI();
}

// Run initial check
checkInitialLoginStates();

// Initialize ship stats
updateShipStats({ name: 'Default Ship', attack: 10, defense: 10, speed: 10, mining: 10, rarity: 'common' });

// Apply default rarity class to ship image
const shipImg = document.getElementById('shipImg');
if (shipImg) {
    shipImg.classList.add('rarity-comum');
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

// Wait for DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        checkInitialSession();
            createFloatingParticles();
    }, 100);
    });
    } else {
    setTimeout(() => {
        checkInitialSession();
createFloatingParticles();
    }, 100);
}