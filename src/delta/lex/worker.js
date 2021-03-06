export default () => {
  var recLength = 0;
  var recBuffer = [];
  var recordSampleRate = 0;

  const messageHandler = [];
  messageHandler['init'] = (data) => init(data);
  messageHandler['record'] = (data) => record(data);
  messageHandler['export'] = (data) => exportBuffer(data);
  messageHandler['clear'] = (data) => clear();
  onmessage = (event) => messageHandler[event.data.command]?messageHandler[event.data.command](event.data):console.log(`no handler for ${event.data.command}`);
  
  const init = (data) => {
    recordSampleRate = data.config.sampleRate;
  }

  const record = (data) => {
    recBuffer.push(data.buffer[0]);
    recLength += data.buffer[0].length;
  }

  const exportBuffer = (data) => {
    var mergedBuffers = mergeBuffers(recBuffer, recLength);
    var downsampledBuffer = downsampleBuffer(mergedBuffers, data.sampleRate);
    var encodedWav = encodeWAV(downsampledBuffer);
    var audioBlob = new Blob([encodedWav], {type: 'application/octet-stream'});
    postMessage(audioBlob);
  }

  const clear = () => {
    recLength = 0;
    recBuffer = [];
  }

  const downsampleBuffer = (buffer, exportSampleRate) => {
    if (exportSampleRate === recordSampleRate) {
      return buffer;
    }
    var sampleRateRatio = recordSampleRate / exportSampleRate;
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Float32Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    while (offsetResult < result.length) {
      var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      var accum = 0,
        count = 0;
      for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  const mergeBuffers = (bufferArray, recLength) => {
    var result = new Float32Array(recLength);
    var offset = 0;
    for (var i = 0; i < bufferArray.length; i++) {
      result.set(bufferArray[i], offset);
      offset += bufferArray[i].length;
    }
    return result;
  }

  const floatTo16BitPCM = (output, offset, input) => {
    for (var i = 0; i < input.length; i++, offset += 2) {
      var s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }

  const writeString = (view, offset, string) => {
    for (var i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  const encodeWAV = (samples) => {
    var buffer = new ArrayBuffer(44 + samples.length * 2);
    var view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 32 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, recordSampleRate, true);
    view.setUint32(28, recordSampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    floatTo16BitPCM(view, 44, samples);

    return view;
  }



}

export class WebWorker {
  constructor(worker) {
    const code = worker.toString();
    const blob = new Blob(["(" + code + ")()"]);
    return new Worker(URL.createObjectURL(blob));
  }
}