// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger menu
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach((bar, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) bar.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) bar.style.opacity = '0';
                    if (index === 2) bar.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                }
            });
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const bars = navToggle.querySelectorAll('.bar');
                bars.forEach(bar => {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                });
            }
        });
    });

    // Dining Category Tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    const categoryContents = document.querySelectorAll('.category-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            categoryContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.querySelector(`.category-content[data-category="${category}"]`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Smooth scrolling for navigation links (only for anchor links, not .map-link or external links)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only handle if href starts with '#' and does not have .map-link class
            const href = this.getAttribute('href');
            if (this.classList.contains('map-link') || !href || !href.startsWith('#')) {
                return; // Allow default for map-link and non-anchor links
            }
            e.preventDefault();
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe timeline items and cards for animation
    const animatedElements = document.querySelectorAll('.timeline-item, .overview-card, .attraction-card, .restaurant-card, .practical-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Tide times warning enhancement
    const tideWarnings = document.querySelectorAll('.tide-warning, .activity.tide-warning');
    tideWarnings.forEach(warning => {
        warning.addEventListener('click', function() {
            this.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
        });
    });

    // Add pulse animation for tide warnings
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);

    // Timeline item hover effects
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        const content = item.querySelector('.timeline-content');
        const marker = item.querySelector('.timeline-marker');
        
        item.addEventListener('mouseenter', function() {
            marker.style.transform = 'translateX(-50%) scale(1.1)';
            marker.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            marker.style.transform = 'translateX(-50%) scale(1)';
        });
    });

    // Add click-to-expand functionality for practical cards
    const practicalCards = document.querySelectorAll('.practical-card');
    practicalCards.forEach(card => {
        const content = card.querySelector('ul, p');
        if (content) {
            card.addEventListener('click', function() {
                this.classList.toggle('expanded');
                if (this.classList.contains('expanded')) {
                    this.style.transform = 'translateY(-5px) scale(1.02)';
                } else {
                    this.style.transform = 'translateY(-3px) scale(1)';
                }
            });
        }
    });

    // Add search functionality (basic)
    function addSearchFunctionality() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" id="search-input" placeholder="Search attractions, restaurants, or activities..." />
            <button id="search-button"><i class="fas fa-search"></i></button>
        `;
        
        // Add search styles
        const searchStyles = `
            .search-container {
                max-width: 500px;
                margin: 20px auto;
                position: relative;
                display: flex;
                gap: 10px;
            }
            
            #search-input {
                flex: 1;
                padding: 12px 20px;
                border: 2px solid #e5e7eb;
                border-radius: 25px;
                font-size: 1rem;
                outline: none;
                transition: border-color 0.3s ease;
            }
            
            #search-input:focus {
                border-color: #2563eb;
            }
            
            #search-button {
                background: #2563eb;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            #search-button:hover {
                background: #1d4ed8;
            }
            
            .search-highlight {
                background: yellow;
                padding: 2px 4px;
                border-radius: 3px;
            }
        `;
        
        const searchStyleSheet = document.createElement('style');
        searchStyleSheet.textContent = searchStyles;
        document.head.appendChild(searchStyleSheet);
        
        // Insert search container after hero section
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.insertAdjacentElement('afterend', searchContainer);
        }
        
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        
        function performSearch() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            if (!searchTerm) return;
            
            // Remove previous highlights
            document.querySelectorAll('.search-highlight').forEach(el => {
                el.outerHTML = el.innerHTML;
            });
            
            // Search in content
            const searchableElements = document.querySelectorAll('h3, h4, p, .description, .attraction-type');
            let found = false;
            
            searchableElements.forEach(el => {
                const text = el.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    // Highlight the term
                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                    el.innerHTML = el.innerHTML.replace(regex, '<span class="search-highlight">$1</span>');
                    
                    // Scroll to first result
                    if (!found) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        found = true;
                    }
                }
            });
            
            if (!found) {
                alert('No results found for: ' + searchTerm);
            }
        }
        
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Initialize search functionality
    addSearchFunctionality();

    // Add weather widget placeholder
    function addWeatherWidget() {
        const weatherWidget = document.createElement('div');
        weatherWidget.className = 'weather-widget';
        weatherWidget.innerHTML = `
            <div class="weather-content">
                <h4><i class="fas fa-cloud-sun"></i> Weather Tip</h4>
                <p>Northumberland coastal areas can be windy - bring layers! Check local weather before visiting Lindisfarne.</p>
            </div>
        `;
        
        const weatherStyles = `
            .weather-widget {
                background: linear-gradient(135deg, #60a5fa, #3b82f6);
                color: white;
                padding: 20px;
                border-radius: 15px;
                margin: 20px auto;
                max-width: 600px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            
            .weather-content h4 {
                margin-bottom: 10px;
                font-size: 1.2rem;
            }
            
            .weather-content i {
                margin-right: 8px;
            }
        `;
        
        const weatherStyleSheet = document.createElement('style');
        weatherStyleSheet.textContent = weatherStyles;
        document.head.appendChild(weatherStyleSheet);
        
        // Insert weather widget in practical section
        const practicalSection = document.getElementById('practical');
        if (practicalSection) {
            const container = practicalSection.querySelector('.container');
            const title = container.querySelector('.section-title');
            title.insertAdjacentElement('afterend', weatherWidget);
        }
    }
    
    // Initialize weather widget
    addWeatherWidget();
});

// Global function for CTA button
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Print functionality
function printItinerary() {
    window.print();
}

// Add print button
document.addEventListener('DOMContentLoaded', function() {
    const printButton = document.createElement('button');
    printButton.innerHTML = '<i class="fas fa-print"></i> Print Itinerary';
    printButton.className = 'print-button';
    printButton.onclick = printItinerary;
    
    const printStyles = `
        .print-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2563eb;
            color: white;
            border: none;
            padding: 15px 20px;
            border-radius: 50px;
            cursor: pointer;
            font-weight: 500;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .print-button:hover {
            background: #1d4ed8;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        @media print {
            .navbar, .print-button, .search-container, .weather-widget {
                display: none !important;
            }
            
            body {
                font-size: 12px;
                line-height: 1.4;
            }
            
            .hero {
                padding: 20px 0;
                background: none !important;
                color: black !important;
            }
            
            section {
                padding: 20px 0;
                page-break-inside: avoid;
            }
            
            .timeline-item {
                page-break-inside: avoid;
                margin-bottom: 20px;
            }
        }
    `;
    
    const printStyleSheet = document.createElement('style');
    printStyleSheet.textContent = printStyles;
    document.head.appendChild(printStyleSheet);
    
    document.body.appendChild(printButton);
});

// Add back to top functionality
document.addEventListener('DOMContentLoaded', function() {
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.className = 'back-to-top';
    backToTopButton.onclick = function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const backToTopStyles = `
        .back-to-top {
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: #6b7280;
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
        }
        
        .back-to-top.visible {
            opacity: 1;
            visibility: visible;
        }
        
        .back-to-top:hover {
            background: #374151;
            transform: translateY(-2px);
        }
    `;
    
    const backToTopStyleSheet = document.createElement('style');
    backToTopStyleSheet.textContent = backToTopStyles;
    document.head.appendChild(backToTopStyleSheet);
    
    document.body.appendChild(backToTopButton);
    
    // Show/hide back to top button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
});

// Draggable Day Filters Functionality
function makeDayFiltersDraggable() {
    const dayFilters = document.querySelector('.day-filters');
    if (!dayFilters) return;

    let isDragging = false;
    let startX, startY, initialX, initialY;
    let currentX = 0, currentY = 0;

    function handleStart(e) {
        // Don't drag if clicking on buttons or controls
        if (e.target.classList.contains('day-btn') || 
            e.target.classList.contains('control-btn') || 
            e.target.closest('.day-btn') || 
            e.target.closest('.control-btn')) {
            return;
        }

        isDragging = true;
        dayFilters.classList.add('dragging');

        // Handle both mouse and touch events
        const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

        startX = clientX - currentX;
        startY = clientY - currentY;

        // Store initial position
        const rect = dayFilters.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;

        // Prevent text selection during drag
        e.preventDefault();
    }

    function handleMove(e) {
        if (!isDragging) return;

        e.preventDefault();

        // Handle both mouse and touch events
        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        currentX = clientX - startX;
        currentY = clientY - startY;

        // Get boundaries - use viewport instead of map container for better boundaries
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const filterRect = dayFilters.getBoundingClientRect();
        
        // Calculate boundaries with padding
        const padding = 20;
        const minX = -initialX + padding;
        const maxX = viewportWidth - initialX - filterRect.width - padding;
        const minY = -initialY + padding;
        const maxY = viewportHeight - initialY - filterRect.height - padding;

        // Constrain to boundaries
        currentX = Math.max(minX, Math.min(maxX, currentX));
        currentY = Math.max(minY, Math.min(maxY, currentY));

        // Apply transform
        dayFilters.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }

    function handleEnd(e) {
        if (!isDragging) return;

        isDragging = false;
        dayFilters.classList.remove('dragging');

        // Store position for future reference
        dayFilters.setAttribute('data-x', currentX);
        dayFilters.setAttribute('data-y', currentY);
    }

    // Remove existing event listeners to prevent duplicates
    dayFilters.removeEventListener('mousedown', handleStart);
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    dayFilters.removeEventListener('touchstart', handleStart);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('touchend', handleEnd);

    // Mouse events
    dayFilters.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // Touch events for mobile
    dayFilters.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    // Initialize position from stored data
    const storedX = dayFilters.getAttribute('data-x');
    const storedY = dayFilters.getAttribute('data-y');
    if (storedX && storedY) {
        currentX = parseFloat(storedX);
        currentY = parseFloat(storedY);
        dayFilters.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }

    // Add visual feedback for draggability
    dayFilters.setAttribute('title', 'Drag to reposition');
}

// Initialize draggable functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure map is initialized
    setTimeout(() => {
        makeDayFiltersDraggable();
    }, 1000);
});

// Re-initialize after window resize to update boundaries
window.addEventListener('resize', function() {
    setTimeout(() => {
        makeDayFiltersDraggable();
    }, 100);
});

