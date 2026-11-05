export type FilterPresetKey = 'ultra' | 'studio' | 'lecture' | 'custom';

export interface AudioFilterSettings {
  preset: FilterPresetKey;
  noiseGateEnabled: boolean;
  noiseGateThresholdDb: number; // e.g. -42 dB
  highPassCutoffHz: number;     // e.g. 85 Hz (cuts low rumbles/wind/fans)
  lowPassCutoffHz: number;      // e.g. 7800 Hz (cuts electrical hissing)
  vocalBoostGainDb: number;     // e.g. +3.5 dB (enhances voice intelligibility)
  compressorRatio: number;      // e.g. 4.0
}

export interface RecordingItem {
  id: string;
  title: string;
  blob: Blob;
  duration: number; // in seconds
  sizeBytes: number;
  mimeType: string;
  createdAt: number;
  filterPreset: FilterPresetKey;
  waveformPeaks: number[]; // normalized 0-1 peak heights for visualization
}

export type AppLanguage = 'kn' | 'en';
