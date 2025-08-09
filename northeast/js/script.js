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

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
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


// MapLibre Map with GeoJSON and Geolocation
let map;
let markers = [];
let currentLocationMarker = null;
let accuracyCircle = null;
let geojsonData = null;
let currentDay = 'all';

// Load GeoJSON data
async function loadGeoJSONData() {
    try {
        const response = await fetch('data/locations.geojson');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        geojsonData = await response.json();
        return geojsonData;
    } catch (error) {
        console.error('Error loading GeoJSON:', error);
        // Fallback to inline data if file loading fails
        return getFallbackGeoJSON();
    }
}

// Fallback GeoJSON data in case file loading fails
function getFallbackGeoJSON() {
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [-2.7833, 51.4833] },
                "properties": {
                    "name": "Portishead", "type": "Starting Point",
                    "description": "Your journey begins here! Home base before the adventure starts.",
                    "address": "17 Avon Way, Portishead, BS20 6JJ",
                    "icon": "map-marker-alt", "color": "#10b981", "day": 1,
                    "dayLabel": "Sunday - Departure", "category": "travel",
                    "details": "Sunday departure • Journey start • Pick up Angela"
                }
            },
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [-0.7278, 52.3992] },
                "properties": {
                    "name": "Kettering", "type": "Family Pickup",
                    "description": "Collect Frank (17) and Al (15) for the family adventure.",
                    "address": "6 Selby Close, Kettering, NN15 5RZ",
                    "icon": "users", "color": "#f59e0b", "day": 1,
                    "dayLabel": "Sunday - Family Pickup", "category": "travel",
                    "details": "Sunday pickup • Collect Frank & Al • Continue to York"
                }
            },
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [-1.0803, 53.9583] },
                "properties": {
                    "name": "York", "type": "Historic City & Overnight Stay",
                    "description": "Explore the medieval walls, magnificent Minster, JORVIK Viking Centre, and The Shambles before continuing north.",
                    "address": "16 Green Lane, Acomb, York YO24 3DL",
                    "icon": "landmark", "color": "#8b5cf6", "day": 2,
                    "dayLabel": "Monday - York Exploration", "category": "attraction",
                    "details": "Monday exploration • City Walls • York Minster • JORVIK • The Shambles"
                }
            },
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [-2.0847, 55.2833] },
                "properties": {
                    "name": "Sharperton", "type": "Your Base (4 nights)",
                    "description": "Your comfortable base in the heart of Northumberland National Park for 4 magical nights.",
                    "address": "Sharperton, NE65 7AE, Northumberland National Park",
                    "icon": "home", "color": "#dc2626", "day": 2,
                    "dayLabel": "Monday Evening - Arrival", "category": "accommodation",
                    "details": "4 nights accommodation • Central location for all attractions • Base camp"
                }
            },
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [-2.3275, 55.0142] },
                "properties": {
                    "name": "Hadrian's Wall (Housesteads)", "type": "UNESCO World Heritage Site",
                    "description": "Walk along the ancient Roman wall at Housesteads Fort, the best-preserved section with spectacular countryside views.",
                    "icon": "shield-alt", "color": "#b45309", "day": 3,
                    "dayLabel": "Tuesday - Roman Heritage", "category": "attraction",
                    "details": "Tuesday visit • 25 miles from base • 2.5 hours • 750m uphill walk"
                }
            },
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [-2.3167, 55.0167] },
                "properties": {
                    "name": "Sycamore Gap", "type": "Iconic Tree Location",
                    "description": "The famous sycamore tree in a dramatic dip in Hadrian's Wall, featured in Robin Hood: Prince of Thieves.",
                    "icon": "tree", "color": "#059669", "day": 3,
                    "dayLabel": "Tuesday - Roman Heritage", "category": "attraction",
                    "details": "Tuesday visit • Along Hadrian's Wall • Famous filming location • Photo opportunity"
                }
            },
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [-1.7067, 55.4150] },
                "properties": {
                    "name": "Alnwick Castle", "type": "Harry Potter Filming Location",
                    "description": "The iconic Hogwarts exterior from the first two Harry Potter films. Experience broomstick training and explore the medieval castle.",
                    "icon": "castle", "color": "#7c3aed", "day": 4,
                    "dayLabel": "Wednesday - Harry Potter Day", "category": "attraction",
                    "details": "Wednesday visit • 15 miles from base • 3 hours • Pre-book online"
                }
            },
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [-1.5833, 55.3833] },
                "properties": {
                    "name": "Shilbottle", "type": "Village Sign Photo Op",
                    "description": "Charming Northumberland village famous for its amusing name - perfect for a fun photo opportunity!",
                    "icon": "sign", "color": "#ea580c", "day": 4,
                    "dayLabel": "Wednesday - Harry Potter Day", "category": "attraction",
                    "details": "Wednesday visit • 12 miles from base • Quick stop • Fun photo opportunity"
                }
            },
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [-1.7092, 55.6092] },
                "properties": {
                    "name": "Bamburgh Castle", "type": "Coastal Fortress",
                    "description": "Dramatic clifftop castle overlooking the North Sea, one of England's most spectacular coastal fortresses.",
                    "icon": "crown", "color": "#7c3aed", "day": 4,
                    "dayLabel": "Wednesday - Harry Potter Day", "category": "attraction",
                    "details": "Wednesday visit • 25 miles from base • 2 hours • Stunning coastal views"
                }
            },
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [-1.7900, 55.6692] },
                "properties": {
                    "name": "Lindisfarne (Holy Island)", "type": "Tidal Island",
                    "description": "Historic monastery ruins and castle on a tidal island. Access depends on tide times - plan carefully!",
                    "icon": "water", "color": "#0ea5e9", "day": 5,
                    "dayLabel": "Thursday - Coastal Adventure", "category": "attraction",
                    "details": "Thursday visit • 30 miles from base • 3 hours • TIDE DEPENDENT ACCESS"
                }
            },
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [-2.0067, 55.7708] },
                "properties": {
                    "name": "Berwick-upon-Tweed", "type": "Border Town & Walls",
                    "description": "Historic border town with complete Elizabethan walls and fascinating Anglo-Scottish heritage.",
                    "icon": "flag", "color": "#059669", "day": 5,
                    "dayLabel": "Thursday - Coastal Adventure", "category": "attraction",
                    "details": "Thursday visit • 35 miles from base • 2 hours • Historic town walls"
                }
            },
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [-2.9333, 54.8833] },
                "properties": {
                    "name": "Carlisle", "type": "Final Family Meal",
                    "description": "Drop off Frank and Al with their uncle and enjoy a final family meal together before the journey home.",
                    "icon": "utensils", "color": "#ef4444", "day": 6,
                    "dayLabel": "Friday - Departure & Family Meal", "category": "travel",
                    "details": "Friday departure • Drop off boys • Family meal • Journey home"
                }
            }
        ]
    };
}

