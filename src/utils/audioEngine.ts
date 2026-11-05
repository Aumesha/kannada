import { AudioFilterSettings, RecordingItem } from '../types/index';
import { calculateDecibelsFromRms, computeRmsFromTimeDomain, downsamplePeaks } from './audioUtils';

export interface LiveAudioState {
  currentDb: number;
  meterPercent: number;
  isVoiceActive: boolean;
  timeDomainData: Uint8Array<ArrayBuffer>;
  frequencyData: Uint8Array<ArrayBuffer>;
}

export class AudioRecordingEngine {
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private highPassFilter: BiquadFilterNode | null = null;
  private lowPassFilter: BiquadFilterNode | null = null;
  private vocalPresenceFilter: BiquadFilterNode | null = null;
  private gateGainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;

  private recordedChunks: Blob[] = [];
  private livePeaks: number[] = [];
  private animationFrameId: number | null = null;
  private onStateUpdateCallback: ((state: LiveAudioState) => void) | null = null;
  private startTime = 0;
  private pauseTime = 0;
  private totalPausedDuration = 0;
  private settings: AudioFilterSettings;

  constructor(settings: AudioFilterSettings) {
    this.settings = settings;
  }

  public updateSettings(newSettings: AudioFilterSettings) {
    this.settings = newSettings;
    if (this.audioContext && this.highPassFilter && this.lowPassFilter && this.vocalPresenceFilter && this.compressorNode) {
      const now = this.audioContext.currentTime;
      this.highPassFilter.frequency.setTargetAtTime(newSettings.highPassCutoffHz, now, 0.05);
      this.lowPassFilter.frequency.setTargetAtTime(newSettings.lowPassCutoffHz, now, 0.05);
      this.vocalPresenceFilter.gain.setTargetAtTime(newSettings.vocalBoostGainDb, now, 0.05);
      this.compressorNode.ratio.setTargetAtTime(newSettings.compressorRatio, now, 0.05);
    }
  }

