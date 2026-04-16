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
    } else if (path.includes('photoshop.html')) {
        folder = 'assets/Photoshop/';
        gallerySelector = '.photoshop-grid';
        itemClass = 'photoshop-item';
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
    img.src = `${folder}${i}.jpg`;
    
    img.onload = function() {
        const div = document.createElement('div');
        div.className = itemClass;
        div.appendChild(img);
        gallery.appendChild(div);
        i++;
        loadImages(); // Try the next number
    };
    
    img.onerror = function() {
        // Try .jpeg extension
        img = new Image();
        img.src = `${folder}${i}.jpeg`;
        
        img.onload = function() {
            const div = document.createElement('div');
            div.className = itemClass;
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadImages);
} else {
    loadImages();
}
