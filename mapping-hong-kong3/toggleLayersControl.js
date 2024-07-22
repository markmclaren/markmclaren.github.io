// Simplified version of:
// https://blog.wxm.be/2024/01/24/maplibre-layer-visibility-control.html

class LayersControl {
  constructor(map, ctrls) {
    this._map = map; // Store the map object
    this._container = document.createElement("div");
    this._container.classList.add(
      "maplibregl-ctrl",
      "maplibregl-ctrl-group",
      "layers-control"
    );

    this._ctrls = ctrls;
    this._createToggleCheckbox();
  }

  _createToggleCheckbox() {
    let label = document.createElement("label");
    label.classList.add("layer-control");
    let text = document.createTextNode(" Data Highlight Toggle");
    let input = document.createElement("input");
    input.type = "checkbox";

    // Set the default checked state
    input.checked = this._ctrls.defaultChecked || false;

    // Apply the initial state
    this._toggleProperties(this._ctrls, input.checked);

    input.addEventListener("change", (e) => {
      this._toggleProperties(this._ctrls, e.target.checked);
    });

    label.appendChild(input);
    label.appendChild(text);
    this._container.appendChild(label);
  }

  _toggleProperties(ctrl, checked) {
    if (!ctrl || !ctrl.id) {
      console.error("Invalid control object:", ctrl);
      return;
    }

    const properties = checked ? ctrl.propertiesOn : ctrl.propertiesOff;

    try {
      Object.entries(properties.fill).forEach(([key, value]) => {
        //console.log(`Setting ${ctrl.id} : ${key} to ${value}`);
        this._map.setPaintProperty(ctrl.id, key, value);
      });
      Object.entries(properties.symbol).forEach(([key, value]) => {
        //console.log(`Setting ${ctrl.id}-label : ${key} to ${value}`);
        this._map.setPaintProperty(ctrl.id + "-label", key, value);
      });
    } catch (error) {
      console.error(
        `Error setting paint properties for layer ${ctrl.id}:`,
        error
      );
    }
  }

  onAdd(map) {
    return this._container;
  }

  onRemove(map) {
    this._container.parentNode.removeChild(this._container);
  }

  // New method to update properties
  updateProperties(newProperties) {
    if (newProperties.propertiesOn) {
      this._ctrls.propertiesOn = newProperties.propertiesOn;
    }
    if (newProperties.propertiesOff) {
      this._ctrls.propertiesOff = newProperties.propertiesOff;
    }
    // Re-apply the current state
    const currentState = this._container.querySelector(
      'input[type="checkbox"]'
    ).checked;
    this._toggleProperties(this._ctrls, currentState);
  }
}
