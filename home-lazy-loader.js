// Home Page Lazy Image Loader
class HomeLazyLoader {
    constructor() {
        this.observer = null;
        this.loadedImages = new Set();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupImageLoading();
        this.setupModalEvents();
        this.updateCopyrightYear();
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    this.observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.1
        });
    }

    setupImageLoading() {
        // Get all images on the home page
        const images = document.querySelectorAll('.highlight-square img');
        
        images.forEach(img => {
            // Skip if already loaded
            if (this.loadedImages.has(img.src)) return;
            
            // Start observing for lazy loading
            this.observer.observe(img);
            
            // Setup click handler for modal
            this.setupImageClick(img.parentElement);
        });
    }

    loadImage(img) {
        if (this.loadedImages.has(img.src)) return;
        
        // Create a new image to preload
        const preloadImg = new Image();
        
        preloadImg.onload = () => {
            // Image loaded successfully
            img.src = preloadImg.src;
            this.loadedImages.add(img.src);
        };
        
        preloadImg.onerror = () => {
            // If loading fails, still mark as loaded to prevent retry
            this.loadedImages.add(img.src);
        };
        
        // Start loading the image
        preloadImg.src = img.src;
    }

    setupImageClick(container) {
        if (container.dataset.clickSetup) return;
        container.dataset.clickSetup = 'true';
        
        container.addEventListener('click', (e) => {
            e.preventDefault();
            
            const modal = document.getElementById('photoModal');
            const modalImg = document.getElementById('modalImage');
            
            if (modal && modalImg) {
                const img = container.querySelector('img');
                if (img.src && img.src !== window.location.href) {
                    modalImg.src = img.src;
                    modal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    }

    setupModalEvents() {
        const closeBtn = document.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        const modal = document.getElementById('photoModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    closeModal() {
        const modal = document.getElementById('photoModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    updateCopyrightYear() {
        const currentYear = new Date().getFullYear();
        const copyrightElements = document.querySelectorAll('.copyright p');
        
        copyrightElements.forEach(element => {
            element.textContent = `© ${currentYear} Jayden Quitos`;
        });
    }
}

// Initialize the home page lazy loader
const homeLazyLoader = new HomeLazyLoader();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        homeLazyLoader.init();
    });
} else {
    homeLazyLoader.init();
}
