// ===== PROGRAM NAVIGATION COMPONENT (Fixed — No Reload, Stable) =====

class ProgramNavigation {
    constructor() {
        // Prevent multiple initializations
        if (window.__program_nav_initialized__) return;
        window.__program_nav_initialized__ = true;

        this.programLinks = document.querySelectorAll('.program-nav__link');
        this.programSections = document.querySelectorAll('.program-section');
        this.isHandlingHashChange = false;

        console.log('ProgramNavigation initializing...');
        this.init();
    }

    init() {
        if (this.programLinks.length === 0 || this.programSections.length === 0) {
            console.error('ProgramNavigation: Required elements not found.');
            return;
        }

        this.bindEvents();
        this.handleInitialLoad();

        console.log('ProgramNavigation initialized successfully.');
    }

    bindEvents() {
        // Handle clicks on the navigation links
        this.programLinks.forEach(link => {
            link.addEventListener('click', e => this.handleProgramClick(e));
        });

        // Handle browser back/forward navigation (hash changes)
        window.addEventListener('hashchange', () => {
            if (this.isHandlingHashChange) return;

            const programId = window.location.hash.replace('#', '');
            if (!['athletics', 'soccer', 'academics'].includes(programId)) return;

            this.isHandlingHashChange = true;
            requestAnimationFrame(() => {
                this.switchProgram(programId, false);
                this.isHandlingHashChange = false;
            });
        });
    }

    handleProgramClick(e) {
        e.preventDefault();

        const link = e.currentTarget;
        const programId = link.getAttribute('data-program');
        const currentHash = window.location.hash.replace('#', '');

        // If already on this section, just scroll — no hash update
        if (currentHash === programId) {
            this.switchProgram(programId, true);
            return;
        }

        // Avoid full reload by updating history state, not hash directly
        this.isHandlingHashChange = true;
        history.replaceState(null, '', `#${programId}`);
        this.switchProgram(programId, true);
        setTimeout(() => (this.isHandlingHashChange = false), 100);
    }

    getScrollOffset() {
        const header = document.querySelector('.header');
        const programsNav = document.querySelector('.programs-nav');
        const headerHeight = header ? header.offsetHeight : 80;
        const navHeight = programsNav ? programsNav.offsetHeight : 0;
        return headerHeight + navHeight + 20;
    }

    smoothScrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    switchProgram(programId, scrollToSection = true) {
        console.log(`Switching to program: ${programId}`);

        // Update active link
        this.programLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-program') === programId);
        });

        // Show selected section, hide others
        this.programSections.forEach(section => {
            const isActive = section.id === programId;
            section.style.display = isActive ? 'block' : 'none';
            section.classList.toggle('active', isActive);

            if (isActive && scrollToSection) {
                setTimeout(() => {
                    const headerEl = section.querySelector('.program__header');
                    if (headerEl) {
                        this.smoothScrollToElement(headerEl, this.getScrollOffset());
                    }
                }, 100);
            }
        });
    }

    handleInitialLoad() {
        // Hide all except the one marked active
        this.programSections.forEach(section => {
            if (!section.classList.contains('active')) section.style.display = 'none';
        });

        const hash = window.location.hash.replace('#', '');
        if (['athletics', 'soccer', 'academics'].includes(hash)) {
            this.isHandlingHashChange = true;
            this.switchProgram(hash, true);
            setTimeout(() => (this.isHandlingHashChange = false), 100);
        }
    }
}

// Initialize safely once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProgramNavigation();
});

export default ProgramNavigation;
