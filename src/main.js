// Main entry point for the application
import './styles.css';
import config from './config-legacy.js';

// Make config available globally
window.appConfig = config;

// Fallback para config.js se não carregar
if (!window.appConfig) {
    window.appConfig = {
        getEnvironment: () => 'production',
        getRedirectUrl: () => window.location.origin,
        getSupabaseConfig: () => ({
            url: "https://cjrbhqlwfjebnjoyfjnc.supabase.co",
            anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcmJocWx3ZmplYm5qb3lmam5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDIwNTMsImV4cCI6MjA3NTI3ODA1M30.X4uaKnfrmHYYSkVXz1qWYF0wmy-bkjHgbvonubYUTA4"
        })
    };
}

// Log configuration on load
console.log('🔧 Configuration loaded:', {
    environment: window.appConfig.getEnvironmentInfo(),
    redirectUrl: window.appConfig.getRedirectUrl(),
    supabaseUrl: window.appConfig.getSupabaseConfig().url
});

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
            
            // Update config fields if switching to config tab
            if (tabName === 'config') {
                setTimeout(() => {
                    updateConfigTabFields();
                }, 50);
            }
            
            console.log(`Switched to ${tabName} tab`);
        } else {
            console.error(`Container not found for tab: ${tabName}`);
        }
    }

    tabs.forEach(tab => {
        const tabName = tab.getAttribute('data-tab');
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            switchTab(tabName);
        });
    });

    function handleHashChange() {
        const hash = window.location.hash.substring(1) || 'profile';
        switchTab(hash);
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    window.switchTab = switchTab;
}

// Load components
async function loadProfileTabComponent() {
    try {
        console.log('🔄 Loading profile tab component...');
        const response = await fetch('/components/profile-tab.html');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const profileHTML = await response.text();
        
        const profileTabContainer = document.getElementById('profile-tab-container');
        if (profileTabContainer) {
            profileTabContainer.innerHTML = profileHTML;
            profileTabContainer.style.display = 'none';
            console.log('✅ Profile tab loaded successfully');
        } else {
            console.error('❌ Profile tab container not found');
        }
    } catch (error) {
        console.error('❌ Error loading profile tab component:', error);
    }
}

async function loadConfigTabComponent() {
    try {
        console.log('🔄 Loading config tab component...');
        const response = await fetch('/components/config-tab.html');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const configHTML = await response.text();
        
        const configTabContainer = document.getElementById('config-tab-container');
        if (configTabContainer) {
            configTabContainer.innerHTML = configHTML;
            configTabContainer.style.display = 'none';
            console.log('✅ Config tab loaded successfully');
        } else {
            console.error('❌ Config tab container not found');
        }
    } catch (error) {
        console.error('❌ Error loading config tab component:', error);
    }
}

async function loadRoadmapTabComponent() {
    try {
        console.log('🔄 Loading roadmap tab component...');
        const response = await fetch('/components/roadmap-tab.html');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const roadmapHTML = await response.text();
        
        const roadmapTabContainer = document.getElementById('roadmap-tab-container');
        if (roadmapTabContainer) {
            roadmapTabContainer.innerHTML = roadmapHTML;
            roadmapTabContainer.style.display = 'none';
            console.log('✅ Roadmap tab loaded successfully');
        } else {
            console.error('❌ Roadmap tab container not found');
        }
    } catch (error) {
        console.error('❌ Error loading roadmap tab component:', error);
    }
}

// Initialize everything
async function initializeApp() {
    console.log('🚀 Initializing app...');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Current origin:', window.location.origin);
    
    // Check if containers exist
    const containers = document.querySelectorAll('[id$="-tab-container"]');
    console.log('📊 Found containers:', containers.length);
    containers.forEach(container => {
        console.log('📦 Container:', container.id, 'exists:', !!container);
    });
    
    try {
        await loadProfileTabComponent();
        await loadConfigTabComponent();
        await loadRoadmapTabComponent();
        
        console.log('🔄 Initializing tabs...');
        initTabsNow();
        
        // Verify content was loaded
        const profileContainer = document.getElementById('profile-tab-container');
        if (profileContainer) {
            console.log('✅ Profile container content length:', profileContainer.innerHTML.length);
            console.log('✅ Profile container has content:', profileContainer.innerHTML.includes('tab-content'));
        }
        
        console.log('✅ App initialized successfully');
        console.log('📊 Available containers:', document.querySelectorAll('[id$="-tab-container"]').length);
    } catch (error) {
        console.error('❌ Error during app initialization:', error);
    }
}

// Prevent multiple initialization
let appInitialized = false;

// Start the app
function startApp() {
    if (appInitialized) {
        console.log('⚠️ App already initialized, skipping...');
        return;
    }
    
    appInitialized = true;
    console.log('🚀 Starting app initialization...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
}

// Start the app
startApp();