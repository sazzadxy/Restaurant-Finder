class RESTAURANTAPI {
    constructor() {
        this.apiKey = "API-KEY-FROM-spoonacular.com";
        this.header = {
            Headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }
    }

    async searchAPI() {

        // category url
        const categoryURL = `https://api.spoonacular.com/food/restaurants/search?apiKey=${this.apiKey}`;

        // category data
        const categoryInfo = await fetch(categoryURL, this.header);
        const categoryJSON = await categoryInfo.json();
        const category = await categoryJSON.restaurants;
        //console.log(category,categoryJSON);


        const c = [];
        for (var i = 0; i < category.length; i++) {
            for (var key in category[i]) {
                if (key === 'cuisines') {
                    for (var j = 0; j < category[i][key].length; j++) {
                        c.push(category[i][key][j]);
                    }
                }
            }
        }

        //console.log('value of c: ' + c);
        var categories = c.filter((v, i, a) => a.indexOf(v) === i);
        //console.log(categories);

        
        const cities = [];
        for (var i = 0; i < category.length; i++) {
            for (var key in category[i]) {
                if (key === 'address') {
                    //console.log(category[i][key].city);
                    cities.push(category[i][key].city);
                }
            }
        }
        //console.log(cities);

        return categories, cities;

    }

    async cityLocation(cuisine, lat, lng) {

        // city url
        const cityURL = `https://api.spoonacular.com/food/restaurants/search?apiKey=${this.apiKey}&cuisine=${cuisine}&lat=${lat}&lng=${lng}`;
        // const cityURL = `https://api.spoonacular.com/food/restaurants/search?apiKey=${this.apiKey}&cuisine=dinner&lat=42.3114312999&lng=-71.2750371081`;

        //console.log(lat,lng);

        // search city
        const cityInfo = await fetch(cityURL, this.header);
        const cityJSON = await cityInfo.json();
        const cityLocation = await cityJSON.restaurants;

        return cityLocation;

    }
}

class UI {
    constructor() {
        this.loader = document.querySelector('.loader');
        this.restaurantList = document.getElementById('restaurant-list');
    }

    addSelectedOptions(categories) {
        const search = document.getElementById("searchCategory");
        //let output = `<option value="" selected>select category</option>`;
        let output = `<option value="" selected disabled fw-bold hidden>choose here</option>`;

        //console.log(typeof(categories),categories, Array.isArray(categories));

        for (const value in categories) {
            //output += `<option value='${value}'>${categories[value]}</option>`;
            output += `<option value='${categories[value]}'>${categories[value]}</option>`;
        }
        search.innerHTML = output;

    }

    addCities(cities) {
        
        let temp = "";
        for (var i = 0; i < cities.length; i++) {
            //console.log(cities[i]);
            temp += cities[i]+`, `;
        }
        document.getElementById("city-list").innerHTML = temp;
    }

    showFeedback(text) {
        const feedback = document.querySelector('.feedback');
        feedback.classList.add("showItem");
        feedback.innerHTML = `<p class="fs-6">${text}</p>`;
        setTimeout(() => {
            feedback.classList.remove("showItem");
        }, 3000);
    }

    showLoader() {
        this.loader.classList.add("showItem");
    }

    hideLoader() {
        this.loader.classList.remove("showItem");
    }

    getRestaurants(restaurants, c) {
        this.hideLoader();
        if (restaurants.length === 0) {
            this.showFeedback("no such cuisines found in your city. try other options.")
        } else {
            //console.log(restaurants);
            this.restaurantList.innerHTML = "";

            for (let i = 0; i < restaurants.length; i++) {
                const img = restaurants[i].logo_photos[0];
                const name = restaurants[i].name;
                const rating = restaurants[i].weighted_rating_value.toFixed(1);
                const address = restaurants[i].address;
                const phone_number = restaurants[i].phone_number;
                const description = restaurants[i].description;
                const is_open = restaurants[i].is_open;
                //console.log(img, name, rating, address, phone_number);
                if (img !== "") {
                    this.showRestaurant(img, name, address, rating, phone_number, description, is_open);
                }
            }

        }
    }

