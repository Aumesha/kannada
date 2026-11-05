import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { AppLanguage } from '../types/index';

export const OfflineIndicator: React.FC<{ language: AppLanguage }> = ({ language }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 text-slate-950 px-3.5 py-2 text-xs font-bold shadow-xl backdrop-blur-sm border border-amber-400">
      <WifiOff className="w-4 h-4 text-slate-950" />
      <span>
        {language === 'kn'
          ? 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ — ಸಂಪೂರ್ಣ ಡೇಟಾ ಸುರಕ್ಷಿತವಾಗಿದೆ'
          : 'Offline Mode Active — App functions 100% locally'}
      </span>
    </div>
  );
};
