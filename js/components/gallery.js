// ===== GALLERY COMPONENT =====
import { $, $$, debounce, showNotification } from './utils/helpers.js';
import { GALLERY_CATEGORIES } from './utils/constants.js';

class Gallery {
    constructor() {
        this.galleryGrid = $('.gallery-grid');
        this.filterButtons = $$('.filter-btn');
        this.galleryItems = $$('.gallery-item');
        this.lightbox = $('#lightbox');
        this.lightboxImage = $('.lightbox-image');
        this.lightboxTitle = $('.lightbox-title');
        this.lightboxDescription = $('.lightbox-description');
        this.lightboxClose = $('.lightbox-close');
        this.lightboxPrev = $('.lightbox-prev');
        this.lightboxNext = $('.lightbox-next');
        this.loadMoreBtn = $('.load-more-btn');
        
        this.currentFilter = 'all';
        this.currentImageIndex = 0;
        this.images = [];
        this.visibleItems = 9; // Initial number of items to show
        this.allItems = [];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initLightbox();
        this.initFiltering();
        this.initLazyLoading();
        this.initLoadMore();
    }
    
    bindEvents() {
        // Filter buttons
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterClick(e));
        });
        
        // Gallery item clicks
        this.galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => this.openLightbox(index));
            
            // Add keyboard support
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openLightbox(index);
                }
            });
        });
        
        // Lightbox navigation
        if (this.lightboxClose) {
            this.lightboxClose.addEventListener('click', () => this.closeLightbox());
        }
        
        if (this.lightboxPrev) {
            this.lightboxPrev.addEventListener('click', () => this.showPreviousImage());
        }
        
        if (this.lightboxNext) {
            this.lightboxNext.addEventListener('click', () => this.showNextImage());
        }
        
        // Keyboard navigation for lightbox
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Close lightbox when clicking outside
        if (this.lightbox) {
            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox) {
                    this.closeLightbox();
                }
            });
        }
        
        // Load more button
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => this.loadMoreItems());
        }
        
        // Handle window resize
        window.addEventListener('resize', debounce(() => this.handleResize(), 250));
    }
    
    initLightbox() {
        // Collect all gallery items for lightbox
        this.images = Array.from(this.galleryItems).map(item => {
            const img = item.querySelector('img');
            const title = item.querySelector('h3') ? item.querySelector('h3').textContent : '';
            const description = item.querySelector('p') ? item.querySelector('p').textContent : '';
            const category = item.getAttribute('data-category');
            
            return {
                src: img.src,
                alt: img.alt,
                title: title,
                description: description,
                category: category
            };
        });
        
        this.allItems = Array.from(this.galleryItems);
    }
    
    initFiltering() {
        // Show all items initially
        this.filterItems('all');
    }
    
    initLazyLoading() {
        // Lazy load images that are not in viewport initially
        const lazyImages = $$('.gallery-item img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    initLoadMore() {
        if (this.loadMoreBtn && this.allItems.length <= this.visibleItems) {
            this.loadMoreBtn.style.display = 'none';
        }
    }
    
    handleFilterClick(e) {
        const button = e.target;
        const filter = button.getAttribute('data-filter');
        
        // Update active filter button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Apply filter
        this.currentFilter = filter;
        this.filterItems(filter);
        
        // Reset visible items count when filtering
        this.visibleItems = 9;
        this.updateLoadMoreButton();
        
        // Scroll to gallery section
        this.scrollToGallery();
    }
    
    filterItems(filter) {
        let itemsToShow;
        
        if (filter === 'all') {
            itemsToShow = this.allItems;
        } else {
            itemsToShow = this.allItems.filter(item => 
                item.getAttribute('data-category') === filter
            );
        }
        
        // Hide all items first
        this.allItems.forEach(item => {
            item.style.display = 'none';
            item.classList.remove('visible');
        });
        
        // Show filtered items (up to visibleItems count)
        itemsToShow.slice(0, this.visibleItems).forEach(item => {
            item.style.display = 'block';
            setTimeout(() => item.classList.add('visible'), 50);
        });
        
        // Update images array for lightbox with filtered items
        this.images = itemsToShow.map(item => {
            const img = item.querySelector('img');
            const title = item.querySelector('h3') ? item.querySelector('h3').textContent : '';
            const description = item.querySelector('p') ? item.querySelector('p').textContent : '';
            const category = item.getAttribute('data-category');
            
            return {
                src: img.src,
                alt: img.alt,
                title: title,
                description: description,
                category: category
            };
        });
        
        // Show message if no items found
        this.showNoResultsMessage(itemsToShow.length === 0);
    }
    
    showNoResultsMessage(show) {
        let message = $('.gallery-no-results');
        
        if (show && !message) {
            message = document.createElement('div');
            message.className = 'gallery-no-results';
            message.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #6b7280;">
                    <i class="fas fa-images" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No images found</h3>
                    <p>Try selecting a different category.</p>
                </div>
            `;
            this.galleryGrid.parentNode.appendChild(message);
        } else if (!show && message) {
            message.remove();
        }
    }
    
    openLightbox(index) {
        if (index < 0 || index >= this.images.length) return;
        
        this.currentImageIndex = index;
        const image = this.images[index];
        
        // Update lightbox content
        this.lightboxImage.src = image.src;
        this.lightboxImage.alt = image.alt;
        this.lightboxTitle.textContent = image.title;
        this.lightboxDescription.textContent = image.description;
        
        // Show lightbox
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Update navigation buttons state
        this.updateLightboxNav();
        
        // Focus management for accessibility
        this.lightboxClose.focus();
    }
    
    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
        
        // Return focus to the gallery item that was clicked
        if (this.currentImageIndex >= 0 && this.currentImageIndex < this.galleryItems.length) {
            this.galleryItems[this.currentImageIndex].focus();
        }
    }
    
    showPreviousImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
            this.updateLightboxImage();
        } else {
            // Loop to last image
            this.currentImageIndex = this.images.length - 1;
            this.updateLightboxImage();
        }
    }
    
    showNextImage() {
        if (this.currentImageIndex < this.images.length - 1) {
            this.currentImageIndex++;
            this.updateLightboxImage();
        } else {
            // Loop to first image
            this.currentImageIndex = 0;
            this.updateLightboxImage();
        }
    }
    
    updateLightboxImage() {
        const image = this.images[this.currentImageIndex];
        
        // Add loading state
        this.lightboxImage.classList.add('loading');
        
        // Load new image
        const newImage = new Image();
        newImage.onload = () => {
            this.lightboxImage.src = image.src;
            this.lightboxImage.alt = image.alt;
            this.lightboxTitle.textContent = image.title;
            this.lightboxDescription.textContent = image.description;
            this.lightboxImage.classList.remove('loading');
        };
        
        newImage.src = image.src;
        
        // Update navigation buttons state
        this.updateLightboxNav();
    }
    
    updateLightboxNav() {
        // Update previous button
        if (this.lightboxPrev) {
            this.lightboxPrev.disabled = this.images.length <= 1;
            this.lightboxPrev.style.visibility = this.images.length > 1 ? 'visible' : 'hidden';
        }
        
        // Update next button
        if (this.lightboxNext) {
            this.lightboxNext.disabled = this.images.length <= 1;
            this.lightboxNext.style.visibility = this.images.length > 1 ? 'visible' : 'hidden';
        }
        
        // Update image counter (if exists)
        const counter = $('.lightbox-counter');
        if (counter) {
            counter.textContent = `${this.currentImageIndex + 1} / ${this.images.length}`;
        }
    }
    
    handleKeyboard(e) {
        if (!this.lightbox.classList.contains('active')) return;
        
        switch (e.key) {
            case 'Escape':
                this.closeLightbox();
                break;
            case 'ArrowLeft':
                this.showPreviousImage();
                break;
            case 'ArrowRight':
                this.showNextImage();
                break;
            case ' ':
                e.preventDefault(); // Prevent page scroll
                break;
        }
    }
    
    loadMoreItems() {
        this.visibleItems += 9;
        this.filterItems(this.currentFilter);
        this.updateLoadMoreButton();
        
        // Smooth scroll to new items
        this.scrollToNewItems();
    }
    
    updateLoadMoreButton() {
        if (!this.loadMoreBtn) return;
        
        const filteredItems = this.currentFilter === 'all' 
            ? this.allItems 
            : this.allItems.filter(item => item.getAttribute('data-category') === this.currentFilter);
        
        if (this.visibleItems >= filteredItems.length) {
            this.loadMoreBtn.style.display = 'none';
        } else {
            this.loadMoreBtn.style.display = 'block';
            this.loadMoreBtn.textContent = `Load More (${filteredItems.length - this.visibleItems} remaining)`;
        }
    }
    
    scrollToNewItems() {
        const newItems = $$('.gallery-item.visible');
        if (newItems.length > 0) {
            const lastItem = newItems[newItems.length - 1];
            lastItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    scrollToGallery() {
        const gallerySection = $('.gallery-section');
        if (gallerySection) {
            gallerySection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    handleResize() {
        // Re-initialize masonry layout if needed
        this.initMasonryLayout();
    }
    
    initMasonryLayout() {
        // Simple masonry layout implementation
        if (this.galleryGrid.classList.contains('gallery-masonry')) {
            const items = $$('.gallery-item.visible');
            const container = this.galleryGrid;
            
            // Reset container height
            container.style.height = 'auto';
            
            // Simple masonry calculation
            // This is a basic implementation - consider using a library like Masonry.js for complex layouts
            items.forEach(item => {
                item.style.position = 'relative';
                item.style.marginBottom = '1.5rem';
            });
        }
    }
    
    // Method to add new gallery items dynamically
    addGalleryItem(imageData) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-category', imageData.category || 'all');
        item.tabIndex = 0;
        
        item.innerHTML = `
            <img src="${imageData.placeholder || imageData.src}" data-src="${imageData.src}" alt="${imageData.alt}" loading="lazy">
            <div class="gallery-overlay">
                <div class="gallery-info">
                    <h3>${imageData.title}</h3>
                    <p>${imageData.description}</p>
                </div>
            </div>
            <div class="gallery-category">${imageData.category}</div>
        `;
        
        // Add event listeners
        item.addEventListener('click', () => {
            const index = this.allItems.length;
            this.openLightbox(index);
        });
        
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const index = this.allItems.length;
                this.openLightbox(index);
            }
        });
        
        // Add to DOM and arrays
        this.galleryGrid.appendChild(item);
        this.allItems.push(item);
        this.images.push(imageData);
        
        // Re-apply current filter
        this.filterItems(this.currentFilter);
    }
    
    // Method to search gallery items
    searchGallery(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filterItems(this.currentFilter);
            return;
        }
        
        const filteredItems = this.allItems.filter(item => {
            const title = item.querySelector('h3') ? item.querySelector('h3').textContent.toLowerCase() : '';
            const description = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';
            const category = item.getAttribute('data-category').toLowerCase();
            
            return title.includes(searchTerm) || 
                   description.includes(searchTerm) || 
                   category.includes(searchTerm);
        });
        
        // Show/hide items based on search
        this.allItems.forEach(item => {
            item.style.display = 'none';
            item.classList.remove('visible');
        });
        
        filteredItems.slice(0, this.visibleItems).forEach(item => {
            item.style.display = 'block';
            setTimeout(() => item.classList.add('visible'), 50);
        });
        
        this.showNoResultsMessage(filteredItems.length === 0);
    }
    
    // Destroy method for cleanup
    destroy() {
        this.filterButtons.forEach(button => {
            button.removeEventListener('click', this.handleFilterClick);
        });
        
        this.galleryItems.forEach(item => {
            item.removeEventListener('click', this.openLightbox);
        });
        
        if (this.lightboxClose) {
            this.lightboxClose.removeEventListener('click', this.closeLightbox);
        }
        
        if (this.lightboxPrev) {
            this.lightboxPrev.removeEventListener('click', this.showPreviousImage);
        }
        
        if (this.lightboxNext) {
            this.lightboxNext.removeEventListener('click', this.showNextImage);
        }
        
        document.removeEventListener('keydown', this.handleKeyboard);
        
        if (this.loadMoreBtn) {
            this.loadMoreBtn.removeEventListener('click', this.loadMoreItems);
        }
        
        window.removeEventListener('resize', this.handleResize);
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Gallery();
});

export default Gallery;