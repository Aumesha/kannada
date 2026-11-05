import React, { useState, useEffect } from 'react';
import { Mic, ListMusic, ShieldCheck, WifiOff, Github, Sparkles } from 'lucide-react';
import { AppLanguage, RecordingItem } from './types/index';
import { translations } from './locales/translations';
import { Header } from './components/Header';
import { StudioRecorder } from './components/StudioRecorder';
import { RecordingsVault } from './components/RecordingsVault';
import { GithubApkModal } from './components/GithubApkModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { getAllRecordings, saveRecording } from './utils/storage';

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>('kn');
  const [activeTab, setActiveTab] = useState<'record' | 'vault'>('record');
  const [vaultRefreshTrigger, setVaultRefreshTrigger] = useState<number>(0);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);

  const t = translations[language];

  // Seed sample demonstration recording on first launch if vault is completely empty
  useEffect(() => {
    async function checkAndSeed() {
      try {
        const existing = await getAllRecordings();
        if (existing.length === 0) {
          // Generate a synthetic demonstration audio buffer (gentle 440Hz warm chime tone)
          const sampleRate = 44100;
          const duration = 2.5;
          const numSamples = Math.floor(sampleRate * duration);
          const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
          const view = new DataView(wavBuffer);

          // Write WAV header
          const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
              view.setUint8(offset + i, string.charCodeAt(i));
            }
          };

          writeString(0, 'RIFF');
          view.setUint32(4, 36 + numSamples * 2, true);
          writeString(8, 'WAVE');
          writeString(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true); // PCM
          view.setUint16(22, 1, true); // Mono
          view.setUint32(24, sampleRate, true);
          view.setUint32(28, sampleRate * 2, true);
          view.setUint16(32, 2, true);
          view.setUint16(34, 16, true);
          writeString(36, 'data');
          view.setUint32(40, numSamples * 2, true);

          // Generate gentle sound
          for (let i = 0; i < numSamples; i++) {
            const time = i / sampleRate;
            const envelope = Math.exp(-time * 1.5);
            // 440Hz fundamental + 880Hz harmonic
            const sample = Math.sin(2 * Math.PI * 440 * time) * 0.6 + Math.sin(2 * Math.PI * 880 * time) * 0.2;
            const intSample = Math.max(-1, Math.min(1, sample * envelope)) * 32767;
            view.setInt16(44 + i * 2, intSample, true);
          }

          const demoBlob = new Blob([wavBuffer], { type: 'audio/wav' });
          const seedItem: RecordingItem = {
            id: 'sample_crystal_voice_welcome',
            title: 'ಧ್ವನಿ ಸ್ಪಷ್ಟ - ಸ್ವಾಗತ ರೆಕಾರ್ಡಿಂಗ್ (ಡೆಮೋ)',
            blob: demoBlob,
            duration: 2.5,
            sizeBytes: demoBlob.size,
            mimeType: 'audio/wav',
            createdAt: Date.now() - 3600000,
            filterPreset: 'ultra',
            waveformPeaks: [
              0.2, 0.4, 0.8, 0.9, 0.7, 0.5, 0.4, 0.3,
              0.25, 0.2, 0.18, 0.15, 0.12, 0.1, 0.08, 0.08,
            ],
          };

          await saveRecording(seedItem);
          setVaultRefreshTrigger((prev) => prev + 1);
        }
      } catch (e) {
        console.error('Seed demo error:', e);
      }
    }

    checkAndSeed();
  }, []);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'kn' ? 'en' : 'kn'));
  };

  const handleRecordingSaved = () => {
    setVaultRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onOpenGithubModal={() => setIsGithubModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:py-7 flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab('record')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'record'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{t.recordTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'vault'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListMusic className="w-4 h-4" />
              <span>{t.vaultTab}</span>
            </button>
          </div>
        </div>

        {/* Tab View */}
        <div className="flex-1">
          {activeTab === 'record' ? (
            <StudioRecorder
              language={language}
              onRecordingSaved={handleRecordingSaved}
            />
          ) : (
            <RecordingsVault
              language={language}
              refreshTrigger={vaultRefreshTrigger}
            />
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'kn'
                ? 'ಯಾವುದೇ ಕ್ಲೌಡ್ ಅಪ್‌ಲೋಡ್ ಇಲ್ಲ — ಸಂಪೂರ್ಣ ಆಫ್‌ಲೈನ್ ಆಂತರಿಕ ಭದ್ರತೆ'
                : 'Zero cloud upload — 100% private offline sandboxed storage'}
            </span>
          </div>
          <button
            onClick={() => setIsGithubModalOpen(true)}
            className="text-cyan-400 hover:underline flex items-center gap-1"
          >
            <Github className="w-3.5 h-3.5" />
            <span>{language === 'kn' ? 'GitHub APK ವರ್ಕ್‌ಫ್ಲೋ' : 'GitHub APK Workflow'}</span>
          </button>
        </div>
      </footer>

      {/* GitHub APK Workflow Modal */}
      <GithubApkModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        language={language}
      />

      {/* Offline Toast Indicator */}
      <OfflineIndicator language={language} />
    </div>
  );
}
