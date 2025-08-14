// PWA Initialization Script for North East England Holiday Website
// Add this to your main HTML files

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    async init() {
        // Register service worker
        await this.registerServiceWorker();
        
        // Setup installation prompt
        this.setupInstallPrompt();
        
        // Setup online/offline indicators
        this.setupConnectionIndicators();
        
        // Check if already installed
        this.checkInstallStatus();
        
        // Setup update notifications
        this.setupUpdateNotifications();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/northeast/sw.js', {
                    scope: '/northeast/'
                });
                
                console.log('Service Worker registered successfully:', registration);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
                return registration;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    setupInstallPrompt() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstalledMessage();
        });
    }

    showInstallButton() {
        // Create install button if it doesn't exist
        let installButton = document.getElementById('pwa-install-button');
        
        if (!installButton) {
            installButton = document.createElement('button');
            installButton.id = 'pwa-install-button';
            installButton.innerHTML = '📱 Install App';
            installButton.className = 'pwa-install-btn';
            installButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #6366f1;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                z-index: 1000;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            installButton.addEventListener('mouseenter', () => {
                installButton.style.transform = 'translateY(-2px)';
                installButton.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
            });
            
            installButton.addEventListener('mouseleave', () => {
                installButton.style.transform = 'translateY(0)';
                installButton.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            });
            
            installButton.addEventListener('click', () => this.installApp());
            
            document.body.appendChild(installButton);
        }
        
        installButton.style.display = 'flex';
    }

    hideInstallButton() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            
            this.deferredPrompt = null;
        }
    }

    showInstalledMessage() {
        // Show a temporary success message
        const message = document.createElement('div');
        message.innerHTML = '✅ App installed successfully!';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    setupConnectionIndicators() {
        // Create connection status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.id = 'connection-status';
        statusIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            z-index: 1000;
            transition: all 0.3s ease;
            display: none;
        `;
        
        document.body.appendChild(statusIndicator);
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateConnectionStatus();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateConnectionStatus();
        });
        
        // Initial status
        this.updateConnectionStatus();
    }

    updateConnectionStatus() {
        const indicator = document.getElementById('connection-status');
        
        if (!this.isOnline) {
            indicator.innerHTML = '📡 Offline Mode';
            indicator.style.background = '#f59e0b';
            indicator.style.color = 'white';
            indicator.style.display = 'block';
        } else {
            indicator.innerHTML = '✅ Online';
            indicator.style.background = '#10b981';
            indicator.style.color = 'white';
            indicator.style.display = 'block';
            
            // Hide after 2 seconds when back online
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 2000);
        }
    }

    checkInstallStatus() {
        // Check if running in standalone mode (installed)
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            this.hideInstallButton();
        }
    }

    showUpdateNotification() {
        // Show update available notification
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span>🔄 Update available!</span>
                <button onclick="window.location.reload()" style="
                    background: white;
                    color: #6366f1;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                ">Update</button>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #6366f1;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    // Utility method to check if content is cached
    async isContentCached(url) {
        if ('caches' in window) {
            const cache = await caches.open('northeast-holiday-v1');
            const response = await cache.match(url);
            return !!response;
        }
        return false;
    }

    // Method to preload important content
    async preloadContent() {
        const importantUrls = [
            '/northeast/',
            '/northeast/food.html',
            '/northeast/map/',
            '/northeast/heritage/'
        ];

        for (const url of importantUrls) {
            try {
                await fetch(url);
                console.log(`Preloaded: ${url}`);
            } catch (error) {
                console.log(`Failed to preload: ${url}`);
            }
        }
    }
}

// Initialize PWA when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PWAManager();
    });
} else {
    new PWAManager();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

