//global variable to store location weather cache object
var locationWeatherCache = new LocationWeatherCache();
//var cathyweatherUrl = "https://api.forecast.io/forecast/549ffc7d0eee04bebeb149307c50a776/"
var WEATHER_URL_KEY = "https://api.forecast.io/forecast/044c9e5b7dea840a676a3d5ffe2e10df/";

//sample url = https://api.forecast.io/forecast/044c9e5b7dea840a676a3d5ffe2e10df/37.8267,-122.423,2016-05-14T12:00:00?exclude==currently,minutely,hourly;

// Prefix to use for Local Storage
var APP_PREFIX = "weatherApp";
// Returns a date in the format "YYYY-MM-DD".
Date.prototype.simpleDateString = function () {
    function pad(value) {
        return ("0" + value).slice(-2);
    }

    var dateString = this.getFullYear() + "-" +
            pad(this.getMonth() + 1, 2) + '-' +
            pad(this.getDate(), 2);

    return dateString;
}

// Date format required by forecast.io API.
// We always represent a date with a time of midday,
// so our choice of day isn't susceptible to time zone errors.
Date.prototype.forecastDateString = function () {
    return this.simpleDateString() + "T12:00:00";
}

//add a number of days to Date.
Date.prototype.addDays = function (num) {
    var value = this.valueOf();
    value += 86400000 * num;
    return new Date(value);
}

function LocationWeatherCache() {
    // Private attributes:

    var locations = [];
    var callbacks = {};

    // Public methods:

    // Returns the number of locations stored in the cache.
    //
    this.length = function () {
        var locationsLength = 0;

        //in case there are no locations.
        if (locations !== null) {
            locationsLength = locations.length;
        }

        return locationsLength;
    };

    // Returns the location object for a given index.
    // Indexes begin at zero.
    //
    this.locationAtIndex = function (index) {
        var location = null;

        //check if there are locations stored in the array
        if (this.length() > 0 && index < this.length() && index >= 0) {
            location = locations[index];
        }

        return location;
    };

    // Given a latitude, longitude and nickname, this method saves a 
    // new location into the cache.  It will have an empty 'forecasts'
    // property.  Returns the index of the added location.
    //
    this.addLocation = function (latitude, longitude, nickname) {
        console.log(latitude);
        console.log(longitude);
        console.log(nickname);
        var newLocation = {
            latitude: latitude,
            longitude: longitude,
            nickname: nickname,
            forecasts: {}
        };

        var index = indexForLocation(latitude, longitude);

        //alert("location to add = " + JSON.stringify(newLocation));

        if (index == -1) {

            index = locations.push(newLocation) - 1;
        }

        //alert("added location = " + JSON.stringify(newLocation) + " at index = " + index);

        //saveLocations(locations);
        return index;
    }

    // Removes the saved location at the given index.
    // 
    this.removeLocationAtIndex = function (index) {
        var n = locations.length;

        //check if there are locations and whether the index exists in the locations array
        if (n > 0 && index < n && index >= 0) {
            //alert("Before remove = " + JSON.stringify(locations));
            //remove it from the locations array
            locations.splice(index, 1);

            //alert("after remove = " + JSON.stringify(locations));
        }
    }

    // This method is used by JSON.stringify() to serialise this class.
    // Note that the callbacks attribute is only meaningful while there 
    // are active web service requests and so doesn't need to be saved.
    //
    this.toJSON = function () {
        //construct locationWeatherCachePDO object
        var locationWeatherCachePDO = {
            "locations": locations
        };

        return locationWeatherCachePDO;
    };

    // Given a public-data-only version of the class (such as from
    // local storage), this method will initialise the current
    // instance to match that version.
    //
    this.initialiseFromPDO = function (locationWeatherCachePDO) {
        //set up private attribute for locations array from locationWeatherCachePDO that was created from local storage
        if (locationWeatherCachePDO != null) {
            //alert("non-null");
            locations = locationWeatherCachePDO["locations"];
        }
        else {
            locations = [];
            //alert("is null");
        }
        //or locations = locationWeatherCachePDO.locations;
    };

    // Request weather for the location at the given index for the
    // specified date.  'date' should be JavaScript Date instance.
    //
    // This method doesn't return anything, but rather calls the 
    // callback function when the weather object is available. This
    // might be immediately or after some indeterminate amount of time.
    // The callback function should have two parameters.  The first
    // will be the index of the location and the second will be the 
    // weather object for that location.
    // 
    this.getWeatherAtIndexForDate = function (index, date, callback) {

        // alert("getWeatherAtIndexForDate passing index = " + index + " date = " + date.forecastDateString() + " callback = " + callback);
        var loc = this.locationAtIndex(index);

        // alert("locations to get weather = " + JSON.stringify(locations));

        loc = locations[index];

        //alert("location to get weather = " + JSON.stringify(loc));

        if (loc) {
            var dateString = date.forecastDateString();
            var lat = loc.latitude;
            var lng = loc.longitude;
            var key = lat + "," + lng + "," + dateString;
            //exclude data for currently, minutely and hourly - we only need daily!
            var urlExt = key + "?exclude=currently,minutely,hourly";

            //alert(urlExt + JSON.stringify(loc));

            //alert(urlExt);
            //if forecasts object for a date exists
            var forecast = {};

            if (loc.forecasts.hasOwnProperty(key)) {
                forecast = loc.forecasts[key];
                //alert("not empty!");
                //use exist forecast object and return to callback function
                callback(date, forecast);
            }
            else {
                //alert("Get from forecast.io");

                //call forecast.io API for forecasts response
                var url = WEATHER_URL_KEY + urlExt;

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
                        loc.forecasts[key] = forecast;

                        //alert("forecast returned from api call = " + JSON.stringify(forecast));

                        //loc.forecasts = data.daily.data[0];
                        callback(date, forecast);
                    },
                    error: function () { alert('Get weather something bad happened'); }
                });
            }
        }
    };

    // This is a callback function passed to forecast.io API calls.
    // This will be called via JSONP when the API call is loaded.
    //
    // This should invoke the recorded callback function for that
    // weather request.
    //
    this.weatherResponse = function (response) {

    };

    this.getAllLocations = function () {
        return locations;
    }

    this.loadFromLocalStorage = function()
    {
        var locationText = localStorage.getItem(APP_PREFIX + "-Locations");
        
        if (locationText != null) {
            //alert("storage locations = " + locationText);
            this.initialiseFromPDO(JSON.parse(locationText));
        }
        else {
            //alert("no content!");
        }
    }

    //save private location into sessionStorage
    this.storeLocationIntoStorage = function () {
        var data = JSON.stringify(this.toJSON());
        //alert("currentLocation store into session Storage is " + data);

        localStorage.setItem(APP_PREFIX + "-Locations", data);
    }

    // Private methods:

    // Given a latitude and longitude, this method looks through all
    // the stored locations and returns the index of the location with
    // matching latitude and longitude if one exists, otherwise it
    // returns -1.
    //
    indexForLocation = function (latitude, longitude) {
        var index = -1;
        var n = locations.length;
        //alert("location len = " + this.length());

        //only when there is locations
        if (n > 0) {
            for (var i = 0; i < n ; i++) {
                var loc = locations[i];

                //alert("find location?" + JSON.stringify(loc));

                if (loc.longitude === longitude && loc.latitude === latitude) {
                    index = i;
                    break;
                }
            }
        }

        //alert("Index found = " + index);

        return index;
    }
}


