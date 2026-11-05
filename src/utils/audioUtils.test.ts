import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDuration,
  formatBytes,
  calculateDecibelsFromRms,
  decibelsToPercentage,
  downsamplePeaks,
  getDefaultFilterSettings,
} from './audioUtils';

test('formatDuration formats seconds to MM:SS and HH:MM:SS', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(45), '00:45');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(3665), '01:01:05');
  assert.equal(formatDuration(-10), '00:00');
});

test('formatBytes converts bytes to human-readable strings', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1024 * 1024 * 2.5), '2.5 MB');
});

test('calculateDecibelsFromRms calculates dB values correctly', () => {
  assert.equal(calculateDecibelsFromRms(1.0), 0); // 0 dBFS for full amplitude
  assert.ok(calculateDecibelsFromRms(0.5) < 0);
  assert.equal(calculateDecibelsFromRms(0.000001), -100);
});

test('decibelsToPercentage clamps within 0 to 100', () => {
  assert.equal(decibelsToPercentage(-70, -60, 0), 0);
  assert.equal(decibelsToPercentage(5, -60, 0), 100);
  assert.equal(decibelsToPercentage(-30, -60, 0), 50);
});

test('downsamplePeaks produces exact targetCount array with values between 0.08 and 1.0', () => {
  const raw = [0.1, 0.4, 0.8, 0.2, 0.9, 0.3, 0.5, 0.7];
  const peaks = downsamplePeaks(raw, 4);
  assert.equal(peaks.length, 4);
  for (const p of peaks) {
    assert.ok(p >= 0.08 && p <= 1.0);
  }
});

test('getDefaultFilterSettings returns complete config for presets', () => {
  const ultra = getDefaultFilterSettings('ultra');
  assert.equal(ultra.preset, 'ultra');
  assert.equal(ultra.noiseGateEnabled, true);
  assert.ok(ultra.highPassCutoffHz >= 80);

  const studio = getDefaultFilterSettings('studio');
  assert.equal(studio.preset, 'studio');
  assert.ok(studio.vocalBoostGainDb > 0);
});
