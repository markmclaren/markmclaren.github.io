// English Heritage Properties Map - Vanilla JavaScript Implementation

class EnglishHeritageMap {
    constructor() {
        this.map = null;
        this.properties = [];
        this.filteredProperties = [];
        this.markers = [];
        this.selectedProperty = null;
        this.hasInitiallyFitBounds = false; // Track if we've done initial bounds fitting
        
        this.init();
    }

    async init() {
        this.showLoading(true);
        await this.loadProperties();
        this.initMap();
        this.initFilters();
        this.initDraggablePanel();
        this.initSidebar();
        this.updateStats();
        this.showLoading(false);
    }

    // Load properties from English Heritage API (using sample data due to CORS restrictions)
    async loadProperties() {
        try {
            // Load properties from local JSON file
            const response = await fetch('GetAll.json');
            //const response = await fetch('sample-data.json');
            
            const data = await response.json();
            this.properties = data.Results || [];
            this.filteredProperties = [...this.properties];
            console.log(`Loaded ${this.properties.length} properties from sample-data.json`);
            console.log('First property:', this.properties[0]);
        } catch (error) {
            console.error('Error loading properties:', error);
            this.showError('Failed to load English Heritage properties. Please try again later.');
        }
    }

    // Initialize MapLibre GL JS map
    initMap() {
        this.map = new maplibregl.Map({
            container: 'map',
            style: 'https://tiles.openfreemap.org/styles/liberty',            
            center: [-2.0, 54.0], // Center on UK
            zoom: 6
        });

        // Add navigation controls
        this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
        this.map.addControl(new maplibregl.FullscreenControl(), 'top-right');

        // Add markers when map loads
        this.map.on('load', () => {
            console.log('Map loaded, adding initial markers');
            console.log('Total properties loaded:', this.properties.length);
            console.log('Filtered properties:', this.filteredProperties.length);
            
            // Apply initial filters to ensure markers are shown
            this.applyFilters();
        });
    }

    // Add property markers to the map
    addMarkers() {
        console.log('Adding markers for', this.filteredProperties.length, 'properties');
        
        // Clear existing markers
        this.clearMarkers();

        let markersAdded = 0;
        this.filteredProperties.forEach(property => {
            if (!property.HasValidLatLong || !property.Latitude || !property.Longitude) {
                console.log('Skipping property due to invalid coordinates:', property.Title);
                return;
            }

            console.log('Adding marker for:', property.Title, 'at', property.Latitude, property.Longitude);

            // Parse coordinates with better precision handling
            const longitude = parseFloat(property.Longitude);
            const latitude = parseFloat(property.Latitude);
            
            // Validate coordinates
            if (isNaN(longitude) || isNaN(latitude)) {
                console.warn('Invalid coordinates for', property.Title, ':', longitude, latitude);
                return;
            }

            // Ensure coordinates are within valid ranges
            if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
                console.warn('Coordinates out of range for', property.Title, ':', longitude, latitude);
                return;
            }

            console.log('Parsed coordinates:', longitude, latitude);

            // Create marker element following the MapLibre best practice pattern
            const markerEl = document.createElement('div');
            markerEl.className = `property-marker ${property.IsFreeEntry ? 'free' : 'paid'} ${property.IsTopHeritageSite ? 'top-site' : ''}`;
            
            // Set dimensions inline like the working MapLibre example
            markerEl.style.width = '20px';
            markerEl.style.height = '20px';

            // Create marker with precise coordinates
            const marker = new maplibregl.Marker({
                element: markerEl
            })
                .setLngLat([longitude, latitude])
                .addTo(this.map);

            // Add click handler for sidebar
            markerEl.addEventListener('click', () => {
                this.showPropertyDetails(property);
            });

            this.markers.push(marker);
            markersAdded++;
        });

        console.log('Successfully added', markersAdded, 'markers to map');
        console.log('Total markers in array:', this.markers.length);

        // Only fit map to markers on initial load, not on filter changes
        if (!this.hasInitiallyFitBounds && this.markers.length > 0) {
            this.fitMapToMarkers();
            this.hasInitiallyFitBounds = true;
        }
        
