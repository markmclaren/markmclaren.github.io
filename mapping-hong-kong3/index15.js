var map;
var legend;
var targets = {};
var layersControl;

const column1 = document.querySelector(".column1");

// Define color schemes
var colorSchemes = {
  original: {
    Roads: "#FFFFFF",
    Land: "#699645",
    Park: "#A4F499",
    Lots: "#8B8686",
    Data: "#FFFF05",
    Images: "#C72F2F",
    Background: "#40362b",
    LightBackground: "#554f45",
  },
  ibm: {
    Roads: "#FFFFFF",
    Land: "#785ef0",
    Park: "#fe6100",
    Lots: "#648fff",
    Data: "#ffb000",
    Images: "#dc267f",
    Background: "#755CEB",
    LightBackground: "#648fff",
  },
  bluered: {
    Roads: "#F7F7F7", // 5
    Land: "#2066AC", // 1
    Park: "#D1E5F0", // 4
    Lots: "#4393C3", // 2
    Data: "#F5A482", // 7
    Images: "#B2172C", // 9
    Background: "#2066AC",
    LightBackground: "#4393C3",
  },
  reversebluered: {
    Roads: "#F7F7F7", // 5
    Land: "#B2172C", // 9
    Park: "#FDDBC7", // 6
    Lots: "#D5604C", // 8
    Data: "#92C5DE", // 3
    Images: "#2066AC", // 1
    Background: "#B2172C",
    LightBackground: "#D5604C",
  },
  purplegreen: {
    Roads: "#F7F7F7", // 5
    Land: "#762A83", // 1
    Park: "#E7D4E8", // 4
    Lots: "#9970AB", // 2
    Data: "#ACD39E", // 7
    Images: "#1B7837", // 9
    Background: "#762A83",
    LightBackground: "#9970AB",
  },
  reversepurplegreen: {
    Roads: "#F7F7F7", // 5
    Land: "#1B7837", // 9
    Park: "#D4EACE", // 6
    Lots: "#5AAE61", // 8
    Data: "#C2A5CF", // 3
    Images: "#762A83", // 1
    Background: "#1B7837",
    LightBackground: "#5AAE61",
  },
  avhrr: {
    Roads: "#FFFFFF", // white
    Land: "#44AA88", // cropland
    Park: "#A9DDCC", // grassland
    Lots: "#BB0211", // urban and built
    Data: "#E5D4E8", // lighter purple
    Images: "#742881", // purple
    Background: "#44AA88",
    LightBackground: "#BB0211",
  },
  blackwhitesequential: {
    Roads: "#636363", // 5
    Land: "#000000", // 1
    Park: "#4A4A4A", // 4
    Lots: "#1C1C1C", // 2
    Data: "#989898", // 7
    Images: "#D1D1D1", // 9
    Background: "#000000",
    LightBackground: "#1C1C1C",
  },
  reverseblackwhitesequential: {
    Roads: "#636363", // 5
    Land: "#D1D1D1", // 9
    Park: "#7D7D7D", // 6
    Lots: "#B4B4B4", // 8
    Data: "#323232", // 3
    Images: "#000000", // 1
    Background: "#D1D1D1",
    LightBackground: "#B4B4B4",
  },
};

var schemeName = "original";
var ColourRoads = colorSchemes[schemeName].Roads;
var ColourLand = colorSchemes[schemeName].Land;
var ColourPark = colorSchemes[schemeName].Park;
var ColourLots = colorSchemes[schemeName].Lots;
var ColourData = colorSchemes[schemeName].Data;
var ColourImages = colorSchemes[schemeName].Images;
var ColourBackground = colorSchemes[schemeName].Background;
var ColourLightBackground = colorSchemes[schemeName].LightBackground;
var ColourParkText = getContrastColor(ColourPark);
var ColourLotsText = getContrastColor(ColourLots);
var ColourDataText = getContrastColor(ColourData);
var ColourImagesText = getContrastColor(ColourImages);

