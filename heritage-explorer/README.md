# Heritage Explorer: Unified UK & Welsh Heritage Map

Welcome to **Heritage Explorer**, a modern, responsive, and high-performance interactive map dashboard combining heritage properties from **English Heritage**, **National Trust**, and **Cadw Wales** into a single cohesive experience.

This project unifies and builds upon three separate maps originally created for England, Wales (Cadw), and a trip to Northeast England. It features a premium, responsive glassmorphic interface that allows you to easily cross-filter and discover **1,131 heritage locations** across the UK.

👉 **Local URL**: [http://localhost:8000/heritage-explorer/](http://localhost:8000/heritage-explorer/) (when running locally)

---

## 🌟 Key Features

* **Real-Time Header Analytics (Desktop)**: Dynamically tracks and displays stats (total visible properties, plus individual counts for English Heritage, National Trust, and Cadw) as you interact with filters.
* **Premium Desktop & Mobile Layouts**:
  * **Desktop**: Features a gorgeous frosted glass draggable filters card, autocomplete drawer, and slide-in sidebar.
  * **Mobile (iOS/Android Native Feel)**: Hides standard website navbars to give **100% of the screen height** to the map canvas, overlaid with a floating native-style search/filter pill, and interactive **bottom drawer sheets** with drag handles!
* **Draggable & Collapsible Filter Panel**: Easily cross-filter properties by:
  * **Organizations** (with markers styled to match their official brand colors).
  * **Property Category** (Castles & Forts, Abbeys & Priories, Houses & Gardens, Roman sites, Prehistoric sites, and Others).
  * **Highlights & Admission** (Filter by Free Entry or "Star / Top" Sites).
  * **Historical Period** (Prehistoric, Roman, Medieval, Tudor, Industrial).
* **Interactive Marker Legend**: Dynamic toggle enabling you to instantly switch marker colors between **Organization Branding** (Navy for EH, Forest Green for NT, Dragon Red for Cadw) or **Property Category** (visualized on-the-fly via GPU-accelerated MapLibre paint properties).
* **Instant Auto-Suggest Search**: Elegant global search bar querying names, counties, and descriptions, showing matches instantly in a floating search drawer.
* **Popup-Free Details Navigation**: Selecting any marker or search suggestion flies the viewport smoothly to the site and slides out the details drawer from the right (or slides up from the bottom on mobile), without speech bubbles cluttering the map canvas.
* **Slide-Out Details Drawer**: Displays full descriptions, custom badge tags, county locations, hero images, and a prominent call-to-action button to visit the official website page.

---

## 📱 Mobile Native Map Interface

To deliver an exceptional experience when browsing sites on a mobile device or tablet, the app dynamically transforms into a native-feeling application under `< 768px` viewports:

1. **Floating Search Pill**: Replaces the website header with a compact, semi-transparent white search container at the top of the map.
2. **Filters Bottom Drawer**: The "Explorer Controls" panel transitions into a bottom sheet that slides up smoothly from the bottom when clicking the filter slider icon. It features an iOS/Android style grey drag handle and a close ('X') button.
3. **Property Details Bottom Sheet**: Clicking any heritage marker slides up a property details sheet from the bottom, occupying **72% of the viewport height** so the map remains beautifully visible in the top 28%.
4. **Auto-Closing Filters Drawer**: Opening a site's details automatically slides down the filter drawer sheet to prevent overlapping widgets, ensuring an extremely clean and spacious interface.

---

## 🛠️ Technical Stack & Architecture

The application is built entirely using robust, vanilla front-end web technologies to ensure speed, modern aesthetics, and ease of static hosting on **GitHub Pages**:

* **Map Engine**: [MapLibre GL JS v4](https://maplibre.org/)
* **Map Style**: [OpenFreeMaps (Liberty Style)](https://openfreemap.org/) - completely free vector-tile map style.
* **CSS Framework**: [Bootstrap 5.3](https://getbootstrap.com/) & [Bootstrap Icons](https://icons.getbootstrap.com/)
* **Typography**: Google Fonts (*Outfit* for headings, *Inter* for body)
* **Data Processing**: Asynchronous parallel loader that dynamically fetches and merges your local datasets within the same directory, maps varied fields to a unified GeoJSON schema, and renders points using super-fast, hardware-accelerated circle layers.

### Self-Contained Deployment (No Cross Dependencies)
To ensure the application has **no cross-folder dependencies** and remains extremely clean, all GeoJSON source files are copied directly inside the `heritage-explorer` subfolder. This makes the entire dashboard fully self-contained; you can copy, zip, or deploy the `heritage-explorer` folder by itself anywhere on the web, and it will run perfectly.

---

## 📁 File Structure

The project has been organized under the `heritage-explorer` subfolder within your primary static web folder (`markmclaren.github.io`), containing all its own local code, styles, and data:

```text
combine-heritage-maps/
└── markmclaren.github.io/             # Main site directory
    ├── index.html                     # Original main landing page (HelloWorld)
    │
    ├── heritage-explorer/             # Self-Contained Heritage Explorer subfolder
    │   ├── index.html                 # Premium, responsive dashboard layout
    │   ├── styles.css                 # Custom design tokens, bottom drawer sheets & transitions
    │   ├── script.js                  # Sync loader, mobile drawer listeners & MapLibre controllers
    │   ├── README.md                  # Main instructions & mobile docs (this file)
    │   ├── cadw.geojson               # Copied local Cadw dataset (124 features)
    │   ├── english-heritage.geojson   # Copied local English Heritage dataset (388 features)
    │   └── NationalTrust.geojson      # Copied local National Trust dataset (619 features)
```

---

## 🚀 Running Locally

To run the site locally, navigate into the web directory and spin up a lightweight HTTP server:

### Python 3 (Built-in)
```bash
cd markmclaren.github.io
python3 -m http.server 8000
```

### Node / npm (http-server)
```bash
cd markmclaren.github.io
npx http-server -p 8000
```

Once running, navigate your web browser to:
👉 **[http://localhost:8000/heritage-explorer/](http://localhost:8000/heritage-explorer/)**

---

## 📈 Database Metrics

The unified MapLibre source comprises:
* **Total Combined Properties**: `1,131`
* **English Heritage Sites**: `388`
* **National Trust Sites**: `619`
* **Cadw Wales Properties**: `124`