// Restore the singleton locationWeatherCache from Local Storage.
//
function loadLocations() {
    var locationText = localStorage.getItem(APP_PREFIX);

    //alert("location stored in local storage = " + locationJSON);

    if (locationText != null) {
        locationWeatherCache.initialiseFromPDO(JSON.parse(locationText));
    }
    else {
        //alert("no content");
    }
}

// Save the singleton locationWeatherCache to Local Storage.
//
function saveLocations() {
    if (typeof (Storage) !== "undefined") {
        //store serialised locations with the key (weatherApp)
        //alert("saved text is " + JSON.stringify(locationWeatherCache.toJSON()));
        localStorage.setItem(APP_PREFIX, JSON.stringify(locationWeatherCache.toJSON()));
    }
    else {
        console.log("Error, current browser does not support localStorage.")
    }
}

// Restore the singleton locationWeatherCache from Local Storage.
//
function loadCurrentLocation() {
    var locationJSON = sessionStorage.getItem(APP_PREFIX + "-CurrentLocation");

    //alert("location stored in local storage = " + locationJSON);

    if (locationJSON != "") {
        currentLocationWeatherCache.initialiseFromPDO(JSON.parse(locationJSON));
    }
    else {
        alert("no content");
    }
}

// Save the singleton locationWeatherCache to Local Storage.
//
function saveCurrentLocation() {
    if (typeof (Storage) !== "undefined") {
        //store serialised locations with the key (weatherApp)
        //alert("saved text is " + JSON.stringify(locationWeatherCache.toJSON()));
        sessionStorage.setItem(APP_PREFIX + "-CurrentLocation", JSON.stringify(currentLocationWeatherCache.toJSON()));
    }
    else {
        console.log("Error, current browser does not support localStorage.")
    }
}
