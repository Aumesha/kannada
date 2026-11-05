import { AudioFilterSettings, FilterPresetKey } from '../types/index';

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Formats raw byte size into human readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${val} ${sizes[i]}`;
}

/**
 * Converts RMS audio amplitude into Decibels (dB)
 * typically -Infinity to 0 dBFS
 */
export function calculateDecibelsFromRms(rms: number): number {
  if (rms <= 0.00001) return -100;
  return 20 * Math.log10(rms);
}

/**
 * Computes RMS from raw 8-bit time-domain data (Uint8Array [0..255])
 */
export function computeRmsFromTimeDomain(timeData: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < timeData.length; i++) {
    // Normalizing from 0..255 to -1..1
    const normalized = (timeData[i] - 128) / 128;
    sum += normalized * normalized;
  }
  return Math.sqrt(sum / timeData.length);
}

/**
 * Clamps dB level to a 0% - 100% meter percentage
 */
export function decibelsToPercentage(db: number, minDb = -60, maxDb = 0): number {
  if (db <= minDb) return 0;
  if (db >= maxDb) return 100;
  return Math.round(((db - minDb) / (maxDb - minDb)) * 100);
}

/**
 * Downsamples audio peaks into a fixed number of bars for compact waveform visualization
 */
export function downsamplePeaks(rawValues: number[], targetCount = 48): number[] {
  if (rawValues.length === 0) {
    return new Array(targetCount).fill(0.1);
  }
  if (rawValues.length <= targetCount) {
    // Pad with last or zero
    const result = [...rawValues];
    while (result.length < targetCount) {
      result.push(result[result.length - 1] ?? 0.1);
    }
    return result;
  }

  const blockSize = Math.floor(rawValues.length / targetCount);
  const peaks: number[] = [];

  for (let i = 0; i < targetCount; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, rawValues.length);
    let max = 0;
    for (let j = start; j < end; j++) {
      if (rawValues[j] > max) max = rawValues[j];
    }
    peaks.push(Math.max(0.08, Math.min(1.0, max)));
  }

  return peaks;
}

/**
 * Factory for presets
 */
export function getDefaultFilterSettings(preset: FilterPresetKey): AudioFilterSettings {
  switch (preset) {
    case 'ultra':
      return {
        preset: 'ultra',
        noiseGateEnabled: true,
        noiseGateThresholdDb: -38, // Stricter gate threshold
        highPassCutoffHz: 110,     // Steeper low-cut
        lowPassCutoffHz: 7500,
        vocalBoostGainDb: 4.5,
        compressorRatio: 5.0,
      };
    case 'studio':
      return {
        preset: 'studio',
        noiseGateEnabled: true,
        noiseGateThresholdDb: -44, // Gentle gate
        highPassCutoffHz: 85,
        lowPassCutoffHz: 8000,
        vocalBoostGainDb: 3.5,
        compressorRatio: 4.0,
      };
    case 'lecture':
      return {
        preset: 'lecture',
        noiseGateEnabled: true,
        noiseGateThresholdDb: -48, // More sensitive for distant voices
        highPassCutoffHz: 95,
        lowPassCutoffHz: 7200,
        vocalBoostGainDb: 5.0,
        compressorRatio: 6.0,
      };
    case 'custom':
    default:
      return {
        preset: 'custom',
        noiseGateEnabled: true,
        noiseGateThresholdDb: -42,
        highPassCutoffHz: 90,
        lowPassCutoffHz: 8000,
        vocalBoostGainDb: 4.0,
        compressorRatio: 4.5,
      };
  }
}
