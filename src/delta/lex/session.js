import * as utils from "../../lib/utils";

const DEFAULT_LATEST = '$LATEST';

const botConfig = params => {
    let id = utils.getCookie('botSessionId');
        
    if(id === ""){
        id = utils.uuidv4();
        utils.setCookie('botSessionId', id);
    } 

    return { 
        "botName": params.botName,
        "botAlias": params.botAlias || DEFAULT_LATEST,
        "userId": id
    }
}

export default botConfig;