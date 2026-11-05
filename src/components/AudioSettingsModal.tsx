import React from 'react';
import { Sliders, X, RotateCcw, Volume2, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { AudioFilterSettings, AppLanguage } from '../types/index';
import { translations } from '../locales/translations';
import { getDefaultFilterSettings } from '../utils/audioUtils';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioFilterSettings;
  onSaveSettings: (settings: AudioFilterSettings) => void;
  language: AppLanguage;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  language,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const handleGateChange = (val: number) => {
    onSaveSettings({
      ...settings,
      preset: 'custom',
      noiseGateThresholdDb: val,
    });
  };

  const handleHighPassChange = (val: number) => {
    onSaveSettings({
      ...settings,
      preset: 'custom',
      highPassCutoffHz: val,
    });
  };

  const handleVocalBoostChange = (val: number) => {
    onSaveSettings({
      ...settings,
      preset: 'custom',
      vocalBoostGainDb: val,
    });
  };

  const handleResetDefaults = () => {
    onSaveSettings(getDefaultFilterSettings('ultra'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {t.audioSettingsTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'kn' ? 'ಉತ್ತಮ ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್‌ಗಾಗಿ ನಿಖರ ಸೆಟ್ಟಿಂಗ್ಸ್' : 'Fine-tune DSP parameters'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders Container */}
        <div className="mt-5 space-y-6">
          {/* 1. Noise Gate Threshold */}
          <div className="rounded-xl p-4 bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                {t.noiseGateThreshold}
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                {settings.noiseGateThresholdDb} dB
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              {t.noiseGateHelp}
            </p>
            <input
              type="range"
              min="-60"
              max="-25"
              step="1"
              value={settings.noiseGateThresholdDb}
              onChange={(e) => handleGateChange(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>-60 dB ({language === 'kn' ? 'ಹೆಚ್ಚು ಸೂಕ್ಷ್ಮ' : 'Sensitive'})</span>
              <span>-40 dB (ಸ್ಟುಡಿಯೋ)</span>
              <span>-25 dB ({language === 'kn' ? 'ಕಠಿಣ ಫಿಲ್ಟರ್' : 'Aggressive'})</span>
            </div>
          </div>

          {/* 2. Low-Cut Rumble Filter */}
          <div className="rounded-xl p-4 bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-emerald-400" />
                {t.lowCutFilter}
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                {settings.highPassCutoffHz} Hz
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              {t.lowCutHelp}
            </p>
            <input
              type="range"
              min="50"
              max="160"
              step="5"
              value={settings.highPassCutoffHz}
              onChange={(e) => handleHighPassChange(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>50 Hz</span>
              <span>85 Hz (ಆದರ್ಶ)</span>
              <span>160 Hz (ಗರಿಷ್ಠ)</span>
            </div>
          </div>

          {/* 3. Vocal Presence Peaking */}
          <div className="rounded-xl p-4 bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {t.vocalBoost}
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/50">
                +{settings.vocalBoostGainDb.toFixed(1)} dB
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              {t.vocalBoostHelp}
            </p>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={settings.vocalBoostGainDb}
              onChange={(e) => handleVocalBoostChange(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0 dB (ನ್ಯಾಚುರಲ್)</span>
              <span>+3.5 dB (ಸ್ಟುಡಿಯೋ ಸ್ಪಷ್ಟ)</span>
              <span>+8.0 dB (ಗರಿಷ್ಠ)</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-2 px-3 rounded-lg hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.resetDefaults}
          </button>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