    showRestaurant(img, name, address, rating, phone_number, description, is_open) {
        is_open = (is_open === true) ? 'open now' : 'closed now';
        const div = document.createElement('div');
        div.classList.add('col-11', 'mx-auto', 'my-3', 'col-md-4');

        div.innerHTML = `<div class="card">
        <div class="card">
          <div class="row p-3">
            <div class="col-5">
              <img src="${img}" class="img-fluid img-thumbnail" alt="restaurant logo">
            </div>
            <div class="col-5 text-capitalize">
              <h6 class="text-uppercase pt-2 fw-bold">${name}</h6>
              <p class="fw-bold">${'phone: ' + phone_number + '<br>' + 'address: ' + address.street_addr + '&nbsp;' + address.city + '&nbsp;' + address.state + '&nbsp;' + address.zipcode + '&nbsp;' + address.country}</p>
            </div>
            <div class="col-1">
              <div class="badge bg-success">
                ${rating}
              </div>
            </div>
          </div>
          <hr>
          <div class="row py-3 ms-1 me-1">
          <p><strong style="text-align: justify;">${description}</strong></p>
          </div>
          <hr>
          <div class="row text-center no-gutters pb-3">
          <p class="fw-bold text-capitalize">${is_open}</p>
          </div>
        </div>
      </div>`;

        this.restaurantList.appendChild(div);
    }

}

(() => {

    const searchForm = document.getElementById("searchForm");
    const searchCategory = document.getElementById("searchCategory");
    // const searchCity = document.getElementById("searchCity");

    const restaurantApi = new RESTAURANTAPI();
    const ui = new UI();

    document.addEventListener('DOMContentLoaded', () => {
        restaurantApi.searchAPI()
            .then((data) => {
                //console.log(data);
                ui.addSelectedOptions(data);
                ui.addCities(data);
            })
            .catch(error => console.log(error));
    }); 

    // function showError(error) {
    //     switch (error.code) {
    //         case error.PERMISSION_DENIED:
    //             ui.showFeedback("User denied the request for Geolocation.");
    //             break;
    //         case error.POSITION_UNAVAILABLE:
    //             ui.showFeedback("Location information is unavailable.");
    //             break;
    //         case error.TIMEOUT:
    //             ui.showFeedback("The request to get user location timed out.")
    //             break;
    //         case error.UNKNOWN_ERROR:
    //             ui.showFeedback("An unknown error occurred.");
    //             break;
    //     }
    // }

    function getLocation(callback) {
        if (navigator.geolocation) {
            var lat_lng = navigator.geolocation.getCurrentPosition((position) => {
                //console.log(position);
                var user_position = {};
                user_position.lat = position.coords.latitude;
                user_position.lng = position.coords.longitude;
                callback(user_position);
            });
        } else {
            // alert("Geolocation is not supported by this browser.");
            ui.showFeedback("Geolocation is not supported by this browser.");
            // showError(error);
        }
    }

    searchForm.onsubmit = (event => {
        event.preventDefault();

        const categoryID = searchCategory.value.toLowerCase();
        //console.log(categoryID);
        let lat, lng;

        if (categoryID === '') {
            ui.showFeedback("please select category");
        } else {
            ui.showLoader();
            getLocation(function (lat_lng) {
                //console.log(lat_lng.lat,lat_lng.lng);
                lat = lat_lng.lat;
                lng = lat_lng.lng;

                restaurantApi.cityLocation(categoryID, lat, lng)
                    .then((cityData) => {
                        //console.log(cityData);
                        ui.getRestaurants(cityData);
                    })
                    .catch(error => console.log(error));

            });


        }
    })
})();

