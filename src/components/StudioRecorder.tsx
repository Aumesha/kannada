import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Volume2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import {
  AudioFilterSettings,
  FilterPresetKey,
  RecordingItem,
  AppLanguage,
} from '../types/index';
import { translations } from '../locales/translations';
import { AudioRecordingEngine, LiveAudioState } from '../utils/audioEngine';
import { formatDuration, getDefaultFilterSettings } from '../utils/audioUtils';
import { saveRecording } from '../utils/storage';
import { AudioVisualizer } from './AudioVisualizer';
import { AudioSettingsModal } from './AudioSettingsModal';

interface StudioRecorderProps {
  language: AppLanguage;
  onRecordingSaved: () => void;
}

export const StudioRecorder: React.FC<StudioRecorderProps> = ({
  language,
  onRecordingSaved,
}) => {
  const t = translations[language];

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [liveAudioState, setLiveAudioState] = useState<LiveAudioState | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Filter settings
  const [settings, setSettings] = useState<AudioFilterSettings>(() =>
    getDefaultFilterSettings('ultra')
  );
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const engineRef = useRef<AudioRecordingEngine | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Sync settings with engine if active
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateSettings(settings);
    }
  }, [settings]);

  // Timer counter
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerIntervalRef.current = window.setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording, isPaused]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: FilterPresetKey) => {
    setSettings(getDefaultFilterSettings(preset));
  };

  // Start Recording
  const handleStartRecording = async () => {
    setErrorMsg(null);
    setSaveToast(null);

    try {
      const engine = new AudioRecordingEngine(settings);
      engineRef.current = engine;

      await engine.start((state) => {
        setLiveAudioState(state);
      });

      setIsRecording(true);
      setIsPaused(false);
      setDurationSeconds(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Error starting recording:', msg);
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setErrorMsg(
          language === 'kn'
            ? 'ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿಯನ್ನು ಅನುಮತಿಸಿ (Microphone permission needed).'
            : 'Please grant microphone access in browser permissions.'
        );
      } else {
        setErrorMsg(
          language === 'kn'
            ? `ಮೈಕ್ ರೆಕಾರ್ಡಿಂಗ್ ಆರಂಭಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ: ${msg}`
            : `Unable to access microphone: ${msg}`
        );
      }
    }
  };

  // Pause Recording
  const handlePause = () => {
    if (engineRef.current && isRecording && !isPaused) {
      engineRef.current.pause();
      setIsPaused(true);
    }
  };

  // Resume Recording
  const handleResume = () => {
    if (engineRef.current && isRecording && isPaused) {
      engineRef.current.resume();
      setIsPaused(false);
    }
  };

  // Stop & Save
  const handleStopAndSave = async () => {
    if (!engineRef.current || !isRecording) return;

    try {
      const { blob, duration, peaks, mimeType } = await engineRef.current.stop();
      engineRef.current = null;
      setIsRecording(false);
      setIsPaused(false);

      // Create item for in-app IndexedDB
      const timestamp = Date.now();
      const dateStr = new Date(timestamp).toLocaleDateString();
      const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const defaultTitle = language === 'kn'
        ? `ಧ್ವನಿ_ರೆಕಾರ್ಡ್_${timeStr}`
        : `Voice_Record_${dateStr}_${timeStr}`;

      const newItem: RecordingItem = {
        id: `rec_${timestamp}`,
        title: defaultTitle,
        blob,
        duration,
        sizeBytes: blob.size,
        mimeType,
        createdAt: timestamp,
        filterPreset: settings.preset,
        waveformPeaks: peaks,
      };

      await saveRecording(newItem);

      // Toast notification
      setSaveToast(t.savedToStorageSuccess);
      setTimeout(() => setSaveToast(null), 3500);

      onRecordingSaved();
    } catch (err: unknown) {
      console.error('Failed to save recording:', err);
      setErrorMsg(
        language === 'kn'
          ? 'ರೆಕಾರ್ಡಿಂಗ್ ಉಳಿಸುವಾಗ ತಪ್ಪು ಸಂಭವಿಸಿದೆ.'
          : 'Failed to save recording to in-app storage.'
      );
    }
  };

  // Discard
  const handleConfirmDiscard = () => {
    if (engineRef.current) {
      engineRef.current.discard();
      engineRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
    setDurationSeconds(0);
    setShowDiscardConfirm(false);
    setLiveAudioState(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-600/60 text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-800 text-rose-200 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Studio Monitor Card */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Glow behind visualizer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Top bar: Status & Duration */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isRecording
                  ? isPaused
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-500 animate-ping'
                  : 'bg-slate-600'
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {isRecording
                ? isPaused
                  ? t.recordingPaused
                  : t.recordingInProgress
                : t.readyToRecord}
            </span>
          </div>

          {/* Large Studio Timer Display */}
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-widest bg-slate-950/80 px-4 py-1 rounded-xl border border-slate-800">
            {formatDuration(durationSeconds)}
          </div>
        </div>

        {/* Live Waveform Oscilloscope Visualizer */}
        <AudioVisualizer
          timeDomainData={liveAudioState?.timeDomainData || null}
          frequencyData={liveAudioState?.frequencyData || null}
          isVoiceActive={liveAudioState?.isVoiceActive || false}
          isRecording={isRecording && !isPaused}
          noiseGateThresholdDb={settings.noiseGateThresholdDb}
        />

        {/* VU Level Meter & Noise Gate Indicator */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              {t.micInputLevel}:
              <strong className="text-slate-200 font-mono ml-1">
                {liveAudioState ? `${liveAudioState.currentDb} dB` : '-∞ dB'}
              </strong>
            </span>

            {/* Noise Gate Shield Status */}
            <span className="flex items-center gap-1.5 text-[11px] font-medium">
              <ShieldCheck
                className={`w-3.5 h-3.5 ${
                  liveAudioState?.isVoiceActive
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              />
              <span
                className={
                  liveAudioState?.isVoiceActive
                    ? 'text-emerald-300 font-semibold'
                    : 'text-slate-400'
                }
              >
                {liveAudioState?.isVoiceActive
                  ? t.voiceDetected
                  : t.silenceFiltered}
              </span>
            </span>
          </div>

          {/* VU Meter Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800 flex">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                (liveAudioState?.meterPercent || 0) > 85
                  ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
              }`}
              style={{ width: `${liveAudioState?.meterPercent || 2}%` }}
            />
          </div>
        </div>

        {/* Primary Action Controls */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          {!isRecording ? (
            /* Start Recording Button */
            <button
              onClick={handleStartRecording}
              className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 hover:from-cyan-500 hover:via-blue-500 hover:to-emerald-500 text-white font-bold text-base shadow-xl shadow-cyan-600/30 active:scale-95 transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span>{t.startRecording}</span>
            </button>
          ) : (
            /* Recording active controls */
            <>
              {/* Pause / Resume */}
              {isPaused ? (
                <button
                  onClick={handleResume}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md active:scale-95 transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{t.resumeRecording}</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 shadow-md active:scale-95 transition"
                >
                  <Pause className="w-4 h-4" />
                  <span>{t.pauseRecording}</span>
                </button>
              )}

              {/* Stop & Save */}
              <button
                onClick={handleStopAndSave}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 active:scale-95 transition"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>{t.stopAndSave}</span>
              </button>

              {/* Discard */}
              <button
                onClick={() => setShowDiscardConfirm(true)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-medium text-xs border border-rose-800/50 active:scale-95 transition"
                title={t.discardRecording}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.discardRecording}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Voice Isolation Filter Presets Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            {t.filterLabel}
          </label>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 py-1 px-2.5 rounded-lg hover:bg-slate-800 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.tuneFiltersBtn}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Preset 1: Ultra Noise Cutoff */}
          <button
            onClick={() => handleSelectPreset('ultra')}
            disabled={isRecording}
            className={`p-3.5 rounded-2xl text-left border transition relative flex flex-col justify-between ${
              settings.preset === 'ultra'
                ? 'bg-cyan-950/50 border-cyan-500/80 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            } ${isRecording ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {t.presetUltraTitle}
                </span>
                {settings.preset === 'ultra' && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {t.presetUltraDesc}
              </p>
            </div>
            <div className="mt-2 text-[10px] font-mono text-cyan-300">
              Cut: 110Hz | Gate: -38dB
            </div>
          </button>

          {/* Preset 2: Studio Clarity */}
          <button
            onClick={() => handleSelectPreset('studio')}
            disabled={isRecording}
            className={`p-3.5 rounded-2xl text-left border transition relative flex flex-col justify-between ${
              settings.preset === 'studio'
                ? 'bg-emerald-950/50 border-emerald-500/80 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            } ${isRecording ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {t.presetStudioTitle}
                </span>
                {settings.preset === 'studio' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {t.presetStudioDesc}
              </p>
            </div>
            <div className="mt-2 text-[10px] font-mono text-emerald-300">
              Cut: 85Hz | Gate: -44dB
            </div>
          </button>

          {/* Preset 3: Meeting & Speech */}
          <button
            onClick={() => handleSelectPreset('lecture')}
            disabled={isRecording}
            className={`p-3.5 rounded-2xl text-left border transition relative flex flex-col justify-between ${
              settings.preset === 'lecture'
                ? 'bg-amber-950/50 border-amber-500/80 shadow-md shadow-amber-950/50 ring-1 ring-amber-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            } ${isRecording ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  {t.presetLectureTitle}
                </span>
                {settings.preset === 'lecture' && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {t.presetLectureDesc}
              </p>
            </div>
            <div className="mt-2 text-[10px] font-mono text-amber-300">
              Cut: 95Hz | Gate: -48dB
            </div>
          </button>
        </div>
      </div>

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              {t.discardTitle}
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              {t.confirmDiscard}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {t.discardCancel}
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow"
              >
                {t.discardYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fine-Tuning Modal */}
      <AudioSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        language={language}
      />
    </div>
  );
};
