// Ultra-Optimized Image Loading System - Maximum Performance
class UltraOptimizedImageLoader {
    constructor() {
        this.folder = '';
        this.gallerySelector = '';
        this.itemClass = '';
        this.loadedImages = new Set();
        this.observer = null;
        this.imageCache = new Map();
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.viewportWidth = window.innerWidth;
        this.connectionType = this.getConnectionType();
        this.isMobile = this.isMobileDevice();
    }

    init() {
        this.determinePageSettings();
        if (!this.folder) return;

        this.setupModalEvents();
        this.setupOptimizedObserver();
        this.loadCriticalImages();
        this.updateCopyrightYear();
        this.setupPerformanceMonitoring();
    }

    getConnectionType() {
        // Check connection type for adaptive loading
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return {
                effectiveType: connection.effectiveType || '4g',
                saveData: connection.saveData || false,
                downlink: connection.downlink || 10
            };
        }
        return { effectiveType: '4g', saveData: false, downlink: 10 };
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    determinePageSettings() {
        const path = window.location.pathname;
        
        if (path.includes('photography.html')) {
            this.folder = 'assets/Photos/';
            this.gallerySelector = '.photography-grid';
            this.itemClass = 'photo-item';
        } else if (path.includes('graphic-design.html')) {
            this.folder = 'assets/Graphic Design/';
            this.gallerySelector = '.graphic-design-grid';
            this.itemClass = 'graphic-design-item';
        }
    }

