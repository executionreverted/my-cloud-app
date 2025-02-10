class Processor extends AudioWorkletProcessor {
  process([input], [output]) {
    // Copy inputs to outputs.
    output[0].set(input[0]);

    // Check if port is available before posting message
    if (this.port) {
      this.port.postMessage({ audioData: output[0].buffer });
    } else {
      console.error("Port is not available for messaging");
    }
    
    return true;
  }
}

registerProcessor("processor", Processor);
