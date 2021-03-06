import AWS from 'aws-sdk';
import { AudioControl } from './control.js';

const DEFAULT_LATEST = '$LATEST';
const DEFAULT_CONTENT_TYPE = 'audio/x-l16; sample-rate=16000';
const DEFAULT_USER_ID = 'userId';
const DEFAULT_ACCEPT_HEADER_VALUE = 'audio/mpeg';
const TEXT_CONTENT_TYPE = 'text/plain; charset=utf-8';


export default class Conversation {
    constructor(config, onStateChange, onSuccess, onError, onAudioData) {
        // Apply default values.
        this.config = this.applyDefaults(config);
        this.lexConfig = this.config.lexConfig;
        this.onStateChange = onStateChange || function() { /* no op */ };
        this.onSuccess = onSuccess || function() { /* no op */ };
        this.onError = onError || function() { /* no op */ };
        this.onAudioData = onAudioData || function() { /* no op */ };
        this.messages = Object.freeze({
            PASSIVE: 'Passive',
            LISTENING: 'Listening',
            SENDING: 'Sending',
            SPEAKING: 'Speaking'
          });
        this.validateConfig();

        this.audioControl = new AudioControl({ checkAudioSupport: true });
        this.lexruntime = new AWS.LexRuntime();
        
        //set init state
        this.currentState = new Initial(this);
    }

    elicitIntent = (intentName, action) => {
          const request = {
                  botName: this.lexConfig.botName,
                  botAlias: this.lexConfig.botAlias,
                  userId: this.lexConfig.userId,
                  dialogAction: {
                    type:action,
                    intentName:intentName
                  },
                  accept: this.lexConfig.accept
          }

        this.lexruntime.putSession(request, (err, data) => {
            if (err) {
                console.log('ERROR', err, err.stack);
                this.transition(new Initial(this)); 
            } else { 
                //console.log('DATA', data);
                this.audioOutput = data;
                this.transition(new Speaking(this));
                this.onSuccess(data);
            }
          });

        console.log(`putSession: ${intentName}`);
    }

    sendText = (message) => {
        this.lexConfig.inputStream = message;
        this.lexConfig.contentType = TEXT_CONTENT_TYPE;
        this.lexruntime.postContent(this.lexConfig, (err, data) => {
            if (err) {
                this.onError(err);
                this.lexConfig.contentType = DEFAULT_CONTENT_TYPE;
                this.transition(new Initial(this));
            } else {
                this.audioOutput = data;
                this.lexConfig.contentType = DEFAULT_CONTENT_TYPE;
                this.transition(new Texting(this));
                this.onSuccess(data);
            }
        });

    }

    onSilence = () => {
        if (this.config.silenceDetection) {
            this.audioControl.stopRecording();
            this.currentState.advanceConversation();
        }
    };
    

    transition = (conversation) => {
        this.currentState = conversation;
        var state = this.currentState.state;
        this.onStateChange(state.message);

        // If we are transitioning into SENDING or SPEAKING we want to immediately advance the conversation state
        // to start the service call or playback.
        if (state.message === state.messages.SENDING || state.message === state.messages.SPEAKING) {
            this.currentState.advanceConversation();
        }
        // If we are transitioning in to sending and we are not detecting silence (this was a manual state change)
        // we need to do some cleanup: stop recording, and stop rendering.
        if (state.message === state.messages.SENDING && !this.config.silenceDetection) {
            this.audioControl.stopRecording();
        }
    };

    advanceConversation = () => {
        var state = this.currentState;
        var error = this.onError;
        this.audioControl.supportsAudio(function(supported) {
            if (supported) {
                state.advanceConversation();
            } else {
                error('Audio is not supported.');
            }
        });
    };

    reset = () => {
        this.audioControl.clear();
        this.currentState = new Initial(this.currentState.state);
      };

