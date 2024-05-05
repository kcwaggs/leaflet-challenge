const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'


d3.json(url).then(data =>{
    let features = data.features;
    let geoJSONLayer = L.geoJSON(features, {
       pointToLayer: (feature, latlng) => {
            let depthColor = colorForDepth(feature.geometry.coordinates[2]); 
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 3,
                fillColor: depthColor,
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(
                `<h2>${feature.properties.place}</h2><hr><p>Magnitude: ${Math.round(feature.properties.mag * 1000) / 1000}</p><p>Depth: ${Math.round(feature.geometry.coordinates[2] * 1000) / 1000} km</p>`
                )
        }
    });
    createMap(geoJSONLayer);
});

function colorForDepth(depth) {
    if (depth > 90) return '#ff5f65';
    if (depth > 70) return '#fca35d';
    if (depth > 50) return '#fdb72a';
    if (depth > 30) return '#f7db11';
    if (depth > 10) return '#dcf400';
    return '#a3f600';
};

function createMap(earthquakes) {
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };
    let overlayMaps = {
        'Earthquakes': earthquakes
    };
    let myMap = L.map("map", {
        center: [
          37.09, -95.71
        ],
        zoom: 5,
        layers: [street, earthquakes]
      });
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    const legend = L.control({position: 'bottomright'});

    legend.onAdd = function() {
        let div = L.DomUtil.create('div', 'legend');
        let depths = [0, 10, 30, 50, 70, 90];
        for (let i = 0; i < depths.length; i++) {
            let start = depths[i];
            let end = depths[i + 1];
            div.innerHTML += `<i style="background:${colorForDepth(depths[i] + 1)}"></i><span>${i==0 ? '>' + end : i==depths.length - 1 ? start + '+': start + ' - ' + end}</span><br>`
        };
        return div;     
    };
       legend.addTo(myMap);
    };
    