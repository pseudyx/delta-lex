import { uuidv4 } from "../../lib/utils";

const DEFAULT_LATEST = '$LATEST';

const botConfig = params => {
    let id = localStorage.getItem('botSessionId');
        
    if(id === null){
        id = uuidv4();
        localStorage.setItem('botSessionId', id);
    } 

    return { 
        "botName": params.botName,
        "botAlias": params.botAlias || DEFAULT_LATEST,
        "userId": id
    }
}

export default botConfig;