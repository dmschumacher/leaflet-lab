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
// var nfcn = new L.layerGroup();
// var nfce = new L.layerGroup();
// var nfcs = new L.layerGroup();
// var nfcw = new L.layerGroup();
// var afcn = new L.layerGroup();
// var afce = new L.layerGroup();
// var afcs = new L.layerGroup();
// var afcw = new L.layerGroup();
var first = true;

var map = L.map('map', {
    center: [39.73, -104.99],
    zoom: 4
    // layers: [nfcn]
});



function clearClassNames(){
    document.getElementById("ALL").className = '';
    document.getElementById("NFC_N").className = '';
    document.getElementById("NFC_E").className = '';
    document.getElementById("NFC_S").className = '';
    document.getElementById("NFC_W").className = '';
    document.getElementById("AFC_N").className = '';
    document.getElementById("AFC_E").className = '';
    document.getElementById("AFC_S").className = '';
    document.getElementById("AFC_W").className = '';
    // $('.menu-ui a').ALL.className = '';
    // $('.menu-ui a').NFC_N.className = '';
    // $('.menu-ui a').NFC_E.className = '';
    // $('.menu-ui a').NFC_S.className = '';
    // $('.menu-ui a').NFC_W.className = '';
    // $('.menu-ui a').AFC_N.className = '';
    // $('.menu-ui a').AFC_E.className = '';
    // $('.menu-ui a').AFC_S.className = '';
    // $('.menu-ui a').AFC_W.className = '';

};

function init(){
	getData(map);
};

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'dmschumacher.p4bn3g0b',
    accessToken: 'pk.eyJ1IjoiZG1zY2h1bWFjaGVyIiwiYSI6ImNpa2g5NjBsNjAxYTF2a2ttcHFmbGFyOXYifQ.wWmDF7mQIq5kv-fCTdCE7g'
}).addTo(map);

// function removeLayers(){
//      map.eachLayer(function(layer){
//         console.log(layer.layerPointToLatLng);
//          if (layer.feature && layer.feature.properties){
//             map.removeLayer(layer);
//          }
        
//      });
// };

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#000099",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
    };

    
    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>City:</b> " + feature.properties.CITY + "</p><p><b>Team:</b> " + feature.properties.TEAM_NAME + "</p>";

    //create panel content
    var panelContent = "<div class = 'panelContent'><value = " + feature.properties.CITY + "><p><b>City:</b> " + feature.properties.CITY  + "</p><p><b>Team:</b> " + feature.properties.TEAM_NAME + "</p><div class = 'year'><p><b>Winning % in " + attribute + ":</b> " + feature.properties[attribute]*100 + "%</div></p></div>";


    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
        closeButton: false
    });

    //when a prop symbol is hovered over, show popup content. 
    //when a prop symbol is clicked show panel content
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            //prevent clutter by clearing panel and re-adding panel content on each click
            $( ".panelContent" ).remove();
            $('#panel').append(panelContent);
        }
    });

    return layer;
    
};

//Update proportional symbols with new timestamp info
function updatePropSymbols(map, attribute, currentPanel, conf){

    //empty variable to hold updated panel content
    var updatePanel;
    var bounds = [];
    //iterate through all prop symbols to resize and update popup/panel content
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            console.log("Valid Layer");
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            // layer.setRadius(radius);

            if(conf == 'ALL' || conf == "Sequence"){
                layer.setRadius(radius);
                // bounds.push(layer._latlng);
                // layer.options.opacity = 1;
            }else if(props.CONF == conf){
                layer.setRadius(radius);
                bounds.push(layer._latlng);
                // console.log("conf = " + conf);
                // layer.options.opacity = 1;
                // layer.
            }else{
                layer.setRadius(0);
                // layer.options.opacity = 0;
            }

            // console.log(layer._latlng);
            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.CITY + "</p><p><b>Team:</b> " + props.TEAM_NAME + "</p>";

            //update panel content
            var panelContent = "<div class = 'panelContent'><value = " + props.CITY + "><p><b>City:</b> " + props.CITY  + "</p><p><b>Team:</b> " + props.TEAM_NAME + "</p><p><b>Winnning % in " + attribute + ":</b> " + props[attribute]*100 + "%</p></div>";

            //if this panel content is for the same city that is currently in the panel, store it in a variable for later
            if (panelContent.indexOf(currentPanel) != -1){

                updatedPanel = "<div class = 'panelContent'><value = " + props.CITY + "><p><b>City:</b> " + props.CITY  + "</p><p><b>Team:</b> " + props.TEAM_NAME + "</p><p><b>Winning % in " + attribute + ":</b> " + props[attribute]*100 + "%</p></div>";
            }
            console.log(layer);
            
            // console.log(layer.options.opacity);
            // layer.options;
            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
            
            //when a prop symbol is hovered over, show popup content. 
            //when a prop symbol is clicked show panel content
            layer.on({
                mouseover: function(){
                    this.openPopup();
                },
                mouseout: function(){
                    this.closePopup();

                },
                click: function(){
                    //prevent clutter by clearing panel and re-adding panel content on each click
                    $( ".panelContent" ).remove();
                    $('#panel').append(panelContent);
                }
            });
        };
    });

    //if the panel isn't blank, remove the current text there, and replace it with the updated information with the new timestamp
    if ($(".panelContent").text() != ""){
        $( ".panelContent" ).remove();
        $('#panel').append(updatedPanel);
    }
    // var padding = [10,10];
    if (conf == "ALL"){
        bounds.push([49.38,-66.94])
        bounds.push([25.82,-124.39]);
    }

    map.fitBounds(bounds, {padding: [50,50]});
};

