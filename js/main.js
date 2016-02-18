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
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    // console.log(attribute);

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
    var popupContent = "<p><b>City:</b> " + feature.properties.CITY + "</p><p><b>Team:</b> " + feature.properties.TEAM_NAME + "</p>";

    var panelContent = "<div class = 'panelContent'><p><b>City:</b> " + feature.properties.CITY  + "</p><p><b>Team:</b> " + feature.properties.TEAM_NAME + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute]*100 + "%</p></div>";


    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
        closeButton: false
    });

    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            // $("#panel").html(panelContent);
            $( ".panelContent" ).remove();
            $('#panel').append(panelContent);
        }
    });

    // var layer = L.marker(latlng, {
    //     title: feature.properties.City
    // });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};


function updatePropSymbols(map, attribute){
    console.log("attribute = " + attribute)
    var currPanelContent;
    map.eachLayer(function(layer){//This causes issues because I lose which city I'm currently on. Need to add city index? Can do when re-geocoding for NY teams
        if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
           


            //access feature properties
            var props = layer.feature.properties;

            var currentCity = 0;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.CITY + "</p>";

            //add formatted attribute to panel content string
            // var year = attribute.split("_")[1];
            // popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";
            popupContent += "<p><b>Team:</b> " + props.TEAM_NAME + "</p>";

            var panelContent = "<div class = 'panelContent'><p><b>City:</b> " + props.CITY  + "</p><p><b>Team:</b> " + props.TEAM_NAME + "</p><p><b>" + attribute + ":</b> " + props[attribute]*100 + "%</p></div>";


            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
            

            layer.on({
                mouseover: function(){
                    this.openPopup();
                },
                mouseout: function(){
                    this.closePopup();
                },
                click: function(){
                    // $("#panel").html(panelContent);
                    $( ".panelContent" ).remove();
                    $('#panel').append(panelContent);
                    currPanelContent = panelContent;
                }
            });
                
        };
    });

    if ($(".panelContent").text() != ""){
        $( ".panelContent" ).remove();
        $('#panel').append(currPanelContent);
    }
};

function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');

    //set slider attributes
    $('.range-slider').attr({
        max: 9,
        min: 0,
        value: 0,
        step: 1
    });

    //below Example 3.4...add skip buttons
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');

    $('#reverse').html('<img src="img/reverse_resize.png">');
    $('#forward').html('<img src="img/forward_resize.png">');


    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 9 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 9 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
        // console.log("Index = " + index)
        updatePropSymbols(map, attributes[index]);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        var index = $(this).val();
        // console.log("Index = " + index)
        updatePropSymbols(map, attributes[index]);
    });
};


//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
   L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};


function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("20") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    // console.log(attributes);

    return attributes;
};


// console.log("Test2");
//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/Lab1Data.geojson", {
        dataType: "json",
        success: function(response){

            var attributes = processData(response);
            //call function to create proportional symbols
           createPropSymbols(response, map, attributes);
           createSequenceControls(map, attributes);
        }
    });
};


function calcPropRadius(attValue){
	// console.log("Test3");
	var scaleFactor = 500;
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