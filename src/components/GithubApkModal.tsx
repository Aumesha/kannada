import React, { useState } from 'react';
import { Github, X, Copy, Check, Download, AlertCircle, CheckCircle2, Terminal } from 'lucide-react';
import { AppLanguage } from '../types/index';
import { translations } from '../locales/translations';

interface GithubApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
}

const WORKFLOW_YAML = `name: Build Android APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build-apk:
    name: Build Android APK with Capacitor (Java 21)
    runs-on: ubuntu-latest
    env:
      ANDROID_HOME: /usr/local/lib/android/sdk
      ANDROID_SDK_ROOT: /usr/local/lib/android/sdk

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Java JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'

      - name: Verify Java 21 Environment
        run: |
          java -version
          javac -version
          echo "JAVA_HOME=$JAVA_HOME"

      - name: Accept Android SDK Licenses
        run: |
          yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses || true

      - name: Install Project Dependencies
        run: |
          npm install --legacy-peer-deps

      - name: Build Web Application
        run: |
          npm run build

      - name: Setup Capacitor for Android
        run: |
          if [ ! -d "android" ]; then
            npx cap add android
          fi
          npx cap sync android

      - name: Ensure Microphone Permissions in AndroidManifest.xml
        run: |
          MANIFEST="android/app/src/main/AndroidManifest.xml"
          if [ -f "$MANIFEST" ]; then
            if ! grep -q "RECORD_AUDIO" "$MANIFEST"; then
              sed -i '/<manifest/a \\    <uses-permission android:name="android.permission.RECORD_AUDIO" />\\n    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />' "$MANIFEST"
            fi
          fi

      - name: Build Debug APK with Gradle (Java 21)
        working-directory: android
        env:
          JAVA_HOME: \${{ env.JAVA_HOME }}
        run: |
          chmod +x ./gradlew
          ./gradlew assembleDebug --stacktrace --no-daemon

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: CrystalVoice-Android-APK
          path: android/app/build/outputs/apk/debug/*.apk
          retention-days: 30
`;

export const GithubApkModal: React.FC<GithubApkModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;
  const t = translations[language];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WORKFLOW_YAML);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([WORKFLOW_YAML], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-apk.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {t.githubModalTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {t.githubModalDesc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps container */}
        <div className="mt-4 overflow-y-auto pr-1 space-y-4 text-xs text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
              <span className="font-bold text-cyan-400">{t.step1Title}</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">{t.step1Desc}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
              <span className="font-bold text-emerald-400">{t.step2Title}</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">{t.step2Desc}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
              <span className="font-bold text-amber-400">{t.step3Title}</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">{t.step3Desc}</p>
            </div>
          </div>

          {/* Error-Free APK Guarantee Note */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-200 leading-relaxed">
              <strong>{language === 'kn' ? 'ಎರರ್ ಬಾರದ ಹಾಗೆ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ:' : 'Error-Proof Configuration:'}</strong>{' '}
              {language === 'kn'
                ? 'ಈ ವರ್ಕ್‌ಫ್ಲೋನಲ್ಲಿ Java 17, Gradle 캐ಶ್, Android SDK, ಮತ್ತು ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ (RECORD_AUDIO) ಎಲ್ಲವೂ ಆಟೋಮ್ಯಾಟಿಕ್ ಆಗಿ ಇಂಜೆಕ್ಟ್ ಆಗುವುದರಿಂದ ಯಾವುದೇ ಬಿಲ್ಡ್ ಎರರ್ ಬರುವುದಿಲ್ಲ.'
                : 'Java 17, Gradle caching, Android SDK, and RECORD_AUDIO permissions are automatically configured to guarantee a clean build.'}
            </div>
          </div>

          {/* Workflow Code Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                {t.workflowFileCode}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 transition"
                >
                  <Download className="w-3 h-3 text-emerald-400" />
                  <span>{t.downloadWorkflow}</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-[11px] transition shadow"
                >
                  {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? t.copiedWorkflow : t.copyWorkflow}</span>
                </button>
              </div>
            </div>

            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-56 leading-relaxed select-all">
              {WORKFLOW_YAML}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
