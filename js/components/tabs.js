// ===== TABS COMPONENT =====
import { $, $$, debounce, isMobile } from './utils/helpers.js';

class Tabs {
    constructor(container = document) {
        this.container = container;
        this.tabContainers = $$('.tab-container', this.container);
        this.tabButtons = $$('.tab-btn', this.container);
        this.tabContents = $$('.tab-content', this.container);
        
        this.activeTab = null;
        this.transitioning = false;
        
        this.init();
    }
    
    init() {
        if (this.tabContainers.length === 0) return;
        
        this.bindEvents();
        this.setInitialActiveTab();
        this.updateTabAccessibility();
        this.handleResize();

        // Diagnostic: Listen at capture phase to detect pointer/touch events
        // inside the tab-toggle area. Helps identify overlays that block taps.
        try {
            const tabToggles = $$('.tab-toggle', this.container);
            const captureHandler = (e) => {
                tabToggles.forEach(toggle => {
                    const rect = toggle.getBoundingClientRect();
                    const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
                    const y = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);
                    if (typeof x === 'number' && typeof y === 'number') {
                        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                            try { console.info('CAPTURE: event inside tab-toggle', e.type); } catch (err) {}
                        }
                    }
                });
            };

            document.addEventListener('pointerup', captureHandler, true);
            document.addEventListener('touchend', captureHandler, true);
        } catch (err) {
            // ignore
        }
    }
    
    bindEvents() {
        // Tab button clicks
        this.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleTabClick(e));
            button.addEventListener('keydown', (e) => this.handleTabKeydown(e));
        });
        
        // Mobile tab toggle with broader pointer support
        const tabToggles = $$('.tab-toggle', this.container);
        tabToggles.forEach(toggle => {
            // Debug binding (helps when testing in device console)
            try { console.debug('Binding tab toggle listener', toggle); } catch (err) {}

            // Click event (desktop and some mobile browsers)
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTabMenu(toggle);
            });

            // Pointer events (unified handling for mouse, touch, pen)
            toggle.addEventListener('pointerup', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleTabMenu(toggle);
            });

            // Touchend fallback for older browsers
            toggle.addEventListener('touchend', (e) => {
                e.stopPropagation();
                this.toggleTabMenu(toggle);
            }, { passive: true });
        });
        
        // Close mobile menu when clicking on a tab button
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => this.closeTabMenu());
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        // Handle window resize for responsive behavior
        window.addEventListener('resize', debounce(() => this.handleResize(), 250));
        
        // Handle orientation change for mobile devices
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 100);
        });
    }
    
    setInitialActiveTab() {
        // Check for active tab from URL hash
        const hash = window.location.hash;
        if (hash) {
            const tabFromHash = $(`[data-tab="${hash.slice(1)}"]`, this.container);
            if (tabFromHash) {
                this.switchToTab(tabFromHash);
                return;
            }
        }
        
        // Check for active tab from data attributes
        const activeTabFromData = $('.tab-btn[data-tab].active', this.container);
        if (activeTabFromData) {
            this.switchToTab(activeTabFromData);
            return;
        }
        
        // Fallback to first tab
        const firstTab = this.tabButtons[0];
        if (firstTab) {
            this.switchToTab(firstTab);
        }
    }
    
    handleTabClick(e) {
        e.preventDefault();
        const button = e.currentTarget;
        this.switchToTab(button);
    }
    
    toggleTabMenu(toggle) {
        try { console.debug('toggleTabMenu called', toggle); } catch (err) {}
        const tabsContainer = toggle.nextElementSibling;
        if (!tabsContainer) return;
        
        const isActive = tabsContainer.classList.contains('active');
        
        if (isActive) {
            tabsContainer.classList.remove('active');
            toggle.classList.remove('active');
            // Update hamburger icon
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        } else {
            tabsContainer.classList.add('active');
            toggle.classList.add('active');
            // Update hamburger icon
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }
        }
    }
    
    closeTabMenu() {
        const tabToggles = $$('.tab-toggle', this.container);
        tabToggles.forEach(toggle => {
            const tabsContainer = toggle.nextElementSibling;
            if (tabsContainer && tabsContainer.classList.contains('active')) {
                tabsContainer.classList.remove('active');
                toggle.classList.remove('active');
                const icon = toggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
    
    handleOutsideClick(e) {
        // Close menu if clicking outside of tab area and on mobile
        if (isMobile()) {
            const tabWrappers = $$('.tab-wrapper');
            let isClickInside = false;
            
            tabWrappers.forEach(wrapper => {
                if (wrapper.contains(e.target)) {
                    isClickInside = true;
                }
            });
            
            if (!isClickInside) {
                this.closeTabMenu();
            }
        }
    }
    
    handleTabKeydown(e) {
        const button = e.currentTarget;
        const key = e.key;
        const currentIndex = Array.from(this.tabButtons).indexOf(button);
        
        switch (key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                this.focusPreviousTab(currentIndex);
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                this.focusNextTab(currentIndex);
                break;
            case 'Home':
                e.preventDefault();
                this.focusFirstTab();
                break;
            case 'End':
                e.preventDefault();
                this.focusLastTab();
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.switchToTab(button);
                break;
        }
    }
    
    focusPreviousTab(currentIndex) {
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : this.tabButtons.length - 1;
        this.tabButtons[previousIndex].focus();
    }
    
    focusNextTab(currentIndex) {
        const nextIndex = currentIndex < this.tabButtons.length - 1 ? currentIndex + 1 : 0;
        this.tabButtons[nextIndex].focus();
    }
    
    focusFirstTab() {
        this.tabButtons[0].focus();
    }
    
    focusLastTab() {
        this.tabButtons[this.tabButtons.length - 1].focus();
    }
    
    async switchToTab(button) {
        if (this.transitioning || button.classList.contains('active')) {
            return;
        }
        
        this.transitioning = true;
        
        const targetTab = button.getAttribute('data-tab');
        const targetContent = $(`#${targetTab}`, this.container);
        
        if (!targetContent) {
            console.warn(`Tab content not found for: ${targetTab}`);
            this.transitioning = false;
            return;
        }
        
        // Get current active tab and content
        const currentButton = $('.tab-btn.active', this.container);
        const currentContent = $('.tab-content.active', this.container);
        
        // Update URL hash without scrolling
        if (history.pushState) {
            history.pushState(null, null, `#${targetTab}`);
        }
        
        // Add loading state
        button.classList.add('tab-loading');
        
        try {
            // Preload content if needed (for dynamic content)
            await this.preloadTabContent(targetTab, targetContent);
            
            // Start transition
            await this.performTabTransition(currentButton, currentContent, button, targetContent);
            
            // Update active states
            this.updateActiveStates(button, targetContent);
            this.activeTab = targetTab;
            
            // Dispatch custom event
            this.dispatchTabChangeEvent(targetTab);
            
        } catch (error) {
            console.error('Tab transition error:', error);
        } finally {
            button.classList.remove('tab-loading');
            this.transitioning = false;
        }
    }
    
    async preloadTabContent(tabId, contentElement) {
        // Check if content needs to be loaded dynamically
        const shouldLoad = contentElement.hasAttribute('data-load') && 
                          !contentElement.hasAttribute('data-loaded');
        
        if (shouldLoad) {
            const loadUrl = contentElement.getAttribute('data-load-url');
            if (loadUrl) {
                try {
                    const response = await fetch(loadUrl);
                    const html = await response.text();
                    contentElement.innerHTML = html;
                    contentElement.setAttribute('data-loaded', 'true');
                } catch (error) {
                    contentElement.innerHTML = `
                        <div class="tab-error">
                            <p>Failed to load content. Please try again.</p>
                            <button class="btn btn--secondary" onclick="this.closest('.tab-content').reload()">
                                Retry
                            </button>
                        </div>
                    `;
                    throw error;
                }
            }
        }
        
        // Preload images in the tab content
        const images = contentElement.querySelectorAll('img[data-src]');
        const imageLoadPromises = Array.from(images).map(img => {
            return new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            });
        });
        
        await Promise.all(imageLoadPromises);
    }
    
    async performTabTransition(currentButton, currentContent, newButton, newContent) {
        return new Promise((resolve) => {
            // Fade out current content
            if (currentContent) {
                currentContent.style.opacity = '0';
                currentContent.style.transform = 'translateY(10px)';
            }
            
            // Remove active classes after fade out
            setTimeout(() => {
                if (currentButton) currentButton.classList.remove('active');
                if (currentContent) currentContent.classList.remove('active');
                
                // Add active classes to new tab
                newButton.classList.add('active');
                newContent.classList.add('active');
                
                // Fade in new content
                setTimeout(() => {
                    newContent.style.opacity = '1';
                    newContent.style.transform = 'translateY(0)';
                    resolve();
                }, 50);
            }, 300);
        });
    }
    
    updateActiveStates(activeButton, activeContent) {
        // Update all buttons and contents
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.opacity = '0';
            content.style.transform = 'translateY(10px)';
        });
        
        // Set active states
        activeButton.classList.add('active');
        activeContent.classList.add('active');
        activeContent.style.opacity = '1';
        activeContent.style.transform = 'translateY(0)';
        
        // Update tab title display
        this.updateTabTitleDisplay(activeButton);
        
        // Update accessibility attributes
        this.updateTabAccessibility();
    }
    
    updateTabTitleDisplay(activeButton) {
        const tabTitleElement = $('#active-tab-title', this.container);
        if (tabTitleElement) {
            const tabTitle = activeButton.textContent.trim();
            tabTitleElement.textContent = tabTitle;
        }
    }
    
    updateTabAccessibility() {
        this.tabButtons.forEach((button, index) => {
            const isActive = button.classList.contains('active');
            const tabId = button.getAttribute('data-tab');
            const content = $(`#${tabId}`, this.container);
            
            // Update ARIA attributes
            button.setAttribute('aria-selected', isActive);
            button.setAttribute('tabindex', isActive ? '0' : '-1');
            
            if (content) {
                content.setAttribute('aria-hidden', !isActive);
            }
            
            // Update role and relationships
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-controls', tabId);
            button.setAttribute('id', `tab-${tabId}`);
            
            if (content) {
                content.setAttribute('role', 'tabpanel');
                content.setAttribute('aria-labelledby', `tab-${tabId}`);
            }
        });
    }
    
    dispatchTabChangeEvent(tabId) {
        const event = new CustomEvent('tabChange', {
            detail: {
                tabId: tabId,
                tabElement: $(`#${tabId}`, this.container),
                buttonElement: $(`[data-tab="${tabId}"]`, this.container)
            },
            bubbles: true
        });
        
        this.container.dispatchEvent(event);
        
        // Also dispatch on window for global listeners
        window.dispatchEvent(new CustomEvent('tabChange', {
            detail: {
                tabId: tabId,
                container: this.container
            }
        }));
    }
    
    handleResize() {
  // Handle responsive tab behavior
  this.tabContainers.forEach(container => {
    const isMobileView = window.innerWidth <= 640; // Use 640px breakpoint
    
    if (isMobileView) {
      container.classList.add('tabs-mobile');
      container.classList.remove('tabs-desktop');
      
      // Close any open mobile menus when switching to desktop
      const tabToggles = $$('.tab-toggle', container);
      tabToggles.forEach(toggle => {
        const tabsContainer = toggle.nextElementSibling;
        if (tabsContainer && tabsContainer.classList.contains('active')) {
          this.closeTabMenu();
        }
      });
    } else {
      container.classList.add('tabs-desktop');
      container.classList.remove('tabs-mobile');
    }
  });
  
  // Adjust tab content height if needed
  this.adjustTabContentHeight();
}
    
    adjustTabContentHeight() {
        // Set consistent height for tab contents
        if (this.tabContents.length > 0) {
            let maxHeight = 0;
            
            // First, reset all heights to auto to get natural heights
            this.tabContents.forEach(content => {
                content.style.height = 'auto';
            });
            
            // Find the maximum height
            this.tabContents.forEach(content => {
                const height = content.scrollHeight;
                if (height > maxHeight) {
                    maxHeight = height;
                }
            });
            
            // Set all tab contents to the maximum height
            this.tabContents.forEach(content => {
                content.style.minHeight = `${maxHeight}px`;
            });
        }
    }
    
    // Method to get current active tab
    getActiveTab() {
        return this.activeTab;
    }
    
    // Method to get tab content
    getTabContent(tabId) {
        return $(`#${tabId}`, this.container);
    }
    
    // Method to programmatically switch to a tab
    switchToTabById(tabId) {
        const button = $(`[data-tab="${tabId}"]`, this.container);
        if (button) {
            this.switchToTab(button);
        }
    }
    
    // Method to add a new tab dynamically
    addTab(tabData) {
        const { id, label, content, position = 'end' } = tabData;
        
        // Create tab button
        const tabButton = document.createElement('button');
        tabButton.className = 'tab-btn';
        tabButton.setAttribute('data-tab', id);
        tabButton.textContent = label;
        
        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.id = id;
        tabContent.innerHTML = content;
        
        // Add to DOM
        const tabNav = $('.tab-nav', this.container);
        const tabContentContainer = $('.tab-content-container', this.container) || this.container;
        
        if (position === 'start' && tabNav) {
            tabNav.insertBefore(tabButton, tabNav.firstChild);
        } else if (tabNav) {
            tabNav.appendChild(tabButton);
        }
        
        tabContentContainer.appendChild(tabContent);
        
        // Update internal arrays
        this.tabButtons = $$('.tab-btn', this.container);
        this.tabContents = $$('.tab-content', this.container);
        
        // Bind events to new tab
        this.bindTabEvents(tabButton);
        
        // Update accessibility
        this.updateTabAccessibility();
        
        return { button: tabButton, content: tabContent };
    }
    
    bindTabEvents(button) {
        button.addEventListener('click', (e) => this.handleTabClick(e));
        button.addEventListener('keydown', (e) => this.handleTabKeydown(e));
    }
    
    // Method to remove a tab
    removeTab(tabId) {
        const button = $(`[data-tab="${tabId}"]`, this.container);
        const content = $(`#${tabId}`, this.container);
        
        if (button && content) {
            // If removing active tab, switch to another tab first
            if (button.classList.contains('active')) {
                const otherTabs = this.tabButtons.filter(btn => btn !== button);
                if (otherTabs.length > 0) {
                    this.switchToTab(otherTabs[0]);
                }
            }
            
            // Remove elements
            button.remove();
            content.remove();
            
            // Update internal arrays
            this.tabButtons = $$('.tab-btn', this.container);
            this.tabContents = $$('.tab-content', this.container);
            
            // Update accessibility
            this.updateTabAccessibility();
        }
    }
    
    // Method to enable/disable a tab
    setTabEnabled(tabId, enabled) {
        const button = $(`[data-tab="${tabId}"]`, this.container);
        if (button) {
            button.disabled = !enabled;
            if (!enabled && button.classList.contains('active')) {
                // If disabling active tab, switch to first enabled tab
                const enabledTab = $('.tab-btn:not([disabled])', this.container);
                if (enabledTab) {
                    this.switchToTab(enabledTab);
                }
            }
        }
    }
    
    // Method to update tab label
    setTabLabel(tabId, newLabel) {
        const button = $(`[data-tab="${tabId}"]`, this.container);
        if (button) {
            button.textContent = newLabel;
        }
    }
    
    // Method to update tab content
    setTabContent(tabId, newContent) {
        const content = $(`#${tabId}`, this.container);
        if (content) {
            content.innerHTML = newContent;
            content.setAttribute('data-loaded', 'true');
        }
    }
    
    // Destroy method for cleanup
    destroy() {
        this.tabButtons.forEach(button => {
            button.removeEventListener('click', this.handleTabClick);
            button.removeEventListener('keydown', this.handleTabKeydown);
        });
        
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleResize);
    }
}

// Initialize tabs when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all tab containers on the page
    const tabContainers = $$('.tab-container');
    const tabsInstances = [];
    
    tabContainers.forEach(container => {
        tabsInstances.push(new Tabs(container));
    });
    
    // Also initialize tabs without container (for backward compatibility)
    if ($$('.tab-btn').length > 0 && tabContainers.length === 0) {
        tabsInstances.push(new Tabs());
    }
    
    // Make instances available globally for debugging
    window.fodasuTabs = tabsInstances;
});

export default Tabs;