function initializeMap() {
    // Check if MapLibre is loaded and map container exists
    if (typeof maplibregl === 'undefined') {
        console.error('MapLibre GL JS not loaded');
        return;
    }
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }

    try {
        // Initialize the map
        map = new maplibregl.Map({
            container: 'map',
            style: 'https://tiles.openfreemap.org/styles/liberty',
            center: [-1.9, 55.4], // Centered on Northumberland
            zoom: 8,
            maxZoom: 18,
            minZoom: 5
        });

        // Add navigation controls
        map.addControl(new maplibregl.NavigationControl(), 'top-left');
        map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

        // Wait for map to load before adding markers
        map.on('load', async function() {
            await loadGeoJSONData();
            addLocationMarkers();
            setupMapControls();
            setupDayFilters();
        });

        // Handle map errors
        map.on('error', function(e) {
            console.error('Map error:', e);
        });

    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

function addLocationMarkers() {
    if (!geojsonData || !geojsonData.features) {
        console.error('No GeoJSON data available');
        return;
    }

    // Clear existing markers
    markers.forEach(markerData => markerData.marker.remove());
    markers = [];

    geojsonData.features.forEach(feature => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;

        try {
            // Create custom marker element
            const markerElement = document.createElement('div');
            markerElement.className = `custom-marker marker-${props.category}`;
            markerElement.setAttribute('data-day', props.day);
            
            // Create marker icon with improved styling
            const markerIcon = document.createElement('div');
            markerIcon.className = 'marker-icon';
            markerIcon.style.cssText = `
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: ${props.color};
                color: white;
                font-size: 16px;
                border: 3px solid #1f2937;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                transition: transform 0.3s ease;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            `;
            
            // Create icon element
            const iconElement = document.createElement('i');
            iconElement.className = `fas fa-${props.icon}`;
            markerIcon.appendChild(iconElement);
            markerElement.appendChild(markerIcon);
            
            // Style the main marker element
            markerElement.style.cssText = `
                width: 40px;
                height: 40px;
                cursor: pointer;
                display: ${currentDay === 'all' || currentDay == props.day ? 'block' : 'none'};
            `;
            
            // Add hover effect
            markerElement.addEventListener('mouseenter', () => {
                markerIcon.style.transform = 'scale(1.1)';
            });
            
            markerElement.addEventListener('mouseleave', () => {
                markerIcon.style.transform = 'scale(1)';
            });

            // Create popup content
            const popupContent = `
                <div class="popup-content">
                    <h4>${props.name}</h4>
                    <div class="popup-type">${props.type}</div>
                    <div class="popup-description">${props.description}</div>
                    ${props.address ? `<div class="popup-address"><i class="fas fa-map-marker-alt"></i> ${props.address}</div>` : ''}
                    <div class="popup-details">${props.details}</div>
                    <div class="popup-day"><i class="fas fa-calendar"></i> ${props.dayLabel}</div>
                </div>
            `;

            // Create popup
            const popup = new maplibregl.Popup({
                offset: 25,
                closeButton: true,
                closeOnClick: false
            }).setHTML(popupContent);

            // Create marker with proper positioning
            const marker = new maplibregl.Marker({
                element: markerElement,
                anchor: 'center'  // Changed from 'bottom' to 'center' for better positioning
            })
            .setLngLat(coords)
            .setPopup(popup)
            .addTo(map);

            markers.push({
                marker: marker,
                element: markerElement,
                day: props.day,
                category: props.category,
                name: props.name
            });

            // Special animation for home marker
            if (props.icon === 'home') {
                markerIcon.style.animation = 'pulse-home 2s infinite';
            }
        } catch (error) {
            console.error('Error adding marker for', props.name, error);
        }
    });
}