    setupOptimizedObserver() {
        // Ultra-optimized Intersection Observer with adaptive thresholds
        const thresholds = this.isMobile ? [0.01, 0.1, 0.5] : [0.01, 0.25, 0.5, 0.75];
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const priority = entry.intersectionRatio > 0.5 ? 'high' : 'normal';
                    this.loadImageOptimized(img, priority);
                    this.observer.unobserve(img);
                }
            });
        }, {
            rootMargin: this.getOptimizedRootMargin(),
            threshold: thresholds
        });
    }

    getOptimizedRootMargin() {
        // Adaptive root margin based on connection and device
        if (this.connectionType.saveData) return '50px';
        if (this.isMobile) return '150px';
        if (this.connectionType.effectiveType === '4g') return '200px';
        return '100px';
    }

    loadCriticalImages() {
        const gallery = document.querySelector(this.gallerySelector);
        if (!gallery) return;

        // Load only critical images (first 2) immediately
        for (let i = 1; i <= 2; i++) {
            const placeholder = this.createOptimizedPlaceholder(i);
            gallery.appendChild(placeholder);
            
            const img = placeholder.querySelector('img');
            this.loadImageOptimized(img, 'high');
        }

        // Add lazy placeholders for next batch
        setTimeout(() => {
            for (let i = 3; i <= 6; i++) {
                const placeholder = this.createOptimizedPlaceholder(i);
                gallery.appendChild(placeholder);
                this.observer.observe(placeholder.querySelector('img'));
            }
        }, 100);
    }

    createOptimizedPlaceholder(index) {
        const div = document.createElement('div');
        div.className = this.itemClass;
        div.style.cursor = 'pointer';
        
        // Optimized placeholder with minimal CSS
        const img = document.createElement('img');
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.2s ease';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.imageRendering = 'auto';
        img.style.backfaceVisibility = 'hidden';
        img.style.transform = 'translateZ(0)';
        img.loading = 'lazy'; // Native lazy loading as fallback
        img.dataset.index = index;
        
        // Add minimal placeholder background
        div.style.background = 'linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)';
        div.style.backgroundSize = '200% 100%';
        div.style.animation = 'shimmer 1.5s infinite';
        
        div.appendChild(img);
        this.setupModalClick(div);
        
        return div;
    }

    async loadImageOptimized(img, priority = 'normal') {
        const index = parseInt(img.dataset.index);
        
        // Check cache first
        if (this.imageCache.has(index)) {
            const cachedSrc = this.imageCache.get(index);
            img.src = cachedSrc;
            img.style.opacity = '1';
            img.parentElement.style.animation = 'none';
            img.parentElement.style.background = 'none';
            return;
        }

        // Determine optimal image format and size
        const imageConfig = this.getOptimalImageConfig(index);
        
        try {
            // Try WebP first (if supported), then fallback to original
            const imageSrc = await this.loadImageWithFallback(imageConfig);
            
            // Cache the result
            this.imageCache.set(index, imageSrc);
            
            // Apply to DOM
            img.src = imageSrc;
            img.style.opacity = '1';
            img.parentElement.style.animation = 'none';
            img.parentElement.style.background = 'none';
            
            this.loadedImages.add(index);
            
            // Load next batch if needed
            if (this.loadedImages.size % 6 === 0) {
                this.loadNextBatch();
            }
            
        } catch (error) {
            console.warn(`Failed to load image ${index}:`, error);
            this.loadNextBatch();
        }
    }

    getOptimalImageConfig(index) {
        // Calculate optimal image size based on viewport and device
        const cardWidth = this.isMobile ? 
            Math.min(300, this.viewportWidth * 0.8) : 
            Math.min(400, this.viewportWidth * 0.2);
        
        const cardHeight = cardWidth * 1.25; // 4:5 aspect ratio
        
        // Scale for device pixel ratio
        const optimalWidth = Math.ceil(cardWidth * this.devicePixelRatio);
        const optimalHeight = Math.ceil(cardHeight * this.devicePixelRatio);
        
        // Adjust quality based on connection
        const quality = this.connectionType.saveData ? 60 : 
                       this.connectionType.effectiveType === '4g' ? 85 : 75;
        
        return {
            index,
            width: optimalWidth,
            height: optimalHeight,
            quality,
            format: this.supportsWebP() ? 'webp' : 'auto'
        };
    }

    supportsWebP() {
        // Simple WebP support detection
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    async loadImageWithFallback(config) {
        const extensions = this.getExtensionPriority(config.format);
        
        for (const ext of extensions) {
            try {
                const src = await this.tryLoadImage(config, ext);
                return src;
            } catch (error) {
                continue; // Try next extension
            }
        }
        
        throw new Error(`No valid image found for index ${config.index}`);
    }

    getExtensionPriority(format) {
        if (format === 'webp') {
            return ['webp', 'jpg', 'jpeg', 'png'];
        }
        return ['jpg', 'jpeg', 'png', 'webp'];
    }

    tryLoadImage(config, extension) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const src = this.buildImageSrc(config, extension);
            
            img.onload = () => resolve(src);
            img.onerror = reject;
            
            // Add timeout for slow connections
            const timeout = setTimeout(() => {
                reject(new Error('Load timeout'));
            }, 5000);
            
            img.onload = () => {
                clearTimeout(timeout);
                resolve(src);
            };
            
            img.src = src;
        });
    }

    buildImageSrc(config, extension) {
        const baseUrl = `${this.folder}${config.index}.${extension}`;
        
        // Add optimization parameters for supported formats
        if (extension === 'webp' && !this.connectionType.saveData) {
            return `${baseUrl}?w=${config.width}&h=${config.height}&q=${config.quality}&format=webp`;
        }
        
        return baseUrl;
    }

    loadNextBatch() {
        const gallery = document.querySelector(this.gallerySelector);
        if (!gallery) return;

        const startIndex = this.loadedImages.size + 1;
        const batchSize = this.isMobile ? 4 : 6;
        
        for (let i = startIndex; i <= startIndex + batchSize - 1; i++) {
            if (!this.loadedImages.has(i)) {
                const placeholder = this.createOptimizedPlaceholder(i);
                gallery.appendChild(placeholder);
                this.observer.observe(placeholder.querySelector('img'));
            }
        }
    }

    setupModalClick(div) {
        div.addEventListener('click', (e) => {
            e.preventDefault();
            
            const modal = document.getElementById('photoModal');
            const modalImg = document.getElementById('modalImage');
            
            if (modal && modalImg) {
                const img = div.querySelector('img');
                if (img.src && img.src !== window.location.href) {
                    // Load high-quality version for modal
                    this.loadModalImage(img.src, modalImg);
                    modal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    }

    loadModalImage(thumbSrc, modalImg) {
        // For modal, load the highest quality version available
        const index = parseInt(thumbSrc.match(/(\d+)\.\w+/)?.[1] || 1);
        const extensions = ['jpg', 'jpeg', 'png', 'webp'];
        
        const tryLoadHighQuality = async () => {
            for (const ext of extensions) {
                try {
                    const highQualitySrc = `${this.folder}${index}.${ext}`;
                    const img = new Image();
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = highQualitySrc;
                    });
                    modalImg.src = highQualitySrc;
                    return;
                } catch (error) {
                    continue;
                }
            }
            modalImg.src = thumbSrc; // Fallback to thumbnail
        };
        
        tryLoadHighQuality();
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

    setupPerformanceMonitoring() {
        // Monitor loading performance
        if ('performance' in window && 'measure' in performance) {
            performance.mark('image-loader-start');
            
            setTimeout(() => {
                performance.mark('image-loader-end');
                performance.measure('image-loader-duration', 'image-loader-start', 'image-loader-end');
                
                const measures = performance.getEntriesByName('image-loader-duration');
                if (measures.length > 0) {
                    console.log(`Image loading took ${measures[0].duration}ms`);
                }
            }, 5000);
        }
    }
}

// Optimized CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
`;
document.head.appendChild(style);

// Initialize with performance optimization
const ultraLoader = new UltraOptimizedImageLoader();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Use requestIdleCallback for non-critical initialization
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => ultraLoader.init(), { timeout: 1000 });
        } else {
            setTimeout(() => ultraLoader.init(), 100);
        }
    });
} else {
    ultraLoader.init();
}