var propertiesOn, propertiesOff;

function getContrastColor(hexColor) {
  // Convert hex code to RGB
  let r = parseInt(hexColor.substr(1, 2), 16); // Red color
  let g = parseInt(hexColor.substr(3, 2), 16); // Green color
  let b = parseInt(hexColor.substr(5, 2), 16); // Blue color

  // Calculating the luminance value
  let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for bright colors, white for dark colors
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
  //return luminance > 0.5 ? "#FF0000" : "#00FFFF";
}

function updateProperties() {
  propertiesOn = {
    fill: {
      "fill-color": [
        "case",
        ["has", "image_source"],
        ColourImages, // Red color if the lot has image_source property
        [
          "any",
          [
            "all",
            ["has", "classification"],
            ["!=", ["get", "classification"], ""],
          ],
          [
            "all",
            ["has", "memorial number"],
            ["!=", ["get", "memorial number"], ""],
          ],
          ["all", ["has", "date of deed"], ["!=", ["get", "date of deed"], ""]],
          [
            "all",
            ["has", "date of registry"],
            ["!=", ["get", "date of registry"], ""],
          ],
          ["all", ["has", "holder(s)"], ["!=", ["get", "holder(s)"], ""]],
          ["all", ["has", "section"], ["!=", ["get", "section"], ""]],
        ],
        ColourData,
        ColourLots, // Use data color if shading is enabled, otherwise use default color
      ],
      "fill-outline-color": "#000000",
    },
    symbol: {
      "text-color": [
        "case",
        ["has", "image_source"],
        ColourImagesText,
        [
          "any",
          [
            "all",
            ["has", "classification"],
            ["!=", ["get", "classification"], ""],
          ],
          [
            "all",
            ["has", "memorial number"],
            ["!=", ["get", "memorial number"], ""],
          ],
          ["all", ["has", "date of deed"], ["!=", ["get", "date of deed"], ""]],
          [
            "all",
            ["has", "date of registry"],
            ["!=", ["get", "date of registry"], ""],
          ],
          ["all", ["has", "holder(s)"], ["!=", ["get", "holder(s)"], ""]],
          ["all", ["has", "section"], ["!=", ["get", "section"], ""]],
        ],
        ColourDataText,
        ColourLotsText,
      ],
    },
  };
  propertiesOff = {
    fill: {
      "fill-color": ColourLots,
      "fill-outline-color": "#000000",
    },
    symbol: {
      "text-color": ColourLotsText,
    },
  };
}

function updateLayerColors() {
  document.body.style.backgroundColor = ColourBackground;
  column1.style.backgroundColor = ColourLightBackground;
  var layers = map.getStyle().layers;
  layers.forEach(function (layer) {
    if (layer.source === "example_source") {
      let styleName = layer.id.substring(4);
      switch (styleName) {
        case "land":
          map.setPaintProperty(layer.id, "fill-color", ColourLand);
          break;
        case "parks":
          map.setPaintProperty(layer.id, "fill-color", ColourPark);
          break;
        case "lots":
          if (!layer.id.includes("hover")) {
            map.setPaintProperty(layer.id, "fill-color", [
              "case",
              ["has", "image_source"],
              ColourImages,
              [
                "any",
                [
                  "all",
                  ["has", "classification"],
                  ["!=", ["get", "classification"], ""],
                ],
                [
                  "all",
                  ["has", "memorial number"],
                  ["!=", ["get", "memorial number"], ""],
                ],
                [
                  "all",
                  ["has", "date of deed"],
                  ["!=", ["get", "date of deed"], ""],
                ],
                [
                  "all",
                  ["has", "date of registry"],
                  ["!=", ["get", "date of registry"], ""],
                ],
                ["all", ["has", "holder(s)"], ["!=", ["get", "holder(s)"], ""]],
                ["all", ["has", "section"], ["!=", ["get", "section"], ""]],
              ],
              ColourData,
              ColourLots,
            ]);
          }
          break;
      }
    }
  });
}

