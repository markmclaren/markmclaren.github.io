var map;
var legend;
var targets = {};

// Define your custom range points
const rangePoints = [1859, 1866, 1886, 1905];

// Render the popup template using Mustache.js
const popupTemplate = `
{{#name}}
<h6>{{name}}</h6>
{{/name}}
{{#title}}
<div>
    <h6>{{title}}</h6>
    {{#identifier}}
        <a target="_blank" href="https://hpcbristol.net/visual/{{identifier}}">
            <img src="https://hpcbristol.net/image-library/small/{{identifier}}.jpg" />
        </a>
    {{/identifier}}
</div>
{{/title}}
`;

function getYear() {
  const slider = document.getElementById("slider");
  const value = slider.value;
  return rangePoints[value];
}

// Function to update slider value
function updateSlider() {
  const sliderValueDisplay = document.getElementById("sliderValue");
  const year = getYear();
  // Update the slider value display with the corresponding range point
  sliderValueDisplay.textContent = year;
  document.getElementById("year").textContent = year;

  // Call filterBy function to filter layers based on the selected year
  filterBy(year);
}

function filterBy(year) {
  // Hide all layers
  map.getStyle().layers.forEach(function (layer) {
    if (layer.source != "maptiler_planet") {
      if (
        layer.type === "fill" ||
        layer.type === "line" ||
        layer.type === "circle"
      ) {
        map.setLayoutProperty(layer.id, "visibility", "none");
      }
    }
  });
  targets = {};
  // Show only layers corresponding to the selected year
  const yearString = year.toString();
  map.getStyle().layers.forEach(function (layer) {
    if (layer.source != "maptiler_planet" && layer.id.includes(yearString)) {
      if (!layer.id.includes("hover")) {
        targets[layer.id] = layer.id;
      }
      map.setLayoutProperty(layer.id, "visibility", "visible");
    }
  });
  legend.targets = targets;
  legend.redraw();
}

function getSortKey(item) {
  var sortKey = 0;
  if (item.type == "circle") {
    sortKey = item.layout["circle-sort-key"];
  }
  if (item.type == "fill") {
    sortKey = item.layout["fill-sort-key"];
  }
  if (item.type == "line") {
    sortKey = item.layout["line-sort-key"];
  }
  return sortKey;
}

