// Robust Image Loader - Guaranteed to load all available images
class RobustImageLoader {
    constructor() {
        this.folder = '';
        this.gallerySelector = '';
        this.itemClass = '';
        this.loadedImages = new Set();
        this.observer = null;
        this.currentIndex = 1;
        this.maxIndex = 50; // Safe upper limit - higher than any expected file count
        this.isLoading = true;
    }

    init() {
        this.determinePageSettings();
        if (!this.folder) return;

        this.setupModalEvents();
        this.setupIntersectionObserver();
        this.loadInitialBatch();
        this.updateCopyrightYear();
    }

    determinePageSettings() {
        const path = window.location.pathname;
        
        if (path.includes('photography.html')) {
            this.folder = 'assets/Photos/';
            this.gallerySelector = '.photography-grid';
            this.itemClass = 'photo-item';
            this.maxIndex = 50; // Safe limit for Photos (you have 35)
        } else if (path.includes('graphic-design.html')) {
            this.folder = 'assets/Graphic Design/';
            this.gallerySelector = '.graphic-design-grid';
            this.itemClass = 'graphic-design-item';
            this.maxIndex = 25; // Safe limit for Graphic Design (you have 17)
        }
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

    loadInitialBatch() {
        const gallery = document.querySelector(this.gallerySelector);
        if (!gallery) return;

        // Load first 3 images immediately
        for (let i = 1; i <= 3; i++) {
            if (i > this.maxIndex) break;
            const placeholder = this.createPlaceholder(i);
            gallery.appendChild(placeholder);
            
            const img = placeholder.querySelector('img');
            this.loadImage(img);
            this.observer.unobserve(img);
        }

        // Add lazy placeholders for next batch
        setTimeout(() => {
            this.loadMoreImages();
        }, 100);
    }

    createPlaceholder(index) {
        const div = document.createElement('div');
        div.className = this.itemClass;
        div.style.cursor = 'pointer';
        div.style.background = 'linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)';
        div.style.backgroundSize = '200% 100%';
        div.style.animation = 'shimmer 1.5s infinite';

        const img = document.createElement('img');
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.dataset.index = index;
        
        div.appendChild(img);
        this.setupModalClick(div);
        
        return div;
    }

    loadImage(img) {
        const index = parseInt(img.dataset.index);
        
        // Don't load if we've exceeded our max index
        if (index > this.maxIndex) {
            const placeholder = img.parentElement;
            placeholder.remove();
            return;
        }

        const extensions = ['jpg', 'jpeg', 'png'];
        let currentExt = 0;

        const tryLoad = () => {
            if (currentExt >= extensions.length) {
                // All extensions failed for this index - remove the blank card
                const placeholder = img.parentElement;
                placeholder.remove();
                
                // Continue loading more images
                this.loadMoreImages();
                return;
            }

            const testImg = new Image();
            testImg.src = `${this.folder}${index}.${extensions[currentExt]}`;
            
            testImg.onload = () => {
                img.src = testImg.src;
                img.style.opacity = '1';
                img.parentElement.style.animation = 'none';
                img.parentElement.style.background = 'none';
                
                this.loadedImages.add(index);
                
                // Always load more images to ensure continuous loading
                this.loadMoreImages();
            };
            
            testImg.onerror = () => {
                currentExt++;
                tryLoad();
            };
        };

        tryLoad();
    }

    loadMoreImages() {
        if (!this.isLoading) return;
        
        const gallery = document.querySelector(this.gallerySelector);
        if (!gallery) return;

        // Find the next index to try
        let nextIndex = 1;
        while (this.loadedImages.has(nextIndex) || this.isIndexQueued(nextIndex)) {
            nextIndex++;
        }
        
        // Stop if we've exceeded our max index
        if (nextIndex > this.maxIndex) {
            this.stopLoading();
            return;
        }
        
        // Create placeholders for next batch - larger batch size
        const batchSize = 8;
        for (let i = nextIndex; i <= Math.min(nextIndex + batchSize - 1, this.maxIndex); i++) {
            if (!this.loadedImages.has(i) && !this.isIndexQueued(i)) {
                const placeholder = this.createPlaceholder(i);
                gallery.appendChild(placeholder);
                this.observer.observe(placeholder.querySelector('img'));
            }
        }
    }

    isIndexQueued(index) {
        const gallery = document.querySelector(this.gallerySelector);
        if (!gallery) return false;
        
        const placeholders = gallery.querySelectorAll(`.${this.itemClass}`);
        for (let placeholder of placeholders) {
            const img = placeholder.querySelector('img');
            if (img && parseInt(img.dataset.index) === index && img.style.opacity === '0') {
                return true;
            }
        }
        return false;
    }

    stopLoading() {
        this.isLoading = false;
        console.log(`Loading complete. Total images loaded: ${this.loadedImages.size} from ${this.folder}`);
    }

    setupModalClick(div) {
        div.addEventListener('click', (e) => {
            e.preventDefault();
            
            const modal = document.getElementById('photoModal');
            const modalImg = document.getElementById('modalImage');
            
            if (modal && modalImg) {
                const img = div.querySelector('img');
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

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
`;
document.head.appendChild(style);

// Initialize
const robustLoader = new RobustImageLoader();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        robustLoader.init();
    });
} else {
    robustLoader.init();
}
