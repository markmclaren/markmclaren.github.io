// Heritage Explorer - Unified Map & Control Dashboard
// Combines English Heritage, National Trust, and Cadw datasets

class HeritageExplorer {
    constructor() {
        this.map = null;
        this.rawFeatures = []; // Holds all parsed unified features
        this.filteredFeatures = []; // Holds features after applying active filters
        this.selectedProperty = null;
        this.activePopup = null;
        this.colorMode = 'org'; // 'org' or 'category'
        this.hasInitiallyFitBounds = false;
        
        // Bind functions to preserve context
        this.showSidebarById = this.showSidebarById.bind(this);
        
        // Save instance globally for popup callback access
        window.heritageMap = this;
        
        this.init();
    }

    async init() {
        this.updateLoadingStatus('Loading GeoJSON datasets...');
        const success = await this.loadAllDatasets();
        
        if (!success) {
            this.showError('Could not load heritage datasets. Please verify the files are present.');
            return;
        }

        this.updateLoadingStatus('Initializing MapLibre GL map...');
        this.initMap();
        this.initUIEventListeners();
        this.initDraggablePanel();
        
        this.updateStats();
        this.hideLoading();
    }

    // Load and merge all three GeoJSON files
    async loadAllDatasets() {
        try {
            // Fetch in parallel
            const [cadwRes, ehRes, ntRes] = await Promise.all([
                fetch('cadw.geojson').then(r => r.ok ? r.json() : null).catch(() => null),
                fetch('english-heritage.geojson').then(r => r.ok ? r.json() : null).catch(() => null),
                fetch('NationalTrust.geojson').then(r => r.ok ? r.json() : null).catch(() => null)
            ]);

            console.log('GeoJSON fetch results:', {
                cadw: cadwRes ? `${cadwRes.features.length} features` : 'Failed',
                eh: ehRes ? `${ehRes.features.length} features` : 'Failed',
                nt: ntRes ? `${ntRes.features.length} features` : 'Failed'
            });

            this.rawFeatures = [];

            // 1. Process Cadw Welsh Heritage
            if (cadwRes && cadwRes.features) {
                cadwRes.features.forEach(f => {
                    const props = f.properties;
                    let category = 'Other';
                    const locType = props.location_type ? String(props.location_type).toLowerCase() : '';
                    if (locType.includes('castle')) category = 'Castle';
                    else if (locType.includes('religious') || locType.includes('abbey') || locType.includes('monastery') || locType.includes('priory')) category = 'Abbey';
                    else if (locType.includes('house') || locType.includes('palace') || locType.includes('hall')) category = 'House';
                    else if (locType.includes('burial') || locType.includes('chamber') || locType.includes('prehistoric')) category = 'Prehistoric';
                    else if (locType.includes('roman')) category = 'Roman';

                    this.rawFeatures.push({
                        type: 'Feature',
                        geometry: f.geometry,
                        properties: {
                            id: `cadw-${props.location_id || Math.random().toString(36).substr(2, 9)}`,
                            title: props.name || 'Unnamed Cadw Site',
                            description: props.description || 'No description available.',
                            visitUrl: props.visit_url || 'https://cadw.gov.wales/',
                            imageUrl: props.image_url || null,
                            category: category,
                            period: props.period || 'Other',
                            org: 'cadw',
                            isFreeEntry: null, // Price is unknown/variable
                            isTopSite: false
                        }
                    });
                });
            }

            // 2. Process English Heritage
            if (ehRes && ehRes.features) {
                ehRes.features.forEach(f => {
                    const props = f.properties;
                    
                    // Determine category via text search in title & summary
                    const text = `${props.title} ${props.summary || ''}`.toLowerCase();
                    let category = 'Other';
                    if (text.includes('castle') || text.includes('fort') || text.includes('tower')) category = 'Castle';
                    else if (text.includes('abbey') || text.includes('church') || text.includes('priory') || text.includes('monastery')) category = 'Abbey';
                    else if (text.includes('house') || text.includes('palace') || text.includes('hall') || text.includes('manor')) category = 'House';
                    else if (text.includes('roman') || text.includes('villa') || text.includes('fortress')) category = 'Roman';
                    else if (text.includes('stone') || text.includes('henge') || text.includes('barrow') || text.includes('prehistoric') || text.includes('ancient')) category = 'Prehistoric';

                    // Infer Period
                    let period = 'Other';
                    if (text.includes('roman')) period = 'Roman';
                    else if (text.includes('prehistoric') || text.includes('neolithic') || text.includes('bronze age') || text.includes('stone age')) period = 'Prehistoric';
                    else if (text.includes('medieval') || text.includes('norman') || text.includes('saxon') || text.includes('abbey') || text.includes('priory')) period = 'Medieval';
                    else if (text.includes('tudor') || text.includes('elizabethan')) period = 'Tudor';
                    else if (text.includes('industrial') || text.includes('victorian') || text.includes('georgian') || text.includes('mill')) period = 'Industrial';

                    const visitUrl = props.path ? `https://www.english-heritage.org.uk${props.path}` : 'https://www.english-heritage.org.uk/';
                    const imageUrl = props.imagePath ? `https://www.english-heritage.org.uk${props.imagePath}` : null;

                    this.rawFeatures.push({
                        type: 'Feature',
                        geometry: f.geometry,
                        properties: {
                            id: `eh-${props.id || Math.random().toString(36).substr(2, 9)}`,
                            title: props.title || 'Unnamed English Heritage Site',
                            description: props.summary || 'No summary available.',
                            visitUrl: visitUrl,
                            imageUrl: imageUrl,
                            category: category,
                            period: period,
                            org: 'english-heritage',
                            isFreeEntry: !!props.isFreeEntry,
                            isTopSite: !!props.isTopHeritageSite,
                            locationText: props.county ? `${props.county}, ${props.region || ''}` : null
                        }
                    });
                });
            }

            // 3. Process National Trust (Northeast Trip Data)
            if (ntRes && ntRes.features) {
                ntRes.features.forEach((f, idx) => {
                    const props = f.properties;
                    
                    // Determine category via text search in title & description
                    const text = `${props.title} ${props.description || ''}`.toLowerCase();
                    let category = 'Other';
                    if (text.includes('castle') || text.includes('fort') || text.includes('tower')) category = 'Castle';
                    else if (text.includes('abbey') || text.includes('church') || text.includes('priory') || text.includes('chapel')) category = 'Abbey';
                    else if (text.includes('house') || text.includes('hall') || text.includes('manor') || text.includes('court') || text.includes('cottage') || text.includes('farm') || text.includes('barn')) category = 'House';
                    else if (text.includes('roman') || text.includes('villa')) category = 'Roman';
                    else if (text.includes('stone') || text.includes('barrow') || text.includes('neolithic') || text.includes('prehistoric') || text.includes('ancient')) category = 'Prehistoric';

                    // Infer Period
                    let period = 'Other';
                    if (text.includes('roman')) period = 'Roman';
                    else if (text.includes('prehistoric') || text.includes('ancient') || text.includes('stone age') || text.includes('neolithic')) period = 'Prehistoric';
                    else if (text.includes('medieval') || text.includes('norman') || text.includes('saxon') || text.includes('abbey')) period = 'Medieval';
                    else if (text.includes('tudor') || text.includes('elizabethan')) period = 'Tudor';
                    else if (text.includes('industrial') || text.includes('victorian') || text.includes('georgian') || text.includes('farm') || text.includes('mill')) period = 'Industrial';

                    let visitUrl = props.websiteUrl || 'https://www.nationaltrust.org.uk/';
                    if (!props.websiteUrl && props.websiteUrlPath) {
                        visitUrl = `https://www.nationaltrust.org.uk${props.websiteUrlPath}`;
                    }

                    this.rawFeatures.push({
                        type: 'Feature',
                        geometry: f.geometry,
                        properties: {
                            id: `nt-${(props.id && props.id.value) || props.id || idx}`,
                            title: props.title || 'Unnamed National Trust Site',
                            description: props.description || 'No description available.',
                            visitUrl: visitUrl,
                            imageUrl: props.imageUrl || null,
                            category: category,
                            period: period,
                            org: 'national-trust',
                            isFreeEntry: null, // Variable / Free for members
                            isTopSite: false
                        }
                    });
                });
            }

            this.filteredFeatures = [...this.rawFeatures];
            console.log(`Unified dataset initialized with ${this.rawFeatures.length} features.`);
            return this.rawFeatures.length > 0;
            
        } catch (error) {
            console.error('Error merging datasets:', error);
            return false;
        }
    }

