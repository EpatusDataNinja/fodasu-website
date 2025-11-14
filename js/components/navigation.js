// ===== NAVIGATION COMPONENT =====
import { $, $$, debounce, isMobile } from './utils/helpers.js';

class Navigation {
    constructor() {
        this.header = $('.header');
        this.nav = $('.nav');
        this.navMenu = $('#nav-menu');
        this.navToggle = $('#nav-toggle');
        this.navLinks = $$('.nav__link');
        this.currentSection = '';
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.handleScroll();
        this.setActiveLink();
    }
    
    bindEvents() {
        // Toggle mobile menu
        if (this.navToggle) {
            // Use both click and touchend for better mobile support
            this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
            this.navToggle.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
            // Prevent text selection on long press
            this.navToggle.addEventListener('touchstart', (e) => {
                e.preventDefault();
            }, { passive: false });
        }
        
        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });
        
        // Handle scroll events with debounce
        window.addEventListener('scroll', debounce(() => this.handleScroll()));
        
        // Handle resize events
        window.addEventListener('resize', debounce(() => this.handleResize()));
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }
    
    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.navToggle.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        
        // UPDATE HAMBURGER ICON
        const icon = this.navToggle.querySelector('i');
        if (this.navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
    
    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
        document.body.classList.remove('no-scroll');
        
        // RESET HAMBURGER ICON TO BARS
        const icon = this.navToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        
        // Add/remove scrolled class to header
        if (scrollY > 100) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
        
        // Update active navigation link based on scroll position
        this.updateActiveLink();
    }
    
    updateActiveLink() {
        const sections = $$('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                this.setActiveNavLink(sectionId);
            }
        });
    }
    
    setActiveNavLink(sectionId) {
        // Remove active class from all links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current section link
        const activeLink = $(`.nav__link[href*="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    setActiveLink() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // Remove active class from all links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current page link
        const activeLink = $(`.nav__link[href="${currentPage}"]`) || 
                          $(`.nav__link[href="./${currentPage}"]`);
        
        if (activeLink) {
            activeLink.classList.add('active');
        } else if (currentPage === 'index.html' || currentPage === '') {
            // Home page
            const homeLink = $('.nav__link[href="index.html"]');
            if (homeLink) homeLink.classList.add('active');
        }
    }
    
    handleResize() {
        // Close mobile menu when resizing to desktop
        if (!isMobile() && this.navMenu.classList.contains('active')) {
            this.closeMobileMenu();
        }
    }
    
    handleOutsideClick(e) {
        if (!this.nav.contains(e.target) && this.navMenu.classList.contains('active')) {
            this.closeMobileMenu();
        }
    }
    
    // Smooth scroll to section
    scrollToSection(sectionId) {
        const section = $(sectionId);
        if (section) {
            const headerHeight = this.header.offsetHeight;
            const sectionTop = section.offsetTop - headerHeight;
            
            window.scrollTo({
                top: sectionTop,
                behavior: 'smooth'
            });
        }
    }
    
    // Update navigation based on authentication (if needed in future)
    updateAuthState(isAuthenticated) {
        // This can be extended for user authentication
        if (isAuthenticated) {
            this.nav.classList.add('authenticated');
        } else {
            this.nav.classList.remove('authenticated');
        }
    }
    
    // Add dropdown functionality (if needed)
    initDropdowns() {
        const dropdowns = $$('.nav__dropdown');
        
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.nav__link');
            const content = dropdown.querySelector('.nav__dropdown-content');
            
            if (trigger && content) {
                trigger.addEventListener('click', (e) => {
                    if (isMobile()) {
                        e.preventDefault();
                        content.classList.toggle('active');
                    }
                });
                
                // Desktop hover
                if (!isMobile()) {
                    dropdown.addEventListener('mouseenter', () => {
                        content.classList.add('active');
                    });
                    
                    dropdown.addEventListener('mouseleave', () => {
                        content.classList.remove('active');
                    });
                }
            }
        });
    }
    
    // Destroy method for cleanup
    destroy() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('click', this.handleOutsideClick);
        
        if (this.navToggle) {
            this.navToggle.removeEventListener('click', this.toggleMobileMenu);
        }
        
        this.navLinks.forEach(link => {
            link.removeEventListener('click', this.closeMobileMenu);
        });
    }
}

export default Navigation;