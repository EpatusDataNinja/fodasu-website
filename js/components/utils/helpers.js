// ===== UTILITY HELPER FUNCTIONS =====
import { BREAKPOINTS, PERFORMANCE, VALIDATION_MESSAGES } from './constants.js';

// DOM Helpers
export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => context.querySelectorAll(selector);

// Create element with attributes and children
export const createElement = (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.keys(attributes).forEach(key => {
        if (key === 'className') {
            element.className = attributes[key];
        } else if (key === 'textContent') {
            element.textContent = attributes[key];
        } else if (key.startsWith('on') && typeof attributes[key] === 'function') {
            element.addEventListener(key.slice(2).toLowerCase(), attributes[key]);
        } else {
            element.setAttribute(key, attributes[key]);
        }
    });
    
    // Append children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    
    return element;
};

// Check if element is in viewport
export const isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

// Check if element is partially in viewport
export const isPartiallyInViewport = (element, threshold = 0.1) => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
    
    const visibleArea = visibleHeight * visibleWidth;
    const totalArea = rect.height * rect.width;
    
    return (visibleArea / totalArea) >= threshold;
};

// Debounce function for performance
export const debounce = (func, wait = PERFORMANCE.DEBOUNCE_DELAY) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function for performance
export const throttle = (func, limit = PERFORMANCE.THROTTLE_DELAY) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Format currency
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
};

// Format phone number
export const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phoneNumber;
};

// Validate email
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number
export const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Sanitize HTML to prevent XSS
export const sanitizeHTML = (str) => {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

// Get current breakpoint
export const getCurrentBreakpoint = () => {
    const width = window.innerWidth;
    if (width >= BREAKPOINTS.XXL) return 'xxl';
    if (width >= BREAKPOINTS.XL) return 'xl';
    if (width >= BREAKPOINTS.LG) return 'lg';
    if (width >= BREAKPOINTS.MD) return 'md';
    if (width >= BREAKPOINTS.SM) return 'sm';
    return 'xs';
};

// Check if device is mobile
export const isMobile = () => {
    return window.innerWidth < BREAKPOINTS.MD;
};

// Check if device is touch capable
export const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Smooth scroll to element
export const smoothScrollTo = (element, offset = 80) => {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
};

// Animate number counting
export const animateNumber = (element, target, duration = 1000) => {
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
};

// Load image with callback
export const loadImage = (src, onLoad, onError) => {
    const img = new Image();
    img.onload = onLoad;
    img.onerror = onError;
    img.src = src;
    return img;
};

// Get URL parameters
export const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
};

// Set URL parameter without page reload
export const setUrlParam = (key, value) => {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
};

// Remove URL parameter
export const removeUrlParam = (key) => {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.pushState({}, '', url);
};

// Local storage helpers
export const storage = {
    get: (key) => {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch {
            return localStorage.getItem(key);
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            localStorage.setItem(key, value);
        }
    },
    
    remove: (key) => {
        localStorage.removeItem(key);
    },
    
    clear: () => {
        localStorage.clear();
    }
};

// Session storage helpers
export const session = {
    get: (key) => {
        try {
            return JSON.parse(sessionStorage.getItem(key));
        } catch {
            return sessionStorage.getItem(key);
        }
    },
    
    set: (key, value) => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch {
            sessionStorage.setItem(key, value);
        }
    },
    
    remove: (key) => {
        sessionStorage.removeItem(key);
    }
};

// Form validation helpers
export const validateField = (field, rules) => {
    const value = field.value.trim();
    const errors = [];
    
    if (rules.required && !value) {
        errors.push(VALIDATION_MESSAGES.REQUIRED);
    }
    
    if (rules.email && value && !validateEmail(value)) {
        errors.push(VALIDATION_MESSAGES.EMAIL);
    }
    
    if (rules.phone && value && !validatePhone(value)) {
        errors.push(VALIDATION_MESSAGES.PHONE);
    }
    
    if (rules.minLength && value.length < rules.minLength) {
        errors.push(VALIDATION_MESSAGES.MIN_LENGTH.replace('{min}', rules.minLength));
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(VALIDATION_MESSAGES.MAX_LENGTH.replace('{max}', rules.maxLength));
    }
    
    if (rules.numeric && value && isNaN(value)) {
        errors.push(VALIDATION_MESSAGES.NUMERIC);
    }
    
    return errors;
};

// Add loading state to element
export const setLoadingState = (element, isLoading) => {
    if (isLoading) {
        element.classList.add('loading');
        element.disabled = true;
    } else {
        element.classList.remove('loading');
        element.disabled = false;
    }
};

// Remove loading state from element
export const removeLoadingState = (element) => {
    element.classList.remove('loading');
    element.disabled = false;
};

// Show notification
export const showNotification = (message, type = 'info', duration = 5000) => {
    // Create notification element
    const notification = createElement('div', {
        className: `notification notification--${type}`,
        style: 'position: fixed; top: 20px; right: 20px; z-index: 10000; padding: 1rem; border-radius: 0.5rem; color: white; max-width: 300px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);'
    }, [message]);
    
    // Add background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, duration);
    
    return notification;
};

// Export default helpers object
export default {
    $,
    $$,
    createElement,
    isInViewport,
    isPartiallyInViewport,
    debounce,
    throttle,
    formatCurrency,
    formatPhoneNumber,
    validateEmail,
    validatePhone,
    sanitizeHTML,
    getCurrentBreakpoint,
    isMobile,
    isTouchDevice,
    smoothScrollTo,
    animateNumber,
    loadImage,
    getUrlParams,
    setUrlParam,
    removeUrlParam,
    storage,
    session,
    validateField,
    setLoadingState,
    removeLoadingState,
    showNotification
};