// Code for the View Location page.

// This is sample code to demonstrate navigation.
// You need not use it for final app.
var geocoder;
var map;
var infoWindow;
var SHOWMAP_FIRST = true;
var locationIndex = localStorage.getItem(APP_PREFIX + "-selectedLocation");

function initPage() {
    if (locationIndex != null) {
        //var locationNames = ["Location 0", "Location A", "Location B"];
        LOCATIONWEATHERCACHE = new LocationWeatherCache();
        LOCATIONWEATHERCACHE.loadFromLocalStorage();
        var loc = LOCATIONWEATHERCACHE.locationAtIndex(locationIndex);

        //document.getElementById("debug").innerText = JSON.stringify(loc);

        var forecast = loc.forecasts[0];
        var today = new Date();
        // If a location name was specified, use it for header bar title.
        document.getElementById("headerBarTitle").innerText = loc.nickname;
        document.getElementById("currentAddress").innerText = loc.nickname;
        document.getElementById("weatherDate").innerText = today.simpleDateString();
        document.getElementById("weatherSummary").innerText = forecast.weather.summary;
        document.getElementById("minTemp").innerText = ConvertToCelsius(forecast.weather.temperatureMin);
        document.getElementById("maxTemp").innerText = ConvertToCelsius(forecast.weather.temperatureMax);
        document.getElementById("humidity").innerText = forecast.weather.humidity;
        document.getElementById("windSpeed").innerText = forecast.weather.windSpeed;

        //displayWeatherInformation(forecast, today);

        var addr = loc.nickname;
        var lat = loc.latitude;
        var lng = loc.longitude;

        drawMap(lat, lng, addr);
    }
}

//display weather information
function displayWeatherInformation(forecast, date)
{
    document.getElementById("weatherDate").innerText = today.simpleDateString();
    document.getElementById("weatherSummary").innerText = forecast.weather.summary;
    document.getElementById("minTemp").innerText = ConvertToCelsius(forecast.weather.temperatureMin);
    document.getElementById("maxTemp").innerText = ConvertToCelsius(forecast.weather.temperatureMax);
    document.getElementById("humidity").innerText = forecast.weather.humidity;
    document.getElementById("windSpeed").innerText = forecast.weather.windSpeed;
}

//draw map on the page.
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


//Display weather when date slider value updated.
//input: value is integer value for date slider selected.
function displayWeather(value) {
    //map has been drawed, no need to draw.
    SHOWMAP_FIRST = false;

    //get slider date
    var date = new Date();
    var newDate = date.addDays(value);

    //dispaly weather date.
    document.getElementById("weatherDate").innerText = newDate.simpleDateString();

    //Display weather other information by the callback function weatherForecast
    LOCATIONWEATHERCACHE.getWeatherAtIndexForDate(locationIndex, newDate, weatherForecast);
}

//data - forecast object returned from forecast.io 
function weatherForecast(date, forecast) {
    //document.getElementById("debug").innerHTML = JSON.stringify(forecast);

    //Display weather information
    document.getElementById("weatherSummary").innerText = forecast.weather.summary;
    document.getElementById("minTemp").innerText = ConvertToCelsius(forecast.weather.temperatureMin);
    document.getElementById("maxTemp").innerText = ConvertToCelsius(forecast.weather.temperatureMax);
    document.getElementById("humidity").innerText = forecast.weather.humidity;
    document.getElementById("windSpeed").innerText = forecast.weather.windSpeed;
}

function removeLocation()
{
    LOCATIONWEATHERCACHE.removeLocationAtIndex(locationIndex);

    LOCATIONWEATHERCACHE.saveToLocalStorage();

    location.href = "index.html";
}