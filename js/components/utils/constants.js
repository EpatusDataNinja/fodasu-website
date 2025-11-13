// ===== APPLICATION CONSTANTS =====

// API Endpoints (if needed in future)
export const API_ENDPOINTS = {
    CONTACT: '/api/contact',
    DONATION: '/api/donate',
    NEWSLETTER: '/api/newsletter'
};

// Animation Durations
export const ANIMATION_DURATIONS = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000
};

// Breakpoints (match CSS breakpoints)
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536
};

// Local Storage Keys
export const STORAGE_KEYS = {
    THEME: 'fodasu_theme',
    DONATION_AMOUNT: 'fodasu_donation_amount',
    CONTACT_FORM: 'fodasu_contact_data'
};

// Form Validation Messages
export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required',
    EMAIL: 'Please enter a valid email address',
    PHONE: 'Please enter a valid phone number',
    MIN_LENGTH: 'Must be at least {min} characters',
    MAX_LENGTH: 'Must be less than {max} characters',
    NUMERIC: 'Please enter a valid number'
};

// Donation Amounts
export const DONATION_AMOUNTS = {
    STUDENT_SPONSORSHIP: 150,
    TEAM_SUPPORT: 500,
    SCHOOL_PROGRAM: 1000,
    PRESET_AMOUNTS: [25, 50, 100, 250, 500]
};

// Program Types
export const PROGRAM_TYPES = {
    ATHLETICS: 'athletics',
    SOCCER: 'soccer',
    ACADEMICS: 'academics'
};

// Gallery Categories
export const GALLERY_CATEGORIES = {
    ALL: 'all',
    ATHLETICS: 'athletics',
    SOCCER: 'soccer',
    ACADEMICS: 'academics',
    EVENTS: 'events',
    COMMUNITY: 'community'
};

// Contact Subjects
export const CONTACT_SUBJECTS = [
    'General Inquiry',
    'Partnership Opportunity',
    'Volunteer Inquiry',
    'Donation Question',
    'Program Information',
    'Media Inquiry',
    'Other'
];

// Leadership Positions
export const LEADERSHIP_POSITIONS = {
    EXECUTIVE: 'executive',
    SOCCER: 'soccer',
    ATHLETICS: 'athletics',
    ACADEMICS: 'academics'
};

// Social Media Links
export const SOCIAL_LINKS = {
    FACEBOOK: 'https://facebook.com/fodasu',
    TWITTER: 'https://twitter.com/fodasu',
    INSTAGRAM: 'https://instagram.com/fodasu',
    LINKEDIN: 'https://linkedin.com/company/fodasu'
};

// Map Configuration (if adding maps later)
export const MAP_CONFIG = {
    CENTER: {
        lat: 8.3667, // Foya, Liberia approximate coordinates
        lng: -10.2167
    },
    ZOOM: 12,
    MARKER_TITLE: 'FODASU Headquarters'
};

// Performance Metrics
export const PERFORMANCE = {
    LAZY_LOAD_THRESHOLD: 0.1,
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    FORM_SUBMISSION_ERROR: 'Error submitting form. Please try again.',
    IMAGE_LOAD_ERROR: 'Error loading image.',
    GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
    CONTACT_FORM: 'Thank you for your message! We\'ll get back to you soon.',
    DONATION: 'Thank you for your generous donation!',
    NEWSLETTER: 'Thank you for subscribing to our newsletter!'
};

// Currency Configuration
export const CURRENCY = {
    SYMBOL: '$',
    CODE: 'USD',
    LOCALE: 'en-US'
};

// Date Formats
export const DATE_FORMATS = {
    DISPLAY: 'MMMM DD, YYYY',
    SHORT: 'MM/DD/YYYY',
    ISO: 'YYYY-MM-DD'
};

// Export all constants as default object
export default {
    API_ENDPOINTS,
    ANIMATION_DURATIONS,
    BREAKPOINTS,
    STORAGE_KEYS,
    VALIDATION_MESSAGES,
    DONATION_AMOUNTS,
    PROGRAM_TYPES,
    GALLERY_CATEGORIES,
    CONTACT_SUBJECTS,
    LEADERSHIP_POSITIONS,
    SOCIAL_LINKS,
    MAP_CONFIG,
    PERFORMANCE,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    CURRENCY,
    DATE_FORMATS
};