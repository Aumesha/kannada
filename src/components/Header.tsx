import React from 'react';
import { Mic, ShieldCheck, WifiOff, Github, Download, Globe } from 'lucide-react';
import { AppLanguage } from '../types/index';
import { translations } from '../locales/translations';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  language: AppLanguage;
  onToggleLanguage: () => void;
  onOpenGithubModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  onOpenGithubModal,
}) => {
  const t = translations[language];

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand and Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Mic className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">
                {t.appTitle}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                Studio HD
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Status Indicators & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Offline & Sandbox Status Badges */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs font-medium">
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.offlineBadge}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.internalStorageBadge}</span>
          </div>

          {/* GitHub APK Workflow Button */}
          <button
            onClick={onOpenGithubModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-medium border border-slate-700 transition"
            title="GitHub Actions APK Workflow"
          >
            <Github className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{t.githubApkBtn}</span>
            <span className="sm:hidden">APK</span>
          </button>

          {/* In-App PWA Install */}
          <PWAInstallButton language={language} />

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'kn' ? 'EN' : 'ಕನ್ನಡ'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
