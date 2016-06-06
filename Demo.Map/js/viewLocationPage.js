// Code for the View Location page.

// This is sample code to demonstrate navigation.
// You need not use it for final app.
var geocoder;
var map;
var infoWindow;
//var SHOWMAP_FIRST = true;
var locationIndex = localStorage.getItem(APP_PREFIX + "-selectedLocation");

//alert(locationIndex);

function initPage() {
    //alert("come here!");

    if (locationIndex != null) {

        //alert("index no null!");

        locationWeatherCache.loadFromLocalStorage();

        var loc = locationWeatherCache.locationAtIndex(locationIndex);

        //document.getElementById("debug").innerText = JSON.stringify(loc);

        //get current date forecast
        var today = new Date();
        var key = loc.latitude + "," + loc.longitude + "," + today.forecastDateString();

        //only when there is current forecast.
        if (loc.forecasts.hasOwnProperty(key))
        {
            //alert("has key!");

            var forecast = loc.forecasts[key];

            // If a location name was specified, use it for header bar title.
            document.getElementById("headerBarTitle").innerText = loc.nickname;
            document.getElementById("currentAddress").innerText = loc.nickname;
            //document.getElementById("weatherDate").innerText = today.simpleDateString();
            //document.getElementById("weatherSummary").innerText = forecast.summary;
            //document.getElementById("minTemp").innerText = forecast.temperatureMin;
            //document.getElementById("maxTemp").innerText = forecast.temperatureMax;
            //document.getElementById("humidity").innerText = forecast.humidity;
            //document.getElementById("windSpeed").innerText = forecast.windSpeed;

            displayWeatherInformation(forecast, today);       
        }

        //draw map
        var addr = loc.nickname;
        var lat = loc.latitude;
        var lng = loc.longitude;

        drawMap(lat, lng, addr);
    }
}

//display date field only.
function updateDateFieldOnly(value)
{
    var today = new Date();
    var valueDate = Date.addDays(value);
    document.getElementById("weatherDate").innerText = valueDate.simpleDateString();
}

//display weather information
function displayWeatherInformation(forecast, date)
{
    document.getElementById("weatherDate").innerText = date.simpleDateString();
    document.getElementById("weatherSummary").innerText = forecast.summary;
    document.getElementById("minTemp").innerText = forecast.temperatureMin;
    document.getElementById("maxTemp").innerText = forecast.temperatureMax;
    document.getElementById("humidity").innerText = forecast.humidity;
    document.getElementById("windSpeed").innerText = forecast.windSpeed;
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
    //SHOWMAP_FIRST = false;

    //get slider date
    var date = new Date();
    var newDate = date.addDays(value);

    //dispaly weather date.
    //document.getElementById("weatherDate").innerText = newDate.simpleDateString();

    //Display weather other information by the callback function weatherForecast
    locationWeatherCache.getWeatherAtIndexForDate(locationIndex, newDate, weatherForecast);
}

//data - forecast object returned from forecast.io 
function weatherForecast(date, forecast) {
    //document.getElementById("debug").innerHTML = JSON.stringify(forecast);
    
    //Display weather information
    displayWeatherInformation(forecast, date);
    //document.getElementById("weatherSummary").innerText = forecast.summary;
    //document.getElementById("minTemp").innerText = forecast.temperatureMin;
    //document.getElementById("maxTemp").innerText = forecast.temperatureMax;
    //document.getElementById("humidity").innerText = forecast.humidity;
    //document.getElementById("windSpeed").innerText = forecast.windSpeed;
}

function removeLocation()
{
    locationWeatherCache.removeLocationAtIndex(locationIndex);

    locationWeatherCache.storeLocationIntoStorage();

    location.href = "index.html";
}