import * as utils from '../lib/utils';

export class ActionScripter {
    constructor(actions = []){
        this.Script = {}
        this.Actions = actions;
    }

    start = (script, callback = ()=>console.log('end script')) => {
        if(typeof script == "string"){
            this.loadScript(script, callback);
        } else {
            this.script = script;
            var startTime = (new Date()).getTime();
            console.log(`Start script: ${startTime}`)
            setTimeout(()=> {this.timeLine(startTime, callback)}, 500);
        }
    }

    loadScript(name, callback = ()=>console.log('end script')){
        this.importScript(name, (res) => {
            if(res.replay == false){
                var replay = utils.getCookie(`noReplay-${name}`);
                if(replay != ""){
                    callback();
                } else {
                    utils.setCookie(`noReplay-${name}`, true);
                    this.start(this.convertJsonToActionScript(res.script), callback);
                }
            } else {
                this.start(this.convertJsonToActionScript(res.script), callback);
            }
        });
    }

    addAction = (action) => {
        this.Actions.push(action);
    }

    timeLine = (startTime, callback) => {
        var time = (new Date()).getTime() - startTime;
        var sec = Math.round((time/1000)*2)/2;//to the nearest half sec n.5

        if(this.script.length > 0){
            var acts = this.script.filter(act => act.sec == sec);
            this.script = this.script.filter(act => !acts.includes(act))
            acts.forEach((act) => {
                switch(act.type){
                    case "text":
                        this.addAction(act);
                        break;
                    case "clear":
                        act.fx(this.Actions);
                }
            });

            setTimeout(()=> {this.timeLine(startTime, callback)}, 500);
        } else {
            callback();
        }
        
        
    }

    importScript(name, callback){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `/actionScripts/${name}.json`, true);
        xhr.send(null);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(JSON.parse(xhr.response));
            }
        }
    }

    convertJsonToActionScript(jsonArr){
        var resArr = [];
        jsonArr.forEach((src) => {  
            var fx = fxConvert[src.type](src);
            resArr.push({
                id: src.id,
                sec: src.sec,
                fx: fx,
                type: src.type
            }); 
        });
        return resArr;
    }
}

var actionScripter = new ActionScripter();
export default actionScripter;

const fxConvert= [];
fxConvert["text"] = (src) => {
    var act = src.action;
    var coords = act.coord.split(':');
    
    const fx = (ctx) => {
        var font = act.font?? "Calibri";
        var size = act.size?? "100%";
        var weight = act.weight?? "normal"

        var x = coordMeasure(ctx.canvas.width, coords[0]);
        var y = coordMeasure(ctx.canvas.height, coords[1]);
        
        ctx.font = `${weight} ${size} ${font}`;
        ctx.fillStyle = act.color;
        ctx.fillText(act.value, x, y);
    }
    return fx;
}
fxConvert["clear"] = (src) => {

    var ids = src.maintain?.split(',');
    if(ids){
        for (let i=0; i<ids.length; ++i) {
            let val = ids[i];
            ids[i] = parseInt(val);
        }
    }

    const fx = (arr) => {
        var nArr = [];
        if(ids){
            nArr = arr.filter(el => ids.includes(el.id));
        } 
        
        arr.splice(0,arr.length);
        nArr.forEach((el) => arr.push(el));
    }
    return fx;
}

const coordMeasure = (bearing, coord) => {
    var resp;
    if(/[0-9]*[%]/g.test(coord)){
        var per = parseInt(coord.match(/^[0-9]*/g));
        if(/(\+|\-)[0-9]*$/g.test(coord)){
            var px = parseInt(coord.match(/[0-9]*$/g));
            switch(`${coord.match(/([+]|[-])/g)}`){
                case "+":
                    resp = (per/100*bearing) + px;
                    break;
                case "-":
                    resp = (per/100*bearing) - px;
                    break;
            }
        } else {
            resp = per/100*bearing;
        }
    } else {
        resp = coord;
    }
    return resp;
}