    applyDefaults = function(config) {
        var resp = config || {};
        config.silenceDetection = config.hasOwnProperty('silenceDetection') ? config.silenceDetection : true;
    
        var lexConfig = config.lexConfig || {};
        lexConfig.botAlias = lexConfig.hasOwnProperty('botAlias') ? lexConfig.botAlias : DEFAULT_LATEST;
        lexConfig.botName = lexConfig.hasOwnProperty('botName') ? lexConfig.botName : '';
        lexConfig.contentType = lexConfig.hasOwnProperty('contentType') ? lexConfig.contentType : DEFAULT_CONTENT_TYPE;
        lexConfig.userId = lexConfig.hasOwnProperty('userId') ? lexConfig.userId : DEFAULT_USER_ID;
        lexConfig.accept = lexConfig.hasOwnProperty('accept') ? lexConfig.accept : DEFAULT_ACCEPT_HEADER_VALUE;
        resp.lexConfig = lexConfig;
    
        return resp;
    };

    validateConfig = () => {
        // Validate input.
        if (!this.config.lexConfig.botName) {
            this.onError('A Bot name must be provided.');
            return;
        }
        if (!AWS.config.credentials) {
            this.onError('AWS Credentials must be provided.');
            return;
        }
        if (!AWS.config.region) {
            this.onError('A Region value must be provided.');
            return;
        }
    }

    updateConfig = (newValue) => {
        this.config = this.applyDefaults(newValue);
        this.lexConfig = this.config.lexConfig;
    };

  };

export class Initial {
    constructor(state) {
        this.state = state;
        this.state.message = this.state.messages.PASSIVE;
    }
    
    advanceConversation = () => {
      this.state.audioControl.startRecording(this.state.onSilence, this.state.onAudioData, this.state.config.silenceDetectionConfig);
      this.state.transition(new Listening(this.state));
    };
};

export class Listening{
    constructor(state) {
        this.state = state;
        this.state.message = this.state.messages.LISTENING;
    }
    
    advanceConversation = () => {
        this.state.audioControl.exportWAV((blob) => {
            this.state.audioInput = blob;
            this.state.transition(new Sending(this.state));
        });
    };
};

export class Sending { 
    constructor(state) {
        this.state = state;
        this.state.message = state.messages.SENDING;
    }
    
    advanceConversation = () => {
        this.state.lexConfig.inputStream = this.state.audioInput;
        this.state.lexruntime.postContent(this.state.lexConfig, (err, data) => {
            if (err) {
                this.state.onError(err);
                this.state.transition(new Initial(this.state));
            } else {
                this.state.audioOutput = data;
                this.state.transition(new Speaking(this.state));
                this.state.onSuccess(data);
            }
        });
    };
};

export class Speaking {
    constructor (state) {
        this.state = state;
        this.state.message = state.messages.SPEAKING;
    }
    
    advanceConversation = () => {
        if (this.state.audioOutput.contentType === 'audio/mpeg') {
            this.state.audioControl.play(this.state.audioOutput.audioStream, () => {
            if (this.state.audioOutput.dialogState === 'ReadyForFulfillment' ||
                this.state.audioOutput.dialogState === 'Fulfilled' ||
                this.state.audioOutput.dialogState === 'Failed' ||
                !this.state.config.silenceDetection) {
                this.state.transition(new Initial(this.state));
            } else {
                this.state.audioControl.startRecording(this.state.onSilence, this.state.onAudioData, this.state.config.silenceDetectionConfig);
                this.state.transition(new Listening(this.state));
            }
            }, this.state.onAudioData);
        } else {
            this.state.transition(new Initial(this.state));
        }
    };
};

export class Texting {
    constructor (state) {
        this.state = state;
        this.state.message = state.messages.SPEAKING;
    }
    
    advanceConversation = () => {
        if (this.state.audioOutput.contentType === 'audio/mpeg') {
            this.state.audioControl.play(this.state.audioOutput.audioStream, () => {
                this.state.transition(new Initial(this.state));
            }, this.state.onAudioData);
        } else {
            this.state.transition(new Initial(this.state));
        }
    };
};
