export const getCookie = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  export const setCookie = (cname, cvalue, exdays = 0) => {
      var d = new Date();
    if(exdays>0){
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    } else {
      d.setTime(d.getTime() + (1000 * 24 * 60 * 60 * 1000));
    }
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  export const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & (0x3 | 0x8));
      return v.toString(16);
    });
  }