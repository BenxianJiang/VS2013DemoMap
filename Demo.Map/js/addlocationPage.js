var geocoder;
var map;
var infoWindow;
var WEATHER_LAT;
var WEATHER_LNG;
var FORMAT_ADDRESS;

function initialize() {
    //default to disaply Melbourne city map
    //showMap(-37.814107, 144.96327999999994, "Melbourne VIC, Australia");
    //Adelaide
    showMap(-34.9285894, 138.5999429, "Adelaide SA 5000, Australia");

    //load data from local storage
    locationWeatherCache.loadFromLocalStorage();

    //alert("locations = " + JSON.stringify( locationWeatherCache.toJSON()));


    //WEATHER_LAT = -37.814107;
    //WEATHER_LNG = 144.96327999999994;
    //FORMAT_ADDRESS = "Melbourne VIC, Australia";

    //LOCATIONWEATHERCACHE.addLocation(-37.814107, 144.96327999999994, "Melbourne VIC, Australia")
}

function codeAddress() {
    var address = document.getElementById("address").value;

    // next line creates asynchronous request
    geocoder.geocode({ 'address': address }, function (results, status) {
        // and this is function which processes response
        if (status == google.maps.GeocoderStatus.OK) {
            displayInfo(results);
        } else {
            //alert("Geocode was not successful for the following reason: " + status);
            document.getElementById("formatAddress").innerText = "[ERROR] - Geocode was not successful for the following reason: " + status;
        }
    });
}

//display different values on the page
function displayInfo(results) {
    var lat = results[0].geometry.location.lat();
    var lng = results[0].geometry.location.lng();
    var addr = results[0].formatted_address;

    document.getElementById("latitude").value = lat;
    document.getElementById("longitude").value = lng;
    document.getElementById("formatAddress").innerText = addr;

    WEATHER_LAT = lat;
    WEATHER_LNG = lng;
    FORMAT_ADDRESS = addr;

    //display map
    showMap(lat, lng, addr);

    //document.getElementById("debug").value = JSON.stringify(data);
}

//display a map for the correct address.
function showMap(lat, lng, addr) {
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat, lng);
    var myOptions = {
        zoom: 14,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    //map.setCenter(data[0].geometry.location);

    var marker = new google.maps.Marker({
        map: map,
        position: latlng
        //position: data[0].geometry.location
    });

    //display formatted address as an annotation on the map
    infowindow = new google.maps.InfoWindow;
    infowindow.setContent(addr);
    infowindow.open(map, marker);
}

//this function run when click button "Add Location" on 
//Add Location page.
function addLocation() {

    var addr = document.getElementById("formatAddress").innerText;
    var nickName = FORMAT_ADDRESS;
    if (document.getElementById("nickName").value != "") {
        nickName = document.getElementById("nickName").value;
    }
    
    //alert("nick name " + nickName + " lat = " + WEATHER_LAT + " lng = " + WEATHER_LNG + " format addr = " + FORMAT_ADDRESS);

    //address will have the following text if there is an error
    //"[ERROR] - Geocode was not successful for the following reason: " + status;
    if (addr.substring(0, 7) == "[ERROR]") {
        alert("ohh - error! can not add location!");
    }
    else {
        if (WEATHER_LAT != "" && WEATHER_LNG != "" && nickName != "") {
            //alert("adding location ...");

            //get location
            var index = locationWeatherCache.addLocation(WEATHER_LAT, WEATHER_LNG, nickName);

            //alert("Saved location at index = " + index + " locations = " + JSON.stringify(LOCATIONWEATHERCACHE.locationAtIndex(index)));

            //alert("All locations = " + JSON.stringify(LOCATIONWEATHERCACHE.getAllLocations()));

            //get weather for the location by call back:
            var today = new Date();
            locationWeatherCache.getWeatherAtIndexForDate(index, today, weatherForecast)
        }
        else {
            alert("Latitude, Longitude and Address must not be empty!");
        }
    }
}

//data - forecast object returned from forecast.io 
function weatherForecast(date, data) {
    //document.getElementById("debug").innerHTML = JSON.stringify(data);

    //store into local storage
    locationWeatherCache.storeLocationIntoStorage();

    //index page
    location.href = "index.html";
}




