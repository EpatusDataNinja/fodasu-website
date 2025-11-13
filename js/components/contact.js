// ===== CONTACT COMPONENT =====
import { $, $$, showNotification, formatPhoneNumber } from './utils/helpers.js';

class Contact {
    constructor() {
        this.contactForm = $('#contactForm');
        this.contactInfo = $$('.contact-card');
        this.faqItems = $$('.faq-item');
        this.leaderContacts = $$('.leader-contact');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initFAQ();
        this.initContactInteractions();
        this.formatPhoneNumbers();
    }
    
    bindEvents() {
        // Contact form specific handling
        if (this.contactForm) {
            this.contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }
        
        // Contact info card interactions
        this.contactInfo.forEach(card => {
            card.addEventListener('click', () => this.handleContactCardClick(card));
        });
        
        // Leader contact interactions
        this.leaderContacts.forEach(contact => {
            contact.addEventListener('click', () => this.handleLeaderContactClick(contact));
        });
    }
    
    initFAQ() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                this.toggleFAQ(item);
            });
            
            // Add keyboard support
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleFAQ(item);
                }
            });
        });
    }
    
    toggleFAQ(item) {
        const isActive = item.classList.contains('active');
        
        // Close all other FAQs
        this.faqItems.forEach(faq => {
            if (faq !== item) {
                faq.classList.remove('active');
            }
        });
        
        // Toggle current FAQ
        item.classList.toggle('active');
        
        // Update ARIA attributes
        const button = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (item.classList.contains('active')) {
            button.setAttribute('aria-expanded', 'true');
            answer.setAttribute('aria-hidden', 'false');
        } else {
            button.setAttribute('aria-expanded', 'false');
            answer.setAttribute('aria-hidden', 'true');
        }
    }
    
    initContactInteractions() {
        // Add click-to-copy functionality for phone numbers
        const phoneElements = $$('.contact-info, .leader-contact .contact-info');
        
        phoneElements.forEach(element => {
            const phoneText = element.textContent;
            if (phoneText.match(/\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}/)) {
                element.style.cursor = 'pointer';
                element.title = 'Click to copy phone number';
                
                element.addEventListener('click', () => {
                    this.copyToClipboard(phoneText.trim());
                    showNotification('Phone number copied to clipboard!', 'success', 2000);
                });
            }
        });
        
        // Add click-to-email functionality for email addresses
        const emailElements = $$('.contact-info:contains("@")');
        
        emailElements.forEach(element => {
            const emailText = element.textContent;
            if (emailText.includes('@')) {
                element.style.cursor = 'pointer';
                element.title = 'Click to send email';
                
                element.addEventListener('click', () => {
                    window.location.href = `mailto:${emailText.trim()}`;
                });
            }
        });
    }
    
    formatPhoneNumbers() {
        const phoneElements = $$('p:contains("0776"), p:contains("0886"), p:contains("0775"), p:contains("0770")');
        
        phoneElements.forEach(element => {
            const text = element.textContent;
            const phoneMatch = text.match(/(\d{3,4})\s?[-\.]?\s?(\d{3})\s?[-\.]?\s?(\d{3,4})/);
            
            if (phoneMatch) {
                const formatted = formatPhoneNumber(phoneMatch[0]);
                element.textContent = text.replace(phoneMatch[0], formatted);
            }
        });
    }
    
    async handleContactSubmit(e) {
        // Let the Forms component handle most of the submission
        // This method adds contact-specific logic
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Add timestamp
        formData.append('submission_time', new Date().toISOString());
        
        // Add page information
        formData.append('page_url', window.location.href);
        formData.append('user_agent', navigator.userAgent);
        
        // You can add additional contact-specific validation here
        const subject = formData.get('subject');
        if (subject === 'Other' && !formData.get('other_subject')) {
            e.preventDefault();
            showNotification('Please specify your subject for "Other"', 'error');
            return;
        }
        
        // If you need to do something specific for contact form before submission
        console.log('Contact form submission:', Object.fromEntries(formData));
    }
    
    handleContactCardClick(card) {
        // Add visual feedback when contact card is clicked
        card.classList.add('contact-card--active');
        
        setTimeout(() => {
            card.classList.remove('contact-card--active');
        }, 300);
        
        // You can add specific actions based on card type
        const title = card.querySelector('h3').textContent;
        
        switch (title) {
            case 'Our Location':
                this.showLocationMap();
                break;
            case 'Phone Numbers':
                this.showPhoneOptions(card);
                break;
            case 'Email Address':
                this.composeEmail(card);
                break;
            case 'Office Hours':
                this.showOfficeHours();
                break;
        }
    }
    
    handleLeaderContactClick(contact) {
        // Add visual feedback
        contact.classList.add('leader-contact--active');
        
        setTimeout(() => {
            contact.classList.remove('leader-contact--active');
        }, 300);
        
        // Extract leader information
        const name = contact.querySelector('h3').textContent;
        const position = contact.querySelector('.position').textContent;
        const contactInfo = contact.querySelector('.contact-info').textContent;
        
        console.log(`Contacting ${name} - ${position}`, contactInfo);
        
        // You could open a contact modal or initiate a call/email
        this.showLeaderContactOptions(name, position, contactInfo);
    }
    
    showLocationMap() {
        // This would open a modal with a map in a real implementation
        showNotification('Opening location map...', 'info', 2000);
        
        // For now, just scroll to map section if it exists
        const mapSection = $('#mapSection');
        if (mapSection) {
            mapSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    showPhoneOptions(card) {
        const phoneNumbers = card.querySelector('p').textContent.split('\n');
        
        if (phoneNumbers.length > 1) {
            // Create a simple modal or dropdown for phone number selection
            const options = phoneNumbers.map(number => {
                const cleanNumber = number.replace(/\D/g, '');
                return {
                    display: number.trim(),
                    value: cleanNumber
                };
            }).filter(option => option.value.length >= 10);
            
            this.showPhoneSelectionModal(options);
        }
    }
    
    showPhoneSelectionModal(options) {
        // Create a simple modal for phone number selection
        const modal = document.createElement('div');
        modal.className = 'phone-selection-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            max-width: 400px;
            width: 90%;
        `;
        
        modalContent.innerHTML = `
            <h3>Select Phone Number</h3>
            <div class="phone-options">
                ${options.map(option => `
                    <button class="phone-option" data-number="${option.value}">
                        ${option.display}
                    </button>
                `).join('')}
            </div>
            <button class="btn-close-modal" style="margin-top: 1rem; width: 100%;">Cancel</button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelectorAll('.phone-option').forEach(button => {
            button.addEventListener('click', () => {
                const number = button.getAttribute('data-number');
                window.location.href = `tel:${number}`;
                modal.remove();
            });
        });
        
        modal.querySelector('.btn-close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    composeEmail(card) {
        const email = card.querySelector('p').textContent.trim();
        window.location.href = `mailto:${email}?subject=Inquiry from FODASU Website`;
    }
    
    showOfficeHours() {
        const hours = $('.contact-card:nth-child(4) p').textContent;
        showNotification(`Office Hours: ${hours}`, 'info', 4000);
    }
    
    showLeaderContactOptions(name, position, contactInfo) {
        const options = [];
        
        // Extract phone numbers
        const phoneMatches = contactInfo.match(/\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}/g);
        if (phoneMatches) {
            phoneMatches.forEach(phone => {
                options.push({
                    type: 'phone',
                    label: `Call ${phone}`,
                    action: `tel:${phone.replace(/\D/g, '')}`
                });
            });
        }
        
        // Extract email
        const emailMatch = contactInfo.match(/\S+@\S+\.\S+/);
        if (emailMatch) {
            options.push({
                type: 'email',
                label: `Email ${emailMatch[0]}`,
                action: `mailto:${emailMatch[0]}?subject=Contacting ${name} - ${position}`
            });
        }
        
        if (options.length > 0) {
            this.showContactActionModal(name, position, options);
        }
    }
    
    showContactActionModal(name, position, options) {
        const modal = document.createElement('div');
        modal.className = 'contact-action-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            max-width: 400px;
            width: 90%;
        `;
        
        modalContent.innerHTML = `
            <h3>Contact ${name}</h3>
            <p style="color: #6b7280; margin-bottom: 1rem;">${position}</p>
            <div class="contact-options">
                ${options.map(option => `
                    <button class="contact-option contact-option--${option.type}" 
                            onclick="window.location.href='${option.action}'">
                        ${option.label}
                    </button>
                `).join('')}
            </div>
            <button class="btn-close-modal" style="margin-top: 1rem; width: 100%;">Cancel</button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close modal
        modal.querySelector('.btn-close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }
    
    // Method to initialize map (if added later)
    initMap() {
        // This would initialize Google Maps or similar service
        console.log('Initializing contact map...');
    }
    
    // Destroy method for cleanup
    destroy() {
        if (this.contactForm) {
            this.contactForm.removeEventListener('submit', this.handleContactSubmit);
        }
        
        this.contactInfo.forEach(card => {
            card.removeEventListener('click', this.handleContactCardClick);
        });
        
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.removeEventListener('click', this.toggleFAQ);
        });
        
        this.leaderContacts.forEach(contact => {
            contact.removeEventListener('click', this.handleLeaderContactClick);
        });
    }
}

// Initialize contact when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Contact();
});

export default Contact;