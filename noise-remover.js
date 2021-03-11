class Compressor extends AudioWorkletProcessor {
    NUM_SAMPLES = 128;
    constructor() {
        super();
        this.port.onmessage = this.onMessage.bind(this);        
        this._buffer = new ArrayBuffer(this.NUM_SAMPLES * 2);
        this._view = new DataView(this._buffer);
    }
    //parameters
    isRecording = false;
    isSampling = false;
    profile = null;

    process (inputs, outputs, parameters) {
        if(this.profile){
            inputs.forEach((input, inputIndex) => {
                input.forEach((channel, channelIndex) => {
                    channel.forEach((sample, sampleIndex) => {
                        outputs[inputIndex][channelIndex][sampleIndex] = sample - this.profile[sampleIndex];
                    });
                });
            });
        }
        return true;
    }

    onMessage(evt) {
        switch(evt.data.eventType) {
            case('profile'):
                this.profile = evt.data.payload;
                break;
        }
    }
}
registerProcessor('noise-remover', Compressor);