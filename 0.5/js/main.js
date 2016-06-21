// http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
String.prototype.toProperCase = function() {
  return this.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};


$(document).ready(main);

// globals
var map, asset, lat, lng, housingAreas;

function main(){
    L.mapbox.accessToken = 'pk.eyJ1Ijoic2hhbSIsImEiOiJmWWVZWmNrIn0.WYNN6PFSD4dbXzadqzmhAg';
    map = L.mapbox.map('map', 'mapbox.streets')
        .setView([51.5451, -0.1032], 15)
        .addControl(L.mapbox.geocoderControl('mapbox.places'))
        .on('ready', function() {
            map._layersMaxZoom = 19;
        });
    
    var hash = L.hash(map);
    
    geolocateUser();
    addHousingAreas();
}

function geolocateUser(){
    if (!navigator.geolocation) {
        alert('Geolocation is not available');
    } else {
        map.locate();
    }


    
 
    // Once we've got a position, zoom and center the map
    // on it, and add a single marker.
    map.on('locationfound', function(e) {
        lat = e.latlng.lat;
        lng = e.latlng.lng;
        
        var popupHtml = '<b>Add a new asset</b><br>'
                        +'<button class="btn btn-primary" name="next" type="button" id="next">Add data to asset '
                            +'<span class="glyphicon glyphicon-chevron-right"></span>'
                        +'</button><br>'
                        +'<div>Drag the marker to change location</div>';
        
        map.fitBounds(e.bounds);

        var asset = L.marker(new L.LatLng(e.latlng.lat, e.latlng.lng), {
                        icon: L.mapbox.marker.icon({
                            'marker-color': '#3a429b',
                            'marker-size': 'large'
                        }),
                        draggable: true
                    }).addTo(map);
            
        asset.bindPopup(popupHtml).openPopup();
        
        asset.on('click', function(e){
            setNextBackEvents();
        });
        
        asset.on("dragend",function(e){
            lat = e.target._latlng.lat;
            lng = e.target._latlng.lng;
//            $('#asset-loc').val(lat+', '+lng);
            this.bindPopup(popupHtml).openPopup();
            setNextBackEvents();
        });
        setNextBackEvents();
        $('#back').click( function(){
            console.log("test");
            $('.part1, .part2').slideToggle(150);
        });
        
        circle = L.circle(e.latlng, e.accuracy, {
                stroke: false,
                color: '#444',
                fillOpacity: '0.1'
        }).addTo(map);
    });
    
    map.on('locationerror', function(e) {
        console.log(e);
        alert('Position could not be found');
    });
    

}

function setNextBackEvents(){
    $('#next').click( function(){
        $('.part1, .part2').slideToggle(150);
        $('#asset-loc').val(lat+', '+lng);
        
        // turf lookup
        var pt1 = turf.point([lat, lng]);
        console.log( turf.inside(pt1, housingAreas) );
    });
}

function addHousingAreas(){
    $.ajax({
        url: "http://giswmsint:8080/geoserver/Oracle.Spatial/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Oracle.Spatial:Area-Housing-Offices&outputFormat=text%2Fjavascript",
        jsonpCallback: "parseResponse",
        dataType: "jsonp",
        success: function(data){
            console.log(data);
            housingAreas = data.features[0].geometry.coordinates;
            console.log(housingAreas);
            housingAreas = turf.polygon(housingAreas,{
                "fill": "#6BC65F",
                "stroke": "#6BC65F",
                "stroke-width": 5
            });
            console.log(housingAreas);
        }
    });
}