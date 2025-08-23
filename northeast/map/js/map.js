// Global variables
let map;
let geoJsonData = null;
let currentLocationMarker = null;
let markers = [];

// Day colors for filtering
const dayColors = {
    1: '#ef4444', // red
    2: '#10b981', // green  
    3: '#f59e0b', // amber
    4: '#8b5cf6', // violet
    5: '#06b6d4', // cyan
    6: '#84cc16'  // lime
};

// Initialize the map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupEventListeners();
});

function initializeMap() {
    // Create the map
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [-2.0, 55.2], // Centered on Northumberland
        zoom: 8,
        attributionControl: true
    });

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Load data when both map and all resources are ready
    let mapLoaded = false;
    let pageLoaded = false;
    
    const tryLoadData = () => {
        if (mapLoaded && pageLoaded) {
            loadGeoJSONData();
        }
    };
    
    map.on('load', function() {
        mapLoaded = true;
        tryLoadData();
    });
    
    // Add zoom event listener for marker visibility
    map.on('zoom', function() {
        updateMarkerVisibility();
    });
    
    // Wait for all page resources including CSS to load
    if (document.readyState === 'complete') {
        pageLoaded = true;
        tryLoadData();
    } else {
        window.addEventListener('load', () => {
            pageLoaded = true;
            tryLoadData();
        });
    }

    // Handle map errors
    map.on('error', function(e) {
        hideLoading();
        showError('Failed to load map. Please refresh the page.');
    });
    // Day filter buttons
    const dayBtns = document.querySelectorAll('.day-btn');
    dayBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all
            dayBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            this.classList.add('active');
            // Filter markers
            const day = this.getAttribute('data-day');
            filterMarkersByDay(day);
        });
    });
}

async function loadGeoJSONData() {
    try {
        const response = await fetch('data/locations.geojson');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        geoJsonData = await response.json();
        
    // Add markers to map
    addMarkersToMap();
    // Apply current day filter (default to 'all' if none active)
    const activeDayBtn = document.querySelector('.day-btn.active');
    const day = activeDayBtn ? activeDayBtn.getAttribute('data-day') : 'all';
    filterMarkersByDay(day);
    // Fit map to show all locations
    fitMapToLocations();
        
        // Hide loading indicator
        hideLoading();
        
    } catch (error) {
        hideLoading();
        showError('Failed to load location data. Please refresh the page.');
    }
}

function updateMarkerVisibility() {
    const currentZoom = map.getZoom();
    markers.forEach(marker => {
        const { element, minZoom, maxZoom } = marker;
        const shouldShow = (!minZoom || currentZoom >= minZoom) && (!maxZoom || currentZoom <= maxZoom);
        if (shouldShow && !element.classList.contains('filtered-out')) {
            element.style.display = 'flex';
        } else {
            element.style.display = 'none';
        }
    });
}

