import React, { useRef, useEffect } from 'react';
import AWS from 'aws-sdk';
import Entity from './entity/entity';
import ActionScripter from './actionScripter';
import LexAudio from './lex/lex-audio';
import appConfig from '../app-config';
import * as utils from '../lib/utils';

export const Delta = ({width, height, name, commandHandler}) =>  {
  const canvasRef = useRef(null);
  const cnvStyle = {
    backgroundColor: 'black'
  }  
  const config = {
    lexConfig: LexAudio.Session({ botName: name })
  }

  useEffect(() => {
    AWS.config.credentials = new AWS.Credentials(appConfig.aws_iam_key, appConfig.aws_iam_secret, null);
    AWS.config.region = appConfig.aws_region;

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
    
    canvas.addEventListener('click', (evt) => Entity.onClick(evt,eventTrigger), false);

    if(typeof commandHandler !== 'function'){
      commandHandler = (cmd, ...args) => console.log(cmd, args);
    }

    onLoad();
  }, []);

  const onLoad = () =>{
    var conversation = new LexAudio.Conversation(config, null, null, null, (timeDomain, bufferLength) => Entity.setVoiceBuffer(timeDomain, bufferLength));
    var replay = utils.getCookie(`noReplay-intro`);
    if(replay != ""){
      enableInteraction();
      conversation.elicitIntent('Welcome', 'Delegate');
    } else {
      ActionScripter.start("intro", enableInteraction);
      setTimeout(() => conversation.elicitIntent('Intro', 'Delegate'), 2000);
    }
  }

  const enableInteraction = () => {
    Entity.isInteractive(true);
    ActionScripter.start("interact");
  }

  const eventTrigger = (evt) => {
    eventHandlers[evt.name]?eventHandlers[evt.name](evt.state):console.log(`no fx for: ${evt.name}`);
  }

  const eventHandlers = [];
  eventHandlers["MicBtn"] = (evtState) => {
    
    var conversation = new LexAudio.Conversation(config, function (state) {
      //onStateChange
      if (state === 'Listening') {
        Entity.menu.onRecord();
        console.log('state: Listening');
      }
      if (state === 'Sending') {
        Entity.menu.onStop();
        console.log('state: Sending');
      }
    }, function (data) {
      //onSuccess
      console.log('Transcript: ', data.inputTranscript, ", Response: ", data.message);

      switch(data.dialogState){
        case "Fulfilled":
          if(data.intentName == "Search"){
            commandHandler('window', null, (id) => {
              commandHandler('search', data.slots.Query, data.slots.Num, (response) => renderToWindow(response, id));
            });
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

  const renderToWindow = (response, id) => {

    var results = response.results
    var htmlContent = (<ul>{results.map((result, i) => (<li key={i}><a href={result.link} style={{color:'#ccc'}} target="_blank">{result.title}</a></li>))}</ul>);

    commandHandler('window', {id: id, content: htmlContent});
  }
  
  return (<canvas ref={canvasRef} id="cnv" style={cnvStyle}>Your browser does not support the HTML canvas tag.</canvas>);

}

export default Delta;