
import * as audioUtils      from './audioUtils';  // for encoding audio data as PCM
import crypto               from 'crypto'; // tot sign our pre-signed URL
import v4                   from './aws-signature-v4'; // to generate our pre-signed URL
import * as marshaller      from '@aws-sdk/eventstream-marshaller'; // for converting binary event stream messages to and from JSON
import * as util_utf8_node  from '@aws-sdk/util-utf8-node'; // utilities for encoding and decoding UTF8
import mic                  from 'microphone-stream'; // collect microphone input as a stream of raw bytes
import config               from '../../delta-config';

export class Transcribe{
    constructor(){
        // convert between binary event streams messages and JSON
        this.eventStreamMarshaller = new marshaller.EventStreamMarshaller(util_utf8_node.toUtf8, util_utf8_node.fromUtf8);

        // global variables for managing state
        this.languageCode = config.language_code;
        this.region = config.aws_region;
        this.key = config.aws_iam_key;
        this.secret = config.aws_iam_secret;
        this.sampleRate = (this.languageCode == "en-US") ? 44100 : 8000;
        this.inputSampleRate = 44100;
        this.transcription = "";
        this.socket = {};
        this.micStream = new mic();
        this.socketError = false;
        this.transcribeException = false;

        // check to see if the browser allows mic access
        if (!window.navigator.mediaDevices.getUserMedia) {
            // Use our helper method to show an error on the page
            this.showError('Delta supports the latest versions of Chrome, Firefox, Safari, and Edge. Update your browser and try again.');
        }

        this.transcribeOut = { stream: (text) => console.log(text) };
    }

    showError(message){
        console.log(message);
    }

    createPresignedUrl() {
        let endpoint = "transcribestreaming." + this.region + ".amazonaws.com:8443";
    
        // get a preauthenticated URL that we can use to establish our WebSocket
        return v4.createPresignedURL(
            'GET',
            endpoint,
            '/stream-transcription-websocket',
            'transcribe',
            crypto.createHash('sha256').update('', 'utf8').digest('hex'), {
                'key': this.key, 
                'secret': this.secret,
                //'sessionToken': '',
                'protocol': 'wss',
                'expires': 15,
                'region': this.region,
                'query': "language-code=" + this.languageCode + "&media-encoding=pcm&sample-rate=" + this.sampleRate
            }
        );
    }

    start = () => {
    //     $('#error').hide(); // hide any existing errors
    //     toggleStartStop(true); // disable start and enable stop button

         // get microphone input from browser (as a promise)...
         window.navigator.mediaDevices.getUserMedia({
                 video: false,
                 audio: true
             })
             // ...then convert mic stream to binary event stream messages when promise resolves 
             .then(this.streamAudioToWebSocket) 
             .catch(function (error) {
                 this.showError('There was an error streaming your audio to Amazon Transcribe. Please try again.');
                 //toggleStartStop();
             });
    }

    stop = () => {
        this.closeSocket();
        //toggleStartStop();
    }

    streamAudioToWebSocket = (userMediaStream) => {
        //get mic input from browser, via the microphone-stream module
        this.micStream = new mic();
    
        this.micStream.on("format", function(data) {
            this.inputSampleRate = data.sampleRate;
        });
    
        this.micStream.setStream(userMediaStream);
    
        // Pre-signed URLs are a way to authenticate a request (or WebSocket connection, in this case)
        // via Query Parameters. Learn more: https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html
        let url = this.createPresignedUrl();
    
        //open up our WebSocket connection
        this.socket = new WebSocket(url);
        this.socket.binaryType = "arraybuffer";
    
        let sampleRate = 0;
    
        // when we get audio data from the mic, send it to the WebSocket if possible
        this.socket.onopen = () => {
            this.micStream.on('data', (rawAudioChunk) => {
                // the audio stream is raw audio bytes. Transcribe expects PCM with additional metadata, encoded as binary
                let binary = this.convertAudioToBinaryMessage(rawAudioChunk);
    
                if (this.socket.readyState === this.socket.OPEN)
                    this.socket.send(binary);
            }
        )};
    
        // handle messages, errors, and close events
        this.wireSocketEvents();
    }

