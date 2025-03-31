const axios = require('axios');

module.exports.getAddressCoordinate = async (address) => {
    // const apiKey = process.env.GOOGLE_MAPS_API;
    // const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    const apiKey = process.env.GOMAPS_PRO_API_KEY;
    const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            const location = response.data.results[ 0 ].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng
            };
        } 
    } catch (error) {
        console.error(error);
        // throw error;
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    // const apiKey = process.env.GOOGLE_MAPS_API;
    // const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    const apiKey = process.env.GOMAPS_PRO_API_KEY;
    const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {

        const response = await axios.get(url);
        if (response.data.status === 'OK') {

            if (response.data.rows[ 0 ].elements[ 0 ].status === 'ZERO_RESULTS') {
                throw new Error('No routes found');
            }

            return response.data.rows[ 0 ].elements[ 0 ];
        } 

    } catch (err) {
        console.error(err);
        // throw err;
    }
}

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }
    
    // const apiKey = process.env.GOOGLE_MAPS_API;
    // const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

    const apiKey = process.env.GOMAPS_PRO_API_KEY;
    const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;
    
    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            return response.data.predictions.map(prediction => prediction.description).filter(value => value);
        } 
    } catch (err) {
        console.error(err);
        // throw err;
    }
}


const getWeatherForRoute = async (waypoints) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    let weatherData = [];

    for (let point of waypoints) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${point.lat}&lon=${point.lng}&appid=${apiKey}&units=metric`;

        try {
            const response = await axios.get(url);
            if (response.data.cod !== 200) continue;

            weatherData.push({
                lat: point.lat,
                lng: point.lng,
                condition: response.data.weather[0].main
            });
        } catch (error) {
            console.error(`Weather fetch error for ${point.lat}, ${point.lng}:`, error.message);
        }
    }

    return weatherData;
};

const classifyOverallWeather = (weatherData) => {
    let conditionCounts = { Clear: 0, Rainy: 0, Stormy: 0 };

    weatherData.forEach(({ condition }) => {
        if (["Clear", "Sunny"].includes(condition)) conditionCounts.Clear++;
        else if (["Rain", "Drizzle"].includes(condition)) conditionCounts.Rainy++;
        else if (["Thunderstorm", "Storm"].includes(condition)) conditionCounts.Stormy++;
    });

    return Object.keys(conditionCounts).reduce((a, b) =>
        conditionCounts[a] > conditionCounts[b] ? a : b
    );
};

module.exports.getTrafficData = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error("Origin and destination are required");
    }

    const apiKey = process.env.GOMAPS_PRO_API_KEY;
    const url = `https://maps.gomaps.pro/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&departure_time=now&traffic_model=best_guess&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        
        if (response.data.status !== "OK") {
            throw new Error("Invalid request to Google Maps API");
        }

        const route = response.data.routes[0].legs[0];
        const normalTime = route.duration.value; // in seconds
        const trafficTime = route.duration_in_traffic ? route.duration_in_traffic.value : normalTime;

        // Extract waypoints every 10th step
        const waypoints = route.steps
            .filter((_, index) => index % 10 === 0)
            .map(step => ({
                lat: step.end_location.lat,
                lng: step.end_location.lng
            }));

        // Fetch weather data
        const weatherData = await getWeatherForRoute(waypoints);
        const weather = classifyOverallWeather(weatherData);

        // Classify traffic level
        const classifyTraffic = (normalTime, trafficTime) => {
            const normalMinutes = normalTime / 60;
            const trafficMinutes = trafficTime / 60;
            const increasePercentage = ((trafficMinutes - normalMinutes) / normalMinutes) * 100;

            if (increasePercentage < 20) return "Low";
            if (increasePercentage < 50) return "Medium";
            return "High";
        };

        const trafficLevel = classifyTraffic(normalTime, trafficTime);

        return {
            origin: route.start_address,
            destination: route.end_address,
            distance: route.distance.text,
            normal_duration: route.duration.text,
            duration_in_traffic: route.duration_in_traffic?.text || route.duration.text,
            traffic_level: trafficLevel,
            weather: weather
        };
    } catch (error) {
        console.error("Error fetching traffic data:", error.message);
        throw error;
    }
};


