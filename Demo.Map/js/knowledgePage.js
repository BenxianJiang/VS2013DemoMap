//check browser have ability to Get current location by Google GeoCode
if (!navigator.geolocation) {
    error('Geo Location is not supported');
}

var currentLocationWeatherCache = new CurrentLocationWeatherCache();
//var WEATHER_URL_KEY = "https://api.forecast.io/forecast/044c9e5b7dea840a676a3d5ffe2e10df/";

function testPage() {
    var json = {};
    var arr = [];
    var debugText = "";

    if (json.hasOwnProperty("any")) {
        debugText = debugText + "JSON object = {} and test json.hasOwnProperty('any') is true! *** ";
    }
    else {
        //it will always come here!
        debugText = debugText + "JSON object = {} and test json.hasOwnProperty('any') is false! *** ";
    }

    //alert(debugText);
    //document.getElementById("debug").innerHTML = debugText;

    if (json != null) {
        //it will always come here!
        debugText = debugText + "JSON object = {} and test != null is true! *** ";
    }
    else {
        debugText = debugText + "JSON object = {} and test != null is false! *** ";
    }

    //alert(debugText);
    //document.getElementById("debug").innerHTML = debugText;

    //this is correct way to test JSON object
    if (JSON.stringify(json) == "{}") {
        //always comes here!
        debugText = debugText + "JSON object = {} and test JSON.stringify(json) == '{}' is True! *** ";
    }
    else {
        debugText = debugText + "JSON object = {} and test JSON.stringify(json) == '{}' is False! *** ";
    }
    //alert(debugText);
    //document.getElementById("debug").innerHTML = debugText;

    //This is the correct way to test array
    if (arr.length > 0) {
        //always comes here!
        debugText = debugText + "array object = [] and arr.length > 0 is true! *** ";
    }
    else {
        debugText = debugText + "array object = [] and arr.length > 0 is false! *** ";
    }
    //alert(debugText);
    //document.getElementById("debug").innerHTML = debugText;

    //Wrong!
    if (arr != null) {
        //it will always comes here!
        debugText = debugText + "Array object = [] and test != null is true! *** ";
    }
    else {
        debugText = debugText + "Array object = [] and test != null is false! *** ";
    }
    //alert(debugText);
    //document.getElementById("debug").innerHTML = debugText;

    var json1

    //This is correct way to test a undefined variable
    if (json1 == null) {
        //it will always comes here!
        debugText = debugText + "Javascript object not defined json1 yet and test json1  == null is true! *** ";
    }
    else {
        debugText = debugText + "Javascript object not defined json1 yet and test json1 == null is false! *** ";
    }
    //alert(debugText);
    //document.getElementById("debug").innerHTML = debugText;

    //alert(JSON.stringify(json1));

    //corect!
    if (json1 == "undefined") {
        //it will always comes here!
        debugText = debugText + "Javascript object json1 not defined yet and test json1 == 'undefined' is true! *** ";
    }
    else {
        debugText = debugText + "Javascript object json1 not defined yet and test json1 == 'undefined' is false! *** ";
    }

    //alert(debugText);
    //document.getElementById("debug").innerHTML = debugText;

    //wrong!
    if (json1 != null && json1.hasOwnProperty('some')) {
        //it will always comes here!
        debugText = debugText + "Javascript object not defined yet and test json1.hasOwnProperty('some') is true! *** ";
    }
    else {
        debugText = debugText + "Javascript object not defined yet and test json1.hasOwnProperty('some') is false! *** ";
    }

    //alert(debugText);
    //document.getElementById("debug").innerHTML = debugText;
}

function viewCurrentLocation()
{
    //save to local storage
    currentLocationWeatherCache.storeLocationIntoStorage();

    location.href = "currentLocation.html";
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

    //current location latitude and longitude
    currentLocationWeatherCache.populateCurrentAddress(position.coords.latitude, position.coords.longitude);

    //Get today's weather by latitude and longitude
    var today = new Date();
    currentLocationWeatherCache.getWeatherForDate(today, getForecast);
}

//get forecast by forecast.api
function getForecast(date, forecast) {
    //alert("Reponse Weather forecast is " + JSON.stringify(forecast));

    //set weather icon
    var img = document.getElementById("preLoad");
    //img.setAttribute("id", "icon" + i);
    //img.setAttribute("class", "mdl-list_item-icon");
    img.setAttribute("src", "images/" + forecast.icon + ".png");

    //set weather summary
    document.getElementById("weather0").innerHTML = forecast.summary;
    document.getElementById("textArea").value = JSON.stringify(currentLocationWeatherCache.toJSON());
    
    //store current location with forecasts into sessionStorage
    currentLocationWeatherCache.storeLocationIntoStorage();
}

// Code for LocationWeatherCache class and other shared code.
function CurrentLocationWeatherCache() {
    var currentLocation = {};

    //update current location only when it is different latitude or longitude
    this.populateCurrentAddress = function (lat, lng) {
        alert("input latitude and longitude is " + lat + ", " + lng);
        alert("existing currentLocation is " + JSON.stringify(currentLocation));

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
