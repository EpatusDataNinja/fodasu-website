// ===== EVENTS COMPONENT =====
import { $, $$, debounce, showNotification } from './utils/helpers.js';

class Events {
    constructor() {
        this.filterButtons = $$('.filter-btn');
        this.eventCards = $$('.event-card');
        this.calendarDays = $$('.event-day');
        this.loadMoreBtn = $('.load-more-btn');
        
        this.currentFilter = 'all';
        this.visibleEvents = 6; // Initial number of events to show
        this.allEvents = [];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initFiltering();
        this.initCalendarInteractions();
        this.initEventCounters();
    }
    
    bindEvents() {
        // Filter buttons
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterClick(e));
        });
        
        // Calendar day clicks
        this.calendarDays.forEach(day => {
            day.addEventListener('click', () => this.handleCalendarDayClick(day));
        });
        
        // Register buttons
        const registerButtons = $$('.event-actions .btn--primary');
        registerButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleRegisterClick(e));
        });
        
        // Load more button
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => this.loadMoreEvents());
        }
        
        // Handle window resize
        window.addEventListener('resize', debounce(() => this.handleResize(), 250));
        
        // Initialize event counters animation
        this.initCounterAnimations();
    }
    
    initFiltering() {
        // Collect all events
        this.allEvents = Array.from(this.eventCards);
        
        // Show all events initially
        this.filterEvents('all');
    }
    
    initCalendarInteractions() {
        // Add tooltips to calendar event days
        this.calendarDays.forEach(day => {
            const eventType = day.getAttribute('data-event');
            if (eventType) {
                this.addCalendarTooltip(day, eventType);
            }
        });
    }
    
    initEventCounters() {
        // Initialize statistics counters
        const stats = $$('.stat-number');
        stats.forEach(stat => {
            const target = parseInt(stat.textContent);
            this.animateCounter(stat, target, 15000);
        });
    }
    
    handleFilterClick(e) {
        const button = e.currentTarget;
        const filter = button.getAttribute('data-filter');
        
        // Update active filter button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Apply filter
        this.currentFilter = filter;
        this.filterEvents(filter);
        
        // Reset visible events count when filtering
        this.visibleEvents = 6;
        this.updateLoadMoreButton();
        
        // Scroll to events section
        this.scrollToEvents();
    }
    
    filterEvents(filter) {
        let eventsToShow;
        
        if (filter === 'all') {
            eventsToShow = this.allEvents;
        } else if (filter === 'upcoming') {
            eventsToShow = this.allEvents.filter(event => 
                !event.classList.contains('past')
            );
        } else if (filter === 'past') {
            eventsToShow = this.allEvents.filter(event => 
                event.classList.contains('past')
            );
        } else {
            eventsToShow = this.allEvents.filter(event => 
                event.getAttribute('data-category') === filter
            );
        }
        
        // Hide all events first
        this.allEvents.forEach(event => {
            event.style.display = 'none';
            event.classList.remove('visible');
        });
        
        // Show filtered events (up to visibleEvents count)
        eventsToShow.slice(0, this.visibleEvents).forEach((event, index) => {
            event.style.display = 'block';
            setTimeout(() => {
                event.classList.add('visible');
                this.animateEventCard(event, index);
            }, index * 100);
        });
        
        // Show message if no events found
        this.showNoEventsMessage(eventsToShow.length === 0);
    }
    
    animateEventCard(card, index) {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animated');
    }
    
    showNoEventsMessage(show) {
        let message = $('.events-empty');
        
        if (show && !message) {
            message = document.createElement('div');
            message.className = 'events-empty';
            message.innerHTML = `
                <i class="fas fa-calendar-times"></i>
                <h3>No Events Found</h3>
                <p>Try selecting a different category or check back later for new events.</p>
                <a href="contact.html" class="btn btn--primary">Suggest an Event</a>
            `;
            
            const eventsSection = $('.upcoming-events') || $('.past-events');
            if (eventsSection) {
                eventsSection.appendChild(message);
            }
        } else if (!show && message) {
            message.remove();
        }
    }
    
    handleCalendarDayClick(day) {
        const eventType = day.getAttribute('data-event');
        if (!eventType) return;
        
        // Filter events based on calendar click
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        
        let filter;
        switch (eventType) {
            case 'athletics-competition':
                filter = 'athletics';
                break;
            case 'soccer-tournament':
                filter = 'soccer';
                break;
            default:
                filter = 'all';
        }
        
        // Find and activate the corresponding filter button
        const correspondingButton = Array.from(this.filterButtons).find(btn => 
            btn.getAttribute('data-filter') === filter
        );
        
        if (correspondingButton) {
            correspondingButton.classList.add('active');
            this.currentFilter = filter;
            this.filterEvents(filter);
            this.scrollToEvents();
        }
        
        // Show notification
        showNotification(`Showing ${filter} events`, 'info', 3000);
    }
    
    addCalendarTooltip(day, eventType) {
        let tooltipText = '';
        
        switch (eventType) {
            case 'athletics-competition':
                tooltipText = 'Annual Athletics Competition';
                break;
            case 'soccer-tournament':
                tooltipText = 'Inter-School Soccer Tournament';
                break;
            default:
                tooltipText = 'FODASU Event';
        }
        
        day.setAttribute('title', tooltipText);
        
        // Add hover effect
        day.addEventListener('mouseenter', () => {
            day.style.backgroundColor = 'var(--primary-color)';
            day.style.color = 'var(--white)';
        });
        
        day.addEventListener('mouseleave', () => {
            day.style.backgroundColor = '';
            day.style.color = '';
        });
    }
    
    handleRegisterClick(e) {
        e.preventDefault();
        const button = e.currentTarget;
        const eventCard = button.closest('.event-card');
        const eventTitle = eventCard.querySelector('h3').textContent;
        
        // Show registration modal or redirect to contact page
        showNotification(`Registration for "${eventTitle}" would open here`, 'info', 4000);
        
        // In a real implementation, you might:
        // 1. Open a registration modal
        // 2. Redirect to a registration form
        // 3. Show more details about the event
        
        // Track registration attempt
        this.trackEvent('event_registration', eventTitle);
    }
    
    loadMoreEvents() {
        this.visibleEvents += 6;
        this.filterEvents(this.currentFilter);
        this.updateLoadMoreButton();
        
        // Smooth scroll to new events
        this.scrollToNewEvents();
    }
    
    updateLoadMoreButton() {
        if (!this.loadMoreBtn) return;
        
        const filteredEvents = this.getFilteredEvents();
        
        if (this.visibleEvents >= filteredEvents.length) {
            this.loadMoreBtn.style.display = 'none';
        } else {
            this.loadMoreBtn.style.display = 'block';
            this.loadMoreBtn.textContent = `Load More Events (${filteredEvents.length - this.visibleEvents} remaining)`;
        }
    }
    
    getFilteredEvents() {
        switch (this.currentFilter) {
            case 'all':
                return this.allEvents;
            case 'upcoming':
                return this.allEvents.filter(event => !event.classList.contains('past'));
            case 'past':
                return this.allEvents.filter(event => event.classList.contains('past'));
            default:
                return this.allEvents.filter(event => 
                    event.getAttribute('data-category') === this.currentFilter
                );
        }
    }
    
    scrollToNewEvents() {
        const newEvents = $$('.event-card.visible');
        if (newEvents.length > 0) {
            const lastEvent = newEvents[newEvents.length - 1];
            lastEvent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    scrollToEvents() {
        const eventsSection = $('.upcoming-events') || $('.events-section');
        if (eventsSection) {
            eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    initCounterAnimations() {
        const counters = $$('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.textContent);
                    this.animateCounter(entry.target, target, 15000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        
        counters.forEach(counter => observer.observe(counter));
    }
    
    animateCounter(element, target, duration = 15000) {
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
    
    handleResize() {
        // Adjust layout for mobile
        if (window.innerWidth < 768) {
            this.adjustMobileLayout();
        }
    }
    
    adjustMobileLayout() {
        // Adjust event actions for mobile
        const eventActions = $$('.event-actions');
        eventActions.forEach(actions => {
            if (actions.children.length > 1) {
                actions.style.flexDirection = 'column';
            }
        });
    }
    
    trackEvent(action, label) {
        // Track event interactions (for analytics)
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'events',
                event_label: label
            });
        }
        
        console.log(`Event tracked: ${action} - ${label}`);
    }
    
    // Method to add new events dynamically
    addEvent(eventData) {
        const eventCard = document.createElement('div');
        eventCard.className = `event-card ${eventData.past ? 'past' : ''}`;
        eventCard.setAttribute('data-category', eventData.category);
        
        eventCard.innerHTML = `
            <div class="event-date ${eventData.past ? 'past' : ''}">
                <div class="date-day">${eventData.day}</div>
                <div class="date-month">${eventData.month}</div>
                <div class="date-year">${eventData.year}</div>
            </div>
            <div class="event-image">
                <img src="${eventData.image}" alt="${eventData.title}">
                <span class="event-category ${eventData.category}">${eventData.category}</span>
            </div>
            <div class="event-content">
                <h3>${eventData.title}</h3>
                <div class="event-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${eventData.date}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${eventData.location}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-users"></i>
                        <span>${eventData.participants}</span>
                    </div>
                </div>
                <p>${eventData.description}</p>
                <div class="event-actions">
                    <a href="#" class="btn btn--primary">Register Now</a>
                    <a href="#" class="btn btn--outline">Learn More</a>
                </div>
            </div>
        `;
        
        // Add to DOM and arrays
        const eventsGrid = $('.events-grid');
        if (eventsGrid) {
            eventsGrid.appendChild(eventCard);
            this.allEvents.push(eventCard);
            this.bindEventCardEvents(eventCard);
        }
        
        // Re-apply current filter
        this.filterEvents(this.currentFilter);
    }
    
    bindEventCardEvents(card) {
        const registerBtn = card.querySelector('.btn--primary');
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => this.handleRegisterClick(e));
        }
    }
    
    // Method to search events
    searchEvents(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filterEvents(this.currentFilter);
            return;
        }
        
        const filteredEvents = this.allEvents.filter(event => {
            const title = event.querySelector('h3').textContent.toLowerCase();
            const description = event.querySelector('p').textContent.toLowerCase();
            const location = event.querySelector('.meta-item:nth-child(2) span').textContent.toLowerCase();
            const category = event.getAttribute('data-category').toLowerCase();
            
            return title.includes(searchTerm) || 
                   description.includes(searchTerm) || 
                   location.includes(searchTerm) ||
                   category.includes(searchTerm);
        });
        
        // Show/hide events based on search
        this.allEvents.forEach(event => {
            event.style.display = 'none';
            event.classList.remove('visible');
        });
        
        filteredEvents.slice(0, this.visibleEvents).forEach(event => {
            event.style.display = 'block';
            setTimeout(() => event.classList.add('visible'), 100);
        });
        
        this.showNoEventsMessage(filteredEvents.length === 0);
    }
    
    // Destroy method for cleanup
    destroy() {
        this.filterButtons.forEach(button => {
            button.removeEventListener('click', this.handleFilterClick);
        });
        
        this.calendarDays.forEach(day => {
            day.removeEventListener('click', this.handleCalendarDayClick);
        });
        
        const registerButtons = $$('.event-actions .btn--primary');
        registerButtons.forEach(button => {
            button.removeEventListener('click', this.handleRegisterClick);
        });
        
        if (this.loadMoreBtn) {
            this.loadMoreBtn.removeEventListener('click', this.loadMoreEvents);
        }
        
        window.removeEventListener('resize', this.handleResize);
    }
}

// Initialize events when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Events();
});

export default Events;