// Function to switch color scheme
function switchColorScheme(schemeName) {
  if (colorSchemes.hasOwnProperty(schemeName)) {
    var scheme = colorSchemes[schemeName];
    ColourRoads = scheme.Roads;
    ColourLand = scheme.Land;
    ColourPark = scheme.Park;
    ColourLots = scheme.Lots;
    ColourData = scheme.Data;
    ColourImages = scheme.Images;
    ColourBackground = scheme.Background;
    ColourLightBackground = scheme.LightBackground;
    ColourParkText = getContrastColor(ColourPark);
    ColourLotsText = getContrastColor(ColourLots);
    ColourDataText = getContrastColor(ColourData);
    ColourImagesText = getContrastColor(ColourImages);
    updateLayerColors();
    updateProperties();
    // Update the LayersControl with new properties
    if (layersControl) {
      var newProperties = {
        propertiesOn: propertiesOn,
        propertiesOff: propertiesOff,
      };
      layersControl.updateProperties(newProperties);
    }
  } else {
    console.error("Invalid color scheme name: " + schemeName);
  }
}

// Handle change event of color scheme select element
document
  .getElementById("colorSchemeSelect")
  .addEventListener("change", function () {
    switchColorScheme(this.value);
  });

// Define your custom range points
const rangePoints = [1859, 1866, 1886, 1905];

