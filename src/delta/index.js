import React, { useRef, useEffect } from 'react';
import Entity from './entity/entity';
import ActionScripter from './actionScripter';
import AWS from 'aws-sdk';
import LexAudio from './lex/lex-audio';
import appConfig from '../delta-config';

//const session = new LexAudio.Session({ botName: 'Delta_AU' });

export const Delta = ({width, height}) =>  {
  const canvasRef = useRef(null);
  const cnvStyle = {
    backgroundColor: 'black'
  }  
  const config = {
    lexConfig: LexAudio.Session({ botName: 'Delta_AU' })
  }

  useEffect(() => {
    AWS.config.credentials = new AWS.Credentials(appConfig.aws_iam_key, appConfig.aws_iam_secret, null);
    AWS.config.region = appConfig.aws_region;

    var conversation = new LexAudio.Conversation(config);
    conversation.elicitIntent('Welcome');

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
  }

  const eventHandlers = [];
  eventHandlers["MicBtn"] = (evtState) => {
    
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

      //"slots":{"State":"Victoria","LastName":"doe","Name":"john"}
      switch(data.dialogState){
        case "Fulfilled":
          if(data.intentName == "Personalise_AU"){
            //session.setSessionStore(data.slots);
          }
        break
      }
    }, function (error) {
      //onError
      console.log(error);
    }, function (timeDomain, bufferLength) {
      //onAudioData
      Entity.setVoiceBuffer(timeDomain, bufferLength);
    });
    conversation.advanceConversation();
  }
  
  return (<canvas ref={canvasRef} id="cnv" style={cnvStyle}>Your browser does not support the HTML canvas tag.</canvas>);

}

export default Delta;