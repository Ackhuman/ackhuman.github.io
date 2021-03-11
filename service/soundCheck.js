import { contextOptions } from './wavRecording.service.js';
import { DeviceService } from './device.service.js';
import { DialogService } from './dialog.service.js';
import { SoundProfileService } from './soundProfile.service.js';

export class SoundCheckService {
    _audioContext = null;
    _analyzer = null;
    _profileService = null;
    constructor() {
        _profileService = new SoundProfileService();
    }
    async onSoundCheckStarted() {        
        const fftSize = 1024;
        this._audioContext = new AudioContext(contextOptions);
        this._analyzer = this._audioContext.createAnalyser();
        this._analyzer.fftSize = fftSize;
        let sourceWorkletPromise = createSourceWorklet();
        let soundCheckWorkletPromise = createSoundCheckWorklet();
        this._audioContext.createBufferSource();
        let [src, soundCheckProcessor] = Promise.all([sourceWorkletPromise, soundCheckWorkletPromise])
        inputSource.connect(soundCheckProcessor);
        let statistics = performSoundCheck(soundCheckProcessor);
        if(statistics.normalPctPeaks > 0 || statistics.peakPctPeaks > 0.01) {
            getVolumeAlertConfig(Math.max(statistics.normalPctPeaks, statistics.peakPctPeaks));
        }
        return statistics;
    }
}

function performSoundCheck(soundCheckProcessor) {
    let statistics = {};
    soundCheckProcessor.port.onmessage = evt => Object.defineProperty(statistics, evt.data.eventType, { value: evt.data.value });
    let soundCheck = this.dialogConfigs.reduce((prev, config) =>
        prev.then(() => 
            startSoundCheckStep(soundCheckProcessor, config)
        ), 
        Promise.resolve({})
    );
    return soundCheck.then(function() {
        audioStream.getTracks().forEach(track => track.stop());
        soundCheckProcessor.port.postMessage({ eventType: "soundCheckComplete" });
        return statistics;
    });
}

function startSoundCheckStep(soundCheckProcessor, stepConfig) {
    stepConfig.onDialogOpened = analyzerStep(stepConfig.stepName, stepConfig.analysisFn);
    return DialogService.Prompt(stepConfig);
}

function createSourceWorklet() { 
    return DeviceService.GetMediaStream()
        .then(function(stream) {
            audioStream = stream;
            inputSource = audioContext.createMediaStreamSource(stream);
        });
}

function createSoundCheckWorklet() {
    return audioContext.audioWorklet.addModule('sound-check-processor.js')
        .then(function() {
            return new AudioWorkletNode(audioContext, 'sound-check-processor', { channelCount: 1 });
        });
}

function analyzerStep(stepName, analysisFn) {
    const buffer = new Float32Array(this._analyser.frequencyBinCount);
    const profile = new Float32Array(this._analyser.frequencyBinCount);
    let intervalMilliseconds = this._audioContext.sampleRate / fftSize;
    let observationCount = 0;
    return new Promise(resolve => {
        var token = setInterval(() => {
            this._analyzer.getFloatFrequencyData(buffer);
            analysisFn(buffer, profile, observationCount);
            observationCount++;
        }, intervalMilliseconds)
        setTimeout(() => {
            _profileService.addProfile(stepName, profile);
            clearInterval(token);
            resolve(profile);
        }, 2000);
    });
}
function roomToneAnalysis(buffer, profile) {
    buffer.forEach((freq, bucketIndex) => profile[bucketIndex] = profile[bucketIndex] * freq);
}

function voiceNormalAnalysis(buffer, profile, observationCount) {
    buffer.forEach((freq, bucketIndex) => {
        let newObservationCount = (observationCount + 1)
        let newPartialAverage = profile[bucketIndex] * (observationCount / newObservationCount);
        profile[bucketIndex] = newPartialAverage + (freq / newObservationCount);
    });
}

function voicePeakAnalysis(buffer, profile) {
    buffer.forEach((freq, bucketIndex) => profile[bucketIndex] = Math.max(profile[bucketIndex], freq));
}

dialogConfigs = [
    {
        title: 'Room tone',
        text: 'This wizard will help you configure your sound settings. <br/>'
            + 'The first step will collect your room tone. Please be as quiet as possible for a couple of seconds and then click OK to proceed.',
        choices: [
            {
                text: 'OK',
                cssClass: 'btn btn-primary',
                reject: false,
                value: true
            },
            {
                text: 'Cancel',
                cssClass: 'btn btn-secondary',
                reject: true,
                value: false
            }
        ],
        height: 250,
        stepName: 'roomTone',
        analysisFn: roomToneAnalysis
    },
    {
        title: 'Normal volume',
        text: 'This step will measure your normal volume. Speak like you normally would into your mic. Click OK when done.',
        choices: [
            {
                text: 'OK',
                cssClass: 'btn btn-primary',
                reject: false,
                value: true
            },
            {
                text: 'Cancel',
                cssClass: 'btn btn-secondary',
                reject: true,
                value: false
            }
        ],
        height:200,
        stepName: 'voiceNormal',
        analysisFn: voiceNormalAnalysis
    },
    {
        title: 'Peak volume',
        text: 'This step will measure your peak volume. Speak loudly into your mic. Click OK when done.',
        choices: [
            {
                text: 'OK',
                cssClass: 'btn btn-primary',
                reject: false,
                value: true
            },
            {
                text: 'Cancel',
                cssClass: 'btn btn-secondary',
                reject: true,
                value: false
            }
        ],
        stepName: 'voicePeak',
        analysisFn: voicePeakAnalysis
    }
];

function getVolumeAlertConfig(pctPeaks) { 
    return {
        title: 'Volume too high',
        text: `Your volume is ${pctPeaks * 100 > 1 ? 'far ' : ''}too high. Your audio peaked ${pctPeaks * 100}% of the time.
            Adjust your volume, or if you can't do that, move away from your mic.
            You should restart the sound check process afterward.`,
        choices: [
            {
                text: 'OK',
                cssClass: 'btn btn-primary',
                reject: true,
                value: true
            }
        ],
        stepName: 'voicePeak'
    }
}