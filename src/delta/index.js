import React, { useRef, useEffect, useState } from 'react';
import Entity from './entity';
import ActionScripter from './actionScripter';
import Typewriter from './typewriter';
import Transcribe from './transcribe';

export const Delta = ({width, height}) =>  {
    const canvasRef = useRef(null);
    const cnvStyle = {
        backgroundColor: 'black'
    }

  
    
    //const [actions, setActions] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = width ?? window.innerWidth;
    canvas.height = height ?? window.innerHeight;

    const context = canvas.getContext("2d");

    window.addEventListener("resize", (e) => { 
      canvas.width = width ?? window.innerWidth;
      canvas.height = height ?? window.innerHeight;
     });

    window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
    })(); 

    Entity.init(context);
    Entity.isInteractive(false);
    ActionScripter.Actions = Entity.renderList;
    ActionScripter.start("intro", enableInteraction);
    Typewriter.typeLines = Entity.renderList;

    Transcribe.transcribeOut = Typewriter;

    canvas.addEventListener('click', (evt) => Entity.onClick(evt,eventTrigger), false);
  }, []);

  const enableInteraction = () => {
    Entity.isInteractive(true);
    ActionScripter.start("interact");
  }

  const eventTrigger = (evt) => {
    eventHandlers[evt.name](evt.state);
    //Typewriter.writeLine(JSON.stringify(evt));
  }

  const eventHandlers = [];
    eventHandlers["MicBtn"] = (state) => {
      if(state){
        Transcribe.start();
      } else {
        Transcribe.stop();
      }
    }
  
  return (<canvas ref={canvasRef} id="cnv" style={cnvStyle}>Your browser does not support the HTML canvas tag.</canvas>);

}

export default Delta;