window.addEventListener("load", (event) => {
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", (request) => {
    return new Promise((resolve, reject) => {
      const callback = (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({ data });
        }
      };
      protocol.tile(request, callback);
    });
  });

  const PMTILES_URL = "hongkong.pmtiles";

  const p = new pmtiles.PMTiles(PMTILES_URL);
  protocol.add(p);
  let hoveredPolygonId = null;

  p.getHeader().then((h) => {
    map = new maplibregl.Map({
      container: "map",
      zoom: h.maxZoom - 1,
      center: [h.centerLon, h.centerLat],
      style:
        "https://api.maptiler.com/maps/dataviz-light/style.json?key=DhInd57wi3xMJdcrgKlv",
    });

    map.on("load", function () {
      map.addSource("example_source", {
        type: "vector",
        url: `pmtiles://${PMTILES_URL}`,
      });

      const layersArray = [];

      p.getMetadata().then((md) => {
        let layers = md.tilestats.layers;
        layers.forEach((item) => {
          let type = "line";
          if (item.geometry === "Polygon") {
            type = "fill";
          }
          if (item.geometry === "Point") {
            type = "circle";
          }
          let styleName = item.layer.substring(4);
          let selectedStyle = {};
          let layout = {};
          switch (styleName) {
            case "points":
              selectedStyle = {
                "circle-radius": 6,
                "circle-color": "#00FFFF",
              };
              layout = {
                "circle-sort-key": 1500,
              };
              break;
            case "land":
              selectedStyle = {
                "fill-color": "#699645",
              };
              layout = {
                "fill-sort-key": 0,
              };
              break;
            case "roads":
              selectedStyle = {
                "line-color": "#FFFFFF",
              };
              layout = {
                "line-sort-key": 100,
              };
              break;
            case "parks":
              selectedStyle = {
                "fill-color": "#A4F499",
              };
              layout = {
                "fill-sort-key": 50,
              };
              break;
            case "lots":
              selectedStyle = {
                "fill-color": "#8B8686",
                "fill-outline-color": "#000000",
              };
              layout = {
                "fill-sort-key": 25,
              };
              break;
            default:
              console.log("Invalid style name.");
          }

          layersArray.push({
            id: item.layer,
            source: "example_source",
            "source-layer": item.layer,
            type: type,
            layout: layout,
            paint: selectedStyle,
          });

          if (styleName === "lots") {
            // Add a second hover layer
            layersArray.push({
              id: item.layer + "hover",
              source: "example_source",
              "source-layer": item.layer,
              type: type,
              layout: layout,
              paint: {
                "fill-color": "#FF0000",
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  1,
                  0,
                ],
              },
            });
            addHover(item.layer);
          }
        });

        // Sort layersArray based on different sort keys
        layersArray.sort((a, b) => {
          // Define your sorting criteria here
          // For example, if you want to sort by circle-sort-key
          return (getSortKey(a) || 0) - (getSortKey(b) || 0);
        });

        const year = getYear();
        const yearString = year.toString();

        // Add layers to the map in the sorted order
        layersArray.forEach((layer) => {
          map.addLayer(layer);
          map.setLayoutProperty(layer.id, "visibility", "none");
          if (layer.id.includes(yearString)) {
            map.setLayoutProperty(layer.id, "visibility", "visible");
            if (!layer.id.includes("hover")) {
              targets[layer.id] = layer.id;
            }
          }
        });
        addInteractiveLayer(map.getLayer("1905points"));
      });

      let options = {
        showDefault: true,
        showCheckbox: true,
        onlyRendered: false,
        reverseOrder: true,
      };
      legend = new MaplibreLegendControl.MaplibreLegendControl(
        targets,
        options
      );
      map.addControl(legend, "bottom-left");
    });

    function addHover(lotsLayerName) {
      var hoverLayerName = lotsLayerName + "hover";
      map.on("mousemove", hoverLayerName, (e) => {
        if (e.features.length > 0) {
          if (hoveredPolygonId !== null) {
            map.setFeatureState(
              {
                source: "example_source",
                sourceLayer: lotsLayerName,
                id: hoveredPolygonId,
              },
              { hover: false }
            );
          }
          hoveredPolygonId = e.features[0].id;
          map.setFeatureState(
            {
              source: "example_source",
              sourceLayer: lotsLayerName,
              id: hoveredPolygonId,
            },
            { hover: true }
          );
        }
      });

      map.on("click", hoverLayerName, (e) => {
        if (hoveredPolygonId !== null) {
          //console.log(hoveredPolygonId);
        }
        var features = map.queryRenderedFeatures(e.point, {
          layers: [hoverLayerName],
        });

        if (!features.length) {
          return;
        }

        var feature = features[0];
        // Access feature properties here
        var info = document.getElementById("information");
        info.innerHTML = "<p>" + JSON.stringify(feature.properties) + "</p>";
      });

      // When the mouse leaves the state-fill layer, update the feature state of the
      // previously hovered feature.
      map.on("mouseleave", hoverLayerName, () => {
        if (hoveredPolygonId !== null) {
          map.setFeatureState(
            {
              source: "example_source",
              sourceLayer: lotsLayerName,
              id: hoveredPolygonId,
            },
            { hover: false }
          );
        }
        hoveredPolygonId = null;
      });
    }
  });

  function addInteractiveLayer(mapLayer) {
    // Check if the layer is a point layer and add popup
    if (mapLayer && mapLayer.type === "circle") {
      // Check if it's a point layer (type: 'circle')
      // Add mouseenter event listener to the layer
      map.on("mouseenter", mapLayer.id, function () {
        // Change the cursor style to pointer
        map.getCanvas().style.cursor = "pointer";
      });

      // Add mouseleave event listener to the layer
      map.on("mouseleave", mapLayer.id, function () {
        // Change the cursor style back to default
        map.getCanvas().style.cursor = "";
      });

      map.on("click", mapLayer.id, function (e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: [mapLayer.id],
        });

        if (!features.length) {
          return;
        }
        // Iterate over grouped features and create popups
        let htmlContent = "";

        e.features.forEach((feature) => {
          // Prepare data for Mustache template
          let data = {
            name: feature.properties.name,
            title: feature.properties.title,
            identifier: feature.properties.identifier,
          };
          htmlContent += Mustache.render(popupTemplate, data);
        });

        var info = document.getElementById("information");
        info.innerHTML = htmlContent;
      });
    }
  }
});
