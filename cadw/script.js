// English Heritage Properties Map - Vanilla JavaScript Implementation

class CADWHeritageMap {
    constructor() {
        this.map = null;
        this.geojsonData = null;
        this.filteredData = null;
        this.selectedProperty = null;
        this.hasInitiallyFitBounds = false; // Track if we've done initial bounds fitting
        
        this.init();
    }

    async init() {
        this.showLoading(true);
        await this.loadGeoJSON();
        this.initMap();
        this.initFilters();
        this.initDraggablePanel();
        this.initSidebar();
        this.updateStats();
        this.showLoading(false);
    }

    // Load GeoJSON data from cadw.geojson
    async loadGeoJSON() {
        try {
            // Load GeoJSON from local file
            const response = await fetch('cadw.geojson');
            
            this.geojsonData = await response.json();
            this.filteredData = JSON.parse(JSON.stringify(this.geojsonData)); // Deep copy
            console.log(`Loaded ${this.geojsonData.features.length} properties from cadw.geojson`);
            
            // Debug: Check a specific property to see the data structure
            const tretower = this.geojsonData.features.find(f => f.properties.name && f.properties.name.includes('Tretower'));
            if (tretower) {
                console.log('Tretower raw data:', tretower.properties);
                console.log('location_type type:', typeof tretower.properties.location_type);
                console.log('location_type value:', tretower.properties.location_type);
                console.log('period type:', typeof tretower.properties.period);
                console.log('period value:', tretower.properties.period);
            }
        } catch (error) {
            console.error('Error loading GeoJSON:', error);
            this.showError('Failed to load CADW heritage properties. Please try again later.');
        }
    }    // Initialize MapLibre GL JS map
    initMap() {
        this.map = new maplibregl.Map({
            container: 'map',
            style: 'https://tiles.openfreemap.org/styles/liberty',            
            center: [-3.7, 52.3], // Center on Wales
            zoom: 7
        });

        // Add navigation controls
        this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
        this.map.addControl(new maplibregl.FullscreenControl(), 'top-right');

        // Add GeoJSON data when map loads
        this.map.on('load', () => {
            console.log('Map loaded, adding GeoJSON source and layers');
            this.addGeoJSONLayers();
            
            // Apply initial filters to ensure markers are shown
            this.applyFilters();
        });
    }

    // Add GeoJSON source and layers to the map
    addGeoJSONLayers() {
        // Add source for properties
        this.map.addSource('properties', {
            type: 'geojson',
            data: this.filteredData
        });

        // Add circle layer for property markers
        this.map.addLayer({
            id: 'properties-circles',
            type: 'circle',
            source: 'properties',
            paint: {
                'circle-radius': 8, // All sites same size since no "top" designation
                'circle-color': [
                    'case',
                    ['==', ['get', 'location_type'], 'Castles'], '#dc3545', // Red for castles
                    ['==', ['get', 'location_type'], 'Religious sites'], '#28a745', // Green for religious sites
                    ['==', ['get', 'location_type'], 'Historic houses'], '#ffc107', // Yellow for historic houses
                    ['==', ['get', 'location_type'], 'Burial chamber'], '#6f42c1', // Purple for burial chambers
                    '#007bff' // Blue as default
                ],
                'circle-stroke-color': '#ffffff', // White border for all sites
                'circle-stroke-width': 2,
                'circle-opacity': 0.8,
                'circle-stroke-opacity': 1
            }
        });

        // Add hover effect layer
        this.map.addLayer({
            id: 'properties-hover',
            type: 'circle',
            source: 'properties',
            paint: {
                'circle-radius': 15,
                'circle-color': '#007bff',
                'circle-opacity': 0.3,
                'circle-stroke-color': '#007bff',
                'circle-stroke-width': 2,
                'circle-stroke-opacity': 0.8
            },
            filter: ['==', 'location_id', '']
        });

        // Add click handler
        this.map.on('click', 'properties-circles', (e) => {
            const feature = e.features[0];
            this.showPropertyDetails(feature.properties);
        });

        // Add hover effects
        this.map.on('mouseenter', 'properties-circles', (e) => {
            this.map.getCanvas().style.cursor = 'pointer';
            const feature = e.features[0];
            this.map.setFilter('properties-hover', ['==', 'location_id', feature.properties.location_id]);
        });

        this.map.on('mouseleave', 'properties-circles', () => {
            this.map.getCanvas().style.cursor = '';
            this.map.setFilter('properties-hover', ['==', 'location_id', '']);
        });

        // Fit map to show all features on initial load
        if (!this.hasInitiallyFitBounds && this.filteredData.features.length > 0) {
            this.fitMapToFeatures();
            this.hasInitiallyFitBounds = true;
        }
    }