function createSequenceControls(map, attributes){
   
    if (first){
        var SequenceControl = L.Control.extend({
            options: {
                position: 'bottomleft'
            },

            onAdd: function (map) {
                // create the control container div with a particular class name
                // var container = document.getElementByClassName("sequence-control-container");

                // if (!L.DomUtil.hasClass('sequence-control-container')){

                // }
                var container = L.DomUtil.create('div', 'sequence-control-container');
                $(container).append('<input class="range-slider" type="range">');
                // ... initialize other DOM elements, add listeners, etc.
                $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
                $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');
               
                $(container).on('mousedown dblclick', function(e){
                    L.DomEvent.stopPropagation(e);
                });

                return container;
            }
        });

        map.addControl(new SequenceControl());

        first = false;
    }
    
    //create range input element (slider)
    // $('#panel').append('<input class="range-slider" type="range">');

    //set slider attributes
    $('.range-slider').attr({
        max: 9,
        min: 0,
        value: 0,
        step: 1
    });

    //below Example 3.4...add skip buttons
    // $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    // $('#panel').append('<button class="skip" id="forward">Skip</button>');

    $('#reverse').html('<img src="img/reverse_resize.png">');
    $('#forward').html('<img src="img/forward_resize.png">');

    //define variable to hold what's currently in the panel
    var currentPanel;
    
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        // var currentPanel;
        // if ($(".panelContent").text() != ""){
        //     currentPanel = document.getElementsByTagName('p')[0].innerHTML;
        // }
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

        if ($(".panelContent").text() != ""){
            currentPanel = document.getElementsByTagName('p')[0].innerHTML;
        }
        //call function to update proportional symbols and panel
        updatePropSymbols(map, attributes[index], currentPanel, "Sequence");
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){

        var index = $(this).val();
        console.log("Slider input: " + index);
        if ($(".panelContent").text() != ""){
            currentPanel = document.getElementsByTagName('p')[0].innerHTML;
        }
        //call function to update proportional symbols and panel
        updatePropSymbols(map, attributes[index], currentPanel, "Sequence");
    });
};


$('.menu-ui a').on('click', function() {
    var index = $('.range-slider').val();
    index = Number(index);
    var year = 2006 + index;
    year = year.toString();
    // console.log("year: " + year);
    clearClassNames();
    var conf = $(this).data('filter');
    var currentPanelCity;
    if ($(".panelContent").text() != ""){
            currentPanelCity = document.getElementsByTagName('p')[0].innerHTML;
    }

    // var attributes = ;
    // var year;
    // if ($(".panelContent").text() != ""){
    //     year = document.getElementsByTagName('p')[2].innerHTML;
    // }
    // year = year.substring(16,20);
        // console.log(year);
    updatePropSymbols(map, year, currentPanelCity, conf);
    this.className = 'active';

    //then use setOpacity to make certain layers invisible

    // console.log("filter = " + conf);
    // removeLayers();
    // getData(map, conf);
    // var group = [];
    // map.eachLayer(function(layer){
    //     console.log(layer.layerPointToLatLng);
    //      if (layer.feature && layer.feature.properties){

    //         group.push(layer.layerPointToLatLng);
    //      }  
    // });
    
    // map.fitBounds(group);
});


function createPropSymbols(data, map, attributes){
    // console.log(mins);
    //create a Leaflet GeoJSON layer and add it to the map
   L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
   // console.log("markers: " + markers[0].feature.properties.CITY);
};

//Extract timestamp headers
function processData(data){
    //empty array to hold attributes
    var attributes = [];
    
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        var val = properties[attribute];
        // console.log("val = " + val);
        if (attribute.indexOf("20") > -1){
            attributes.push(attribute);
        };
    };

    return attributes;
};


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
            // createMenu();
        }
    });
};

//calculate radius of a proportional symbol
function calcPropRadius(attValue){

    var scaleFactor = .5;
    var area = scaleFactor * Math.pow(attValue*100, 2);
    var radius = Math.sqrt(area/Math.PI);

	return radius;
}

$(document).ready(init);