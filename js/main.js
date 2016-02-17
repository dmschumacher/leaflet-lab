//create leaflet map
//load map tiles
//find/format data (geocode)
//load point data into map
//convert points to circles
//

//Setup Boiler code
//Get data
// Setup map tiles
// Import data onto map
//setup prop symbols
// Implement basic functions
//	zoom
//	 pan etc


var map = L.map('map').setView([40, -100], 4);

// var dots;
function init(){
	dots = getData(map);
}
//add tile layer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'dmschumacher.p4bn3g0b',
    accessToken: 'pk.eyJ1IjoiZG1zY2h1bWFjaGVyIiwiYSI6ImNpa2g5NjBsNjAxYTF2a2ttcHFmbGFyOXYifQ.wWmDF7mQIq5kv-fCTdCE7g'
}).addTo(map);

// function createPropSymbols(data, map){
//    // create marker options
//     var geojsonMarkerOptions = {
//         radius: 8,
//         fillColor: "#ff7800",
//         color: "#000",
//         weight: 1,
//         opacity: 1,
//         fillOpacity: 0.8
//     };

//     var att1 = "2006";

//     // console.log("Test1");

//     //create a Leaflet GeoJSON layer and add it to the map
//     L.geoJson(data, {
//         pointToLayer: function (feature, latlng) {
//         	var attValue = Number(feature.properties[att1]);
//         	// console.log("attValue =", attValue);

//         	geojsonMarkerOptions.radius = calcPropRadius(attValue);

//     		// console.log(feature.properties, attValue);

//             return L.circleMarker(latlng, geojsonMarkerOptions);
//         }
//     }).addTo(map);
// };

//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "2006";

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>City:</b> " + feature.properties.CITY + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};



// console.log("Test2");
//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/Lab1Data.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
           createPropSymbols(response, map);
        }
    });
};


function calcPropRadius(attValue){
	// console.log("Test3");
	var scaleFactor = 300;
	// console.log("attValue =", attValue);
	var area = scaleFactor * attValue;
	var radius = Math.sqrt(area/Math.PI);
	// console.log("Radius = ", radius);
	return radius;
}
// map.on('click', onMapClick);

// function on
// var dots = getData(map);
// dots.bindpopup("Click");

// function

$(document).ready(init);