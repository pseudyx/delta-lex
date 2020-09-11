import fetch from 'node-fetch';
import appConfig from '../app-config';

const headers = {
    "accept": "application/json",
    "Accept-Encoding": "gzip"
}

const weather = async (args, emitter) => {
    var params = args[0];
    var [postcode, num, callback] = params;

    if(typeof callback !== 'function'){
        callback = (resp) => console.log(resp);
    }

    var response = await fetch(`https://api.weather.com/v1/location/${postcode}%3A4%3AAU/forecast/daily/${num}day.json?units=m&language=en-US&apiKey=${appConfig.weather_api_key}`, {
	"method": "GET",
    "headers": headers
    });

    var content = await response.json()
    emitter.emit('weatherResponse', content);
    callback(content);

}

export default weather;