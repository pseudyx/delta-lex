import * as rec from './recorder.js';

export class AudioControl {
    constructor(options){
        this.options = options || {};
        this.checkAudioSupport = options.checkAudioSupport !== false;
        this.recorder = {};
        this.audioSupported = true;
        this.playbackSource = {};
        this.audioRecorder = {};
        
        if (this.checkAudioSupport) {
            this.supportsAudio(this.audioSupported);
        }

        this.UNSUPPORTED = 'Audio is not supported.';
    }

    startRecording = (onSilence, visualizer, silenceDetectionConfig) => {
        onSilence = onSilence || function () { /* no op */ };
        visualizer = visualizer || function () { /* no op */ };
        if (!this.audioSupported) {
            throw new Error(this.UNSUPPORTED);
        }
        this.recorder = this.audioRecorder.createRecorder(silenceDetectionConfig);
        this.recorder.record(onSilence, visualizer);
    };

    stopRecording = () => {
        if (!this.audioSupported) {
            throw new Error(this.UNSUPPORTED);
        }
        this.recorder.stop();
    };

    exportWAV = (callback, sampleRate) => {
        if (!this.audioSupported) {
          throw new Error(this.UNSUPPORTED);
        }
        if (!(callback && typeof callback === 'function')) {
          throw new Error('You must pass a callback function to export.');
        }
        sampleRate = (typeof sampleRate !== 'undefined') ? sampleRate : 16000;
        this.recorder.exportWAV(callback, sampleRate);
        this.recorder.clear();
    };

    playHtmlAudioElement = (buffer, callback) => {
        if (typeof buffer === 'undefined') {
          return;
        }
        var myBlob = new Blob([buffer]);
        var audio = document.createElement('audio');
        var objectUrl = window.URL.createObjectURL(myBlob);
        audio.src = objectUrl;
        audio.addEventListener('ended', function () {
          audio.currentTime = 0;
          if (typeof callback === 'function') {
            callback();
          }
        });
        audio.play();
    };

    play = (buffer, callback) => {
        if (typeof buffer === 'undefined') {
          return;
        }
        var myBlob = new Blob([buffer]);
        // We'll use a FileReader to create and ArrayBuffer out of the audio response.
        var fileReader = new FileReader();
        fileReader.onload = (e) => {
          // Once we have an ArrayBuffer we can create our BufferSource and decode the result as an AudioBuffer.
          this.playbackSource = this.audioRecorder.audioContext().createBufferSource();
          this.audioRecorder.audioContext().decodeAudioData(e.target.result, (buf) => {
            // Set the source buffer as our new AudioBuffer.
            this.playbackSource.buffer = buf;
            // Set the destination (the actual audio-rendering device--your device's speakers).
            this.playbackSource.connect(this.audioRecorder.audioContext().destination);
            // Add an "on ended" callback.
            this.playbackSource.onended = (event) => {
              if (typeof callback === 'function') {
                callback();
              }
            };
            // Start the playback.
            this.playbackSource.start(0);
          });
        };
        fileReader.readAsArrayBuffer(myBlob);
    };

    stop = () => {
        if (typeof this.playbackSource === 'undefined') {
          return;
        }
        this.playbackSource.stop();
      };

    clear = () => {
        this.recorder.clear();
    };

    supportsAudio = (callback) => {
        callback = callback || function () { /* no op */ };
        var isSupported = this.audioSupported;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          this.audioRecorder = new rec.AudioRecorder();
          this.audioRecorder.requestDevice()
            .then(() => { this.isSupported(true, callback); })
            .catch(() => { this.isSupported(false, callback); });
        } else {
          this.isSupported(false, callback); 
        }
      };

      isSupported = (isSupported, callback) => {
        this.audioSupported = isSupported;
        callback(isSupported);
      }

}