    convertAudioToBinaryMessage = (audioChunk) => {
        let raw = mic.toRaw(audioChunk);
    
        if (raw == null)
            return;
    
        // downsample and convert the raw audio bytes to PCM
        let downsampledBuffer = audioUtils.downsampleBuffer(raw, this.inputSampleRate, this.sampleRate);
        let pcmEncodedBuffer = audioUtils.pcmEncode(downsampledBuffer);
    
        // add the right JSON headers and structure to the message
        let audioEventMessage = this.getAudioEventMessage(Buffer.from(pcmEncodedBuffer));
    
        //convert the JSON object + headers into a binary event stream message
        let binary = this.eventStreamMarshaller.marshall(audioEventMessage);
    
        return binary;
    }

    wireSocketEvents = () => {
        // handle inbound messages from Amazon Transcribe
        this.socket.onmessage = (message) => {
            //convert the binary event stream message to JSON
            let messageWrapper = this.eventStreamMarshaller.unmarshall(Buffer(message.data));
            let messageBody = JSON.parse(String.fromCharCode.apply(String, messageWrapper.body));
            if (messageWrapper.headers[":message-type"].value === "event") {
                this.handleEventStreamMessage(messageBody);
            }
            else {
                this.transcribeException = true;
                this.showError(messageBody.Message);
                //toggleStartStop();
            }
        };
    
        this.socket.onerror = () => {
            this.socketError = true;
            this.showError('WebSocket connection error. Try again.');
            //toggleStartStop();
        };
        
        this.socket.onclose = (closeEvent) => {
            this.micStream.stop();
            
            // the close event immediately follows the error event; only handle one.
            if (!this.socketError && !this.transcribeException) {
                if (closeEvent.code != 1000) {
                    this.showError('Sreaming Exception:' + closeEvent.reason);
                }
                //toggleStartStop();
            }
        };
    }

    handleEventStreamMessage = (messageJson) => {
        let results = messageJson.Transcript.Results;
    
        if (results.length > 0) {
            if (results[0].Alternatives.length > 0) {
                let transcript = results[0].Alternatives[0].Transcript;
    
                // fix encoding for accented characters
                transcript = decodeURIComponent(escape(transcript));
    
                // update the textarea with the latest result
                //$('#transcript').val(this.transcription + transcript + "\n");
                // THIS IS WHERE THE TRANSCRIPT IS OUTPUT
                this.transcribeOut.stream(this.transcription + transcript); 
    
                // if this transcript segment is final, add it to the overall transcription
                if (!results[0].IsPartial) {
                    //scroll the textarea down
                    //$('#transcript').scrollTop($('#transcript')[0].scrollHeight);
                    this.transcription += transcript + "\n";
                }
            }
        }
    }
    
    closeSocket = () => {
        if (this.socket.readyState === this.socket.OPEN) {
            this.micStream.stop();
    
            // Send an empty frame so that Transcribe initiates a closure of the WebSocket after submitting all transcripts
            let emptyMessage = this.getAudioEventMessage(Buffer.from(new Buffer([])));
            let emptyBuffer =this.eventStreamMarshaller.marshall(emptyMessage);
            this.socket.send(emptyBuffer);
        }
    }

    getAudioEventMessage = (buffer) => {
        // wrap the audio data in a JSON envelope
        return {
            headers: {
                ':message-type': {
                    type: 'string',
                    value: 'event'
                },
                ':event-type': {
                    type: 'string',
                    value: 'AudioEvent'
                }
            },
            body: buffer
        };
    }

    // //RESET
    // $('#reset-button').click(function (){
    //     $('#transcript').val('');
    //     transcription = '';
    // });

    toggleStartStop(disableStart = false) {
        // $('#start-button').prop('disabled', disableStart);
        // $('#stop-button').attr("disabled", !disableStart);
    }

}

const transcribe = new Transcribe();
export default transcribe;








