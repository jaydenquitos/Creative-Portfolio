// Sequential Image Loading System
let i = 1;

function loadImages() {
    // Determine current page and folder
    const path = window.location.pathname;
    let folder, gallerySelector, itemClass;
    
    if (path.includes('photography.html')) {
        folder = 'assets/Photos/';
        gallerySelector = '.photography-grid';
        itemClass = 'photo-item';
    } else if (path.includes('graphic-design.html')) {
        folder = 'assets/Graphic Design/';
        gallerySelector = '.graphic-design-grid';
        itemClass = 'graphic-design-item';
    } else {
        // Not on a gallery page, don't load images
        return;
    }
    
    const gallery = document.querySelector(gallerySelector);
    
    if (!gallery) {
        console.log(`Gallery element not found: ${gallerySelector}`);
        return;
    }
    
    let img = new Image();
    img.src = `${folder}${i}.jpg?v=${Date.now()}`;
    
    img.onload = function() {
        const div = document.createElement('div');
        div.className = itemClass;
        div.style.cursor = 'pointer';
        
        // Embed modal functionality directly into this card
        div.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the modal elements
            const modal = document.getElementById('photoModal');
            const modalImg = document.getElementById('modalImage');
            
            if (modal && modalImg) {
                // Set the image source and show modal
                modalImg.src = img.src; // Use the loaded image source directly
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
        
        div.appendChild(img);
        gallery.appendChild(div);
        i++;
        loadImages(); // Try the next number
    };
    
    img.onerror = function() {
        // Try .jpeg extension
        img = new Image();
        img.src = `${folder}${i}.jpeg?v=${Date.now()}`;
        
        img.onload = function() {
            const div = document.createElement('div');
            div.className = itemClass;
            div.style.cursor = 'pointer';
            
            // Embed modal functionality directly into this card
            div.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get the modal elements
                const modal = document.getElementById('photoModal');
                const modalImg = document.getElementById('modalImage');
                
                if (modal && modalImg) {
                    // Set the image source and show modal
                    modalImg.src = img.src; // Use the loaded image source directly
                    modal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            });
            
            div.appendChild(img);
            gallery.appendChild(div);
            i++;
            loadImages(); // Try the next number
        };
        
        img.onerror = function() {
            // Try .png extension
            img = new Image();
            img.src = `${folder}${i}.png`;
            
            img.onload = function() {
                const div = document.createElement('div');
                div.className = itemClass;
                div.style.cursor = 'pointer';
                
                // Embed modal functionality directly into this card
                div.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Get the modal elements
                    const modal = document.getElementById('photoModal');
                    const modalImg = document.getElementById('modalImage');
                    
                    if (modal && modalImg) {
                        // Set the image source and show modal
                        modalImg.src = img.src; // Use the loaded image source directly
                        modal.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                    }
                });
                
                div.appendChild(img);
                gallery.appendChild(div);
                i++;
                loadImages(); // Try the next number
            };
            
            img.onerror = function() {
                // No more images found, stop loading
                console.log(`Finished loading images. Last attempted: ${folder}${i}`);
            };
        };
    };
}

// Update copyright year automatically
function updateCopyrightYear() {
    const currentYear = new Date().getFullYear();
    const copyrightElements = document.querySelectorAll('.copyright p');
    
    copyrightElements.forEach(element => {
        element.textContent = `© ${currentYear} Jayden Quitos`;
    });
}


// Close modal functionality
function closeModal() {
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Add modal event listeners when DOM is ready
function setupModalEvents() {
    // Close modal when clicking the X
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside the image
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupModalEvents();
        loadImages();
        updateCopyrightYear();
    });
} else {
    setupModalEvents();
    loadImages();
    updateCopyrightYear();
}
