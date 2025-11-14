# FODASU Website - AI Coding Agent Instructions

## Project Overview
**fodasu-website** is a responsive non-profit website for the Foya District Academics Sports Union (FODASU), a Liberian organization promoting athletics and academics. Built with vanilla HTML5, CSS3, and ES6 JavaScript—no build tools or frameworks. Seven core pages (index, about, programs, events, gallery, donate, contact) + assets.

## Architecture & Key Patterns

### 1. Folder Structure (Semantic Organization)
```
css/
  ├─ base/          → Core styles (_variables, _reset, _typography, _utilities)
  ├─ components/    → UI components (_header, _footer, _buttons, _cards, gallery.css)
  ├─ layouts/       → Page layouts (_grid, _navigation, _sections)
  └─ pages/         → Page-specific overrides (_about, _contact, _donate, _events, _gallery, _programs)
js/
  ├─ main.js        → App entry point (FODASUApp class, initializes all components)
  ├─ components/    → Feature modules (Navigation, Gallery, Tabs, Events, etc.)
  │  └─ utils/      → Shared helpers (helpers.js, constants.js)
```

**Design Philosophy:** CSS uses ITCSS (Inverted Triangle) + SMACSS naming. Import order in `main.css` flows from generic to specific (base → components → layouts → pages). JS is modular with components as ES6 classes that initialize themselves.

### 2. CSS Naming Convention (BEM + Utility Classes)
- **Block-Element-Modifier (BEM):** `.component__element--modifier` (e.g., `.nav__link`, `.btn--primary`)
- **Utilities:** Minimal set in `base/_utilities.css` for spacing, text alignment, display
- **CSS Variables:** All colors, typography, spacing defined in `base/_variables.css` (use `--primary-color`, `--text-dark`, etc.)
- **Responsive:** Media queries use `BREAKPOINTS` from JS constants (640px SM, 768px MD, 1024px LG, 1280px XL, 1536px XXL)

**Example pattern from `_buttons.css`:**
```css
.btn {
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius);
}
.btn--primary { background: var(--primary-color); }
.btn--secondary { background: var(--secondary-color); }
```

### 3. JavaScript Architecture (ES6 Class-Based Components)
Each component (Navigation, Gallery, Events, etc.) is a **singleton class** that:
- Caches DOM selectors via `$()` and `$$()` helpers
- Binds event listeners in `bindEvents()`
- Initializes sub-features in `init()`
- Uses debounce/throttle for scroll/resize performance

**Pattern from `Navigation` class:**
```javascript
class Navigation {
  constructor() { /* Cache DOM elements */ }
  init() { this.bindEvents(); /* other inits */ }
  bindEvents() { /* Add listeners with debounce for scroll */ }
  handleScroll() { /* Update active link, sticky header */ }
}
```

### 4. Utility Helpers (`js/components/utils/helpers.js`)
**Critical utilities for all JS work:**
- `$(selector)` → single element, `$$(selector)` → NodeList
- `debounce(func, delay)` / `throttle(func, limit)` → performance optimization for scroll/resize
- `isInViewport()` / `isPartiallyInViewport()` → lazy loading, animations
- `createElement(tag, attributes, children)` → programmatic DOM creation
- `formatCurrency()`, `formatPhoneNumber()`, `validateField()` → validation & formatting
- `showNotification(message, type)` → toast messages (success/error/info)

**Always use these instead of vanilla JS** to maintain consistency.

### 5. Constants (`js/components/utils/constants.js`)
- `BREAKPOINTS` → matches CSS (use for responsive JS logic)
- `ANIMATION_DURATIONS` → (FAST: 150ms, NORMAL: 300ms, SLOW: 500ms, VERY_SLOW: 1000ms)
- `STORAGE_KEYS` → local storage prefixed with `fodasu_` (e.g., `fodasu_theme`, `fodasu_donation_amount`)
- `VALIDATION_MESSAGES`, `DONATION_AMOUNTS` → form/feature data

