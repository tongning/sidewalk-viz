
var turfbuffer = require('turf-buffer');
var turfwithin = require('turf-within');

L.mapbox.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejkyYm9qbjAwdm8yd3RlaXNtZmN3a3gifQ.Uc9LFNtZpBHYc00cU-tQUA';

var map = L.mapbox.map('map', 'mapbox.dark', { zoomControl: false })
    .setView([38.91326933963583, -77.0323696732521,], 15);
map.scrollWheelZoom.disable();
new L.Control.Zoom({ position: 'topright' }).addTo(map);

var amenitiesActive = true;
var pedestriansActive = false;
var debounceWait = 15;


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
    {name: 'libraries', importance: 1, data: NoSidewalk},
    { name: 'schools', importance: 1, data: streets }*/
];

var accFeatures = [

    { name: 'CurbRamp', importance: 6.5, data: CurbRamp },
    { name: 'NoCurbRamp', importance: 5, data: NoCurbRamp },
    { name: 'Obstacle', importance: 4, data: Obstacle },
    { name: 'SurfaceProblem', importance: 3, data: SurfaceProblem },
    { name: 'Other', importance: 2.5, data: Other },
    { name: 'Occlusion', importance: 3, data: Occlusion },
    { name: 'NoSidewalk', importance: 1, data: NoSidewalk }

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

    
    /*
    console.log("amenitieszerodatafeatures")
    console.log(amenities[0].data.features)*/
    var count = 0
    obs_counts = [];
    
    for (var streetline of streets) {
            obs_counts.push({'CurbRamp':[0,0,0,0,0],
                                'NoCurbRamp':[0,0,0,0,0],
                                'Obstacle': [0,0,0,0,0],
                                'SurfaceProblem': [0,0,0,0,0],
                                'Other': [0,0,0,0,0],
                                'Occlusion': [0,0,0,0,0],
                                'NoSidewalk': [0,0,0,0,0]
                                });
            //var street = turf.featurecollection([turfbuffer(streetline, 0.06, 'miles')]);
            var street = turfbuffer(streetline, 0.06, 'miles');
            console.log("streetarea")
            //console.log(JSON.stringify(street));
            console.log(street)
            //var point = turf.point([-90.548630, 14.616599]);
            //var street = turf.buffer(point, 0.06, {units: 'miles'});
            count++;
            //if(count > 10) {
            //    break
            //}
            
            for (var featurecategory of accFeatures) {
                    count++;
                    
                    var featuresinside = turfwithin(featurecategory.data, street);
                    console.log("found featuresinside. length is ");
                    console.log(featuresinside.features.length)
                    console.log(featuresinside)
                    for (var item of featuresinside.features) {
                        current_cell_obj = obs_counts[obs_counts.length-1];
                        current_cell_obj[item.properties.label_type][item.properties.severity-1]++;
                    }
            }
            console.log(obs_counts)
                

            
   
    }




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
