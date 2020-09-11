import React, { useRef, useEffect } from 'react';
import AWS from 'aws-sdk';
import Entity from './entity/entity';
import ActionScripter from './actionScripter';
import LexAudio from './lex/lex-audio';
import appConfig from '../app-config';
import * as utils from '../lib/utils';
import listItemGroup from '../components/listItemGroup';

AWS.config.credentials = new AWS.Credentials(appConfig.aws_iam_key, appConfig.aws_iam_secret, null);
AWS.config.region = appConfig.aws_region;

export const Delta = ({name, commandHandler}) =>  {
  const cmdHnd = (typeof commandHandler === 'function') ? commandHandler : (cmd, ...args) => console.log(cmd, args);
  const canvasRef = useRef(null);
  const cnvStyle = {
    backgroundColor: 'black'
  }  
  const config = {
    lexConfig: LexAudio.Session({ botName: name })
  }
  const conversation = new LexAudio.Conversation(config, onStateChange, onSuccess, onError, onAudioData);

  useEffect(() => {    
    Entity.init(canvasRef, eventTrigger);
    Entity.isInteractive(false);
    ActionScripter.Actions = Entity.renderList;  

    // initial Intro or Welcome message 
    if(utils.getCookie(`noReplay-intro`) !== ""){
      enableInteraction();
      conversation.elicitIntent('Welcome', 'Delegate');
    } else {
      ActionScripter.start("intro", enableInteraction);
      setTimeout(() => conversation.elicitIntent('Intro', 'Delegate'), 2000);
    }

  }, []);

  const enableInteraction = () => {
    Entity.isInteractive(true);
    ActionScripter.start("interact");
  }

  const eventHandlers = [];
  const eventTrigger = (evt) => eventHandlers[evt.name]?eventHandlers[evt.name](evt.state):()=>{};

  eventHandlers["MicBtn"] = (evtState) => conversation.advanceConversation();
  eventHandlers['Listening'] = () => Entity.menu.onRecord();
  eventHandlers['Sending'] = () => Entity.menu.onStop();

  function onStateChange(state) {
    eventTrigger({name: state});
  }

  function onError(error) {
    console.log(error);
  }

  function onAudioData(timeDomain, bufferLength) {
    Entity.setVoiceBuffer(timeDomain, bufferLength);
  }

  function onSuccess(data){
    //console.log('Transcript: ', data.inputTranscript, ", Response: ", data.message);

    if(data.dialogState === "Fulfilled"){

        if(data.intentName === "Search"){
          cmdHnd('window', null, (id) => {
            cmdHnd('search', data.slots.Query, data.slots.Num, (response) => {
              cmdHnd('window', {id: id, content: listItemGroup(response.results) }) 
            });
          });
        }

    }
  }

  
  return (<canvas ref={canvasRef} id="cnv" style={cnvStyle}>Your browser does not support the HTML canvas tag.</canvas>);

}

export default Delta;