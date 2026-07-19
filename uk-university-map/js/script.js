/* ═══════════════════════════════════════════════════════════════════════════
   UK University Map — Vanilla JS Application
   Tribute to Peter Burden, University of Wolverhampton (1994)
   Data: learning-provider.data.ac.uk + Wikidata + HESA Discover Uni
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

// ── Institution type configuration ──────────────────────────────────────────
const TYPE_CONFIG = {
  russell_group:      { color: '#C0392B', label: 'Russell Group University',     short: 'Russell Group' },
  research_university:{ color: '#E74C3C', label: 'Research University',          short: 'Research'      },
  university:         { color: '#E67E22', label: 'University',                   short: 'University'    },
  modern_university:  { color: '#F39C12', label: 'Modern University',            short: 'Modern'        },
  cathedrals_group:   { color: '#8E44AD', label: 'Cathedrals Group',             short: 'Cathedrals'    },
  specialist_arts:    { color: '#9B59B6', label: 'Specialist Arts Institution',  short: 'Arts'          },
  specialist_medical: { color: '#27AE60', label: 'Specialist Medical/Scientific',short: 'Medical'       },
  higher_education:   { color: '#2980B9', label: 'Higher Education Institution', short: 'HE'            },
};

const TYPE_ORDER = [
  'russell_group','research_university','university','modern_university',
  'cathedrals_group','specialist_arts','specialist_medical','higher_education'
];

// ── SVG marker shapes (echoing Burden's PostScript diamond/star/circle) ──────
function markerSVG(color, type, size = 16) {
  const h = size / 2;
  if (type === 'russell_group' || type === 'research_university') {
    // Diamond ◆
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <polygon points="${h},1 ${size-1},${h} ${h},${size-1} 1,${h}" fill="${color}" stroke="white" stroke-width="1.5"/>
    </svg>`;
  } else if (type === 'specialist_arts' || type === 'cathedrals_group' || type === 'specialist_medical' || type === 'higher_education') {
    // Circle ●
    const r = h - 1.5;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${h}" cy="${h}" r="${r}" fill="${color}" stroke="white" stroke-width="1.5"/>
    </svg>`;
  } else {
    // Pentagon/star ★ — for standard universities
    const r = h - 1.5, cx = h, cy = h;
    const pts = Array.from({length:5}, (_,i) => {
      const a = (i * 72 - 90) * Math.PI / 180;
      return `${cx + r*Math.cos(a)},${cy + r*Math.sin(a)}`;
    }).join(' ');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <polygon points="${pts}" fill="${color}" stroke="white" stroke-width="1.5"/>
    </svg>`;
  }
}

// ── State ────────────────────────────────────────────────────────────────────
let allInstitutions = [];
let markers = [];
let map = null;
let activeFilters = new Set(TYPE_ORDER.slice(0, 4));
let selectedInstitution = null;
let sidebarOpen = true;

// ── DOM refs ─────────────────────────────────────────────────────────────────
const sidebar       = document.getElementById('sidebar');
const toggleBtn     = document.getElementById('sidebar-toggle');
const toggleIcon    = document.getElementById('toggle-icon');
const searchInput   = document.getElementById('search-input');
const searchClear   = document.getElementById('search-clear');
const searchResults = document.getElementById('search-results');
const visibleCount  = document.getElementById('visible-count');
const totalCount    = document.getElementById('total-count');
const legend        = document.getElementById('legend');
const infoPanel     = document.getElementById('info-panel');
const infoTypeBar   = document.getElementById('info-type-bar');
const infoName      = document.getElementById('info-name');
const infoLocation  = document.getElementById('info-location');
const infoBadges    = document.getElementById('info-badges');
const infoGroups    = document.getElementById('info-groups');
const infoUkprn     = document.getElementById('info-ukprn');
const infoLinks     = document.getElementById('info-links');
const infoClose     = document.getElementById('info-close');
const mapSubtitle   = document.getElementById('map-subtitle');
const loadingOverlay= document.getElementById('loading-overlay');

// ── Sidebar toggle ───────────────────────────────────────────────────────────
toggleBtn.addEventListener('click', () => {
  sidebarOpen = !sidebarOpen;
  sidebar.classList.toggle('collapsed', !sidebarOpen);
  toggleIcon.className = sidebarOpen
    ? 'bi bi-layout-sidebar-reverse'
    : 'bi bi-layout-sidebar';
});

// ── Build legend ─────────────────────────────────────────────────────────────
function buildLegend() {
  const heading = legend.querySelector('.legend-heading');
  legend.innerHTML = '';
  legend.appendChild(heading);

  TYPE_ORDER.forEach(type => {
    const tc = TYPE_CONFIG[type];
    const active = activeFilters.has(type);
    const count = allInstitutions.filter(i => i.institution_type === type).length;

    const item = document.createElement('div');
    item.className = `legend-item ${active ? 'active' : 'inactive'}`;
    item.dataset.type = type;
    item.innerHTML = `
      <div class="legend-marker-wrap">${markerSVG(tc.color, type, 14)}</div>
      <span class="legend-label">${tc.label}</span>
      <span class="legend-count">${count}</span>
    `;
    item.addEventListener('click', () => toggleFilter(type));
    legend.appendChild(item);
  });
}

function toggleFilter(type) {
  if (activeFilters.has(type)) {
    activeFilters.delete(type);
  } else {
    activeFilters.add(type);
  }
  updateLegendState();
  applyFilters();
}

function updateLegendState() {
  legend.querySelectorAll('.legend-item').forEach(item => {
    const type = item.dataset.type;
    const active = activeFilters.has(type);
    item.classList.toggle('active', active);
    item.classList.toggle('inactive', !active);
  });
}

document.getElementById('btn-all').addEventListener('click', () => {
  activeFilters = new Set(TYPE_ORDER);
  updateLegendState();
  applyFilters();
});

document.getElementById('btn-none').addEventListener('click', () => {
  activeFilters = new Set();
  updateLegendState();
  applyFilters();
});

// ── Filter markers ───────────────────────────────────────────────────────────
function applyFilters() {
  let shown = 0;
  markers.forEach(({ marker, institution }) => {
    const visible = activeFilters.has(institution.institution_type);
    const el = marker.getElement();
    el.style.display = visible ? '' : 'none';
    if (visible) shown++;
  });
  visibleCount.textContent = shown;
  mapSubtitle.textContent = `${shown} institutions · 2025–26 data`;
}

// ── Search ───────────────────────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  searchClear.style.display = q ? 'block' : 'none';

  if (q.length < 2) {
    searchResults.style.display = 'none';
    searchResults.innerHTML = '';
    return;
  }

  const hits = allInstitutions
    .filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.town.toLowerCase().includes(q) ||
      i.postcode.toLowerCase().startsWith(q)
    )
    .slice(0, 10);

  if (!hits.length) {
    searchResults.style.display = 'none';
    return;
  }

  searchResults.innerHTML = hits.map(inst => {
    const tc = TYPE_CONFIG[inst.institution_type] || TYPE_CONFIG.higher_education;
    return `<div class="search-result-item" data-ukprn="${inst.ukprn}">
      <div class="search-result-dot" style="background:${tc.color}"></div>
      <div>
        <div class="search-result-name">${inst.name}</div>
        <div class="search-result-sub">${inst.town} · ${tc.short}</div>
      </div>
    </div>`;
  }).join('');

  searchResults.style.display = 'block';

  searchResults.querySelectorAll('.search-result-item').forEach(el => {
    el.addEventListener('click', () => {
      const ukprn = el.dataset.ukprn;
      const inst = allInstitutions.find(i => i.ukprn === ukprn);
      if (inst) {
        searchInput.value = inst.name;
        searchClear.style.display = 'block';
        searchResults.style.display = 'none';
        flyTo(inst);
        showInfoPanel(inst);
      }
    });
  });
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.style.display = 'none';
  searchResults.style.display = 'none';
});

// Close search results when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap')) {
    searchResults.style.display = 'none';
  }
});

// ── Info panel ───────────────────────────────────────────────────────────────
function showInfoPanel(inst) {
  selectedInstitution = inst;
  const tc = TYPE_CONFIG[inst.institution_type] || TYPE_CONFIG.higher_education;

  infoTypeBar.style.background = tc.color;
  infoName.textContent = inst.name;
  infoLocation.textContent = [inst.town, inst.postcode].filter(Boolean).join(' · ');

  // Badges
  let badgesHTML = `<span class="type-badge" style="background:${tc.color}">${tc.short}</span>`;
  if (inst.founded) {
    badgesHTML += `<span class="founded-badge">Est. ${inst.founded}</span>`;
  }
  infoBadges.innerHTML = badgesHTML;

  // Groups
  if (inst.groups_display && inst.groups_display.length) {
    infoGroups.textContent = inst.groups_display.join(' · ');
    infoGroups.style.display = '';
  } else {
    infoGroups.style.display = 'none';
  }

  // UKPRN
  let ukprnText = `UKPRN: ${inst.ukprn}`;
  if (inst.hesa_id) ukprnText += ` · HESA: ${inst.hesa_id}`;
  infoUkprn.textContent = ukprnText;

  // Links
  const links = [];
  if (inst.website) {
    links.push(`<a href="${inst.website}" target="_blank" rel="noopener" class="info-link">Website ↗</a>`);
  }
  if (inst.wikipedia) {
    links.push(`<a href="${inst.wikipedia}" target="_blank" rel="noopener" class="info-link">Wikipedia ↗</a>`);
  }
  if (inst.discover_uni_url) {
    links.push(`<a href="${inst.discover_uni_url}" target="_blank" rel="noopener" class="info-link discover">Discover Uni ↗</a>`);
  }
  infoLinks.innerHTML = links.join('');

  infoPanel.classList.add('visible');

  // Scroll info panel into view in sidebar
  setTimeout(() => {
    infoPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 50);
}

infoClose.addEventListener('click', () => {
  infoPanel.classList.remove('visible');
  selectedInstitution = null;
});

// ── Map fly-to ───────────────────────────────────────────────────────────────
function flyTo(inst) {
  if (!map) return;
  map.flyTo({
    center: inst.coordinates,
    zoom: Math.max(map.getZoom(), 9),
    duration: 900,
    essential: true,
  });
}

// ── Build popup HTML ─────────────────────────────────────────────────────────
function buildPopupHTML(inst) {
  const tc = TYPE_CONFIG[inst.institution_type] || TYPE_CONFIG.higher_education;
  const links = [];
  if (inst.website) links.push(`<a href="${inst.website}" target="_blank" rel="noopener" class="popup-link">Website ↗</a>`);
  if (inst.wikipedia) links.push(`<a href="${inst.wikipedia}" target="_blank" rel="noopener" class="popup-link">Wikipedia ↗</a>`);
  if (inst.discover_uni_url) links.push(`<a href="${inst.discover_uni_url}" target="_blank" rel="noopener" class="popup-link">Discover Uni ↗</a>`);

  return `
    <div class="popup-type-bar" style="background:${tc.color}"></div>
    <div class="popup-body">
      <div class="popup-name">${inst.name}</div>
      <div class="popup-town">${inst.town}${inst.postcode ? ' · ' + inst.postcode : ''}</div>
      <span class="popup-badge" style="background:${tc.color}">${tc.short}${inst.founded ? ' · Est. ' + inst.founded : ''}</span>
      ${links.length ? `<div class="popup-links">${links.join('')}</div>` : ''}
    </div>`;
}

// ── Initialise map ───────────────────────────────────────────────────────────
function initMap() {
  map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [-2.5, 54.5],
    zoom: 5.5,
    minZoom: 4,
    maxZoom: 16,
    attributionControl: false,
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

  map.on('load', () => {
    loadingOverlay.classList.add('hidden');
    loadData();
  });

  // Close search on map click
  map.on('click', () => {
    searchResults.style.display = 'none';
  });
}

// ── Load GeoJSON data ────────────────────────────────────────────────────────
function loadData() {
  fetch('uk_universities.geojson')
    .then(r => r.json())
    .then(data => {
      allInstitutions = data.features.map(f => ({
        ...f.properties,
        coordinates: f.geometry.coordinates,
      }));

      totalCount.textContent = allInstitutions.length;

      buildLegend();
      addMarkers();
    })
    .catch(err => {
      console.error('Failed to load GeoJSON:', err);
      loadingOverlay.querySelector('.loading-text').textContent = 'Failed to load data.';
    });
}

// ── Add markers ──────────────────────────────────────────────────────────────
function addMarkers() {
  markers = [];

  allInstitutions.forEach(inst => {
    const [lng, lat] = inst.coordinates;
    const tc = TYPE_CONFIG[inst.institution_type] || TYPE_CONFIG.higher_education;

    // Marker element — wrap SVG in an inner div for hover scaling
    const el = document.createElement('div');
    el.className = 'uni-marker';
    el.innerHTML = `<div class="uni-marker-inner">${markerSVG(tc.color, inst.institution_type, 16)}</div>`;
    el.title = inst.name;

    // Popup
    const popup = new maplibregl.Popup({
      offset: 10,
      closeButton: true,
      closeOnClick: false,
      maxWidth: '280px',
    }).setHTML(buildPopupHTML(inst));

    // Marker
    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    // Click: show info panel + popup
    el.addEventListener('click', e => {
      e.stopPropagation();
      showInfoPanel(inst);
      marker.togglePopup();
      // Ensure sidebar is open on mobile
      if (!sidebarOpen && window.innerWidth <= 768) {
        sidebarOpen = true;
        sidebar.classList.remove('collapsed');
        toggleIcon.className = 'bi bi-layout-sidebar-reverse';
      }
    });

    markers.push({ marker, institution: inst });
  });

  applyFilters();
}

// ── Boot ─────────────────────────────────────────────────────────────────────
initMap();