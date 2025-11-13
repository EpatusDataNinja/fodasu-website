// ===== DONATION COMPONENT =====
import { $, $$, formatCurrency, showNotification, setLoadingState, debounce } from './utils/helpers.js';
import { DONATION_AMOUNTS, CURRENCY } from './utils/constants.js';

class Donation {
    constructor() {
        this.donationForm = $('#donationForm');
        this.amountButtons = $$('.amount-btn');
        this.donationCards = $$('.donation-card');
        this.customAmountInput = $('#customAmount');
        this.recurringCheckbox = $('#recurring');
        this.donationType = $('#donationType');
        
        this.selectedAmount = 0;
        this.isRecurring = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initAmountPresets();
        this.updateUI();
        this.initImpactStats();
    }
    
    bindEvents() {
        // Amount preset buttons
        this.amountButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleAmountSelect(e));
        });
        
        // Custom amount input
        if (this.customAmountInput) {
            this.customAmountInput.addEventListener('input', debounce(() => {
                this.handleCustomAmount();
            }, 300));
            
            this.customAmountInput.addEventListener('focus', () => {
                this.clearAmountSelection();
            });
        }
        
        // Donation card selection
        this.donationCards.forEach(card => {
            const button = card.querySelector('button[data-amount]');
            if (button) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleDonationCardSelect(card, button);
                });
            }
            
            card.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON') {
                    const button = card.querySelector('button[data-amount]');
                    if (button) {
                        this.handleDonationCardSelect(card, button);
                    }
                }
            });
        });
        
        // Recurring donation toggle
        if (this.recurringCheckbox) {
            this.recurringCheckbox.addEventListener('change', (e) => {
                this.isRecurring = e.target.checked;
                this.updateRecurringUI();
            });
        }
        
        // Donation type change
        if (this.donationType) {
            this.donationType.addEventListener('change', (e) => {
                this.updateDonationDescription(e.target.value);
            });
        }
        
        // Form submission
        if (this.donationForm) {
            this.donationForm.addEventListener('submit', (e) => this.handleDonationSubmit(e));
        }
    }
    
    initAmountPresets() {
        // Set up preset amount buttons
        this.amountButtons.forEach(button => {
            const amount = parseInt(button.getAttribute('data-amount'));
            button.textContent = formatCurrency(amount, CURRENCY.CODE, CURRENCY.LOCALE);
        });
    }
    
    handleAmountSelect(e) {
        const button = e.target;
        const amount = parseInt(button.getAttribute('data-amount'));
        
        this.clearAmountSelection();
        this.setAmountSelection(button, amount);
        
        // Update custom amount input
        if (this.customAmountInput) {
            this.customAmountInput.value = amount;
        }
    }
    
    handleCustomAmount() {
        const amount = parseFloat(this.customAmountInput.value) || 0;
        
        if (amount > 0) {
            this.selectedAmount = amount;
            this.clearAmountSelection();
            this.updateSummary();
        }
    }
    
    handleDonationCardSelect(card, button) {
        const amount = parseInt(button.getAttribute('data-amount'));
        
        // Remove selection from all cards
        this.donationCards.forEach(c => {
            c.classList.remove('donation-card--selected');
        });
        
        // Add selection to clicked card
        card.classList.add('donation-card--selected');
        
        // Set amount
        this.setAmountSelection(button, amount);
        
        // Update custom amount input
        if (this.customAmountInput) {
            this.customAmountInput.value = amount;
        }
        
        // Update donation type based on card
        this.updateDonationTypeFromCard(card);
    }
    
    updateDonationTypeFromCard(card) {
        const title = card.querySelector('h3').textContent.toLowerCase();
        let donationType = 'general';
        
        if (title.includes('student')) {
            donationType = 'scholarship';
        } else if (title.includes('team')) {
            donationType = 'soccer';
        } else if (title.includes('school')) {
            donationType = 'academics';
        }
        
        if (this.donationType) {
            this.donationType.value = donationType;
            this.updateDonationDescription(donationType);
        }
    }
    
    setAmountSelection(button, amount) {
        // Remove active class from all amount buttons
        this.amountButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected button
        button.classList.add('active');
        
        // Update selected amount
        this.selectedAmount = amount;
        
        // Update summary
        this.updateSummary();
    }
    
    clearAmountSelection() {
        this.amountButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        this.donationCards.forEach(card => {
            card.classList.remove('donation-card--selected');
        });
    }
    
    updateSummary() {
        const summaryElement = $('.donation-summary');
        if (!summaryElement) return;
        
        if (this.selectedAmount > 0) {
            const formattedAmount = formatCurrency(this.selectedAmount, CURRENCY.CODE, CURRENCY.LOCALE);
            const frequency = this.isRecurring ? 'monthly' : 'one-time';
            
            summaryElement.innerHTML = `
                <div class="summary-item">
                    <strong>Amount:</strong> ${formattedAmount}
                </div>
                <div class="summary-item">
                    <strong>Frequency:</strong> ${frequency}
                </div>
                ${this.isRecurring ? `
                <div class="summary-item">
                    <strong>Yearly Total:</strong> ${formatCurrency(this.selectedAmount * 12, CURRENCY.CODE, CURRENCY.LOCALE)}
                </div>
                ` : ''}
            `;
            summaryElement.style.display = 'block';
        } else {
            summaryElement.style.display = 'none';
        }
    }
    
    updateRecurringUI() {
        const recurringText = $('.recurring-text');
        if (recurringText) {
            if (this.isRecurring) {
                recurringText.textContent = 'This will be a monthly recurring donation';
                recurringText.classList.add('text-success');
            } else {
                recurringText.textContent = 'Make this a monthly recurring donation';
                recurringText.classList.remove('text-success');
            }
        }
        
        this.updateSummary();
    }
    
    updateDonationDescription(type) {
        const descriptionElement = $('.donation-description');
        if (!descriptionElement) return;
        
        const descriptions = {
            general: 'Your donation will be used where it\'s needed most across all FODASU programs.',
            athletics: 'Support our athletics program to develop track and field talents in young athletes.',
            soccer: 'Help fund soccer training, equipment, and competitions for youth teams.',
            academics: 'Contribute to academic programs including quizzes, debates, and educational resources.',
            scholarship: 'Provide scholarships for outstanding students to continue their education.'
        };
        
        descriptionElement.textContent = descriptions[type] || descriptions.general;
    }
    
    initImpactStats() {
        // Animate impact numbers when they come into view
        const impactStats = $$('.impact-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    this.animateNumber(entry.target, target, 2000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        impactStats.forEach(stat => {
            observer.observe(stat);
        });
        
        // Initialize budget chart animation
        this.animateBudgetChart();
    }
    
    animateNumber(element, target, duration = 1000) {
        const start = parseInt(element.textContent.replace(/,/g, '')) || 0;
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
    
    animateBudgetChart() {
        const chartBars = $$('.chart-bar');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const percentage = entry.target.getAttribute('data-percentage');
                    entry.target.style.width = `${percentage}%`;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        chartBars.forEach(bar => {
            bar.style.width = '0%'; // Start from 0
            observer.observe(bar);
        });
    }
    
    validateDonation() {
        if (this.selectedAmount <= 0) {
            showNotification('Please select or enter a donation amount.', 'error');
            return false;
        }
        
        if (this.selectedAmount < 1) {
            showNotification('Minimum donation amount is $1.', 'error');
            return false;
        }
        
        // Check if custom amount is valid
        if (this.customAmountInput && this.customAmountInput.value) {
            const customAmount = parseFloat(this.customAmountInput.value);
            if (isNaN(customAmount) || customAmount < 1) {
                showNotification('Please enter a valid donation amount.', 'error');
                return false;
            }
        }
        
        return true;
    }
    
    async handleDonationSubmit(e) {
        e.preventDefault();
        
        if (!this.validateDonation()) {
            return;
        }
        
        const submitButton = this.donationForm.querySelector('button[type="submit"]');
        setLoadingState(submitButton, true);
        
        try {
            // Simulate donation processing
            await this.processDonation();
            
            // Show success message
            this.showDonationSuccess();
            
            // Reset form
            this.donationForm.reset();
            this.clearAmountSelection();
            this.selectedAmount = 0;
            this.isRecurring = false;
            this.updateSummary();
            
        } catch (error) {
            console.error('Donation processing error:', error);
            showNotification('There was an error processing your donation. Please try again.', 'error');
        } finally {
            setLoadingState(submitButton, false);
        }
    }
    
    async processDonation() {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // In a real application, you would integrate with a payment processor like Stripe, PayPal, etc.
        // const response = await fetch('/api/donate', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         amount: this.selectedAmount,
        //         recurring: this.isRecurring,
        //         type: this.donationType ? this.donationType.value : 'general',
        //         donorInfo: this.getDonorInfo()
        //     })
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Donation processing failed');
        // }
        
        return { success: true, transactionId: 'TX_' + Date.now() };
    }
    
    getDonorInfo() {
        const formData = new FormData(this.donationForm);
        return {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone')
        };
    }
    
    showDonationSuccess() {
        const successModal = this.createSuccessModal();
        document.body.appendChild(successModal);
        
        // Add confetti effect
        this.createConfettiEffect();
        
        // Track donation in analytics (if available)
        this.trackDonationEvent();
    }
    
    createSuccessModal() {
        const modal = document.createElement('div');
        modal.className = 'donation-success-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background: white;
            padding: 3rem;
            border-radius: 1.5rem;
            text-align: center;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        `;
        
        modalContent.innerHTML = `
            <div class="success-icon" style="font-size: 4rem; color: #10b981; margin-bottom: 1rem;">🎉</div>
            <h2 style="color: #1f2937; margin-bottom: 1rem;">Thank You for Your Generous Donation!</h2>
            <p style="color: #6b7280; margin-bottom: 2rem; line-height: 1.6;">
                Your support of ${formatCurrency(this.selectedAmount, CURRENCY.CODE, CURRENCY.LOCALE)} 
                ${this.isRecurring ? 'monthly' : ''} will help transform young lives through sports and education in Foya District.
            </p>
            <div class="impact-message" style="background: #f0f9ff; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem;">
                <p style="color: #0369a1; margin: 0; font-weight: 500;">
                    Your donation will provide opportunities for ${Math.floor(this.selectedAmount / 10)} students.
                </p>
            </div>
            <button class="btn btn--primary" onclick="this.closest('.donation-success-modal').remove()">
                Continue
            </button>
        `;
        
        modal.appendChild(modalContent);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }
    
    createConfettiEffect() {
        // Simple confetti effect
        const confettiCount = 100;
        const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}vw;
                border-radius: 50%;
                pointer-events: none;
                z-index: 10001;
            `;
            
            document.body.appendChild(confetti);
            
            // Animate confetti
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight}px) rotate(${360 * Math.random()}deg)`, opacity: 0 }
            ], {
                duration: 3000 + Math.random() * 2000,
                easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
            });
            
            animation.onfinish = () => {
                confetti.remove();
            };
        }
    }
    
    trackDonationEvent() {
        // Track donation in analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'donation', {
                'event_category': 'engagement',
                'event_label': 'donation_submitted',
                'value': this.selectedAmount
            });
        }
        
        // Log donation for internal tracking
        console.log('Donation tracked:', {
            amount: this.selectedAmount,
            recurring: this.isRecurring,
            type: this.donationType ? this.donationType.value : 'general',
            timestamp: new Date().toISOString()
        });
    }
    
    // Method to set donation amount programmatically
    setDonationAmount(amount) {
        this.selectedAmount = amount;
        
        // Update custom amount input
        if (this.customAmountInput) {
            this.customAmountInput.value = amount;
        }
        
        // Find and select matching preset button
        const matchingButton = Array.from(this.amountButtons).find(button => {
            return parseInt(button.getAttribute('data-amount')) === amount;
        });
        
        if (matchingButton) {
            this.setAmountSelection(matchingButton, amount);
        } else {
            this.clearAmountSelection();
            this.updateSummary();
        }
    }
    
    // Method to set donation type programmatically
    setDonationType(type) {
        if (this.donationType) {
            this.donationType.value = type;
            this.updateDonationDescription(type);
        }
    }
    
    // Destroy method for cleanup
    destroy() {
        this.amountButtons.forEach(button => {
            button.removeEventListener('click', this.handleAmountSelect);
        });
        
        this.donationCards.forEach(card => {
            card.removeEventListener('click', this.handleDonationCardSelect);
        });
        
        if (this.customAmountInput) {
            this.customAmountInput.removeEventListener('input', this.handleCustomAmount);
        }
        
        if (this.recurringCheckbox) {
            this.recurringCheckbox.removeEventListener('change', this.updateRecurringUI);
        }
        
        if (this.donationType) {
            this.donationType.removeEventListener('change', this.updateDonationDescription);
        }
        
        if (this.donationForm) {
            this.donationForm.removeEventListener('submit', this.handleDonationSubmit);
        }
    }
}

// Initialize donation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Donation();
});

export default Donation;