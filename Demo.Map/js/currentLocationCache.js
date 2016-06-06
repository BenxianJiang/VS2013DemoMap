
var WEATHER_URL_KEY = "https://api.forecast.io/forecast/044c9e5b7dea840a676a3d5ffe2e10df/";
var WEATHER_LAT;
var WEATHER_LNG;
var geocoder;
var map;
var infoWindow;
var SHOWMAP_FIRST = true;
var CURRENT_FORMAT_ADDRESS = "Current Location";
var currentLocationWeatherCache = new CurrentLocationWeatherCache();

//check browser have ability to Get current location by Google GeoCode
if (!navigator.geolocation) {
     alert('Geo Location is not supported');
}

//data - forecast object returned from forecast.io 
function weatherForecast(date, data)
{
    //document.getElementById("debug").innerHTML = JSON.stringify(data);

    //Display weather information
    displayForecast(date, data);

    //display current format address
    displayFormatAddressAndMap(WEATHER_LAT, WEATHER_LNG);
}

//display a map for the correct address.
function drawMap(lat, lng, addr) {
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

function displayForecast(date, forecast) {
    var weatherSummary = forecast.summary;
    var minTemp = forecast.temperatureMin;
    var maxTemp = forecast.temperatureMax;

    document.getElementById("weatherDate").innerText = date.simpleDateString();
    document.getElementById("weatherSummary").innerText = weatherSummary;
    document.getElementById("minTemp").innerText = minTemp;
    document.getElementById("maxTemp").innerText = maxTemp;
    document.getElementById("humidity").innerText = forecast.humidity;
    document.getElementById("windSpeed").innerText = forecast.windSpeed;
}

//get location from latitude and longitude
//function displayFormatAddressAndMap(lat, lng) {
//    //google geocode url for query location - current address.
//    var url = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyC7MZxN81AK3EWqKYXwERmM-Dbl6ZZGoB0&latlng=" + lat + "," + lng;

//    $.ajax({
//        type: 'GET',
//        url: url,
//        data: {},
//        dataType: 'json',
//        success: function (data) {
//            var streetaddress = data.results[1].formatted_address;
//            document.getElementById("currentAddress").innerText = streetaddress;
//            document.getElementById("headerBarTitle").innerText = streetaddress;
//            CURRENT_FORMAT_ADDRESS = streetaddress;

//            //show map and current format address.
//            //call back to display map
//            if (SHOWMAP_FIRST) {
//                drawMap(lat, lng, streetaddress);
//            }
//        },
//        error: function () { alert('error!'); }
//    });
//}

function updateDateOnly(value)
{
    var today = new Date();
    var dateString = today.addDays(value).simpleDateString();
    document.getElementById("weatherDate").innerText = dateString;
}

//Display weather when date slider value updated.
//input: value is integer value for date slider selected.
function displayWeather(value) {
    //get slider date
    var date = new Date();
    var newDate = date.addDays(value);
    
    //Display weather other information by the callback function weatherForecast
    currentLocationWeatherCache.getWeatherForDate(newDate, getForecast);
}

//Get current location and forecast information.
function getCurrentLocationAndWeatherInformation() {
    //load current location cache from sessionStorage (session cookie)
    currentLocationWeatherCache.initializeCurrentLocation();

    //Get current location by callback via using Google Geocode API
    currentLocationWeatherCache.getCurrentLocationByGeocode(currentLocationAddress);
}

//Geocode getCurrentPosition callback
function currentLocationAddress(position) {
    //alert("Response current position latitude is = " + JSON.stringify(position.coords.latitude));
    WEATHER_LAT = position.coords.latitude;
    WEATHER_LNG = position.coords.longitude;

    //show map
    drawMap(WEATHER_LAT, WEATHER_LNG, "Current Location");

    //current location latitude and longitude
    currentLocationWeatherCache.populateCurrentAddress(position.coords.latitude, position.coords.longitude);

    //Get today's weather by latitude and longitude
    var today = new Date();
    currentLocationWeatherCache.getWeatherForDate(today, getForecast);
}

//get forecast by forecast.api
function getForecast(date, forecast) {
    //display forecast
    displayForecast(date, forecast);

    document.getElementById("textArea").value = JSON.stringify(currentLocationWeatherCache.toJSON());

    //document.getElementById("debug").innerHTML = JSON.stringify(currentLocationWeatherCache.toJSON());

    //store current location with forecasts into sessionStorage
    currentLocationWeatherCache.storeLocationIntoStorage();
}

// Code for LocationWeatherCache class and other shared code.
function CurrentLocationWeatherCache() {
    var currentLocation = {};

    //update current location only when it is different latitude or longitude
    this.populateCurrentAddress = function (lat, lng) {
        //alert("input latitude and longitude is " + lat + ", " + lng);
        //alert("existing currentLocation is " + JSON.stringify(currentLocation));

        if (lat != currentLocation.latitude || lng != currentLocation.longitude) {
            currentLocation = { "latitude": lat, "longitude": lng, "nickname": "Current Location", forecasts: {} };
        }
        //else {
        //    alert("location exist!");
        //}

        //alert("Current location is now = " + JSON.stringify(currentLocation));
    }

    //use google geocode to retrieve current locaion using passing callback function.
    this.getCurrentLocationByGeocode = function (callback) {
        //alert("the callback = " + JSON.stringify(callback));
        navigator.geolocation.getCurrentPosition(callback);
    }

    this.getWeatherForDate = function (date, callback) {
        //alert("private currentLocation = " + JSON.stringify(currentLocation));

        var dateString = date.forecastDateString();
        var lat = currentLocation.latitude;
        var lng = currentLocation.longitude;
        var key = lat + "," + lng + "," + dateString;
        //exclude data for currently, minutely and hourly - we only need daily!
        var urlExt = key + "?exclude=currently,minutely,hourly";

        //alert("URL = " + urlExt);

        //alert(urlExt);
        //if forecasts object for a date exists
        var forecast = {};

        if (currentLocation.forecasts.hasOwnProperty(key)) {
            forecast = currentLocation.forecasts[key];

            //alert("existing forecast in location: " + JSON.stringify(forecast));

            //use exist forecast object and return to callback function
            callback(date, forecast);
        }
        else {
            //alert("Get from forecast.io");

            //call forecast.io API for forecasts response
            var url = WEATHER_URL_KEY + urlExt;

            //document.getElementById("debug").innerHTML = url;

            //alert("URL = " + url);

            $.ajax({
                type: 'GET',
                url: url,
                data: {},
                dataType: 'jsonp',
                success: function (data) {
                    //data contains weather response from forecast.io API call.
                    //set forecasts (daily only) to location.
                    forecast = data.daily.data[0];

                    //add the forecast into forecasts
                    currentLocation.forecasts[key] = forecast;

                    //alert("forecast returned from api call = " + JSON.stringify(forecast));

                    //loc.forecasts = data.daily.data[0];
                    callback(date, forecast);
                },
                error: function () { alert('Get weather something bad happened'); }
            });
        }
    };

    this.toJSON = function () {
        //construct locationWeatherCachePDO object
        var locationWeatherCachePDO = {
            "location": currentLocation
        };

        return locationWeatherCachePDO;
    };

    //populate private location from sessionStorage
    this.initializeCurrentLocation = function () {
        //alert("calling initialize function ....");
        var jsonText = sessionStorage.getItem(APP_PREFIX + "-CurrentLocation");

        //alert("json text is " + jsonText);
        //currentLocation = {};

        if (jsonText != null) {
            var json = JSON.parse(jsonText);
            if (json.hasOwnProperty("location")) {
                currentLocation = json["location"];
            }
        }
        //else {
        //    alert("no session storage yet!");
        //}
    }

    //save private location into sessionStorage
    this.storeLocationIntoStorage = function () {
        var data = JSON.stringify(this.toJSON());
        //alert("currentLocation store into session Storage is " + data);

        sessionStorage.setItem(APP_PREFIX + "-CurrentLocation", data);
    }
}

