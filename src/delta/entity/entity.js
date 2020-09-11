import Body from './body';
import Eyeball from './eyeball';
import Menu from './menu';

export class Entity{
  constructor(){
    this.renderList = [];
    this.eye = {x: 0, y:0 }
    this.voiceBuffer = {dataArray: [128], bufferLength: 1}
    this.bodyEnabled = true;
    this.eyeEnabled = true;
    this.voiceVisualEnabled = true;

    window.requestAnimFrame = (function(callback) {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      };
    })();

  }

  init(canvasRef, clickEventCallback){

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.ctx = canvas.getContext("2d");

    window.addEventListener("resize", (e) => { 
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    canvas.addEventListener('click', (evt) => this.onClick(evt, clickEventCallback), false);

    this.menu = new Menu(this.ctx);
    var startTime = (new Date()).getTime();
    this.loop(this.ctx, startTime);

    return this.ctx;
  }

  toggleBody = () => {
    this.bodyEnabled = !this.bodyEnabled;
  }

  toggleEye = () => {
    this.eyeEnabled = !this.eyeEnabled;
  }

  toggleVoiceVisual = () => {
    this.voiceVisualEnabled = !this.voiceVisualEnabled;
  }

  setVoiceBuffer(dataArray, bufferLength){
    this.voiceBuffer.dataArray = dataArray;
    this.voiceBuffer.bufferLength = bufferLength;
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
  
    if(this.bodyEnabled)Body(ctx, nextx, nexty);
    if(this.eyeEnabled)Eyeball(ctx, nextx, nexty, this.eye.x, this.eye.y);
    if(this.voiceVisualEnabled)this.VoiceVisualizer(ctx, nextx, nexty, this.eye.x, this.eye.y);
    this.menu.render();
  
    this.renderList.forEach(action => action.fx(ctx));
  
    // request new frame
    window.requestAnimFrame(() => this.loop(ctx, startTime));
  }

  VoiceVisualizer = (ctx, cx, cy, lx, ly) => {
    var LENGTH = 4.1/100 *ctx.canvas.width;
    var x = cx - (LENGTH/2);

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgb(77, 78, 128)';
      ctx.beginPath();

      var sliceWidth = LENGTH * 1.0 / this.voiceBuffer.bufferLength;

      if(this.eyeEnabled){
        lx = (lx > 10) ? 10 : lx;
        lx = (lx < -10) ? -10 : lx;
        ly = (ly > 10) ? 10 : ly;
        ly = (ly < -10) ? -10 : ly;
      } else {
        lx = 0;
        ly = 0;
      }

      for (var i = 0; i < this.voiceBuffer.bufferLength; i++) {
        var v = this.voiceBuffer.dataArray[i] / 128.0;
        var y = v*cy;
        /* == Constrain to max length == */
        if(this.eyeEnabled){
          if(y > cy+(LENGTH/2)){
            y = cy+(LENGTH/2);
          }
          if(y < cy-(LENGTH/2)){
            y = cy-(LENGTH/2);
          }
        }
        /* == */
        if (i === 0) {
          ctx.moveTo(x+lx, y+ly);
        } else {
          ctx.lineTo(x+lx, y+ly);
        }
        x += sliceWidth;
      }

      ctx.lineTo(x+lx, cy+ly);
      ctx.stroke();

  }
   
}

const entity = new Entity();
export default entity;



