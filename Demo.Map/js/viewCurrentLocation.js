//Get current location and forecast information.
function getCurrentLocationAndWeatherInformation() {
    //load current location cache from sessionStorage (session cookie)
    currentLocationWeatherCache.loadCurrentLocation();

    //Get current location by callback via using Google Geocode API
    currentLocationWeatherCache.getCurrentLocationByGeocode(currentLocationAddress);
}