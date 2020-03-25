// var fiveDayQueryURL = "api.openweathermap.org/data/2.5/forecast?q=" + city_name + "&appid=96f595b81fd754dae6e47484245107c2"
var recentSearchesEl = $("#recentSearches")
var fiveDayEl = $("#fiveDay");
var searchFieldEl = $("#searchField");
var searchBtn = $("#searchBtn");
var cityEl = $("#city");
var dateEl = $("#date")
var currTempEl = $("#currTemp");
var currHumidEl = $("#currHumid");
var currWindEl = $("#currWind");
var currUVIEl = $("#currUVI");
var lat;
var lon;
var now = moment();
var storageArray = [];
var cityName = searchFieldEl.val().trim();

//runs date display
//runs recent searches recall
$(document).ready(function () {
    console.log("Ready");
    displayDate();
    storageRecall();
});

//not functioning
//event listener for click on recent searches
$(document).on("click", ".list-group-item-action", function () {
    event.preventDefault();
    console.log($(this).text());
    cityName=($(this).text());
    todayForecastSearch();
});

//search click event 
searchBtn.click(searchBtnClicked);

//function intended for recent search click function
function recentSearchClicked() {
    console.log("click")
    $(this).innerText = searchFieldEl.val();
    console.log($(this).val());
    console.log(searchFieldEl);
}

//search function
//resets now variable
//fires todayForecast Search
function searchBtnClicked() {
    event.preventDefault();
    now = moment();
    cityName = searchFieldEl.val().trim();
    todayForecastSearch();
};

//recalls local storage to poulate recent search list
function storageRecall() {
    recentSearchesEl.empty();
    storageArray = []
    for (var i = 0; i < 5; i++) {
        var item = localStorage.getItem(i);
        var newLI = $('<button type="button" class="list-group-item list-group-item-action">')
        newLI.append(item);
        recentSearchesEl.append(newLI);
        storageArray.push(item);
        console.log(storageArray);
    }
};

//displays date at top of page
function displayDate() {
    dateEl.html(now.format('dddd, MMMM D, YYYY'));
};

// Current weather search
//searches
//then appends desired info to page
//then fires UVI search, five day search, and unshifts latest search to top of local storage
function todayForecastSearch() {
    
    var todayQueryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=96f595b81fd754dae6e47484245107c2";
    $.ajax({
        url: todayQueryURL,
        method: "GET"
    }).then(function (response) {
        lat = response.coord.lat;
        lon = response.coord.lon;
        var humidity = ("Humidity: " + Math.round(response.main.humidity));
        var wind = ("Wind speed: " + Math.round(response.wind.speed));
        var temp = ("Temperature: " + Math.round(response.main.temp));
        currTempEl.html(temp + '&#8457;');
        currHumidEl.html(humidity + '%');
        currWindEl.html(wind + 'mph');
        cityEl.html(response.name + " <br>");
    }).then(function () {
        uviSearch();
        fiveDayForecastSearch();
        storageUnshift();
    });
};

//UVI search
function uviSearch() {
    var uviQueryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=96f595b81fd754dae6e47484245107c2&lat=" + lat + "&lon=" + lon
    $.ajax({
        url: uviQueryURL,
        method: "GET"
    }).then(function (response) {
        var UVI = response.value;
        currUVIEl.html('UV index: ' + UVI);
    });
};

//searches
//then uses 15:00 as a on each consecutive day to select a record
//then build cards with the pertinent data
function fiveDayForecastSearch() {
    // event.preventDefault
    var nowCheck = now.format('YYYY-MM-DD') + " 15:00:00";
    fiveDayEl.html("");
    var fiveDayQueryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=96f595b81fd754dae6e47484245107c2";
    $.ajax({
        url: fiveDayQueryURL,
        method: "GET"
    }).then(function (response) {
        var x = 0
        do {
            x = x + 1
            nowCheck = now.add(x, 'd').format('YYYY-MM-DD') + " 15:00:00";
            for (var i = 0; i < response.list.length; i++) {
                if (response.list[i].dt_txt === nowCheck) {
                    var newCol = $("<div class='col-md'>");
                    var newCard = $('<div class="card text-white bg-info mb-3" style="max-width: 18rem;">');
                    var newCardHead = $('<div class="card-header">');
                    var newCardBody = $('<div class="card-body">');
                    var newCardText = $('<p class="card-text">');
                    var newIcon = response.list[i].weather[0].icon;
                    var newAlt = response.list[i].weather[0].description;
                    var newTemp = Math.round(response.list[i].main.temp);
                    var newHumid = response.list[i].main.humidity;
                    var nowHead = now.format('ddd, MMMM D');
                    newCardHead.append(nowHead);
                    newCard.append(newCardHead);
                    newCardText.html('<img src="http://openweathermap.org/img/wn/' + newIcon + '.png" alt=' + newAlt + '><br>Temp: ' + newTemp + '&#8457;' + '<br>Humidity: ' + newHumid + '%');
                    newCardBody.append(newCardText);
                    newCard.append(newCardBody);
                    newCol.append(newCard);
                    fiveDayEl.append(newCol);
                };
            };
            nowCheck = now.subtract(x, 'd').format('YYYY-MM-DD') + " 15:00:00";
        } while (x < 5);
    });
};

//moves latest search item to local storage
//fire storageRecall to refresh recent search list
function storageUnshift() {
    console.log(storageArray)
    console.log(cityName);
    storageArray.unshift(cityName);
    for (var i = 0; i < 5; i++) {
        localStorage.setItem(i, storageArray[i]);
    };
    console.log(storageArray);
    storageRecall();
};