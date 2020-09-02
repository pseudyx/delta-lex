import WorkerSvc, { WebWorker} from './worker';
const worker = new WebWorker(WorkerSvc);

export class AudioRecorder {
    constructor(){
        this.audio_context = undefined;
        this.audio_stream = [];
    }

    /**
     * Creates an audio context and calls getUserMedia to request the mic (audio).
     */
    requestDevice = () => {

      if (typeof this.audio_context === 'undefined') {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audio_context = new AudioContext();
      }
      return navigator.mediaDevices.getUserMedia({audio: true}).then(this.setStream);
    };

    setStream = (stream) =>{
      this.audio_stream = stream;
    }

    createRecorder = (silenceDetectionConfig) => {
      return new Recorder(this.audio_context.createMediaStreamSource(this.audio_stream), silenceDetectionConfig);
    };

    audioContext = () => {
      return this.audio_context;
    };

};

export class Recorder {
    constructor(source, silenceDetectionConfig) {
        this.source = source;
        this.silenceDetectionConfig = silenceDetectionConfig || {time: 1500, amplitude: 0.2};
        if(silenceDetectionConfig !== undefined){
          this.silenceDetectionConfig.time = silenceDetectionConfig.hasOwnProperty('time') ? silenceDetectionConfig.time : 1500;
          this.silenceDetectionConfig.amplitude = silenceDetectionConfig.hasOwnProperty('amplitude') ? silenceDetectionConfig.amplitude : 0.2;
        }

        this.recording = false;
        this.start = Date.now();
        this.currCallback = () => {};
        this.silenceCallback = () => {};
        this.visualizationCallback = () => {};
  
        // Create a ScriptProcessorNode with a bufferSize of 4096 and a single input and output channel
        this.node = this.source.context.createScriptProcessor(4096, 1, 1);

        worker.onmessage = (message) => {
            var blob = message.data;
            this.currCallback(blob);
            console.log("onMessage callback");
        };

        worker.postMessage({
            command: 'init',
            config: {
              sampleRate: this.source.context.sampleRate,
            }
        });

        /**
         * The onaudioprocess event handler of the ScriptProcessorNode interface. It is the EventHandler to be
         * called for the audioprocess event that is dispatched to ScriptProcessorNode node types.
         */
        this.node.onaudioprocess = (audioProcessingEvent) => {
            if (!this.recording) {
            return;
            }
            worker.postMessage({
            command: 'record',
            buffer: [
                audioProcessingEvent.inputBuffer.getChannelData(0),
            ]
            });
            this.analyse();
        };
    
        this.analyser = this.source.context.createAnalyser();
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;
        this.analyser.smoothingTimeConstant = 0.85;
    
        this.source.connect(this.analyser);
        this.analyser.connect(this.node);
        this.node.connect(this.source.context.destination);
    }

    record = (onSilence, visualizer) => {
      this.silenceCallback = onSilence;
      //this.visualizationCallback = visualizer;
      this.start = Date.now();
      this.recording = true;
    };

    stop = () => {
      this.recording = false;
    };

    clear = () => {
      this.stop();
      worker.postMessage({command: 'clear'});
    };

    exportWAV = (callback, sampleRate) => {
      this.currCallback = callback;
      worker.postMessage({
        command: 'export',
        sampleRate: sampleRate
      });
    };

    /**
     * Checks the time domain data to see if the amplitude of the audio waveform is more than
     * the silence threshold. If it is, "noise" has been detected and it resets the start time.
     * If the elapsed time reaches the time threshold the silence callback is called. If there is a 
     * visualizationCallback it invokes the visualization callback with the time domain data.
     */
    analyse = () => {
      this.analyser.fftSize = 2048;
      var bufferLength = this.analyser.fftSize;
      var dataArray = new Uint8Array(bufferLength);
      var amplitude = this.silenceDetectionConfig.amplitude;
      var time = this.silenceDetectionConfig.time;

      this.analyser.getByteTimeDomainData(dataArray);

      if (typeof this.visualizationCallback === 'function') {
        this.visualizationCallback(dataArray, bufferLength);
      }

      for (var i = 0; i < bufferLength; i++) {
        // Normalize between -1 and 1.
        var curr_value_time = (dataArray[i] / 128) - 1.0;
        if (curr_value_time > amplitude || curr_value_time < (-1 * amplitude)) {
          this.start = Date.now();
        }
      }
      var newtime = Date.now();
      var elapsedTime = newtime - this.start;
      if (elapsedTime > time) {
        this.silenceCallback();
      }
    };

  };