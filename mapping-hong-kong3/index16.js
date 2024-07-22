var map;
var legend;
var targets = {};
var layersControl;

const column1 = document.querySelector(".column1");

// Define color schemes
var colorSchemes = {
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
};

var schemeName = "bluered";
var ColourRoads = colorSchemes[schemeName].Roads;
var ColourLand = colorSchemes[schemeName].Land;
var ColourPark = colorSchemes[schemeName].Park;
var ColourLots = colorSchemes[schemeName].Lots;
var ColourData = colorSchemes[schemeName].Data;
var ColourImages = colorSchemes[schemeName].Images;
var ColourBackground = colorSchemes[schemeName].Background;
var ColourLightBackground = colorSchemes[schemeName].LightBackground;

var FillLand, FillPark, FillLots, FillData, FillImages;

document.body.style.backgroundColor = ColourBackground;
column1.style.backgroundColor = ColourLightBackground;

var propertiesOn, propertiesOff;

// Function to create a colored version of a sprite
function createColoredSprite(
  map,
  spriteName,
  backgroundColor,
  foregroundColor
) {
  return new Promise((resolve, reject) => {
    const fullSpriteName = `polygons:${spriteName}`;
    const sprite = map.style.getImage(fullSpriteName);
    console.log("Sprite data:", sprite);

    if (!sprite) {
      reject(new Error(`Sprite ${fullSpriteName} not found`));
      return;
    }

    const width = sprite.data.width;
    const height = sprite.data.height;
    const data = sprite.data.data;

    console.log("Sprite dimensions:", width, height);

    if (!width || !height || !data) {
      reject(new Error("Invalid sprite data"));
      return;
    }

    if (!width || typeof width !== "number" || width <= 0) {
      reject(new Error(`Invalid sprite width: ${width}`));
      return;
    }
    if (!height || typeof height !== "number" || height <= 0) {
      reject(new Error(`Invalid sprite height: ${height}`));
      return;
    }
    if (!data || !(data instanceof Uint8Array) || data.length === 0) {
      reject(new Error(`Invalid sprite data: ${data}`));
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const imageData = new ImageData(new Uint8ClampedArray(data), width, height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const alpha = imageData.data[i + 3];
      if (alpha > 0) {
        imageData.data[i] = parseInt(foregroundColor.slice(1, 3), 16);
        imageData.data[i + 1] = parseInt(foregroundColor.slice(3, 5), 16);
        imageData.data[i + 2] = parseInt(foregroundColor.slice(5, 7), 16);
      } else {
        imageData.data[i] = parseInt(backgroundColor.slice(1, 3), 16);
        imageData.data[i + 1] = parseInt(backgroundColor.slice(3, 5), 16);
        imageData.data[i + 2] = parseInt(backgroundColor.slice(5, 7), 16);
        imageData.data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    resolve({ width, height, data: new Uint8Array(imageData.data.buffer) });
  });
}

// Function to add a colored pattern layer
async function addColoredPatternLayer(
  map,
  spriteName,
  backgroundColor,
  foregroundColor
) {
  try {
    const coloredSprite = await createColoredSprite(
      map,
      spriteName,
      backgroundColor,
      foregroundColor
    );
    const coloredSpriteName = `${spriteName}-${backgroundColor}-${foregroundColor}`;
    map.addImage(coloredSpriteName, coloredSprite);
    return coloredSpriteName;
  } catch (error) {
    console.error("Error adding colored pattern layer:", error);
  }
}

function updateProperties() {
  propertiesOn = {
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
  };
  propertiesOff = {
    "fill-color": ColourLots,
    "fill-outline-color": "#000000",
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
          if (FillLand) {
            map.setPaintProperty(layer.id, "fill-pattern", FillLand);
            //map.setPaintProperty(layer.id, "fill-opacity", 0.6);
          }
          break;
        case "parks":
          map.setPaintProperty(layer.id, "fill-color", ColourPark);
          if (FillPark) {
            map.setPaintProperty(layer.id, "fill-pattern", FillPark);
            //map.setPaintProperty(layer.id, "fill-opacity", 0.6);
          }
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
            if (FillLots) {
              map.setPaintProperty(layer.id, "fill-pattern", [
                "case",
                ["has", "image_source"],
                FillImages,
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
                FillData,
                FillLots,
              ]);
              //map.setPaintProperty(layer.id, "fill-pattern", FillLots);
              //map.setPaintProperty(layer.id, "fill-opacity", 0.6);
            }
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

    map.on("load", async () => {
      try {
        // Load the sprite
        await map.addSprite("polygons", "polygons-sprite");
        //
        // List the loaded sprites
        const style = map.getStyle();
        const spriteData = style.sprite[1];

        if (spriteData) {
          console.log("Sprite data URL:", spriteData.url);

          // Fetch the JSON data for the sprite
          const response = await fetch(`${spriteData.url}.json`);
          const spriteJson = await response.json();

          // List all the individual sprites
          const spriteNames = Object.keys(spriteJson);
          console.log("Loaded sprites:", spriteNames);
        } else {
          console.log("No sprite data found in the style.");
        }
      } catch (error) {
        console.error("Error loading or processing sprite:", error);
      }
      //
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
                "text-color": "#000",
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
        //
        Promise.all([
          addColoredPatternLayerAndUpdate(
            map,
            "tmpoly-circle-alt-light-100-white",
            ColourLand,
            "#FFFFFF"
          ),
          addColoredPatternLayerAndUpdate(
            map,
            "tmpoly-caret-200-white",
            ColourPark,
            "#FFFFFF"
          ),
          addColoredPatternLayerAndUpdate(
            map,
            "tmpoly-line-vertical-up-light-100-white",
            ColourLots,
            "#CCCCCC"
          ),
          addColoredPatternLayerAndUpdate(
            map,
            "tmpoly-square-100-black",
            ColourData,
            ColourLots
          ),
          addColoredPatternLayerAndUpdate(
            map,
            "tmpoly-square-200-white",
            ColourImages,
            ColourPark
          ),
        ])
          .then(
            ([
              landSprite,
              parkSprite,
              lotsSprite,
              dataSprite,
              imagesSprite,
            ]) => {
              FillLand = landSprite;
              FillPark = parkSprite;
              FillLots = lotsSprite;
              FillData = dataSprite;
              FillImages = imagesSprite;

              updateLayerColors();
            }
          )
          .catch((error) => {
            console.error("An error occurred:", error);
          });
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

    function addColoredPatternLayerAndUpdate(
      map,
      patternName,
      fgColour,
      bgColour
    ) {
      return addColoredPatternLayer(map, patternName, fgColour, bgColour)
        .then((newSpriteName) => {
          console.log(`Added ${newSpriteName}`);
          return newSpriteName;
        })
        .catch((error) => {
          console.error(
            `Error in addColoredPatternLayer for ${patternName}:`,
            error
          );
          throw error;
        });
    }

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
