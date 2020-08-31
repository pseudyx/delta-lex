import Body from './body';
import Eyeball from './eyeball';
import Menu from './menu';

export class Entity{
  constructor(){
    this.renderList = [];
    this.eye = {x: 0, y:0 }
  }

  init(context){
    this.ctx = context;
    this.menu = new Menu(context);
    var startTime = (new Date()).getTime();
    this.loop(this.ctx, startTime);
  }

  setEye(x,y){
    this.eye.x = x;
    this.eye.y = y;
  }

  onClick(evt, callBack = (evnt) => console.log(`no onClick callback. Event: ${JSON.stringify(evnt)}`)){
    var rect = this.ctx.canvas.getBoundingClientRect();
    var pos = {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
    this.menu.onClick(pos, callBack);
  }

  isInteractive(isEnabled){
    this.menu.enabled = isEnabled;
  }

  loop = (ctx, startTime) => {
    // update
    var time = (new Date()).getTime() - startTime;
    var amplitude = 25;
  
    // in ms
    var period = 8000;
    var nextx = amplitude * Math.sin(time * 3 * Math.PI / period) + (ctx.canvas.width/2);
    var nexty = amplitude * Math.sin(time * 2 * Math.PI / period) + (ctx.canvas.height/2);
  
    var coordX = ctx.canvas.width/2; 
    var coordY = ctx.canvas.height/2;
    var pupilx = (coordX > nextx && coordX < 10 ) ? coordX : 10;
    pupilx = (coordX < nextx && coordX > -10 ) ? coordX : -10;
    var pupily = (coordY > nexty && coordY < 10 ) ? coordY : 10;
    pupily = (coordY < nexty && coordY > -10 ) ? coordY : -10;
    this.setEye(pupilx, pupily);
  
    // clear
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
    Body(ctx, nextx, nexty);
    Eyeball(ctx, nextx, nexty, this.eye.x, this.eye.y);
    this.menu.render();
  
    this.renderList.forEach(action => action.fx(ctx));
  
    // request new frame
    window.requestAnimFrame(() => this.loop(ctx, startTime));
  }
   
}

const entity = new Entity();
export default entity;



