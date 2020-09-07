import { setCookie, getCookie } from "../../lib/utils";

const DEFAULT_LATEST = '$LATEST';

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

const botConfig = params => {
    let id = getCookie('botSessionId');
        
    if(id == ""){
        id = uuidv4();
        setCookie('botSessionId', id);
    } 

    return { 
        "botName": params.botName,
        "botAlias": params.botAlias || DEFAULT_LATEST,
        "userId": id
    }
}

export default botConfig;