function setupMapControls() {
    // Fit bounds button
    const fitBoundsBtn = document.getElementById('fitBounds');
    if (fitBoundsBtn) {
        fitBoundsBtn.addEventListener('click', function() {
            if (geojsonData && geojsonData.features && geojsonData.features.length > 0) {
                const bounds = new maplibregl.LngLatBounds();
                
                geojsonData.features.forEach(feature => {
                    const coords = feature.geometry.coordinates;
                    // Ensure coordinates are valid numbers
                    if (Array.isArray(coords) && coords.length === 2 && 
                        !isNaN(coords[0]) && !isNaN(coords[1])) {
                        bounds.extend(coords);
                    }
                });
                
                if (!bounds.isEmpty()) {
                    map.fitBounds(bounds, {
                        padding: { top: 50, bottom: 50, left: 50, right: 50 },
                        maxZoom: 10
                    });
                }
            }
        });
    }

    // Back to base button
    const backToBaseBtn = document.getElementById('backToBase');
    if (backToBaseBtn) {
        backToBaseBtn.addEventListener('click', function() {
            // Find Sharperton (base) coordinates
            const baseFeature = geojsonData?.features?.find(f => f.properties.icon === 'home');
            if (baseFeature) {
                const coords = baseFeature.geometry.coordinates;
                map.flyTo({
                    center: coords,
                    zoom: 12,
                    duration: 2000
                });
            }
        });
    }

    // Find location button
    const findLocationBtn = document.getElementById('findLocation');
    if (findLocationBtn) {
        findLocationBtn.addEventListener('click', function() {
            if ('geolocation' in navigator) {
                const button = this;
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding...';
                button.disabled = true;

                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        const coords = [position.coords.longitude, position.coords.latitude];
                        
                        // Remove existing user location marker
                        if (window.userLocationMarker) {
                            window.userLocationMarker.remove();
                        }
                        
                        // Create user location marker
                        const userMarkerElement = document.createElement('div');
                        userMarkerElement.className = 'user-location-marker';
                        userMarkerElement.innerHTML = '<i class="fas fa-location-arrow"></i>';
                        userMarkerElement.style.cssText = `
                            width: 30px;
                            height: 30px;
                            background: #3b82f6;
                            border: 3px solid white;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 14px;
                            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                            animation: pulse-location 2s infinite;
                        `;
                        
                        window.userLocationMarker = new maplibregl.Marker({
                            element: userMarkerElement,
                            anchor: 'center'
                        })
                        .setLngLat(coords)
                        .setPopup(new maplibregl.Popup().setHTML('<div class="popup-content"><h4>Your Location</h4><p>Current GPS position</p></div>'))
                        .addTo(map);
                        
                        // Fly to user location
                        map.flyTo({
                            center: coords,
                            zoom: 14,
                            duration: 2000
                        });
                        
                        button.innerHTML = originalText;
                        button.disabled = false;
                    },
                    function(error) {
                        console.error('Geolocation error:', error);
                        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Location Error';
                        setTimeout(() => {
                            button.innerHTML = originalText;
                            button.disabled = false;
                        }, 3000);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    }
                );
            } else {
                alert('Geolocation is not supported by this browser.');
            }
        });
    }

    // Fullscreen toggle button
    const toggleFullscreenBtn = document.getElementById('toggleFullscreen');
    if (toggleFullscreenBtn) {
        toggleFullscreenBtn.addEventListener('click', function() {
            const mapContainer = document.querySelector('.map-container');
            const button = this;
            const icon = button.querySelector('i');
            
            if (mapContainer.classList.contains('fullscreen')) {
                // Exit fullscreen
                mapContainer.classList.remove('fullscreen');
                icon.className = 'fas fa-expand';
                button.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
                
                // Resize map after exiting fullscreen
                setTimeout(() => {
                    map.resize();
                }, 100);
            } else {
                // Enter fullscreen
                mapContainer.classList.add('fullscreen');
                icon.className = 'fas fa-compress';
                button.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
                
                // Resize map after entering fullscreen
                setTimeout(() => {
                    map.resize();
                }, 100);
            }
        });
    }

    // ESC key to exit fullscreen
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const mapContainer = document.querySelector('.map-container');
            if (mapContainer.classList.contains('fullscreen')) {
                const toggleBtn = document.getElementById('toggleFullscreen');
                if (toggleBtn) toggleBtn.click();
            }
        }
    });
}