    // Update the GeoJSON data source
    updateGeoJSONSource() {
        if (this.map.getSource('properties')) {
            this.map.getSource('properties').setData(this.filteredData);
            console.log('Updated GeoJSON source with', this.filteredData.features.length, 'features');
        }
    }

    // Fit map to show all filtered features
    fitMapToFeatures() {
        console.log('fitMapToFeatures called with', this.filteredData.features.length, 'features');
        
        if (this.filteredData.features.length === 0) {
            console.log('No features to fit, skipping fitBounds');
            return;
        }

        const bounds = new maplibregl.LngLatBounds();
        this.filteredData.features.forEach(feature => {
            const coords = feature.geometry.coordinates;
            console.log(`Adding to bounds: ${feature.properties.name} at [${coords[0]}, ${coords[1]}]`);
            bounds.extend(coords);
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

    // Apply filters to properties - period and location type based
    applyFilters() {
        const filters = {
            castles: document.getElementById('filter-castle').checked,
            religious: document.getElementById('filter-abbey').checked, // Repurpose abbey filter for religious sites
            houses: document.getElementById('filter-house').checked,
            burial: document.getElementById('filter-prehistoric').checked, // Repurpose prehistoric for burial chambers
            
            medieval: document.getElementById('filter-free').checked, // Repurpose free filter for medieval period
            roman: document.getElementById('filter-roman').checked,
            tudor: document.getElementById('filter-paid').checked, // Repurpose paid filter for tudor period
            industrial: document.getElementById('filter-top-sites').checked, // Repurpose top sites for industrial period
            prehistoric: document.getElementById('filter-prehistoric-period').checked // New prehistoric period filter
        };

        console.log('Applying filters:', filters);
        console.log('Total features before filtering:', this.geojsonData.features.length);

        // Check if any filters are selected
        const anyFilterSelected = Object.values(filters).some(filter => filter);

        // If no filters are selected, show all properties
        if (!anyFilterSelected) {
            console.log('No filters selected - showing all properties');
            this.filteredData = JSON.parse(JSON.stringify(this.geojsonData)); // Deep copy
            this.updateGeoJSONSource();
            this.updateStats();
            return;
        }

        // Filter features based on criteria
        const filteredFeatures = this.geojsonData.features.filter(feature => {
            const props = feature.properties;
            
            // Check location type matches
            const locationTypeMatches = [
                filters.castles && this.propertyIncludes(props.location_type, 'Castles'),
                filters.religious && this.propertyIncludes(props.location_type, 'Religious sites'),
                filters.houses && this.propertyIncludes(props.location_type, 'Historic houses'),
                filters.burial && this.propertyIncludes(props.location_type, 'Burial chamber')
            ].some(match => match);

            // Check period matches
            const periodMatches = [
                filters.medieval && this.propertyIncludes(props.period, 'Medieval'),
                filters.roman && this.propertyIncludes(props.period, 'Roman'),
                filters.tudor && this.propertyIncludes(props.period, 'Tudor'),
                filters.industrial && this.propertyIncludes(props.period, 'Industrial'),
                filters.prehistoric && this.propertyIncludes(props.period, 'Prehistoric')
            ].some(match => match);

            // Return true if either location type or period matches (OR logic)
            return locationTypeMatches || periodMatches;
        });

        // Update filtered data
        this.filteredData = {
            type: 'FeatureCollection',
            features: filteredFeatures
        };

        console.log('Features after filtering:', this.filteredData.features.length);

        this.updateGeoJSONSource();
        this.updateStats();
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

        title.textContent = property.name;
        content.innerHTML = this.createSidebarContent(property);

        sidebar.classList.remove('d-none');
    }

    // Helper function to check if a property value includes a target value (handles arrays and stringified arrays)
    propertyIncludes(propertyValue, targetValue) {
        if (!propertyValue) return false;
        
        // Parse the value first to handle stringified arrays
        const parsedValue = this.parseArrayValue(propertyValue);
        
        if (Array.isArray(parsedValue)) {
            return parsedValue.includes(targetValue);
        }
        return parsedValue === targetValue;
    }

    // Helper function to parse potentially stringified arrays
    parseArrayValue(value) {
        if (!value) return value;
        
        // If it's already an array, return it
        if (Array.isArray(value)) {
            return value;
        }
        
        // If it's a string that looks like an array, try to parse it
        if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : value;
            } catch (e) {
                console.log('Failed to parse array string:', value, e);
                return value;
            }
        }
        
        return value;
    }

    // Create sidebar content HTML
    createSidebarContent(property) {
        const imageUrl = property.image_url || null;

        console.log('=== createSidebarContent Debug ===');
        console.log('Property name:', property.name);
        console.log('location_type type:', typeof property.location_type);
        console.log('location_type value:', property.location_type);
        console.log('location_type is array?', Array.isArray(property.location_type));
        console.log('period type:', typeof property.period);
        console.log('period value:', property.period);
        console.log('period is array?', Array.isArray(property.period));

        // Parse potentially stringified arrays
        const locationTypeArray = this.parseArrayValue(property.location_type);
        const periodArray = this.parseArrayValue(property.period);

        console.log('Parsed location_type:', locationTypeArray, 'is array?', Array.isArray(locationTypeArray));
        console.log('Parsed period:', periodArray, 'is array?', Array.isArray(periodArray));

        // Handle location types - ensure proper formatting
        let locationTypesText = '';
        if (locationTypeArray) {
            if (Array.isArray(locationTypeArray)) {
                locationTypesText = locationTypeArray.join(', ');
                console.log('Joined location types:', locationTypesText);
            } else {
                locationTypesText = String(locationTypeArray);
                console.log('String location type:', locationTypesText);
            }
        }

        // Handle periods - ensure proper formatting  
        let periodsText = '';
        if (periodArray) {
            if (Array.isArray(periodArray)) {
                periodsText = periodArray.join(', ');
                console.log('Joined periods:', periodsText);
            } else {
                periodsText = String(periodArray);
                console.log('String period:', periodsText);
            }
        }

        return `
            ${imageUrl ? `<img src="${imageUrl}" alt="${property.name}" class="property-image">` : ''}
            
            <div class="property-badges">
                ${locationTypesText ? `<span class="badge bg-primary me-2">
                    <i class="bi bi-building"></i>
                    ${locationTypesText}
                </span>` : ''}
                ${periodsText ? `<span class="badge bg-secondary">
                    <i class="bi bi-clock"></i>
                    ${periodsText}
                </span>` : ''}
            </div>

            <div class="property-summary">
                ${property.description}
            </div>

            <div class="d-grid">
                <a href="${property.visit_url}" 
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
        const castleCount = document.getElementById('free-count'); // Repurpose this element

        totalCount.textContent = `${this.filteredData.features.length} Properties`;
        
        const castleProperties = this.filteredData.features.filter(f => f.properties.location_type === 'Castles').length;
        castleCount.textContent = `${castleProperties} Castles`;
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
    new CADWHeritageMap();
});

