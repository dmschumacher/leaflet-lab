///////////////////////////////////////////////
//Map of all 32 NFL teams from 2006-2015 seasons
// winning %s are represented by proportional symbols
//  teams that made the playoffs are represented in red rather than blue
//
//
//Author: Dan Schumacher
// Geog 575, Lab 301
//////////////////////////////////////////////


var first = true;

//starting map boundaries
var mapbounds = [];
mapbounds.push([49.38,-66.94])
mapbounds.push([25.82,-124.39]);
 
var map = L.map('map', {
    center: [39.73, -104.99],
    maxZoom: 8,
    minZoom: 4,
    maxBounds: mapbounds
});

//set map to show the US on load
// map.fitBounds(mapbounds, {padding: [50,50]});
map.fitBounds(mapbounds);

//reset class names from the dropdown menu to ''
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

function getPanelContent(props, attribute, madePlayoff){

    //add message to panel about making/missing playoffs
    var playoffText;
    if (madePlayoff){
        playoffText = "Made the Playoffs!";

    }else{
        playoffText = "Missed the Playoffs"
    }

    var panelContent = "<div id='imagecontainer' class='imagecontainer' value=" + props.CITY + "><img id='image' src='img/" + props.TEAM_NAME + ".png'><p id="+ props.CITY+ " class='panelContent'><h2><value = " + props.CITY + "><p><h1>" + props.TEAM_NAME + "</h1></p><div class = 'year'><p><b>Winning % in " + attribute + ":</b> " + Math.round(props[attribute]*100) + "%</div></p><p>" + playoffText + "</h2></p></div>";

        panelContent += getPanelStandardContent();

    return panelContent;
}

function getPanelStandardContent(){

    //Always have this text displayed in the panel
    var standardContent = "<div class='playoff'><img src='img/nfl_logo.jpg'><div class='playoffText'>The success of NFL franchises is often measured by playoff appearances. However, what constitutes a playoff team in the eyes of the National Football League is different than what the casual fan would expect. Rather than selecting the top 12 teams with the highest winning percentage in a season, the NFL playoff rules mandate that at least one team from each of the eight divisions must make a playoff appearance while four 'Wild Card' teams also make the postseason. This means that occasionally a team sneaks into the postseason with a less than stellar record simply because their division was weak that year. This is often seen as unfair to rival teams who had a good season but did not make the playoffs due to a great team winning their division. <h6><p>Sources: nfl.com, leaflet.com, sportslogos.net, w3schools.com</p><p>Author: Dan Schumacher</p></h6></div></div>";

    return standardContent;
}

function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    var playoffTotal = 0;
    var playoff_ID = attribute + "_P";

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };

            //compute average wins for playoff teams
            if(layer.feature.properties[playoff_ID]){
                playoffTotal += attributeValue;
            };
        };
    });

    //compute average wins for playoff teams
    var playoffMean = playoffTotal  / 12;

    //set mean
    var mean = (max + min) / 2;
    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min,
        playoffMean: playoffMean
    };
};

//Example 3.7 line 1...Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var content = "Overall Win Percentage in " + attribute;

    //replace legend content
    $('#temporal-legend').html(content);

    //add new subheader for playoff teams
    var subheader = "Playoff Teams and their Average Win Percentage in " + attribute;

    $('#subheader').html(subheader);

    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);

    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 60 - radius,
            r: radius
        });

        $('#'+key+'-text').text(Math.round(circleValues[key]*100) + "%");
    };

    $('#playoffMean').attr({
        cy: 30
    });
};

function updateTitle(attribute){
    
    //keep the title up to date
    var content = "NFL Team Wins " + attribute;
    $('#title').html(content);
};

function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="300" height="75px">';
            var playoffSvg = '<svg id="attribute-legend2" width="300px" height="100px">';

            var circles = {
                max: 20,
                mean: 40,
                min: 60,
                playoffMean: 35
            };

            //loop to add each circle and text to svg string
            for (var circle in circles){

                //if this is the playoff average value, add it to a separate svg
                if (circle == "playoffMean"){
                        //circle string
                    playoffSvg += '<circle class="legend-circle2" id="' + circle + '" fill="#cc0000" fill-opacity="0.8" stroke="#000000" cx="30"/><text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
                //otherwise just add it to the normal svg
                }else{
                    svg += '<circle class="legend-circle" id="' + circle + '" fill="#000066" fill-opacity="0.8" stroke="#000000" cx="30"/><text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
                }                
            };

            //close svg string
            svg += "</svg>";
            playoffSvg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);
            
            //add new section to legend with average playoff win %
            $(container).append('<div id="subheader">')
            $(container).append(playoffSvg);

            return container;
        }
    });

    map.addControl(new LegendControl());

    //update all the things
    updateLegend(map, attributes[0]);
    updateTitle(attributes[0]);
};


//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#000066",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.65,
    };

    
    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //There's columns in .geojson of the format "year_P"
    //if the value is one, the team made the playoffs that year
    //ie "2006_P" for the chicago bears would be 1 because they went to the playoffs in 2006
    var madePlayoffID = attribute + "_P";
    var madePlayoff = feature.properties[madePlayoffID];
  
    //if the team made the playoffs this year turn that circle red
    if(madePlayoff){
        options.fillColor = "#cc0000";
    }

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p>" +feature.properties.CITY + ", " + feature.properties.STATE + "</p><p><b>Team:</b> " + feature.properties.TEAM_NAME + "</p>";

    var panelContent = getPanelContent(feature.properties, attribute, madePlayoff);

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
            $('#panel').html(panelContent);
        }
    });

    return layer;
    
};