function setupDayFilters() {
    const dayButtons = document.querySelectorAll('.day-btn');
    dayButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedDay = this.getAttribute('data-day');
            filterByDay(selectedDay);
            
            // Update active button
            dayButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function filterByDay(day) {
    currentDay = day;
    
    markers.forEach(markerData => {
        const shouldShow = day === 'all' || markerData.day == day;
        markerData.element.style.display = shouldShow ? 'block' : 'none';
    });
}

// Geolocation functionality
function getCurrentLocation() {
    const locateBtn = document.getElementById('locate-me');
    
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        return;
    }

    // Update button state
    locateBtn.classList.add('locating');
    locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            showCurrentLocation(longitude, latitude, accuracy);
            
            // Update button state
            locateBtn.classList.remove('locating');
            locateBtn.classList.add('located');
            locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Location Found';
            
            // Reset button after 3 seconds
            setTimeout(() => {
                locateBtn.classList.remove('located');
                locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Find My Location';
            }, 3000);
        },
        (error) => {
            console.error('Geolocation error:', error);
            handleLocationError(error);
            
            // Update button state
            locateBtn.classList.remove('locating');
            locateBtn.classList.add('location-error');
            locateBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Location Error';
            
            // Reset button after 3 seconds
            setTimeout(() => {
                locateBtn.classList.remove('location-error');
                locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Find My Location';
            }, 3000);
        },
        options
    );
}

function showCurrentLocation(longitude, latitude, accuracy) {
    // Remove existing current location marker and accuracy circle
    if (currentLocationMarker) {
        currentLocationMarker.remove();
    }
    if (accuracyCircle) {
        accuracyCircle.remove();
    }

    // Create current location marker
    const locationElement = document.createElement('div');
    locationElement.className = 'current-location-marker';

    currentLocationMarker = new maplibregl.Marker({
        element: locationElement,
        anchor: 'center'
    })
    .setLngLat([longitude, latitude])
    .addTo(map);

    // Create accuracy circle if accuracy is reasonable (less than 1000m)
    if (accuracy < 1000) {
        const accuracyElement = document.createElement('div');
        accuracyElement.className = 'accuracy-circle';
        const radiusInPixels = Math.max(accuracy / 10, 20); // Rough conversion
        accuracyElement.style.width = `${radiusInPixels * 2}px`;
        accuracyElement.style.height = `${radiusInPixels * 2}px`;

        accuracyCircle = new maplibregl.Marker({
            element: accuracyElement,
            anchor: 'center'
        })
        .setLngLat([longitude, latitude])
        .addTo(map);
    }

    // Create popup for current location
    const locationPopup = new maplibregl.Popup({
        offset: 15,
        closeButton: true,
        closeOnClick: false
    }).setHTML(`
        <div class="popup-content">
            <h4><i class="fas fa-location-arrow"></i> Your Current Location</h4>
            <div class="popup-description">You are here!</div>
            <div class="popup-details">
                Accuracy: ±${Math.round(accuracy)}m<br>
                Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
            </div>
        </div>
    `);

    currentLocationMarker.setPopup(locationPopup);

    // Fly to current location
    map.flyTo({
        center: [longitude, latitude],
        zoom: Math.max(map.getZoom(), 12),
        duration: 1500
    });
}

function handleLocationError(error) {
    let message = 'Unable to get your location. ';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message += 'Location access was denied. Please enable location services and try again.';
            break;
        case error.POSITION_UNAVAILABLE:
            message += 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            message += 'Location request timed out. Please try again.';
            break;
        default:
            message += 'An unknown error occurred.';
            break;
    }
    
    alert(message);
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure MapLibre is fully loaded
    setTimeout(() => {
        initializeMap();
    }, 500);
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