const lotTemplate = `
<div class="container border-0">
{{#lotname}}
<h6 class="text-center">{{lotname}}</h6>
<div class="text-center">{{lotnumber}}</div>
{{/lotname}}
{{^lotname}}
<h6 class="text-center">{{lotnumber}}</h6>
{{/lotname}}
{{#image}}
<div class="row col-12 text-center">
    {{#imageArray}}
        <a target="_blank" class="pt-2" href="https://hpcbristol.net/visual/{{.}}">
                <img src="https://hpcbristol.net/image-library/small/{{.}}.jpg" />
        </a>
    {{/imageArray}}
</div>
{{/image}}
{{#classification}}
<div class="row">
<div class="col-6 text-end">Classification</div><div class="col-6">{{classification}}</div>
</div>
{{/classification}}
{{#memorial number}}
<div class="row">
<div class="col-6 text-end">Memorial number</div><div class="col-6">{{memorial number}}</div>
</div>
{{/memorial number}}
{{#date of deed}}
<div class="row">
<div class="col-6 text-end">Date of deed</div><div class="col-6">{{date of deed}}</div>
</div>
{{/date of deed}}
{{#date of registry}}
<div class="row">
<div class="col-6 text-end">Date of registry</div><div class="col-6">{{date of registry}}</div>
</div>
{{/date of registry}}
{{#holder(s)}}
<div class="row">
<div class="col-6 text-end">Holder(s)</div><div class="col-6">{{holder(s)}}</div>
</div>
{{/holder(s)}}
{{#section}}
<div class="row">
<div class="col-6 text-end">Section</div><div class="col-6">{{section}}</div>
</div>
{{/section}}
</div>
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
  if (item.type == "symbol") {
    sortKey = item.layout["symbol-sort-key"];
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
          var textColour = getContrastColor(ColourLots);
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
                "fill-color": ColourLand,
              };
              layout = {
                "fill-sort-key": 0,
              };
              break;
            case "roads":
              selectedStyle = {
                "line-color": ColourRoads,
              };
              layout = {
                "line-sort-key": 100,
              };
              break;
            case "parks":
              selectedStyle = {
                "fill-color": ColourPark,
              };
              layout = {
                "fill-sort-key": 50,
              };
              break;
            case "lots":
              selectedStyle = {
                "fill-color": ColourLots,
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

          if (
            styleName === "roads" ||
            styleName === "parks" ||
            styleName === "lots"
          ) {
            let symbolPlacement = "line";
            let textField = ["coalesce", ["get", "name"], ""];
            let textSize = [
              "interpolate",
              ["linear"],
              ["zoom"],
              0, // Zoom level 0
              12, // Text size of 12 pixels
              10, // Zoom level 10
              16, // Text size of 24 pixels
            ];
            let textHaloWidth = 1;
            let textTransform = "none";
            if (styleName === "roads") {
              textTransform = "uppercase";
            }
            let textOpacity = [
              "step",
              ["zoom"],
              0, // Text is completely hidden at zoom level 9 or above
              14, // Text opacity starts increasing from zoom level 8
              1, // Text is fully visible at zoom level 8 or below
            ];
            if (styleName === "parks") {
              textColour = ColourParkText;
            }
            if (styleName === "parks" || styleName === "lots") {
              symbolPlacement = "point";
            }
            if (styleName === "lots") {
              textField = [
                "coalesce",
                ["get", "lotname"],
                ["get", "lotnumber"],
                "",
              ];
              textSize = 8;
              textHaloWidth = 0;
              textColour = [
                "case",
                ["has", "image_source"],
                ColourImagesText,
                [
                  "any",
                  [
                    "all",
                    ["has", "classification"],
                    ["!=", ["get", "classification"], ""],
                  ],
                  [
                    "all",
                    ["has", "memorial number"],
                    ["!=", ["get", "memorial number"], ""],
                  ],
                  [
                    "all",
                    ["has", "date of deed"],
                    ["!=", ["get", "date of deed"], ""],
                  ],
                  [
                    "all",
                    ["has", "date of registry"],
                    ["!=", ["get", "date of registry"], ""],
                  ],
                  [
                    "all",
                    ["has", "holder(s)"],
                    ["!=", ["get", "holder(s)"], ""],
                  ],
                  ["all", ["has", "section"], ["!=", ["get", "section"], ""]],
                ],
                ColourDataText,
                ColourLotsText,
              ];
            }
            layersArray.push({
              id: item.layer + "-label",
              type: "symbol",
              source: "example_source",
              "source-layer": item.layer,
              layout: {
                "symbol-placement": symbolPlacement,
                "text-field": textField,
                "text-transform": textTransform,
                "text-font": ["Noto Sans Regular"],
                "text-size": textSize,
                "symbol-sort-key": 110,
              },
              paint: {
                "text-color": textColour,
                "text-halo-color": "#FFF",
                "text-halo-width": textHaloWidth,
                "text-opacity": textOpacity,
              },
            });
          }

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

        // Create an instance of LayersControl
        updateProperties();
        const layersControlsConfig = {
          id: "1905lots",
          defaultChecked: true, // Set this to true or false as needed
          propertiesOn: propertiesOn,
          propertiesOff: propertiesOff,
        };
        layersControl = new LayersControl(map, layersControlsConfig);

        // Add the layers control to your map
        map.addControl(layersControl);
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
        if (hoveredPolygonId !== null) {
          if (e.features.length > 0) {
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
        const preprocessedData = preprocessData(feature.properties);
        var htmlContent = Mustache.render(lotTemplate, preprocessedData);
        //info.innerHTML = "<p>" + JSON.stringify(feature.properties) + "</p>";
        info.innerHTML = htmlContent;
      });

      // Function to preprocess the JSON data
      function preprocessData(data) {
        let imageArray = [];
        // Check if data.image is defined and is a string
        if (typeof data.image === "string") {
          imageArray = data.image.split("; ").map((item) => item.trim());
        }
        // Remove "T00:00:00" from the end of "date of deed" attribute if present
        if (typeof data["date of deed"] === "string") {
          data["date of deed"] = data["date of deed"].replace("T00:00:00", "");
        }

        // Remove "T00:00:00" from the end of "date of registry" attribute if present
        if (typeof data["date of registry"] === "string") {
          data["date of registry"] = data["date of registry"].replace(
            "T00:00:00",
            ""
          );
        }

        return {
          ...data,
          imageArray,
        };
      }
    }
  });
});
