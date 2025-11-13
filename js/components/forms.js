// ===== FORMS COMPONENT =====
import { $, $$, validateField, setLoadingState, showNotification, debounce } from './utils/helpers.js';
import { VALIDATION_MESSAGES, SUCCESS_MESSAGES, ERROR_MESSAGES } from './utils/constants.js';

class Forms {
    constructor() {
        this.forms = $$('form');
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initAutoSave();
    }
    
    bindEvents() {
        this.forms.forEach(form => {
            // Input validation on blur
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', (e) => this.validateInput(e.target));
                input.addEventListener('input', debounce((e) => this.validateInput(e.target), 300));
            });
            
            // Form submission
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Real-time validation for required fields
            this.initRealTimeValidation(form);
        });
    }
    
    validateInput(input) {
        const rules = this.getValidationRules(input);
        const errors = validateField(input, rules);
        
        this.clearFieldError(input);
        
        if (errors.length > 0) {
            this.showFieldError(input, errors[0]);
            return false;
        }
        
        this.showFieldSuccess(input);
        return true;
    }
    
    getValidationRules(input) {
        const rules = {};
        
        if (input.required) rules.required = true;
        if (input.type === 'email') rules.email = true;
        if (input.type === 'tel') rules.phone = true;
        if (input.dataset.numeric) rules.numeric = true;
        
        if (input.minLength) rules.minLength = parseInt(input.minLength);
        if (input.maxLength) rules.maxLength = parseInt(input.maxLength);
        
        // Custom data attributes for validation
        if (input.dataset.min) rules.minLength = parseInt(input.dataset.min);
        if (input.dataset.max) rules.maxLength = parseInt(input.dataset.max);
        
        return rules;
    }
    
    showFieldError(input, message) {
        this.clearFieldError(input);
        
        input.classList.add('form-control--error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'form-text form-text--error';
        errorElement.textContent = message;
        
        input.parentNode.appendChild(errorElement);
    }
    
    showFieldSuccess(input) {
        this.clearFieldError(input);
        input.classList.remove('form-control--error');
        input.classList.add('form-control--success');
        
        // Remove success class after a delay
        setTimeout(() => {
            input.classList.remove('form-control--success');
        }, 2000);
    }
    
    clearFieldError(input) {
        input.classList.remove('form-control--error', 'form-control--success');
        
        const existingError = input.parentNode.querySelector('.form-text--error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    initRealTimeValidation(form) {
        const requiredInputs = form.querySelectorAll('[required]');
        
        requiredInputs.forEach(input => {
            input.addEventListener('input', debounce(() => {
                if (input.value.trim() === '') {
                    this.showFieldError(input, VALIDATION_MESSAGES.REQUIRED);
                } else {
                    this.clearFieldError(input);
                }
            }, 300));
        });
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Validate all fields
        const isValid = this.validateForm(form);
        
        if (!isValid) {
            showNotification('Please fix the errors in the form.', 'error');
            return;
        }
        
        // Set loading state
        setLoadingState(submitButton, true);
        
        try {
            // Simulate form submission (replace with actual API call)
            await this.submitForm(form);
            
            // Show success message
            showNotification(this.getSuccessMessage(form), 'success');
            
            // Reset form
            form.reset();
            this.clearAllErrors(form);
            
            // Remove success classes
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => input.classList.remove('form-control--success'));
            
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification(ERROR_MESSAGES.FORM_SUBMISSION_ERROR, 'error');
        } finally {
            setLoadingState(submitButton, false);
        }
    }
    
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });
        
        // Additional form-level validation
        if (form.id === 'donationForm') {
            isValid = this.validateDonationForm(form) && isValid;
        }
        
        if (form.id === 'contactForm') {
            isValid = this.validateContactForm(form) && isValid;
        }
        
        return isValid;
    }
    
    validateDonationForm(form) {
        const amountInput = form.querySelector('#customAmount');
        const amount = parseFloat(amountInput.value);
        
        if (amount && amount < 1) {
            this.showFieldError(amountInput, 'Donation amount must be at least $1');
            return false;
        }
        
        return true;
    }
    
    validateContactForm(form) {
        const email = form.querySelector('#email').value;
        const phone = form.querySelector('#phone').value;
        
        if (phone && !this.validatePhone(phone)) {
            const phoneInput = form.querySelector('#phone');
            this.showFieldError(phoneInput, VALIDATION_MESSAGES.PHONE);
            return false;
        }
        
        return true;
    }
    
    validatePhone(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
    
    async submitForm(form) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real application, you would make an actual API call here
        // const formData = new FormData(form);
        // const response = await fetch('/api/submit', {
        //     method: 'POST',
        //     body: formData
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Form submission failed');
        // }
        
        return { success: true };
    }
    
    getSuccessMessage(form) {
        switch (form.id) {
            case 'contactForm':
                return SUCCESS_MESSAGES.CONTACT_FORM;
            case 'donationForm':
                return SUCCESS_MESSAGES.DONATION;
            case 'newsletterForm':
                return SUCCESS_MESSAGES.NEWSLETTER;
            default:
                return 'Form submitted successfully!';
        }
    }
    
    clearAllErrors(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => this.clearFieldError(input));
    }
    
    initAutoSave() {
        const formsToAutoSave = $$('#contactForm, #donationForm');
        
        formsToAutoSave.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                input.addEventListener('input', debounce(() => {
                    this.saveFormState(form);
                }, 1000));
            });
        });
        
        // Load saved form data on page load
        this.loadSavedFormData();
    }
    
    saveFormState(form) {
        const formData = {};
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (input.type !== 'password') { // Don't save passwords
                formData[input.name] = input.value;
            }
        });
        
        localStorage.setItem(`form_${form.id}`, JSON.stringify(formData));
    }
    
    loadSavedFormData() {
        const forms = $$('#contactForm, #donationForm');
        
        forms.forEach(form => {
            const savedData = localStorage.getItem(`form_${form.id}`);
            
            if (savedData) {
                const formData = JSON.parse(savedData);
                const inputs = form.querySelectorAll('input, textarea, select');
                
                inputs.forEach(input => {
                    if (formData[input.name] !== undefined) {
                        input.value = formData[input.name];
                    }
                });
                
                // Show restore notification
                const notification = document.createElement('div');
                notification.className = 'form-restore-notification';
                notification.innerHTML = `
                    <p>We found saved data for this form. <button type="button" class="btn-restore">Restore</button></p>
                `;
                
                form.parentNode.insertBefore(notification, form);
                
                // Add restore functionality
                notification.querySelector('.btn-restore').addEventListener('click', () => {
                    notification.remove();
                });
                
                // Auto-remove notification after 10 seconds
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 10000);
            }
        });
    }
    
    // Method to clear saved form data
    clearSavedFormData(formId) {
        localStorage.removeItem(`form_${formId}`);
    }
    
    // Method to programmatically set form values
    setFormValues(formId, values) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        Object.keys(values).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = values[key];
            }
        });
    }
    
    // Destroy method for cleanup
    destroy() {
        this.forms.forEach(form => {
            form.removeEventListener('submit', this.handleSubmit);
        });
    }
}

// Initialize forms when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Forms();
});

export default Forms;