function addMarkersToMap() {
    if (!geoJsonData || !geoJsonData.features) {
        return;
    }
    
    // Clear existing markers
    markers.forEach(obj => {
        if (obj.element && obj.element.parentNode) {
            obj.element.parentNode.removeChild(obj.element);
        }
        if (obj.updatePosition) {
            map.off('move', obj.updatePosition);
            map.off('zoom', obj.updatePosition);
        }
    });
    markers = [];
    
    // Gather all key place coordinates before creating any markers
    const keyPlaces = ['Portishead', 'Kettering', 'York', 'Sharperton', 'Rheged'];
    const coords = {};
    keyPlaces.forEach(name => { coords[name] = null; });
    geoJsonData.features.forEach(f => {
        if (f.properties && keyPlaces.includes(f.properties.name)) {
            coords[f.properties.name] = f.geometry.coordinates;
        }
    });

    geoJsonData.features.forEach(feature => {
        const { coordinates } = feature.geometry;
        const { name, type, description, days, dayLabels, distance_from_base, minZoom, maxZoom } = feature.properties;
        // Clean up name to avoid 'undefined' in title
        const safeName = typeof name === 'string' ? name : '';

        // Create a DOM element for the marker
        const el = document.createElement('div');
        el.className = 'marker';

        const markerColor = getLegendColor(type);
        el.style.backgroundColor = markerColor;
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.color = 'white';
        el.style.fontSize = '14px';
        el.style.fontWeight = 'bold';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';

        // Add the icon
        const iconText = getSimpleIcon(type);
        el.innerHTML = iconText;

        // Helper to generate popup content
        function generatePopupContent({ name, description, days, dayLabels, distance_from_base, coordinates, coords, dayColors }) {
            const safeName = typeof name === 'string' ? name : '';
            // Create day badges for popup
            const dayBadges = Array.isArray(days) && days.length > 0 ? days.map((day, index) => {
                const label = dayLabels && dayLabels[index] ? dayLabels[index] : `Day ${day}`;
                const color = dayColors[day] || '#6b7280';
                return `<div style="margin: 4px 2px; padding: 4px 8px; background: ${color}; color: white; border-radius: 12px; font-size: 0.8rem; display: inline-block; border: 2px solid ${color};">${label}</div>`;
            }).join('') : '';
            let desc = (typeof description === 'string') ? description.trim() : '';
            if (desc === '' || desc === 'undefined' || typeof description === 'undefined') desc = null;
            const googleMapsLink = `https://maps.google.com/maps?daddr=${coordinates[1]},${coordinates[0]}`;
            // Route logic for key places using coordinates
            let routeLink = '';
            let routeLabel = '';
            if (safeName === 'Portishead' && coords['Portishead'] && coords['Kettering']) {
                routeLink = `https://maps.google.com/maps?saddr=${coords['Portishead'][1]},${coords['Portishead'][0]}&daddr=${coords['Kettering'][1]},${coords['Kettering'][0]}`;
                routeLabel = 'Route to Kettering';
            } else if (safeName === 'Kettering' && coords['Kettering'] && coords['York']) {
                routeLink = `https://maps.google.com/maps?saddr=${coords['Kettering'][1]},${coords['Kettering'][0]}&daddr=${coords['York'][1]},${coords['York'][0]}`;
                routeLabel = 'Route to York';
            } else if (safeName === 'York' && coords['York'] && coords['Sharperton']) {
                routeLink = `https://maps.google.com/maps?saddr=${coords['York'][1]},${coords['York'][0]}&daddr=${coords['Sharperton'][1]},${coords['Sharperton'][0]}`;
                routeLabel = 'Route to Sharperton';
            } else if (safeName === 'Sharperton' && coords['Sharperton'] && coords['Rheged']) {
                routeLink = `https://maps.google.com/maps?saddr=${coords['Sharperton'][1]},${coords['Sharperton'][0]}&daddr=${coords['Rheged'][1]},${coords['Rheged'][0]}`;
                routeLabel = 'Route to Rheged';
            } else if (safeName === 'Rheged' && coords['Rheged'] && coords['Portishead']) {
                routeLink = `https://maps.google.com/maps?saddr=${coords['Rheged'][1]},${coords['Rheged'][0]}&daddr=${coords['Portishead'][1]},${coords['Portishead'][0]}`;
                routeLabel = 'Route to Portishead';
            }
            // Add website link if present
            let websiteLink = '';
            if (feature.properties && feature.properties.website) {
                websiteLink = `<div style=\"margin-top: 8px;\"><a href=\"${feature.properties.website}\" target=\"_blank\" rel=\"noopener\" style=\"color: #059669; text-decoration: none; font-size: 0.95rem;\"><i class=\"fas fa-globe\"></i> Website</a></div>`;
            } else if (feature.properties && feature.properties.url) {
                websiteLink = `<div style=\"margin-top: 8px;\"><a href=\"${feature.properties.url}\" target=\"_blank\" rel=\"noopener\" style=\"color: #059669; text-decoration: none; font-size: 0.95rem;\"><i class=\"fas fa-globe\"></i> Website</a></div>`;
            }
            return `
                <div style="padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 1.1rem;">${safeName}</h3>
                    ${desc ? `<p style=\"margin: 0 0 8px 0; color: #6b7280; font-size: 0.9rem;\">${desc}</p>` : ''}
                    ${dayBadges ? `<div style=\"margin: 8px 0;\">${dayBadges}</div>` : ''}
                    ${distance_from_base ? `<p style=\"margin: 8px 0 0 0; color: #6b7280; font-size: 0.8rem;\"><i class=\"fas fa-route\"></i> ${distance_from_base}</p>` : ''}
                    <div style=\"margin-top: 10px;\"><a href=\"${googleMapsLink}\" target=\"_blank\" rel=\"noopener\" style=\"color: #2563eb; text-decoration: none; font-size: 0.95rem;\"><i class=\"fas fa-directions\"></i> Directions</a></div>
                    ${routeLink ? `<div style='margin-top: 6px;'><a href='${routeLink}' target='_blank' rel='noopener' style='color: #059669; text-decoration: none; font-size: 0.95rem;'><i class=\"fas fa-route\"></i> ${routeLabel}</a></div>` : ''}
                    ${websiteLink}
                </div>
            `;
        }

        // Create popup
        const popup = new maplibregl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false
        }).setHTML(generatePopupContent({ name, description, days, dayLabels, distance_from_base, coordinates, coords, dayColors }));

        // Add click event for popup
        el.addEventListener('click', () => {
            new maplibregl.Popup()
                .setLngLat(coordinates)
                .setHTML(generatePopupContent({ name, description, days, dayLabels, distance_from_base, coordinates, coords, dayColors }))
                .addTo(map);
        });

        // Use manual positioning approach that we know works, with Font Awesome icons
        const point = map.project(coordinates);

        // Position element manually
        el.style.position = 'absolute';
        el.style.left = `${point.x - 16}px`; // Center the 32px marker
        el.style.top = `${point.y - 16}px`;
        el.style.pointerEvents = 'auto';

        // Add directly to map container
        const mapContainer = map.getContainer();
        mapContainer.appendChild(el);

        // Update position when map moves
        const updatePosition = () => {
            const newPoint = map.project(coordinates);
            el.style.left = `${newPoint.x - 16}px`;
            el.style.top = `${newPoint.y - 16}px`;
        };

        map.on('move', updatePosition);
        map.on('zoom', updatePosition);

        // Store marker with metadata
        markers.push({
            element: el,
            coordinates: coordinates,
            days: days,
            type: type,
            name: name,
            minZoom: minZoom,
            maxZoom: maxZoom,
            updatePosition: updatePosition
        });
    });
    
    // Apply initial zoom-based visibility
    updateMarkerVisibility();
}

function createMarkerSVG(iconHtml, color) {
    // Extract the icon class from the HTML
    const iconMatch = iconHtml.match(/class="([^"]+)"/);
    const iconClass = iconMatch ? iconMatch[1] : 'fas fa-map-marker-alt';
    
    // Create SVG with Font Awesome icon
    const svg = `
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <style>
                    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
                </style>
            </defs>
            <!-- Main circle -->
            <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
            <!-- Tail -->
            <path d="M16 30 L10 22 L22 22 Z" fill="${color}"/>
            <!-- Icon -->
            <foreignObject x="8" y="8" width="16" height="16">
                <div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; color: white; font-size: 12px;">
                    <i class="${iconClass}"></i>
                </div>
            </foreignObject>
        </svg>
    `;
    
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

function getSimpleIcon(type) {
    const icons = {
        'base': '<i class="fas fa-home" style="color: white;"></i>',
        'castle': '<i class="fas fa-chess-rook"></i>',
        'roman': '<i class="fas fa-shield-alt"></i>',
        'coastal': '<i class="fas fa-water"></i>',
        'town': '<i class="fas fa-city"></i>',
        'travel': '<i class="fas fa-route"></i>',
        'attraction': '<i class="fas fa-star"></i>',
        'supermarket': '<i class="fas fa-shopping-cart"></i>',
        'pub': '<i class="fas fa-beer"></i>',
        'restaurant': '<i class="fas fa-utensils"></i>',
        'Starting Point': '<i class="fas fa-play"></i>',
        'Family Pickup': '<i class="fas fa-users"></i>',
        'user-location': '<i class="fas fa-star" style="color: white;"></i>',
        'food': '<i class="fas fa-utensils"></i>',
    };
    const result = icons[type] || '<i class="fas fa-map-marker-alt"></i>';
    return result;
}

function createSVGMarker(type, color) {
    const iconMap = {
        'base': '🏠',
        'castle': '🏰', 
        'roman': '🏛️',
        'coastal': '⚓',
        'town': '🏙️',
        'travel': '🚗',
        'attraction': '⭐'
    };
    
    const icon = iconMap[type] || '📍';
    
    const svg = `
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
            <polygon points="16,32 10,24 22,24" fill="${color}"/>
            <text x="16" y="21" text-anchor="middle" fill="white" font-size="12" font-family="Arial">${icon}</text>
        </svg>
    `;
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
}

function getLegendColor(type) {
    const legendColors = {
        'base': '#dc2626', // home
        'castle': '#7c3aed', // castle
        'roman': '#d97706', // roman
        'coastal': '#0284c7', // coastal
        'town': '#65a30d', // town
        'travel': '#dc2626', // travel
        'attraction': '#059669', // location
        'supermarket': '#f59e42', // supermarket (orange)
        'pub': '#8b5a2b', // pub (brown)
        'restaurant': '#e11d48', // restaurant (red)
        'food': '#0284c7' // food (blue)
    };
    return legendColors[type] || '#6b7280';
}

function getMarkerColor(type, days) {
    // Base location is always red
    if (type === 'base') return '#dc2626';
    
    // Use the first day's color if available
    if (days && days.length > 0 && dayColors[days[0]]) {
        return dayColors[days[0]];
    }
    
    // Fallback type colors
    const typeColors = {
        'castle': '#7c3aed',
        'roman': '#d97706', 
        'coastal': '#0284c7',
        'town': '#65a30d',
        'travel': '#dc2626',
        'attraction': '#2563eb'
    };
    return typeColors[type] || '#6b7280';
}

function fitMapToLocations() {
    if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length === 0) return;
    
    // Remove current location marker when fitting to all locations
    removeCurrentLocationMarker();
    
    const coordinates = geoJsonData.features.map(feature => feature.geometry.coordinates);

    if (coordinates.length === 1) {
        map.flyTo({ center: coordinates[0], zoom: 12 });
        return;
    }

    const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
    }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

    map.fitBounds(bounds, {
        padding: { top: 50, bottom: 200, left: 50, right: 50 },
        duration: 1500
    });
}

function removeCurrentLocationMarker() {
    if (currentLocationMarker) {
        if (currentLocationMarker.element && currentLocationMarker.element.parentNode) {
            currentLocationMarker.element.parentNode.removeChild(currentLocationMarker.element);
        }
        if (currentLocationMarker.updatePosition) {
            map.off('move', currentLocationMarker.updatePosition);
            map.off('zoom', currentLocationMarker.updatePosition);
        }
        currentLocationMarker = null;
    }
}function setupEventListeners() {
    // Toggle controls
    const toggleBtn = document.getElementById('toggleControls');
    const controlContent = document.getElementById('controlContent');
    const mapControls = document.querySelector('.map-controls');
    
    toggleBtn.addEventListener('click', () => {
        mapControls.classList.toggle('collapsed');
        controlContent.classList.toggle('collapsed');
        toggleBtn.classList.toggle('rotated');
    });
    
    // Quick action buttons
    document.getElementById('fitBounds').addEventListener('click', fitMapToLocations);
    
    document.getElementById('backToBase').addEventListener('click', () => {
        const baseLocation = geoJsonData?.features?.find(f => f.properties.type === 'base');
        if (baseLocation) {
            map.flyTo({
                center: baseLocation.geometry.coordinates,
                zoom: 12,
                duration: 1500
            });
        }
    });
    
    document.getElementById('findLocation').addEventListener('click', getCurrentLocation);
    
    document.getElementById('showInfo').addEventListener('click', () => {
        document.getElementById('infoPanel').classList.add('open');
    });
    
    // Close info panel
    document.getElementById('closeInfo').addEventListener('click', () => {
        document.getElementById('infoPanel').classList.remove('open');
    });
    
    // Close info panel when clicking outside
    document.addEventListener('click', (e) => {
        const infoPanel = document.getElementById('infoPanel');
        const showInfoBtn = document.getElementById('showInfo');
        
        if (infoPanel.classList.contains('open') && 
            !infoPanel.contains(e.target) && 
            !showInfoBtn.contains(e.target)) {
            infoPanel.classList.remove('open');
        }
    });
}

function filterMarkersByDay(day) {
    markers.forEach(({ element, days }) => {
        if (
            day === 'all' ||
            (Array.isArray(days) && days.includes(parseInt(day)))
        ) {
            element.classList.remove('filtered-out');
        } else {
            element.classList.add('filtered-out');
        }
    });
    updateMarkerVisibility();

    // Fit map to visible markers if not showing all
    if (day !== 'all') {
        const visibleCoordinates = geoJsonData.features
            .filter(f => Array.isArray(f.properties.days) && f.properties.days.includes(parseInt(day)))
            .map(f => f.geometry.coordinates);

        if (visibleCoordinates.length > 0) {
            if (visibleCoordinates.length === 1) {
                map.flyTo({ center: visibleCoordinates[0], zoom: 12 });
            } else {
                const bounds = visibleCoordinates.reduce((bounds, coord) => {
                    return bounds.extend(coord);
                }, new maplibregl.LngLatBounds(visibleCoordinates[0], visibleCoordinates[0]));

                map.fitBounds(bounds, {
                    padding: { top: 50, bottom: 200, left: 50, right: 50 },
                    maxZoom: 12
                });
            }
        }
    } else {
        fitMapToLocations();
    }
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser.');
        return;
    }
    
    const button = document.getElementById('findLocation');
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Finding...</span>';
    button.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            
            // Remove existing current location marker
            removeCurrentLocationMarker();
            
            // Create current location marker using manual positioning
            const locationElement = document.createElement('div');
            locationElement.className = 'marker';
            locationElement.innerHTML = '<i class="fas fa-star" style="color: white;"></i>';
            locationElement.style.cssText = `
                width: 40px;
                height: 40px;
                background: #3b82f6 !important;
                color: white;
                font-size: 16px;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: pulse 2s infinite;
                position: absolute;
                pointer-events: auto;
            `;
            
            // Add pulse animation with blue color
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 0 rgba(59, 130, 246, 0.7); }
                    70% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 10px rgba(59, 130, 246, 0); }
                    100% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 0 rgba(59, 130, 246, 0); }
                }
            `;
            document.head.appendChild(style);
            
            // Position element manually
            const point = map.project([longitude, latitude]);
            locationElement.style.left = `${point.x - 20}px`; // Center the 40px marker
            locationElement.style.top = `${point.y - 20}px`;
            
            // Add directly to map container
            const mapContainer = map.getContainer();
            mapContainer.appendChild(locationElement);
            
            // Update position when map moves
            const updatePosition = () => {
                const newPoint = map.project([longitude, latitude]);
                locationElement.style.left = `${newPoint.x - 20}px`;
                locationElement.style.top = `${newPoint.y - 20}px`;
            };
            
            map.on('move', updatePosition);
            map.on('zoom', updatePosition);
            
            // Add click event for popup
            locationElement.addEventListener('click', () => {
                new maplibregl.Popup()
                    .setLngLat([longitude, latitude])
                    .setHTML(`
                        <div style="padding: 8px;">
                            <h3 style="margin: 0 0 8px 0; color: #1f2937;">Your Current Location</h3>
                            <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">Accuracy: ±${Math.round(position.coords.accuracy)}m</p>
                        </div>
                    `)
                    .addTo(map);
            });
            
            // Store the marker reference
            currentLocationMarker = {
                element: locationElement,
                coordinates: [longitude, latitude],
                updatePosition: updatePosition
            };
            
            // Fly to current location
            map.flyTo({
                center: [longitude, latitude],
                zoom: 14,
                duration: 1500
            });
            
            button.innerHTML = originalContent;
            button.disabled = false;
        },
        (error) => {
            showError('Unable to get your location. Please check your location settings.');
            button.innerHTML = originalContent;
            button.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

function hideLoading() {
    const loading = document.getElementById('loading');
    loading.classList.add('hidden');
    setTimeout(() => {
        loading.style.display = 'none';
    }, 500);
}

function showError(message) {
    const loading = document.getElementById('loading');
    loading.innerHTML = `
        <div style="text-align: center;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; margin-bottom: 15px;"></i>
            <p style="color: white; margin-bottom: 20px;">${message}</p>
            <button onclick="location.reload()" style="background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                <i class="fas fa-redo"></i> Retry
            </button>
        </div>
    `;
}

