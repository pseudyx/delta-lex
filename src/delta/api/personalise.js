import config from '../../delta-config';
import fetch from 'node-fetch';

const url = `https://${config.api_id}.execute-api.${config.aws_region}.amazonaws.com/${config.api_stage}/personalise`;

const headers = { 
    'Content-Type': 'application/json'
};

const personalise = {
    
    setState: async (state, callback) => {
        let response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(state)
          });
          
          let body = await response.json();
          if(typeof callback === "function"){
            callback(body.id);
          }
          return body.id;
    },
    
    
    getState: async (id, callback) => {
      console.log("get state");
        let response = await fetch(`${url}/${id}`, {
          headers: headers,
        });
        if (response.ok) { // if HTTP-status is 200-299
            // get the response body 
            let body = await response.json();
            if(typeof callback === "function"){
                callback(body);
            }
            return body;
          } else {
            console.log("HTTP-Error: " + response.status);
          }
    } 

}

export default personalise;