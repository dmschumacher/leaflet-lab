// //function to retrieve the data and place it on the map
// function getData(map){
//     //load the data
//     $.ajax("data/MegaCities.geojson", {
//         dataType: "json",
//         success: function(response){
//             //examine the data in the console to figure out how to construct the loop
//             console.log(response)

//             //create an L.markerClusterGroup layer
//             var markers = L.markerClusterGroup();

//             //loop through features to create markers and add to MarkerClusterGroup
//             for (var i = 0; i < response.features.length; i++) {
//                 var a = response.features[i];
//                 //add properties html string to each marker
//                 var properties = "";
//                 for (var property in a.properties){
//                     properties += "<p>" + property + ": " + a.properties[property] + "</p>";
//                 };
//                 var marker = L.marker(new L.LatLng(a.geometry.coordinates[1], a.geometry.coordinates[0]), { properties: properties });
//                 //add a popup for each marker
//                 marker.bindPopup(properties);
//                 //add marker to MarkerClusterGroup
//                 markers.addLayer(marker);
//             }

//             //add MarkerClusterGroup to map
//             map.addLayer(markers);
//         }
//     });
// };

//Example 2.3 line 22...load the data
$.ajax("data/MegaCities.geojson", {
    dataType: "json",
    success: function(response){
        //create marker options
        var geojsonMarkerOptions = {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        //create a Leaflet GeoJSON layer and add it to the map
        L.geoJson(response, {
            pointToLayer: function (feature, latlng){
                return L.circleMarker(latlng, geojsonMarkerOptions);
            }
        }).addTo(map);
    }
});