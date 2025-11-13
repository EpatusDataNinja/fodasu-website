// ===== MAIN APPLICATION ENTRY POINT =====
import { $, $$, showNotification, debounce, isMobile, getCurrentBreakpoint } from './components/utils/helpers.js';
import { BREAKPOINTS, PERFORMANCE } from './components/utils/constants.js';

// Import all components
import Navigation from './components/navigation.js';
import Gallery from './components/gallery.js';
import Tabs from './components/tabs.js';
import ProgramNavigation from './components/program-nav.js';
import Events from './components/events.js'; // Added Events component import

class FODASUApp {
    constructor() {
        this.components = {};
        this.isInitialized = false;
        this.currentBreakpoint = getCurrentBreakpoint();
        
        this.init();
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            await this.initializeApp();
            this.isInitialized = true;
            
            console.log('FODASU App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize FODASU App:', error);
            // Temporary: Don't show error state during development
            // this.showErrorState();
        }
    }
    
    async initializeApp() {
        // Initialize core functionality
        this.initCore();
        
        // Initialize components based on page
        this.initComponents();
        
        // Initialize performance optimizations
        this.initPerformance();
        
        // Initialize analytics
        this.initAnalytics();
        
        // Initialize service worker (if available)
        this.initServiceWorker();
        
        // Initialize error handling
        this.initErrorHandling();
        
        // Dispatch app ready event
        this.dispatchAppReadyEvent();
    }
    
    initCore() {
        // Set up global error handler
        window.addEventListener('error', (e) => this.handleGlobalError(e));
        window.addEventListener('unhandledrejection', (e) => this.handlePromiseRejection(e));
        
        // Initialize responsive behavior
        this.initResponsiveBehavior();
        
        // Initialize smooth scrolling for anchor links
        this.initSmoothScrolling();
        
        // Initialize lazy loading for images
        this.initLazyLoading();
        
        // Initialize intersection observer for animations
        this.initScrollAnimations();
        
        // Initialize keyboard navigation
        this.initKeyboardNavigation();
    }
    
    initComponents() {
        // Initialize components that should run on all pages
        try {
            this.components.navigation = new Navigation();
            console.log('Navigation initialized');
        } catch (error) {
            console.warn('Navigation initialization failed:', error);
        }
        
        // Initialize page-specific components
        this.initPageSpecificComponents();
        
        // Initialize utility components
        this.initUtilityComponents();
    }
    
    initPageSpecificComponents() {
        const page = this.getCurrentPage();
        
        console.log(`Initializing components for page: ${page}`);
        
        try {
            switch (page) {
                case 'about':
                    // Only initialize if tabs container exists
                    if ($('.leadership')) {
                        this.components.tabs = new Tabs();
                        console.log('Tabs initialized on about page');
                    }
                    break;
                    
                case 'contact':
                    // Contact component doesn't exist - skip
                    console.log('Contact component not available');
                    break;
                    
                case 'donate':
                    // Donation component doesn't exist - skip  
                    console.log('Donation component not available');
                    break;
                    
                case 'gallery':
                    // Only initialize if gallery elements exist
                    if ($('.gallery-grid') || $('.gallery-item')) {
                        this.components.gallery = new Gallery();
                        console.log('Gallery initialized');
                    }
                    break;
                    
                case 'programs':
                    // Only initialize if program navigation exists
                    if ($('.programs-nav')) {
                        this.components.programNav = new ProgramNavigation();
                        console.log('ProgramNavigation initialized');
                    }
                    // Only initialize tabs if leadership section exists
                    if ($('.leadership')) {
                        this.components.tabs = new Tabs($('.leadership'));
                        console.log('Tabs initialized on programs page');
                    }
                    break;
                    
                case 'events':
                    // Initialize Events component on events page
                    if ($('.event-card') || $('.events-section') || $('.filter-btn')) {
                        this.components.events = new Events();
                        console.log('Events initialized on events page');
                    }
                    break;
                    
                case 'index':
                    // Homepage specific components
                    this.initHomepageComponents();
                    
                    // Also check if events exist on homepage
                    if ($('.event-card') || $('.events-section')) {
                        this.components.events = new Events();
                        console.log('Events initialized on homepage');
                    }
                    break;
            }
        } catch (error) {
            console.warn(`Component initialization failed for ${page}:`, error);
            // Don't throw - allow app to continue
        }
    }
    
    initHomepageComponents() {
        // Initialize stats animation
        this.initStatsAnimation();
        
        // Initialize hero animations
        this.initHeroAnimations();
        
        // Initialize program preview interactions
        this.initProgramPreviews();
    }
    
    initUtilityComponents() {
        // Initialize back to top button
        this.initBackToTop();
        
        // Initialize external link handler
        this.initExternalLinks();
        
        // Initialize print styles
        this.initPrintStyles();
        
        // Initialize theme handler (if needed in future)
        this.initThemeHandler();
    }
    
    initPerformance() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Defer non-critical CSS
        this.deferNonCriticalCSS();
        
        // Optimize images
        this.optimizeImages();
        
        // Initialize performance monitoring
        this.initPerformanceMonitoring();
    }
    
    initAnalytics() {
        // Initialize Google Analytics (if available)
        this.initGoogleAnalytics();
        
        // Initialize custom event tracking
        this.initEventTracking();
        
        // Initialize performance analytics
        this.initPerformanceAnalytics();
    }
    
    initServiceWorker() {
        // Register service worker for PWA capabilities
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
                try {
                    const registration = await navigator.serviceWorker.register('../sw.js');
                    console.log('ServiceWorker registered: ', registration);
                    
                    // Track service worker registration
                    this.trackEvent('service_worker', 'registered');
                } catch (error) {
                    console.log('ServiceWorker registration failed: ', error);
                    this.trackEvent('service_worker', 'registration_failed');
                }
            });
        }
    }
    
    initErrorHandling() {
        // Global error handler for AJAX requests
        this.initAjaxErrorHandling();
        
        // Error boundary for components
        this.initErrorBoundaries();
        
        // Offline detection
        this.initOfflineDetection();
    }
    
    // Core functionality methods
    initResponsiveBehavior() {
        const updateBreakpoint = debounce(() => {
            const newBreakpoint = getCurrentBreakpoint();
            if (newBreakpoint !== this.currentBreakpoint) {
                this.currentBreakpoint = newBreakpoint;
                this.handleBreakpointChange(newBreakpoint);
            }
        }, 100);
        
        window.addEventListener('resize', updateBreakpoint);
        window.addEventListener('orientationchange', updateBreakpoint);
    }
    
    handleBreakpointChange(breakpoint) {
        // Update CSS custom property for breakpoint
        document.documentElement.style.setProperty('--current-breakpoint', breakpoint);
        
        // Dispatch breakpoint change event
        const event = new CustomEvent('breakpointChange', {
            detail: { breakpoint }
        });
        window.dispatchEvent(event);
        
        console.log(`Breakpoint changed to: ${breakpoint}`);
    }
    
    initSmoothScrolling() {
        // Handle anchor links with smooth scrolling
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = $('.header').offsetHeight || 80;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without page reload
                    if (history.pushState) {
                        history.pushState(null, null, `#${targetId}`);
                    }
                }
            }
        });
    }
    
    initLazyLoading() {
        // Lazy load images that are not in viewport
        const lazyImages = $$('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.classList.add('fade-in');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    initScrollAnimations() {
        // Animate elements when they come into view
        const animatedElements = $$('.animate-on-scroll');
        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        animatedElements.forEach(el => animationObserver.observe(el));
    }
    
    initKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in an input
            if (e.target.matches('input, textarea, select')) return;
            
            switch (e.key) {
                case 'Escape':
                    // Close modals or menus
                    this.handleEscapeKey();
                    break;
                case 'Tab':
                    // Enhanced tab navigation
                    this.handleTabKey(e);
                    break;
            }
        });
    }
    
    handleEscapeKey() {
        // Close any open modals, dropdowns, or lightboxes
        const openModals = $$('.modal.open, .lightbox.active, .dropdown.open');
        openModals.forEach(modal => {
            modal.classList.remove('open', 'active');
        });
        
        // Close mobile navigation
        const mobileNav = $('.nav__menu.active');
        if (mobileNav) {
            mobileNav.classList.remove('active');
        }
    }
    
    handleTabKey(e) {
        // Add focus styles for keyboard navigation
        document.documentElement.classList.add('keyboard-navigation');
        
        // Remove focus styles when mouse is used
        const handleMouse = () => {
            document.documentElement.classList.remove('keyboard-navigation');
            document.removeEventListener('mousedown', handleMouse);
        };
        
        document.addEventListener('mousedown', handleMouse);
    }
    
    // Homepage specific methods
    initStatsAnimation() {
        const stats = $$('.stat__number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    this.animateNumber(entry.target, target, 8000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        stats.forEach(stat => observer.observe(stat));
    }
    
    animateNumber(element, target, duration = 8000) {
        const start = parseInt(element.textContent) || 0;
        const increment = target > start ? 1 : -1;
        const steps = Math.abs(target - start);
        const stepDuration = duration / steps;
        
        let current = start;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current.toLocaleString();
            
            if (current === target) {
                clearInterval(timer);
            }
        }, stepDuration);
    }
    
    initHeroAnimations() {
        // Add parallax effect to hero image
        const heroImage = $('.hero__img');
        if (heroImage) {
            window.addEventListener('scroll', debounce(() => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                heroImage.style.transform = `translateY(${rate}px)`;
            }, 10));
        }
    }
    
    initProgramPreviews() {
        // Add hover effects to program cards
        const programCards = $$('.program__card');
        programCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('program__card--hover');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('program__card--hover');
            });
        });
    }
    
    // Utility component methods
    initBackToTop() {
        // Create back to top button
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
        backToTop.setAttribute('aria-label', 'Back to top');
        backToTop.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(backToTop);
        
        // Show/hide based on scroll position
        window.addEventListener('scroll', debounce(() => {
            if (window.pageYOffset > 300) {
                backToTop.style.opacity = '1';
                backToTop.style.visibility = 'visible';
            } else {
                backToTop.style.opacity = '0';
                backToTop.style.visibility = 'hidden';
            }
        }, 100));
        
        // Scroll to top when clicked
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    initExternalLinks() {
        // Add external link indicators and security attributes
        const externalLinks = $$('a[href^="http"]');
        externalLinks.forEach(link => {
            if (!link.href.includes(window.location.hostname)) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                
                // Add external link icon
                const icon = document.createElement('i');
                icon.className = 'fas fa-external-link-alt';
                icon.style.marginLeft = '0.25rem';
                link.appendChild(icon);
            }
        });
    }
    
    initPrintStyles() {
        // Add print-specific functionality
        window.addEventListener('beforeprint', () => {
            document.body.classList.add('printing');
        });
        
        window.addEventListener('afterprint', () => {
            document.body.classList.remove('printing');
        });
    }
    
    initThemeHandler() {
        // Handle dark/light theme preferences
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        const setTheme = (isDark) => {
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        };
        
        // Set initial theme
        setTheme(prefersDark.matches);
        
        // Listen for theme changes
        prefersDark.addEventListener('change', (e) => {
            setTheme(e.matches);
        });
    }
    
    // Performance methods
    preloadCriticalResources() {
        // Preload critical images
        const criticalImages = $$('img[data-critical]');
        criticalImages.forEach(img => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.src;
            document.head.appendChild(link);
        });
    }
    
    deferNonCriticalCSS() {
        // Move non-critical CSS to bottom
        const nonCriticalLinks = $$('link[rel="stylesheet"][media="print"]');
        nonCriticalLinks.forEach(link => {
            link.onload = () => {
                link.media = 'all';
            };
        });
    }
    
    optimizeImages() {
        // Convert images to WebP if supported
        if (this.supportsWebP()) {
            const images = $$('img[data-webp]');
            images.forEach(img => {
                const webpSrc = img.getAttribute('data-webp');
                if (webpSrc) {
                    img.src = webpSrc;
                }
            });
        }
    }
    
    supportsWebP() {
        return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    
    initPerformanceMonitoring() {
        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log(`${entry.name}: ${entry.value}`);
                    this.trackPerformance(entry.name, entry.value);
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        }
    }
    
    // Analytics methods
    initGoogleAnalytics() {
        // Initialize GA4 if available
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    }
    
    initEventTracking() {
        // Track custom events
        document.addEventListener('click', (e) => {
            const trackable = e.target.closest('[data-track]');
            if (trackable) {
                const event = trackable.getAttribute('data-track');
                this.trackEvent('engagement', event);
            }
        });
    }
    
    initPerformanceAnalytics() {
        // Track page load performance
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.trackPerformance('page_load', loadTime);
        });
    }
    
    // Error handling methods
    initAjaxErrorHandling() {
        // Override fetch to handle errors globally
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response;
            } catch (error) {
                this.handleNetworkError(error);
                throw error;
            }
        };
    }
    
    initErrorBoundaries() {
        // Error boundary for components
        window.addEventListener('error', (e) => {
            const target = e.target;
            if (target.tagName === 'IMG') {
                target.src = '/images/placeholder.jpg';
                target.alt = 'Image not available';
            }
        }, true);
    }
    
    initOfflineDetection() {
        // Handle offline/online status
        window.addEventListener('online', () => {
            showNotification('Connection restored', 'success', 3000);
            document.documentElement.classList.remove('offline');
        });
        
        window.addEventListener('offline', () => {
            showNotification('You are currently offline', 'warning', 5000);
            document.documentElement.classList.add('offline');
        });
    }
    
    // Utility methods
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        
        if (page === 'index.html' || page === '') return 'index';
        if (page === 'about.html') return 'about';
        if (page === 'contact.html') return 'contact';
        if (page === 'donate.html') return 'donate';
        if (page === 'gallery.html') return 'gallery';
        if (page === 'programs.html') return 'programs';
        if (page === 'events.html') return 'events'; // Added events page detection
        
        return 'index';
    }
    
    handleGlobalError(error) {
        console.error('Global error:', error);
        this.trackEvent('error', 'global', error.message);
    }
    
    handlePromiseRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        this.trackEvent('error', 'promise_rejection', event.reason?.message);
    }
    
    handleNetworkError(error) {
        console.error('Network error:', error);
        this.trackEvent('error', 'network', error.message);
    }
    
    showErrorState() {
        // Show user-friendly error message
        const errorElement = document.createElement('div');
        errorElement.className = 'app-error';
        errorElement.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; margin: 1rem;">
                <h3 style="color: #dc2626;">Something went wrong</h3>
                <p style="color: #7f1d1d;">We're having trouble loading the application. Please refresh the page.</p>
                <button onclick="window.location.reload()" class="btn btn--primary">Refresh Page</button>
            </div>
        `;
        
        document.body.prepend(errorElement);
    }
    
    trackEvent(category, action, label = '') {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
        
        console.log(`Event tracked: ${category}.${action}`, label);
    }
    
    trackPerformance(metric, value) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance', {
                event_category: 'performance',
                event_label: metric,
                value: Math.round(value)
            });
        }
    }
    
    dispatchAppReadyEvent() {
        const event = new CustomEvent('fodasuAppReady', {
            detail: {
                version: '1.0.0',
                components: Object.keys(this.components),
                breakpoint: this.currentBreakpoint
            }
        });
        
        document.dispatchEvent(event);
        console.log('FODASU App Ready event dispatched');
    }
    
    // Public API methods
    getComponent(name) {
        return this.components[name];
    }
    
    getCurrentBreakpoint() {
        return this.currentBreakpoint;
    }
    
    showNotification(message, type = 'info', duration = 5000) {
        showNotification(message, type, duration);
    }
    
    // Cleanup method
    destroy() {
        // Clean up all components
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        this.components = {};
        this.isInitialized = false;
        
        console.log('FODASU App destroyed');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.fodasuApp = new FODASUApp();
    
    // Make app available for debugging
    if (process.env.NODE_ENV === 'development') {
        console.log('FODASU App initialized in development mode');
    }
});

// Export for module usage
export default FODASUApp;