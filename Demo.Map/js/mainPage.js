// Code for the main app page (locations list).

// This is sample code to demonstrate navigation.
// You need not use it for final app.


function listLocationOnPage1() {
    //display current location
    getCurrentLocationAndWeatherInformation();

    //get other locations array from local storage
    loadLocations();
    var n = locationWeatherCache.length();
    
    //dynamic build locations
    //get another div (parent div which contains child divs for each item in array)
    var itemsListDiv = document.getElementById("locationList");

    //remove all items in the div (if available)
    //while (ItemsListDiv.hasChildNodes()) {
    //    ItemsListDiv.removeChild(ItemsListDiv.lastChild);
    //}
    var key, loc;
    var today = new Date();

    //iterate through each element in the array dynamic build list.
    for (var i = 0; i < n; i++) {
        loc = locationWeatherCache.locationAtIndex(i);
        key = loc.latitude + "," + loc.longitude + today.forecastDateString();
        //there is weather for today?
        if (loc.forecasts.hasOwnProperty(key))
        {
            var forecast = loc.forecasts[key];
            var newLi = document.createElement("li");
            newLi.setAttribute("id", "item" + i);
            newLi.setAttribute("class", "mdl-list_item mdl-list_item--two-line");
            newLi.setAttribute("onclick", "viewLocation(" + i + ");");

            var img = document.createElement("img");
            img.setAttribute("id", "icon" + i);
            img.setAttribute("class", "mdl-list_item-icon");
            img.setAttribute("src", "images/" + forecast.icon + ".png");
            //img.setAttribute("src", "images/Preloader_8.gif");

            var span1 = document.createElement("span");
            span1.innerHTML = "<b>" + loc[i].nickname + "</b>";

            var span2 = document.createElement("span");
            span2.innerHTML = " - " + forecast.summary;
            span2.setAttribute("id", "weather" + i);
            span2.setAttribute("class", "mdl-list_item-sub-title");

            newLi.appendChild(img);
            newLi.appendChild(span1);
            newLi.appendChild(span2);
        }
        else
        {
            var newLi = document.createElement("li");
            newLi.setAttribute("id", "item" + i);
            newLi.setAttribute("class", "mdl-list_item mdl-list_item--two-line");
            newLi.setAttribute("onclick", "viewLocation(" + i + ");");

            var img = document.createElement("img");
            img.setAttribute("id", "icon" + i);
            img.setAttribute("class", "mdl-list_item-icon");
            img.setAttribute("src", "images/loading.gif");

            var span1 = document.createElement("span");
            span1.innerHTML = "<b>" + loc.nickname + "</b>";

            var span2 = document.createElement("span");
            span2.innerHTML = " - loading...";
            span2.setAttribute("id", "weather" + i);
            span2.setAttribute("class", "mdl-list_item-sub-title");

            newLi.appendChild(img);
            newLi.appendChild(span1);
            newLi.appendChild(span2);
        }

        itemsListDiv.appendChild(newLi);  
    }
}

function viewLocation(locationIndex) {
    //alert("click location: " + locationName);

    // Save the desired location to local storage
    localStorage.setItem(APP_PREFIX + "-selectedLocation", locationIndex);
    // And load the view location page.
    location.href = 'viewlocation.html';
}

function viewCurrentLocation() {
    //save to local storage
    currentLocationWeatherCache.storeLocationIntoStorage();

    location.href = "currentLocation.html";
}

//Get current location and forecast information.
function getCurrentLocationAndWeatherInformation() {
    //load current location cache from sessionStorage (session cookie)
    currentLocationWeatherCache.initializeCurrentLocation();

    alert(JSON.stringify(currentLocationWeatherCache.toJSON()));

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
    currentLocationWeatherCache.getWeatherForDate(today, getCurrentForecast);
}

//get forecast by forecast.api
function getCurrentForecast(date, forecast) {
    //alert("Reponse Weather forecast is " + JSON.stringify(forecast));

    //set weather icon
    var img = document.getElementById("preLoad");
    //img.setAttribute("id", "icon" + i);
    //img.setAttribute("class", "mdl-list_item-icon");
    img.setAttribute("src", "images/" + forecast.icon + ".png");

    //set weather summary
    document.getElementById("currentWeather").innerHTML = forecast.summary;
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

            alert("existing forecast in location: " + JSON.stringify(forecast));

            //use exist forecast object and return to callback function
            callback(date, forecast);
        }
        else {
            //alert("Get from forecast.io");

            //call forecast.io API for forecasts response
            var url = WEATHER_URL_KEY + urlExt;

            //document.getElementById("debug").innerHTML = url;

            alert("URL = " + url);

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
        alert("currentLocation store into session Storage is " + data);

        sessionStorage.setItem(APP_PREFIX + "-CurrentLocation", data);
    }
}