        // If we have markers but they're not visible, try centering on the first one (only on initial load)
        if (!this.hasInitiallyFitBounds && this.markers.length > 0 && this.filteredProperties.length > 0) {
            const firstProperty = this.filteredProperties[0];
            if (firstProperty.HasValidLatLong) {
                console.log('Centering map on first property:', firstProperty.Title);
                this.map.setCenter([parseFloat(firstProperty.Longitude), parseFloat(firstProperty.Latitude)]);
                this.map.setZoom(8);
                this.hasInitiallyFitBounds = true;
            }
        }
    }

    // Clear all markers from the map
    clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
    }

    // Fit map to show all markers
    fitMapToMarkers() {
        console.log('fitMapToMarkers called with', this.filteredProperties.length, 'filtered properties');
        
        if (this.filteredProperties.length === 0) {
            console.log('No filtered properties, skipping fitBounds');
            return;
        }

        const validProperties = this.filteredProperties.filter(p => 
            p.HasValidLatLong && p.Latitude && p.Longitude
        );

        console.log('Valid properties for bounds:', validProperties.length);

        if (validProperties.length === 0) {
            console.log('No valid properties for bounds, skipping fitBounds');
            return;
        }

        const bounds = new maplibregl.LngLatBounds();
        validProperties.forEach(property => {
            const lng = parseFloat(property.Longitude);
            const lat = parseFloat(property.Latitude);
            console.log(`Adding to bounds: ${property.Title} at [${lng}, ${lat}]`);
            bounds.extend([lng, lat]);
        });

        console.log('Fitting map to bounds:', bounds);
        
        // Use fitBounds with better options to prevent jarring movement
        this.map.fitBounds(bounds, { 
            padding: 50,
            duration: 1000, // Smooth animation
            maxZoom: 15 // Prevent over-zooming on single markers
        });
    }

    // Initialize filter functionality
    initFilters() {
        // Get all filter checkboxes
        const filterCheckboxes = document.querySelectorAll('#filter-content input[type="checkbox"]');
        
        // Add event listeners
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.applyFilters());
        });

        // Reset filters button
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetFilters();
        });

        // Toggle filter panel
        document.getElementById('toggle-filters').addEventListener('click', () => {
            this.toggleFilterPanel();
        });
    }

    // Apply filters to properties - entry type required, others additive
    applyFilters() {
        const filters = {
            free: document.getElementById('filter-free').checked,
            paid: document.getElementById('filter-paid').checked,
            topSites: document.getElementById('filter-top-sites').checked,
            abbey: document.getElementById('filter-abbey').checked,
            castle: document.getElementById('filter-castle').checked,
            house: document.getElementById('filter-house').checked,
            roman: document.getElementById('filter-roman').checked,
            prehistoric: document.getElementById('filter-prehistoric').checked
        };

        console.log('Applying filters:', filters);
        console.log('Total properties before filtering:', this.properties.length);

        // Check if any entry type filters are selected
        const entryTypeSelected = filters.free || filters.paid;
        const otherFiltersSelected = filters.topSites || filters.abbey || filters.castle || filters.house || filters.roman || filters.prehistoric;

        // If no filters are selected, show all properties
        if (!entryTypeSelected && !otherFiltersSelected) {
            console.log('No filters selected - showing all properties');
            this.filteredProperties = [...this.properties];
            this.addMarkers();
            this.updateStats();
            return;
        }

        // New filtering logic: entry type is required, other filters are additive
        this.filteredProperties = this.properties.filter(property => {
            // First check: Must match entry type if any entry type filter is selected
            if (entryTypeSelected) {
                const matchesEntryType = (filters.free && property.IsFreeEntry) || (filters.paid && !property.IsFreeEntry);
                if (!matchesEntryType) {
                    return false; // Property doesn't match required entry type
                }
            }

            // If only entry type is selected, property passes
            if (entryTypeSelected && !otherFiltersSelected) {
                return true;
            }

            // If other filters are selected, check if property matches any of them
            if (otherFiltersSelected) {
                const additionalMatches = [];

                // Top sites filter
                if (filters.topSites && property.IsTopHeritageSite) {
                    additionalMatches.push('top heritage site');
                }

                // Property type filters (additive)
                if (this.matchesPropertyTypeFilters(property, filters)) {
                    additionalMatches.push('property type match');
                }

                // If no entry type is selected but other filters are, property must match at least one other filter
                if (!entryTypeSelected) {
                    return additionalMatches.length > 0;
                }

                // If entry type is selected, property must match entry type AND at least one other filter
                return additionalMatches.length > 0;
            }

            // Property passes entry type requirement
            return true;
        });

        console.log('Properties after filtering:', this.filteredProperties.length);

        this.addMarkers();
        this.updateStats();
    }

    // Check if property matches property type filters (additive logic)
    matchesPropertyTypeFilters(property, filters) {
        const title = property.Title.toLowerCase();
        const summary = property.Summary.toLowerCase();
        const text = `${title} ${summary}`;

        // Check if any property type filters are selected
        const anyPropertyTypeSelected = filters.abbey || filters.castle || filters.house || filters.roman || filters.prehistoric;
        if (!anyPropertyTypeSelected) return false;

        // Check individual type matches (return true if ANY match)
        const matches = [
            filters.abbey && (text.includes('abbey') || text.includes('church') || text.includes('priory') || text.includes('monastery')),
            filters.castle && (text.includes('castle') || text.includes('fort') || text.includes('tower')),
            filters.house && (text.includes('house') || text.includes('palace') || text.includes('hall') || text.includes('manor')),
            filters.roman && (text.includes('roman') || text.includes('villa')),
            filters.prehistoric && (text.includes('stone') || text.includes('henge') || text.includes('barrow') || text.includes('prehistoric'))
        ];

        return matches.some(match => match);
    }

    // Reset all filters
    resetFilters() {
        const checkboxes = document.querySelectorAll('#filter-content input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.applyFilters();
    }

    // Toggle filter panel visibility
    toggleFilterPanel() {
        const content = document.getElementById('filter-content');
        const toggleBtn = document.getElementById('toggle-filters');
        const icon = toggleBtn.querySelector('i');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.className = 'bi bi-dash';
        } else {
            content.style.display = 'none';
            icon.className = 'bi bi-plus';
        }
    }

    // Initialize draggable filter panel
    initDraggablePanel() {
        const panel = document.getElementById('filter-panel');
        const header = panel.querySelector('.card-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
                panel.classList.add('dragging');
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                // Constrain to viewport
                const rect = panel.getBoundingClientRect();
                const maxX = window.innerWidth - rect.width;
                const maxY = window.innerHeight - rect.height;

                xOffset = Math.max(0, Math.min(maxX, xOffset));
                yOffset = Math.max(0, Math.min(maxY, yOffset));

                panel.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            }
        }

        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            panel.classList.remove('dragging');
        }
    }

    // Initialize sidebar functionality
    initSidebar() {
        document.getElementById('close-sidebar').addEventListener('click', () => {
            this.hideSidebar();
        });
    }

    // Show property details in sidebar
    showPropertyDetails(property) {
        this.selectedProperty = property;
        const sidebar = document.getElementById('property-sidebar');
        const title = document.getElementById('property-title');
        const content = document.getElementById('property-content');

        title.textContent = property.Title;
        content.innerHTML = this.createSidebarContent(property);

        sidebar.classList.remove('d-none');
    }

    // Create sidebar content HTML
    createSidebarContent(property) {
        const imageUrl = property.ImagePath ? 
            `https://www.english-heritage.org.uk${property.ImagePath}` : null;

        return `
            ${imageUrl ? `<img src="${imageUrl}" alt="${property.ImageAlt || property.Title}" class="property-image">` : ''}
            
            <div class="property-badges">
                <span class="badge ${property.IsFreeEntry ? 'bg-success' : 'bg-danger'} me-2">
                    <i class="bi bi-${property.IsFreeEntry ? 'check-circle' : 'currency-pound'}"></i>
                    ${property.IsFreeEntry ? 'Free Entry' : 'Paid Entry'}
                </span>
                ${property.IsTopHeritageSite ? '<span class="badge bg-warning text-dark"><i class="bi bi-star"></i> Top Heritage Site</span>' : ''}
            </div>

            <div class="property-location">
                <i class="bi bi-geo-alt"></i>
                ${property.County}, ${property.Region}
            </div>

            <div class="property-summary">
                ${property.Summary}
            </div>

            <div class="d-grid">
                <a href="https://www.english-heritage.org.uk${property.Path}" 
                   target="_blank" 
                   class="btn btn-primary">
                    <i class="bi bi-box-arrow-up-right"></i>
                    Visit Property Page
                </a>
            </div>
        `;
    }

    // Hide sidebar
    hideSidebar() {
        document.getElementById('property-sidebar').classList.add('d-none');
        this.selectedProperty = null;
    }

    // Update statistics in header
    updateStats() {
        const totalCount = document.getElementById('total-count');
        const freeCount = document.getElementById('free-count');

        totalCount.textContent = `${this.filteredProperties.length} Properties`;
        
        const freeProperties = this.filteredProperties.filter(p => p.IsFreeEntry).length;
        freeCount.textContent = `${freeProperties} Free Entry`;
    }

    // Show/hide loading overlay
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.remove('d-none');
        } else {
            overlay.classList.add('d-none');
        }
    }

    // Show error message
    showError(message) {
        const overlay = document.getElementById('loading-overlay');
        overlay.innerHTML = `
            <div class="text-center">
                <i class="bi bi-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
                <h5 class="mt-3 text-danger">Error</h5>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="bi bi-arrow-clockwise"></i>
                    Try Again
                </button>
            </div>
        `;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EnglishHeritageMap();
});

