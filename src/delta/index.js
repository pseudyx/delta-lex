import React, { useRef, useEffect, useState } from 'react';
import Entity from './entity';
import ActionScripter from './actionScripter';
import AWS from 'aws-sdk';
import LexAudio from './lex/lex-audio';
import config               from '../delta-config';


export const Delta = ({width, height}) =>  {
    const canvasRef = useRef(null);
    const cnvStyle = {
        backgroundColor: 'black'
    }  
    //const [actions, setActions] = useState([]);

  useEffect(() => {
    AWS.config.credentials = new AWS.Credentials(config.aws_iam_key, config.aws_iam_secret, null);
    AWS.config.region = config.aws_region;

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
  eventHandlers["MicBtn"] = (evtState) => {
    
    var config = {
      lexConfig: { botName: 'Delta' }
    }

    var conversation = new LexAudio.Conversation(config, function (state) {
      //onStateChange
      if (state === 'Listening') {
        console.log('state: Listening');
      }
      if (state === 'Sending') {
        Entity.menu.onStop();
        console.log('state: Sending');
      }
    }, function (data) {
      //onSuccess
      console.log('Transcript: ', data.inputTranscript, ", Response: ", data.message);
    }, function (error) {
      //onError
      console.log(error);
    }, function (timeDomain, bufferLength) {
      //onAudioData
    });
    conversation.advanceConversation();
  }
  
  return (<canvas ref={canvasRef} id="cnv" style={cnvStyle}>Your browser does not support the HTML canvas tag.</canvas>);

}

export default Delta;