### 6. Form Validation Pattern (`js/components/forms.js`)
- `validateField(input, rules)` validates in real-time with debounce
- Rules: `required`, `email`, `phone`, `numeric`, `minLength`, `maxLength`
- Error states styled in `css/components/_forms.css`
- Auto-save to localStorage with STORAGE_KEYS

## Page-Specific Conventions

### Per-Page Components
- **index.html** → Hero, stats counter, mission, programs preview, CTA
- **gallery.html** → Gallery component with lightbox, filtering, lazy loading, load-more button
- **events.html** → Events list with tabs/filtering
- **donate.html** → Donation form with preset amounts, validation
- **contact.html** → Contact form with validation, real-time feedback

Each page imports `js/main.js` as module, which auto-initializes relevant components based on page content.

### Navigation Pattern
- Links use full page URLs (e.g., `href="programs.html#athletics"`) with hash for anchor navigation
- Navigation auto-sets `.active` class based on scroll position via `Navigation.setActiveLink()`
- Mobile menu toggles on click, closes on link click or outside click

## Critical Workflows

### Adding a New Component
1. Create `js/components/your-feature.js` as an ES6 class
2. Import and instantiate in `main.js` within `FODASUApp.initComponents()`
3. Use `$()` / `$$()` for DOM queries, `debounce()` for listeners
4. Cache DOM on construction, don't query repeatedly
5. Add corresponding styles in `css/components/_your-feature.css`
6. Import new CSS file in `css/main.css`

### Adding Styles to a Page
1. Define component styles in `css/components/*.css` (reusable)
2. Override/extend in `css/pages/_page-name.css` (page-specific)
3. Use CSS variables from `base/_variables.css`, never hardcode colors/spacing
4. Follow BEM naming: `.component__element--modifier`

### Form Submission Workflow
1. Form HTML includes `name`, `type`, `required`, `minLength`/`maxLength` attrs
2. `Forms.handleSubmit()` validates all inputs via `validateField()`
3. On success, prevent default and show `showNotification()` message
4. Auto-save intermediate data to localStorage
5. Disable submit button with `setLoadingState()` during processing

### Performance Considerations
- Use `debounce()` for scroll/resize events (300ms default)
- Use `throttle()` for frequent events (set custom limits)
- Lazy-load images with `isInViewport()` checks
- Gallery uses load-more button, not infinite scroll
- `FODASUApp.initPerformance()` placeholder for future optimizations

## External Dependencies
- **Font Awesome 6.4.0** (icons via CDN, classes like `fa-bars`, `fa-times`, `fas fa-running`)
- **Google Fonts** (Montserrat, Open Sans—define in `_variables.css`)
- **No build tool / no npm** (keep vanilla ES6, use `<script type="module">`)

## Common Pitfalls to Avoid
- ❌ Don't create styles without using CSS variables; always reference `--primary-color`, `--spacing-*`
- ❌ Don't query DOM repeatedly in loops; cache selectors in constructor
- ❌ Don't add scroll/resize listeners without `debounce()`
- ❌ Don't hardcode breakpoints; import `BREAKPOINTS` from constants
- ❌ Don't create new utilities; extend `helpers.js` and use existing ones
- ❌ Don't use `alert()` or `console.log()` for user feedback; use `showNotification()`

## Development Checklist for New Features
- [ ] CSS follows BEM + uses variables from `_variables.css`
- [ ] JS component extends existing pattern (cache DOM, debounce listeners, init() method)
- [ ] Component imported and initialized in `main.js`
- [ ] Form inputs validated with helpers, not custom logic
- [ ] Mobile responsive (test at all `BREAKPOINTS`)
- [ ] Accessibility: semantic HTML, `:focus-visible` styles, ARIA labels where needed
- [ ] Performance: no repeated DOM queries, debounced listeners, lazy-loaded media