    // Initialize MapLibre Map
    initMap() {
        this.map = new maplibregl.Map({
            container: 'map',
            style: 'https://tiles.openfreemap.org/styles/liberty',            
            center: [-2.5, 54.5], // Centered on the UK
            zoom: 6,
            maxZoom: 18,
            minZoom: 4
        });

        // Add standard controls
        this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
        this.map.addControl(new maplibregl.FullscreenControl(), 'top-right');
        this.map.addControl(new maplibregl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true
        }), 'top-right');

        this.map.on('load', () => {
            console.log('Map loaded successfully.');
            this.addMapSourceAndLayers();
            this.applyFilters(true); // Fit bounds on initial load
        });
    }

    // Create GPU circle layers and express markers visually
    addMapSourceAndLayers() {
        // Add vector point source
        this.map.addSource('heritage-sites', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: this.filteredFeatures
            }
        });

        // Circle marker layers
        this.map.addLayer({
            id: 'sites-circles',
            type: 'circle',
            source: 'heritage-sites',
            paint: {
                'circle-radius': [
                    'case',
                    ['get', 'isTopSite'], 11,
                    7
                ],
                'circle-color': this.getMarkerColorExpression(),
                'circle-stroke-color': [
                    'case',
                    ['get', 'isTopSite'], '#FFD700',
                    '#ffffff'
                ],
                'circle-stroke-width': [
                    'case',
                    ['get', 'isTopSite'], 3.5,
                    1.8
                ],
                'circle-opacity': 0.85,
                'circle-stroke-opacity': 1.0
            }
        });

        // Hover highlighting glow
        this.map.addLayer({
            id: 'sites-hover',
            type: 'circle',
            source: 'heritage-sites',
            paint: {
                'circle-radius': [
                    'case',
                    ['get', 'isTopSite'], 18,
                    14
                ],
                'circle-color': '#0d6efd',
                'circle-opacity': 0.28,
                'circle-stroke-color': '#0d6efd',
                'circle-stroke-width': 1.5,
                'circle-stroke-opacity': 0.7
            },
            filter: ['==', 'id', '']
        });

        // CLICK: Show sidebar and map details
        this.map.on('click', 'sites-circles', (e) => {
            if (e.features && e.features.length > 0) {
                const feature = e.features[0];
                this.showPropertyDetails(feature.properties, e.lngLat);
            }
        });

        // HOVER: Mouse cursor pointer & hover glow layer filter
        this.map.on('mouseenter', 'sites-circles', (e) => {
            this.map.getCanvas().style.cursor = 'pointer';
            if (e.features && e.features.length > 0) {
                const feature = e.features[0];
                this.map.setFilter('sites-hover', ['==', 'id', feature.properties.id]);
            }
        });

        this.map.on('mouseleave', 'sites-circles', () => {
            this.map.getCanvas().style.cursor = '';
            this.map.setFilter('sites-hover', ['==', 'id', '']);
        });
    }

    // Dynamic MapLibre coloring expressions based on user setting
    getMarkerColorExpression() {
        if (this.colorMode === 'org') {
            return [
                'match',
                ['get', 'org'],
                'english-heritage', '#0066CC', // Cobalt Blue
                'national-trust', '#198754',   // Vibrant Green
                'cadw', '#D22630',             // Dragon Red
                '#6c757d'
            ];
        } else {
            // Category color coding
            return [
                'match',
                ['get', 'category'],
                'Castle', '#CF142B',      // Solid Red
                'Abbey', '#4B0082',       // Indigo / Purple
                'House', '#FF8C00',       // Dark Orange
                'Roman', '#8A2BE2',       // Blue Violet
                'Prehistoric', '#20B2AA', // Light Sea Green
                '#708090'                 // Slate Gray
            ];
        }
    }

    // Update marker colors dynamically
    updateMarkerColors() {
        if (this.map && this.map.getLayer('sites-circles')) {
            this.map.setPaintProperty('sites-circles', 'circle-color', this.getMarkerColorExpression());
        }
    }

    // Set up interactive dashboard listeners
    initUIEventListeners() {
        // Checkboxes & Select filters
        const filters = [
            'org-eh', 'org-nt', 'org-cadw',
            'cat-castle', 'cat-abbey', 'cat-house', 'cat-roman', 'cat-prehistoric', 'cat-other',
            'spec-free', 'spec-top'
        ];
        
        filters.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.applyFilters());
        });

        const periodSelect = document.getElementById('period-select');
        if (periodSelect) {
            periodSelect.addEventListener('change', () => this.applyFilters());
        }

        // Color coding mode toggles
        const colorModeOrg = document.getElementById('color-mode-org');
        const colorModeCat = document.getElementById('color-mode-cat');
        
        const handleColorToggle = (mode) => {
            this.colorMode = mode;
            this.updateMarkerColors();
        };

        if (colorModeOrg) colorModeOrg.addEventListener('change', () => handleColorToggle('org'));
        if (colorModeCat) colorModeCat.addEventListener('change', () => handleColorToggle('category'));

        // Header & Mobile Instant Search Input Syncing
        const searchInput = document.getElementById('search-input');
        const mobileSearchInput = document.getElementById('mobile-search-input');
        const clearBtn = document.getElementById('clear-search');
        const mobileClearBtn = document.getElementById('mobile-clear-search');
        
        const syncSearch = (val) => {
            if (searchInput) searchInput.value = val;
            if (mobileSearchInput) mobileSearchInput.value = val;
            
            if (val.length > 0) {
                if (clearBtn) clearBtn.classList.remove('d-none');
                if (mobileClearBtn) mobileClearBtn.classList.remove('d-none');
            } else {
                if (clearBtn) clearBtn.classList.add('d-none');
                if (mobileClearBtn) mobileClearBtn.classList.add('d-none');
            }
            
            this.handleSearchQuery(val.trim().toLowerCase());
        };

        if (searchInput) {
            searchInput.addEventListener('input', (e) => syncSearch(e.target.value));
        }

        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('input', (e) => syncSearch(e.target.value));
        }

        const handleClear = () => {
            syncSearch('');
            this.closeSearchDrawer();
        };

        if (clearBtn) clearBtn.addEventListener('click', handleClear);
        if (mobileClearBtn) mobileClearBtn.addEventListener('click', handleClear);

        // Reset all filters button
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetAllFilters();
        });

        // Minimize filter panel button
        document.getElementById('toggle-filters').addEventListener('click', () => {
            this.toggleFilterPanel();
        });

        // Close sidebar button
        document.getElementById('close-sidebar').addEventListener('click', () => {
            this.closeSidebar();
        });

        // Close drawer button
        document.getElementById('close-drawer-btn').addEventListener('click', () => {
            this.closeSearchDrawer();
        });

        // Mobile Bottom Sheet Listeners
        const filterPanel = document.getElementById('filter-panel');
        const mobileFilterBtn = document.getElementById('mobile-filter-btn');
        const closeFiltersMobile = document.getElementById('close-filters-mobile');

        if (mobileFilterBtn && filterPanel) {
            mobileFilterBtn.addEventListener('click', () => {
                filterPanel.classList.toggle('open');
                // Close details drawer if filter sheet opens
                this.closeSidebar();
            });
        }

        if (closeFiltersMobile && filterPanel) {
            closeFiltersMobile.addEventListener('click', () => {
                filterPanel.classList.remove('open');
            });
        }
    }

    // Main multi-faceted cross filtering logic
    applyFilters(fitMapBounds = false) {
        // Collect current filter states
        const activeFilters = {
            orgEH: document.getElementById('org-eh').checked,
            orgNT: document.getElementById('org-nt').checked,
            orgCadw: document.getElementById('org-cadw').checked,
            
            catCastle: document.getElementById('cat-castle').checked,
            catAbbey: document.getElementById('cat-abbey').checked,
            catHouse: document.getElementById('cat-house').checked,
            catRoman: document.getElementById('cat-roman').checked,
            catPrehistoric: document.getElementById('cat-prehistoric').checked,
            catOther: document.getElementById('cat-other').checked,
            
            specFree: document.getElementById('spec-free').checked,
            specTop: document.getElementById('spec-top').checked,
            
            period: document.getElementById('period-select').value,
            searchQuery: document.getElementById('search-input').value.trim().toLowerCase()
        };

        // Determine if any category filters are selected
        const categoryFiltersActive = activeFilters.catCastle || activeFilters.catAbbey || activeFilters.catHouse || 
                                      activeFilters.catRoman || activeFilters.catPrehistoric || activeFilters.catOther;

        // Perform cross filtering
        this.filteredFeatures = this.rawFeatures.filter(feature => {
            const props = feature.properties;

            // 1. Organization filtering
            if (props.org === 'english-heritage' && !activeFilters.orgEH) return false;
            if (props.org === 'national-trust' && !activeFilters.orgNT) return false;
            if (props.org === 'cadw' && !activeFilters.orgCadw) return false;

            // 2. Category filtering (OR logical query within category group)
            if (categoryFiltersActive) {
                let matchesCategory = false;
                if (activeFilters.catCastle && props.category === 'Castle') matchesCategory = true;
                if (activeFilters.catAbbey && props.category === 'Abbey') matchesCategory = true;
                if (activeFilters.catHouse && props.category === 'House') matchesCategory = true;
                if (activeFilters.catRoman && props.category === 'Roman') matchesCategory = true;
                if (activeFilters.catPrehistoric && props.category === 'Prehistoric') matchesCategory = true;
                if (activeFilters.catOther && props.category === 'Other') matchesCategory = true;
                if (!matchesCategory) return false;
            }

            // 3. Admission & stature
            if (activeFilters.specFree && props.isFreeEntry !== true) return false;
            if (activeFilters.specTop && props.isTopSite !== true) return false;

            // 4. Period selection
            if (activeFilters.period && props.period !== activeFilters.period) return false;

            // 5. Title / Location Search
            if (activeFilters.searchQuery) {
                const titleMatch = props.title.toLowerCase().includes(activeFilters.searchQuery);
                const descMatch = props.description.toLowerCase().includes(activeFilters.searchQuery);
                const locationMatch = props.locationText && props.locationText.toLowerCase().includes(activeFilters.searchQuery);
                if (!titleMatch && !descMatch && !locationMatch) return false;
            }

            return true;
        });

        // Update map source
        if (this.map && this.map.getSource('heritage-sites')) {
            this.map.getSource('heritage-sites').setData({
                type: 'FeatureCollection',
                features: this.filteredFeatures
            });
        }

        // Update counts and statistics
        this.updateStats();

        // Fit map bounds if explicitly requested
        if (fitMapBounds && this.filteredFeatures.length > 0) {
            this.fitMapToFeatures();
        }
    }

    // Instantly pan/zoom map to fit all filtered markers
    fitMapToFeatures() {
        if (this.filteredFeatures.length === 0) return;

        const bounds = new maplibregl.LngLatBounds();
        this.filteredFeatures.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates) {
                bounds.extend(feature.geometry.coordinates);
            }
        });

        this.map.fitBounds(bounds, {
            padding: 70,
            maxZoom: 14,
            duration: 1000
        });
    }

    // Reset all filtration boxes back to defaults
    resetAllFilters() {
        // Reset checkbox states
        ['org-eh', 'org-nt', 'org-cadw'].forEach(id => {
            document.getElementById(id).checked = true;
        });

        const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
        categoryCheckboxes.forEach(cb => cb.checked = false);

        const specCheckboxes = document.querySelectorAll('.spec-checkbox');
        specCheckboxes.forEach(cb => cb.checked = false);

        document.getElementById('period-select').value = '';
        document.getElementById('search-input').value = '';
        document.getElementById('clear-search').classList.add('d-none');

        this.closeSearchDrawer();
        this.applyFilters(true); // Recenter map
    }

    // Toggle control card minimize/expand
    toggleFilterPanel() {
        const content = document.getElementById('filter-content');
        const btn = document.getElementById('toggle-filters');
        const icon = btn.querySelector('i');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.className = 'bi bi-dash-lg';
            btn.title = 'Minimize panel';
        } else {
            content.style.display = 'none';
            icon.className = 'bi bi-plus-lg';
            btn.title = 'Expand panel';
        }
    }

    // Real-time search indexing and auto-suggestion drawer
    handleSearchQuery(query) {
        this.applyFilters(false); // Update points in real-time, but don't auto zoom map jarringly

        const drawer = document.getElementById('search-results-drawer');
        const list = document.getElementById('search-results-list');
        const label = document.getElementById('results-count-label');

        if (!query || query.length < 2) {
            this.closeSearchDrawer();
            return;
        }

        // Search matches (cap at 6 for clean aesthetics)
        const matches = this.rawFeatures.filter(feature => {
            const props = feature.properties;
            return props.title.toLowerCase().includes(query) || 
                   (props.locationText && props.locationText.toLowerCase().includes(query));
        }).slice(0, 6);

        if (matches.length === 0) {
            list.innerHTML = `
                <div class="p-3 text-center text-muted small">
                    <i class="bi bi-search mb-1 d-block"></i> No sites found matching your search.
                </div>
            `;
            label.textContent = '0 Results';
            drawer.classList.remove('d-none');
            return;
        }

        label.textContent = `${matches.length} Suggestion${matches.length > 1 ? 's' : ''}`;
        list.innerHTML = '';

        matches.forEach(feature => {
            const props = feature.properties;
            
            // Map logo badges
            let badgeClass = 'bg-primary';
            let orgLabel = 'English Heritage';
            if (props.org === 'national-trust') {
                badgeClass = 'bg-success';
                orgLabel = 'National Trust';
            } else if (props.org === 'cadw') {
                badgeClass = 'bg-danger';
                orgLabel = 'Cadw';
            }

            const item = document.createElement('div');
            item.className = 'search-result-item list-group-item list-group-item-action d-flex align-items-center justify-content-between';
            item.innerHTML = `
                <div>
                    <div class="search-result-title">${props.title}</div>
                    <div class="search-result-subtitle">${orgLabel} • ${props.category}</div>
                </div>
                <span class="badge ${badgeClass} text-white uppercase-label">${orgLabel.split(' ')[0]}</span>
            `;

            // Fly to marker when suggestion clicked
            item.addEventListener('click', () => {
                const coords = feature.geometry.coordinates;
                this.map.flyTo({
                    center: coords,
                    zoom: 13,
                    duration: 1500,
                    essential: true
                });
                
                this.showPropertyDetails(props, coords);
                this.closeSearchDrawer();
            });

            list.appendChild(item);
        });

        drawer.classList.remove('d-none');
    }

    closeSearchDrawer() {
        const drawer = document.getElementById('search-results-drawer');
        if (drawer) drawer.classList.add('d-none');
    }

    // Populate and open slide-out sidebar details panel
    showPropertyDetails(props, mapCoords = null) {
        this.selectedProperty = props;

        // On mobile viewports, auto-close the bottom filter sheet if details sheet slides up
        const filterPanel = document.getElementById('filter-panel');
        if (filterPanel && window.innerWidth <= 768) {
            filterPanel.classList.remove('open');
        }

        // 1. Sidebar HTML Population
        const sidebar = document.getElementById('property-sidebar');
        const orgBadge = document.getElementById('sidebar-org-badge');
        const title = document.getElementById('sidebar-title');
        const categoryBadge = document.getElementById('sidebar-category-badge');
        const periodBadge = document.getElementById('sidebar-period-badge');
        const freeBadge = document.getElementById('sidebar-free-badge');
        const topBadge = document.getElementById('sidebar-top-badge');
        const locationDiv = document.getElementById('sidebar-location');
        const locationText = document.getElementById('sidebar-location-text');
        const description = document.getElementById('sidebar-description');
        const img = document.getElementById('sidebar-img');
        const placeholder = document.getElementById('sidebar-placeholder');
        const visitBtn = document.getElementById('sidebar-visit-btn');

        // Title and summary
        title.textContent = props.title;
        description.innerHTML = props.description;

        // Organization badge colors
        orgBadge.className = 'badge px-2.5 py-1.5 rounded-pill';
        if (props.org === 'english-heritage') {
            orgBadge.textContent = 'English Heritage';
            orgBadge.classList.add('bg-primary');
        } else if (props.org === 'national-trust') {
            orgBadge.textContent = 'National Trust';
            orgBadge.classList.add('bg-success');
        } else if (props.org === 'cadw') {
            orgBadge.textContent = 'Cadw Welsh Heritage';
            orgBadge.classList.add('bg-danger');
        }

        // Category Badge
        categoryBadge.textContent = props.category;
        
        // Period Badge
        if (props.period && props.period !== 'Other') {
            periodBadge.textContent = props.period;
            periodBadge.classList.remove('d-none');
        } else {
            periodBadge.classList.add('d-none');
        }

        // Admission details badge
        if (props.isFreeEntry === true) {
            freeBadge.classList.remove('d-none');
        } else {
            freeBadge.classList.add('d-none');
        }

        // Star site badge
        if (props.isTopSite === true) {
            topBadge.classList.remove('d-none');
        } else {
            topBadge.classList.add('d-none');
        }

        // Location text
        if (props.locationText) {
            locationText.textContent = props.locationText;
            locationDiv.classList.remove('d-none');
        } else {
            locationDiv.classList.add('d-none');
        }

        // Image handler
        if (props.imageUrl) {
            img.src = props.imageUrl;
            img.classList.remove('d-none');
            placeholder.classList.add('d-none');
        } else {
            img.classList.add('d-none');
            placeholder.classList.remove('d-none');
        }

        // Web Link Button
        visitBtn.href = props.visitUrl;

        // Slide Sidebar open
        sidebar.classList.remove('closed');
    }

    // Call sidebar when clicking search autocomplete nodes
    showSidebarById(id) {
        const feature = this.rawFeatures.find(f => f.properties.id === id);
        if (feature) {
            this.showPropertyDetails(feature.properties, feature.geometry.coordinates);
        }
    }

    closeSidebar() {
        const sidebar = document.getElementById('property-sidebar');
        if (sidebar) sidebar.classList.add('closed');
        
        if (this.activePopup) {
            this.activePopup.remove();
            this.activePopup = null;
        }
        
        this.selectedProperty = null;
    }

    // Realtime metrics counter calculator
    updateStats() {
        const totalCountVal = this.filteredFeatures.length;
        const ehCountVal = this.filteredFeatures.filter(f => f.properties.org === 'english-heritage').length;
        const ntCountVal = this.filteredFeatures.filter(f => f.properties.org === 'national-trust').length;
        const cadwCountVal = this.filteredFeatures.filter(f => f.properties.org === 'cadw').length;

        // Header statistics
        document.getElementById('total-count').textContent = totalCountVal.toLocaleString();
        document.getElementById('eh-count').textContent = ehCountVal.toLocaleString();
        document.getElementById('nt-count').textContent = ntCountVal.toLocaleString();
        document.getElementById('cadw-count').textContent = cadwCountVal.toLocaleString();

        // Checkbox count badges
        document.getElementById('org-eh-badge').textContent = this.rawFeatures.filter(f => f.properties.org === 'english-heritage').length;
        document.getElementById('org-nt-badge').textContent = this.rawFeatures.filter(f => f.properties.org === 'national-trust').length;
        document.getElementById('org-cadw-badge').textContent = this.rawFeatures.filter(f => f.properties.org === 'cadw').length;
    }

    // Drag draggable filters panel box around
    initDraggablePanel() {
        const panel = document.getElementById('filter-panel');
        const header = panel.querySelector('.card-header');
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.btn-action')) return; // Ignore drag if button clicked
            
            isDragging = true;
            panel.classList.add('dragging');
            
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = panel.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            // Remove anchor styles to allow free absolute styling
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            panel.style.left = `${initialLeft}px`;
            panel.style.top = `${initialTop}px`;
            
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let targetLeft = initialLeft + dx;
            let targetTop = initialTop + dy;

            // Enforce window viewport constraints
            const rect = panel.getBoundingClientRect();
            targetLeft = Math.max(10, Math.min(window.innerWidth - rect.width - 10, targetLeft));
            targetTop = Math.max(10, Math.min(window.innerHeight - rect.height - 10, targetTop));

            panel.style.left = `${targetLeft}px`;
            panel.style.top = `${targetTop}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                panel.classList.remove('dragging');
            }
        });
        
        // Touch supports
        header.addEventListener('touchstart', (e) => {
            if (e.target.closest('.btn-action')) return;
            const touch = e.touches[0];
            
            isDragging = true;
            panel.classList.add('dragging');
            
            startX = touch.clientX;
            startY = touch.clientY;
            
            const rect = panel.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            panel.style.left = `${initialLeft}px`;
            panel.style.top = `${initialTop}px`;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            
            let targetLeft = initialLeft + dx;
            let targetTop = initialTop + dy;
            
            const rect = panel.getBoundingClientRect();
            targetLeft = Math.max(10, Math.min(window.innerWidth - rect.width - 10, targetLeft));
            targetTop = Math.max(10, Math.min(window.innerHeight - rect.height - 10, targetTop));
            
            panel.style.left = `${targetLeft}px`;
            panel.style.top = `${targetTop}px`;
        });
        
        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                panel.classList.remove('dragging');
            }
        });
    }

    // Helper: Update loading spinner text
    updateLoadingStatus(message) {
        const text = document.getElementById('loading-status');
        if (text) text.textContent = message;
    }

    // Helper: Hide spinner overlay
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('d-none');
    }

    // Helper: Show static error screen
    showError(message) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.innerHTML = `
                <div class="card shadow p-4 text-center border-0 rounded-4" style="max-width: 340px;">
                    <i class="bi bi-exclamation-triangle text-danger" style="font-size: 3.5rem;"></i>
                    <h5 class="outfit-font fw-bold mt-3 text-danger">Dataset Loading Error</h5>
                    <p class="text-muted mt-2 small">${message}</p>
                    <button class="btn btn-primary mt-3 py-2" onclick="location.reload()">
                        <i class="bi bi-arrow-clockwise me-1"></i> Try Reloading
                    </button>
                </div>
            `;
        }
    }
}

// Instantiate dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HeritageExplorer();
});
