# English Heritage Properties Map

A vanilla JavaScript web application that displays English Heritage properties on an interactive map using MapLibre GL JS and OpenStreetMap tiles.

## Features

- 🗺️ Interactive map with zoom, pan, and fullscreen controls
- 📍 Property markers color-coded by entry type (green = free, red = paid)
- 🔍 Advanced filtering system:
  - Free/Paid entry filter
  - Top Heritage Sites filter
  - Property type filters (Abbeys, Castles, Houses, Roman sites, Prehistoric sites)
- 📱 Responsive design that works on desktop and mobile
- 🎯 Draggable filter panel
- 💬 Property popups with detailed information
- 🎨 Bootstrap 5 styling with professional appearance

## Files

- `index.html` - Main HTML file with Bootstrap layout
- `styles.css` - Custom CSS styles
- `script.js` - Main JavaScript application logic
- `sample-data.js` - Sample English Heritage property data

## Setup Instructions

### Option 1: Simple Local Server
1. Download all files to a folder
2. Open a terminal/command prompt in that folder
3. Run a local server:
   - **Python 3**: `python -m http.server 8080`
   - **Python 2**: `python -m SimpleHTTPServer 8080`
   - **Node.js**: `npx serve .`
4. Open your browser and go to `http://localhost:8080`

### Option 2: Direct File Opening
1. Download all files to a folder
2. Double-click `index.html` to open in your browser
3. Note: Some features may not work due to CORS restrictions

## API Integration

The application is designed to work with the English Heritage API:
```
https://www.english-heritage.org.uk/api/PropertySearch/GetAll
```

However, due to CORS restrictions, the current version uses sample data. To use the real API:

1. Set up a proxy server or CORS-enabled backend
2. Modify the `loadProperties()` method in `script.js`
3. Uncomment the fetch call and remove the sample data logic

## Customization

### Adding More Properties
Edit `sample-data.js` to add more properties following the same structure.

### Changing Map Style
In `script.js`, modify the map style configuration to use different tile sources:
```javascript
style: {
    version: 8,
    sources: {
        'your-tiles': {
            type: 'raster',
            tiles: ['https://your-tile-server/{z}/{x}/{y}.png'],
            tileSize: 256
        }
    },
    // ... rest of style config
}
```

### Modifying Filters
Update the filter logic in the `applyFilters()` and `matchesPropertyTypeFilters()` methods.

### Styling Changes
- Edit `styles.css` for custom styling
- Modify Bootstrap classes in `index.html` for layout changes
- Adjust marker colors in the CSS `.property-marker` classes

## Browser Compatibility

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Dependencies (loaded from CDN)

- Bootstrap 5.3.0
- Bootstrap Icons 1.10.0
- MapLibre GL JS 4.7.1

## License

This project is for demonstration purposes. English Heritage data is subject to their terms of use.

## Support

For issues or questions about the code, refer to the individual file comments or modify as needed for your specific use case.

