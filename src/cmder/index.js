import search from './cmdSearch';
import weather from './cmdWeather';

export const cmder = {
    events: {},
    on(event, listener) {
        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return () => this.removeListener(event, listener);
    },
    removeListener(event, listener) {
      if (typeof this.events[event] === 'object') {
          const idx = this.events[event].indexOf(listener);
          if (idx > -1) {
            this.events[event].splice(idx, 1);
          }
      }
    },
    emit(event, ...args) {
      if (typeof this.events[event] === 'object') {
        this.events[event].forEach(listener => listener.apply(this, args));
      }
    },
    once(event, listener) {
      const remove = this.on(event, (...args) => {
          remove();
          listener.apply(this, args);
      });
    },

    exec: function(cmd, ...args){
        var fx = this[cmd];
        if(fx){
            fx(args, this);
        }
    }
}

cmder["window"] = (args, emitter) => {

  var params = args[0];
  var [iwin, callback] = params; 
  
  if(typeof iwin !== 'object' || iwin === null){
    iwin = {}
  }

  if(iwin.id){
    emitter.emit('updateWindow', iwin);
  } else {
    if(typeof callback !== 'function'){
      callback = ()=>{};
    }
    emitter.emit('addWindow', iwin, callback);
  }

  
};
cmder["search"] = search;
cmder["weather"] = weather;

export default cmder;

