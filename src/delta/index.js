import React, { useRef, useEffect } from 'react';
import AWS from 'aws-sdk';
import Entity from './entity/entity';
import ActionScripter from './actionScripter';
import LexAudio from './lex/lex-audio';
import eventHandler from './eventHandler';
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
    Entity.init(canvasRef, entityEvent);
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

    eventHandler.on('MicBtn', () => conversation.advanceConversation());
    eventHandler.on('Listening', () => Entity.menu.onRecord());
    eventHandler.on('Sending', () => Entity.menu.onStop());
    eventHandler.on('SettingsBtn', () => cmdHnd('window', {content: deltaMenu(), width:222, height:170 }));

  }, []);

  const enableInteraction = () => {
    Entity.isInteractive(true);
    ActionScripter.start("interact");
  }

  function entityEvent(evt) {
    eventHandler.emit(evt.name);
  }

  function onStateChange(state) {
    eventHandler.emit(state);
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

  const deltaMenu = () => {
    
    return (
    <div>
      <p>Customize the Entiy by toggling visual components</p>
      <ul>
      <li><button onClick={Entity.toggleBody}>Toggle</button> Body</li>
      <li><button onClick={Entity.toggleEye}>Toggle</button> Eye</li>
      <li><button onClick={Entity.toggleVoiceVisual}>Toggle</button> Mouth</li>
      </ul>
    </div>)
  }

  
  return (<canvas ref={canvasRef} id="cnv" style={cnvStyle}>Your browser does not support the HTML canvas tag.</canvas>);

}

export default Delta;