  public async start(onUpdate: (state: LiveAudioState) => void): Promise<void> {
    this.onStateUpdateCallback = onUpdate;
    this.recordedChunks = [];
    this.livePeaks = [];
    this.totalPausedDuration = 0;

    // 1. Acquire mic with hardware noise suppression & echo cancellation
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true },
        channelCount: 1,
        sampleRate: { ideal: 48000 },
      },
      video: false,
    });
    this.micStream = stream;

    // 2. Initialize AudioContext
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioContext = new AudioCtx({ sampleRate: 48000 });
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const ctx = this.audioContext;
    this.sourceNode = ctx.createMediaStreamSource(stream);

    // 3. High-Pass Filter (removes rumble, traffic, wind, handling noise)
    this.highPassFilter = ctx.createBiquadFilter();
    this.highPassFilter.type = 'highpass';
    this.highPassFilter.frequency.setValueAtTime(this.settings.highPassCutoffHz, ctx.currentTime);
    this.highPassFilter.Q.setValueAtTime(0.707, ctx.currentTime);

    // 4. Low-Pass Filter (cuts electrical hiss)
    this.lowPassFilter = ctx.createBiquadFilter();
    this.lowPassFilter.type = 'lowpass';
    this.lowPassFilter.frequency.setValueAtTime(this.settings.lowPassCutoffHz, ctx.currentTime);

    // 5. Vocal Presence Filter (enhances vocal intelligibility)
    this.vocalPresenceFilter = ctx.createBiquadFilter();
    this.vocalPresenceFilter.type = 'peaking';
    this.vocalPresenceFilter.frequency.setValueAtTime(2800, ctx.currentTime);
    this.vocalPresenceFilter.Q.setValueAtTime(1.2, ctx.currentTime);
    this.vocalPresenceFilter.gain.setValueAtTime(this.settings.vocalBoostGainDb, ctx.currentTime);

    // 6. Dynamic Noise Gate Gain Node
    this.gateGainNode = ctx.createGain();
    this.gateGainNode.gain.setValueAtTime(1.0, ctx.currentTime);

    // 7. Multiband Dynamics Compressor
    this.compressorNode = ctx.createDynamicsCompressor();
    this.compressorNode.threshold.setValueAtTime(-24, ctx.currentTime);
    this.compressorNode.knee.setValueAtTime(12, ctx.currentTime);
    this.compressorNode.ratio.setValueAtTime(this.settings.compressorRatio, ctx.currentTime);
    this.compressorNode.attack.setValueAtTime(0.003, ctx.currentTime);
    this.compressorNode.release.setValueAtTime(0.15, ctx.currentTime);

    // 8. Visualizer & Measurement Analyser
    this.analyserNode = ctx.createAnalyser();
    this.analyserNode.fftSize = 512;
    this.analyserNode.smoothingTimeConstant = 0.75;

    // 9. Output Destination for MediaRecorder
    this.destinationNode = ctx.createMediaStreamDestination();

    // Wiring Audio Graph:
    // Source -> HighPass -> LowPass -> VocalPresence -> GateGain -> Compressor -> Destination & Analyser
    this.sourceNode.connect(this.highPassFilter);
    this.highPassFilter.connect(this.lowPassFilter);
    this.lowPassFilter.connect(this.vocalPresenceFilter);
    this.vocalPresenceFilter.connect(this.gateGainNode);
    this.gateGainNode.connect(this.compressorNode);

    // Send filtered audio to recorder destination
    this.compressorNode.connect(this.destinationNode);
    // Send to analyser for live visualization
    this.compressorNode.connect(this.analyserNode);

    // 10. Setup MediaRecorder with best supported mimeType
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];
    let selectedMimeType = '';
    for (const mime of mimeTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
        selectedMimeType = mime;
        break;
      }
    }

    this.mediaRecorder = new MediaRecorder(this.destinationNode.stream, {
      mimeType: selectedMimeType || undefined,
      audioBitsPerSecond: 128000,
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(250); // Timeslice 250ms
    this.startTime = Date.now();

    // 11. Start live processing / visualizer loop
    this.startProcessingLoop();
  }

  public pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.pauseTime = Date.now();
    }
  }

  public resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      if (this.pauseTime > 0) {
        this.totalPausedDuration += Date.now() - this.pauseTime;
        this.pauseTime = 0;
      }
    }
  }

  public async stop(): Promise<{ blob: Blob; duration: number; peaks: number[]; mimeType: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder is not active'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const rawMime = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type: rawMime });
        
        let calculatedDuration = (Date.now() - this.startTime - this.totalPausedDuration) / 1000;
        if (calculatedDuration < 0.1) calculatedDuration = 0.1;

        const finalPeaks = downsamplePeaks(this.livePeaks, 48);

        this.cleanup();
        resolve({
          blob,
          duration: calculatedDuration,
          peaks: finalPeaks,
          mimeType: rawMime,
        });
      };

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      } else {
        this.mediaRecorder.onstop(new Event('stop'));
      }
    });
  }

  public discard(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  private startProcessingLoop() {
    if (!this.analyserNode || !this.audioContext) return;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const timeDomainArray = new Uint8Array(bufferLength);
    const frequencyArray = new Uint8Array(bufferLength);

    const checkLevel = () => {
      if (!this.analyserNode || !this.audioContext) return;

      this.analyserNode.getByteTimeDomainData(timeDomainArray);
      this.analyserNode.getByteFrequencyData(frequencyArray);

      // Compute RMS & dB
      const rms = computeRmsFromTimeDomain(timeDomainArray);
      const db = calculateDecibelsFromRms(rms);

      // Noise Gate logic
      const isVoiceActive = db >= this.settings.noiseGateThresholdDb;

      if (this.settings.noiseGateEnabled && this.gateGainNode) {
        const now = this.audioContext.currentTime;
        if (isVoiceActive) {
          // Open gate rapidly
          this.gateGainNode.gain.setTargetAtTime(1.0, now, 0.008);
        } else {
          // Attenuate background noise down by ~26dB smoothly
          this.gateGainNode.gain.setTargetAtTime(0.05, now, 0.08);
        }
      }

      // Record peak for waveform
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.livePeaks.push(rms * 2.5);
      }

      // Meter percentage: -60dB to 0dB range
      let meterPercent = 0;
      if (db > -60) {
        meterPercent = Math.min(100, Math.max(0, Math.round(((db + 60) / 60) * 100)));
      }

      if (this.onStateUpdateCallback) {
        this.onStateUpdateCallback({
          currentDb: Math.round(db),
          meterPercent,
          isVoiceActive,
          timeDomainData: timeDomainArray,
          frequencyData: frequencyArray,
        });
      }

      this.animationFrameId = requestAnimationFrame(checkLevel);
    };

    this.animationFrameId = requestAnimationFrame(checkLevel);
  }

  private cleanup() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    this.sourceNode = null;
    this.highPassFilter = null;
    this.lowPassFilter = null;
    this.vocalPresenceFilter = null;
    this.gateGainNode = null;
    this.compressorNode = null;
    this.analyserNode = null;
    this.destinationNode = null;
    this.mediaRecorder = null;
  }
}
