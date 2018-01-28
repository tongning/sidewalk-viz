var PTL = require('@turf/point-to-line-distance');

L.mapbox.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejkyYm9qbjAwdm8yd3RlaXNtZmN3a3gifQ.Uc9LFNtZpBHYc00cU-tQUA';

var map = L.mapbox.map('map', 'mapbox.dark', { zoomControl: false })
    .setView([38.91326933963583, -77.0323696732521,], 15);
map.scrollWheelZoom.disable();
new L.Control.Zoom({ position: 'topright' }).addTo(map);

var amenitiesActive = true;
var pedestriansActive = false;
var debounceWait = 15;

var distances = [
    { miles: 0.1, decay: 1 },
    { miles: 0.5, decay: 0.4 },
    { miles: 0.7, decay: 0.13 }
];

var SurfaceProblem = L.geoJson(accessibilitylabels, { filter: surfaceProblemFilter }).toGeoJSON();

function surfaceProblemFilter(feature) {
    if (feature.properties.label_type === "SurfaceProblem") return true
}

var CurbRamp = L.geoJson(accessibilitylabels, { filter: curbRampFilter }).toGeoJSON();

function curbRampFilter(feature) {
    if (feature.properties.label_type === "CurbRamp") return true
}

var Obstacle = L.geoJson(accessibilitylabels, { filter: obstacleFilter }).toGeoJSON();

function obstacleFilter(feature) {
    if (feature.properties.label_type === "Obstacle") return true
}

var Other = L.geoJson(accessibilitylabels, { filter: otherFilter }).toGeoJSON();

function otherFilter(feature) {
    if (feature.properties.label_type === "Other") return true
}

var Occlusion = L.geoJson(accessibilitylabels, { filter: occlusionFilter }).toGeoJSON();

function occlusionFilter(feature) {
    if (feature.properties.label_type === "Occlusion") return true
}

var NoSidewalk = L.geoJson(accessibilitylabels, { filter: noSidewalkFilter }).toGeoJSON();

function noSidewalkFilter(feature) {
    if (feature.properties.label_type === "NoSidewalk") return true
}

var NoCurbRamp = L.geoJson(accessibilitylabels, { filter: noCurbRampFilter }).toGeoJSON();

function noCurbRampFilter(feature) {
    if (feature.properties.label_type === "NoCurbRamp") return true
}

/*
var amenities = [
    {name: 'metros', importance: 6.5, data: SurfaceProblem},
    {name: 'grocery', importance: 5, data: grocery},
    {name: 'pharmacies', importance: 4, data: pharmacies},
    {name: 'bikes', importance: 3, data: bikes},
    {name: 'bars', importance: 2.5, data: bars},
    {name: 'zipcar', importance: 3, data: zipcar},
    {name: 'libraries', importance: 1, data: libraries},
    {name: 'schools', importance: 1, data: schools},
    {name: 'postoffices', importance: .5, data: postoffices}
];

*/

var amenities = [
    /*
    {name: 'metros', importance: 6.5, data: CurbRamp},
    {name: 'grocery', importance: 5, data: NoCurbRamp},
    {name: 'pharmacies', importance: 4, data: Obstacle},
    {name: 'bikes', importance: 3, data: SurfaceProblem},
    {name: 'bars', importance: 2.5, data: Other},
    {name: 'zipcar', importance: 3, data: Occlusion},
    {name: 'libraries', importance: 1, data: NoSidewalk},*/
    { name: 'schools', importance: 1, data: streets }
];

var accFeatures = [

    { name: 'metros', importance: 6.5, data: CurbRamp },
    { name: 'grocery', importance: 5, data: NoCurbRamp },
    { name: 'pharmacies', importance: 4, data: Obstacle },
    { name: 'bikes', importance: 3, data: SurfaceProblem },
    { name: 'bars', importance: 2.5, data: Other },
    { name: 'zipcar', importance: 3, data: Occlusion },
    { name: 'libraries', importance: 1, data: NoSidewalk }

];

var pt = {
    "type": "Feature",
    "properties": {
        "marker-symbol": "pitch",
        "marker-color": "#fff",
        "marker-size": "small",
        "stroke": "#000"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [
            -77.0323696732521,
            38.91326933963583
        ]
    }
};

var ptLayer = L.mapbox.featureLayer().setGeoJSON(pt);
var amenityLayer = new L.layerGroup().addTo(map);

ptLayer.eachLayer(function (layer) {
    layer.options.draggable = true;
    walkability = debounce(walkability, debounceWait)
    layer.on('drag', walkability);
});
ptLayer.addTo(map);

walkability();

