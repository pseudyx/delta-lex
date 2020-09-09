import fetch from 'node-fetch';
import appConfig from '../app-config';

const searchUri = `https://${appConfig.rappid_api_host}/api/v1/search`
const headers = {
    "x-rapidapi-host": appConfig.rappid_api_host,
    "x-rapidapi-key": appConfig.rappid_api_key
}

const search = async (args, emitter) => {
    var params = args[0];
    var [query, num, callback] = params;
    num = parseInt(num)+1;

    if(typeof callback !== 'function'){
        callback = (resp) => console.log(resp);
    }

    var response = await fetch(`${searchUri}/q=${query.replace(' ', '+')}&num=${num}&lr=lang_en`, {
	"method": "GET",
	"headers": headers
    });
    // .then(response => {
        
    // })
    // .catch(err => {
    //     emitter.emit('commandError', err);
    //     callback(err);
    // });
    var content = await response.json()
    emitter.emit('searchResponse', content);
    callback(content);

}

export default search;