//Update proportional symbols with new timestamp info
function updatePropSymbols(map, attribute, currentPanel, conf){

    //if this function was called from sequence, set "conf" to 
    //the "active" conference. This way if you filter to a division,
    //it will only update the current division
    if (conf == 'Sequence'){ 

        conf = document.getElementsByClassName('active')[0].id;
    }

    //empty variable to hold updated panel content
    var updatePanel;

    //empty array to hold latlngs of 'active' layers
    var bounds = [];

    //iterate through all prop symbols to resize and update popup/panel content
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            
            //access feature properties
            var props = layer.feature.properties;

            var madePlayoffID = attribute + "_P";
            var madePlayoff = props[madePlayoffID];

            layer.options.fillColor = "#000066";
            if(madePlayoff){
                layer.options.fillColor = "#cc0000"; 
            }
            layer._updateStyle();//kind of a hack, but it works

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);

            //if we're looking at all of the division, calculate radius normally
            if(conf == 'ALL'){
                layer.setRadius(radius);
                
            //if a specfic conference has been specified calculate
            //the radius if its in the division or simply set the radius 
            //to 0 (to make it invisble on the map)
            }else if(props.CONF == conf){
                layer.setRadius(radius);

                //add the current layer to the array
                bounds.push(layer._latlng);
                  
            }else{
                layer.setRadius(0);
            }

            //update popup content
            var popupContent = "<p>" + props.CITY + ", " + props.STATE + "</p><p><b>Team:</b> " + props.TEAM_NAME + "</p>";

            var panelContent = getPanelContent(props, attribute, madePlayoff);

            //if this panel content is for the same team that is currently in the panel, store it in a variable for later
            if (panelContent.indexOf(currentPanel) != -1){
                updatePanel = panelContent;
            }

            //If the circle is on the smaller side, bring it to the front so it isn't covered by larger circles
            if (props[attribute] <= 0.5){
                layer.bringToFront();
            }

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
                    $('#panel').html(panelContent);
                }
            });
        };
    });

    //if the panel isn't blank, remove the current text there, and replace it with the updated information with the new timestamp
    if (typeof document.getElementsByTagName('h1')[0] != 'undefined'){
        $('#panel').html(updatePanel);
    }
    
    //if we want all the teams to show up add the coordinates to the array
    if (conf == "ALL"){
        bounds.push([49.38,-66.94])
        bounds.push([25.82,-124.39]);
    }

    updateLegend(map, attribute);
    updateTitle(attribute);

    //fit the map to the specified cities/teams based on coordinates that have
    //been added to the 'bounds' array
    map.fitBounds(bounds, {padding: [50,50]});
};

function createSequenceControls(map, attributes){
   
   //only add to the map if its the first time this is being called
   //(this was messing with something, but I don't remember what :/)
    if (first){
        var SequenceControl = L.Control.extend({
            options: {
                position: 'bottomleft'
            },

            onAdd: function (map) {
                // create the control container div with a particular class name
      
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

    //set slider attributes
    $('.range-slider').attr({
        max: 9,
        min: 0,
        value: 0,
        step: 1
    });

    $('#reverse').html('<img src="img/reverse_resize.png">');
    $('#forward').html('<img src="img/forward_resize.png">');

    //define variable to hold what's currently in the panel
    var currentPanel;
    
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

        if (typeof document.getElementsByTagName('h1')[0] != 'undefined'){
            currentPanel = document.getElementsByTagName('h1')[0].innerHTML;//I'm 100% there's a better way to do this, but it works!
        }
        //call function to update proportional symbols and panel
        updatePropSymbols(map, attributes[index], currentPanel, "Sequence");
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){

        var index = $(this).val();

        if (typeof document.getElementsByTagName('h1')[0] != 'undefined'){
            currentPanel = document.getElementsByTagName('h1')[0].innerHTML;
        }
        //call function to update proportional symbols and panel
        updatePropSymbols(map, attributes[index], currentPanel, "Sequence");
    });
};

//fifth interaction operator
$('.dropdown a').on('click', function() {

    //calculate the year using the index from the slider
    var index = $('.range-slider').val();
    index = Number(index);
    var year = 2006 + index;
   
    //reset all classnames to 
    clearClassNames();

    //get which conference was selected
    var conf = $(this).data('filter');

    //get the current team to pass in
    var currentPanelTeam;
    if (typeof document.getElementsByTagName('h1')[0] != 'undefined'){
            currentPanelTeam = document.getElementsByTagName('h1')[0].innerHTML;
    }

    //update the selected proportional symbols
    updatePropSymbols(map, year, currentPanelTeam, conf); //fifth interaction operator additions here
    updateLegend(map, year);

    //set the displayed text in the button to be the selected division
    document.getElementById('filterButton').value = document.getElementById(conf).innerHTML;

    //set the selected conference to active
    this.className = 'active';

});


function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
   L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
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
            createLegend(map, attributes)
            $('#panel').html(getPanelStandardContent());
        }
    });
};

//calculate radius of a proportional symbol
function calcPropRadius(attValue){

    var scaleFactor = 2500;
    // var area = scaleFactor * Math.pow(attValue*100, 2);
    var area = scaleFactor * attValue;
    var radius = Math.sqrt(area/Math.PI);

	return radius;
}

$(document).ready(init);