function walkability() {
    pt = ptLayer.getLayers()[0].toGeoJSON();

    var score = 0;
    var categories
    var pois = turf.featurecollection([]);

    amenities.forEach(function (amenity) {
        amenity.data.features.forEach(function (f) {
            f.properties.score = null;
        });
    });

    distances.forEach(function (distance) {
        amenities.forEach(function (amenity) {
            //console.log("streetsNearMarker amenity");
            console.log(amenity)
            var streetsNearMarker = turf.featurecollection(amenity.data.features.filter(function (f) {

                if (PTL(pt, f, { units: 'miles' }) <= distance.miles) {
                    //console.log("streetsNearMarker a close street");
                    return true;

                }
                //console.log("distance is");

                //console.log(PTL(pt, f, {units: 'miles'}));
                //return true;
            })
            );

            var curbRampsNearMarker = turf.featurecollection(CurbRamp.features.filter(function (f) {
                if (turf.distance(f, pt) <= 0.7) {
                    return true;

                }
            })
            );

            var increment = amenity.importance * (distance.decay)
            streetsNearMarker.features.forEach(function (street) {
                /*
                var curbRampsNearStreet = turf.featurecollection(curbRampsNearMarker.features.filter(function (f) {
                    console.log("counted curb ramps near a street")
                    if (PTL(f, street, { units: 'miles' }) <= 0.1) {
                        return true;

                    }
                })
                );
                */
                var curbRampsNearStreet = Math.floor(Math.random() * 20);
                street.properties.score = curbRampsNearStreet;

                //console.log("curbrampsnearstreet");
                //console.log(curbRampsNearStreet);
                //if (!street.properties.score || street.properties.score < increment) street.properties.score = increment;
                //console.log("Score is");
                //console.log(street.properties.score)
            });
            pois.features = pois.features.concat(streetsNearMarker.features);
            amenity[distance.miles + 'mi'] = streetsNearMarker.features.length
            score += (amenity[distance.miles + 'mi'] * amenity.importance * distance.decay) / 5;
        });
    });

    amenityLayer.clearLayers();
    amenityLayer = new L.layerGroup().addTo(map);
    /*
    L.geoJson(pois, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.score * 4,
                fillColor: 'yellow',
                fillOpacity: 1,
                stroke: false
            });
        }
    }).addTo(amenityLayer);
    
    */
    var myStyle = {
        "color": "#ff7800",
        "weight": 5,
        "opacity": 0.65
    };

    L.geoJson(pois, {
        style: function (feature, latlng) {
            var colorFromScore;
            if (feature.properties.score < 5) {
                colorFromScore = "#BD0026";
            } else if (feature.properties.score >= 5 && feature.properties.score < 7) {
                colorFromScore = "#E31A1C";
            } else if (feature.properties.score >= 7 && feature.properties.score < 11) {
                colorFromScore = "#FC4E2A";
            } else if (feature.properties.score >= 11 && feature.properties.score < 13) {
                colorFromScore = "#FD8D3C";
            } else if (feature.properties.score >= 13 && feature.properties.score < 15) {
                colorFromScore = "#FEB24C";
            } else if (feature.properties.score >= 115 && feature.properties.score < 118) {
                colorFromScore = "#FED976";
            } else {
                colorFromScore = "#FFEDA0";
            }
            return {
                "color": colorFromScore,
                "weight": 5,
                "opacity": 0.65
            }
        }
    }).addTo(amenityLayer);


    /*
    L.geoJson(streets, {
        style: function(feature) {
            
                console.log(feature.properties.score);
            
        }
    }).addTo(amenityLayer);
    */

    if (score > 100) score = 100;
    document.getElementById('score').innerHTML = Math.floor(score);
}

// taken from underscore http://underscorejs.org/
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

var pedestrianLayer = new L.layerGroup().addTo(map);

function setButton(t) {
    t.classList.toggle('fill-green');
}

document.getElementById('amenities').onclick = function () { setButton(this); toggleAmenities(); };
document.getElementById('pedestrians').onclick = function () { setButton(this); togglePedestrians(); };

function toggleAmenities() {
    // turn off amenities
    if (amenitiesActive) {
        amenitiesActive = false;

        amenityLayer.clearLayers();
        ptLayer.clearLayers();
        //turn on amenities
    } else {
        console.log('adding amenities')
        amenitiesActive = true;

        ptLayer = L.mapbox.featureLayer().setGeoJSON(pt);
        ptLayer.eachLayer(function (layer) {
            layer.options.draggable = true;
            walkability = debounce(walkability, debounceWait)
            layer.on('drag', walkability);
            walkability();
        });
        ptLayer.addTo(map);
    }
}

function togglePedestrians() {
    if (pedestriansActive) {
        pedestriansActive = false;

        //remove pedestrians
        pedestrianLayer.clearLayers();
    } else {
        pedestriansActive = true;

        // add pedestrians sized by daily counts
        L.geoJson(pedestrians, {
            pointToLayer: function (feature, latlng) {
                var radius = 0;
                if (feature.properties.daily > 1) radius = .1;
                if (feature.properties.daily > 200) radius = .3;
                if (feature.properties.daily > 500) radius = .6;
                if (feature.properties.daily > 1000) radius = .8;
                if (feature.properties.daily > 3000) radius = 1.5;
                if (feature.properties.daily > 8000) radius = 3;
                if (feature.properties.daily > 15000) radius = 5;
                if (feature.properties.daily > 25000) radius = 8;
                if (feature.properties.daily > 60000) radius = 10;

                return L.circleMarker(latlng, {
                    radius: radius,
                    fillColor: 'red',
                    fillOpacity: 1,
                    stroke: false
                });
            }
        }).addTo(pedestrianLayer);
    }
}
