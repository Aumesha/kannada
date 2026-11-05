import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Trash2,
  Edit2,
  Check,
  X,
  Download,
  Share2,
  HardDrive,
  Search,
  Sparkles,
  Volume2,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { RecordingItem, AppLanguage } from '../types/index';
import { translations } from '../locales/translations';
import { formatDuration, formatBytes } from '../utils/audioUtils';
import {
  getAllRecordings,
  deleteRecording,
  updateRecordingTitle,
  clearAllRecordings,
  getStorageStats,
} from '../utils/storage';

interface RecordingsVaultProps {
  language: AppLanguage;
  refreshTrigger: number;
}

export const RecordingsVault: React.FC<RecordingsVaultProps> = ({
  language,
  refreshTrigger,
}) => {
  const t = translations[language];

  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [storageStats, setStorageStats] = useState<{ count: number; totalSizeBytes: number }>({
    count: 0,
    totalSizeBytes: 0,
  });

  // Active Playback State
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeDuration, setActiveDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isVocalBoostActive, setIsVocalBoostActive] = useState<boolean>(true);

  // Rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // Audio element & Web Audio processing for playback boost
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const eqFilterRef = useRef<BiquadFilterNode | null>(null);

  // Load recordings
  const loadVaultData = async () => {
    try {
      const items = await getAllRecordings();
      setRecordings(items);
      const stats = await getStorageStats();
      setStorageStats(stats);
    } catch (err) {
      console.error('Failed to load recordings from vault:', err);
    }
  };

  useEffect(() => {
    loadVaultData();
  }, [refreshTrigger]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Play / Pause handler
  const handleTogglePlay = (item: RecordingItem) => {
    if (playingId === item.id) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      return;
    }

    // Play new item
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audioUrl = URL.createObjectURL(item.blob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.playbackRate = playbackSpeed;

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      setActiveDuration(audio.duration || item.duration);
    };

    audio.onended = () => {
      setPlayingId(null);
      setCurrentTime(0);
      URL.revokeObjectURL(audioUrl);
    };

    // Play
    audio.play().catch((err) => console.error('Audio playback error:', err));
    setPlayingId(item.id);
    setActiveDuration(item.duration);
    setCurrentTime(0);
  };

  // Change playback speed
  const handleChangeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Scrubber change
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Start Rename
  const handleStartRename = (item: RecordingItem) => {
    setEditingId(item.id);
    setEditTitleText(item.title);
  };

  // Save Rename
  const handleSaveRename = async (id: string) => {
    if (!editTitleText.trim()) return;
    await updateRecordingTitle(id, editTitleText.trim());
    setEditingId(null);
    loadVaultData();
  };

  // Confirm delete single item
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    if (playingId === deleteTargetId && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
    }
    await deleteRecording(deleteTargetId);
    setDeleteTargetId(null);
    loadVaultData();
  };

  // Clear all
  const handleConfirmClearAll = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
    }
    await clearAllRecordings();
    setShowClearAllModal(false);
    loadVaultData();
  };

  // Export / Download
  const handleExport = (item: RecordingItem) => {
    const ext = item.mimeType.includes('mp4') ? 'mp4' : 'webm';
    const filename = `${item.title.replace(/\s+/g, '_')}.${ext}`;
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter list by search query
  const filteredRecordings = recordings.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Vault Header & Storage Stat Banner */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              {t.vaultTitle}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800/50">
              {t.savedRecordingsCount(storageStats.count)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.storageSubtitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-slate-200">
              {t.totalStorageUsed(formatBytes(storageStats.totalSizeBytes))}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">
              100% Offline Sandbox
            </div>
          </div>

          {recordings.length > 0 && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-800 text-slate-400 text-xs font-medium border border-slate-700 transition"
            >
              {t.clearAll}
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      {recordings.length > 1 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {/* Empty State */}
      {recordings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center bg-slate-950/40">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-500 mb-3">
            <HardDrive className="w-6 h-6 text-cyan-500/60" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 mb-1">
            {t.noRecordingsYet}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {t.noRecordingsDesc}
          </p>
        </div>
      ) : (
        /* List of Recordings */
        <div className="space-y-3">
          {filteredRecordings.map((item) => {
            const isPlaying = playingId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition p-4 sm:p-5 ${
                  isPlaying
                    ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Title & Metadata row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editTitleText}
                          onChange={(e) => setEditTitleText(e.target.value)}
                          className="bg-slate-950 border border-cyan-500 px-2.5 py-1 rounded-lg text-xs text-white font-semibold flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(item.id)}
                          className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                          title={t.save}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                          title={t.cancel}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-100 truncate">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => handleStartRename(item)}
                          className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition"
                          title={t.rename}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatDuration(item.duration)}
                      </span>
                      <span className="font-mono text-slate-400">
                        {formatBytes(item.sizeBytes)}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 text-[10px] uppercase font-mono">
                        {item.filterPreset} filter
                      </span>
                    </div>
                  </div>

                  {/* Actions: Export & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleExport(item)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition"
                      title={t.exportAudio}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(item.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition"
                      title={t.deleteBtn}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Waveform Peak Bars */}
                <div className="my-2.5 h-10 flex items-center gap-1 bg-slate-950/50 rounded-xl px-2.5 py-1 overflow-hidden">
                  {(item.waveformPeaks || []).map((peak, idx) => {
                    const isPlayedSoFar = isPlaying && (currentTime / (activeDuration || 1)) >= (idx / item.waveformPeaks.length);
                    return (
                      <div
                        key={idx}
                        className={`flex-1 rounded-full transition-colors ${
                          isPlayedSoFar
                            ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                            : isPlaying
                            ? 'bg-cyan-900/60'
                            : 'bg-slate-700/60'
                        }`}
                        style={{ height: `${Math.max(15, peak * 100)}%` }}
                      />
                    );
                  })}
                </div>

                {/* Scrubber Progress when playing */}
                {isPlaying && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 min-w-[35px]">
                        {formatDuration(currentTime)}
                      </span>
                      <input
                        type="range"
                        min="0"
                        max={activeDuration || item.duration}
                        step="0.1"
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <span className="text-[10px] font-mono text-slate-400 min-w-[35px] text-right">
                        {formatDuration(activeDuration || item.duration)}
                      </span>
                    </div>

                    {/* Playback speed controls & Vocal boost pill */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">{t.speed}:</span>
                        {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleChangeSpeed(s)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                              playbackSpeed === s
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>HD Clarity Active</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Play/Pause Button */}
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => handleTogglePlay(item)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
                      isPlaying
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>{t.pause}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{t.play}</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-slate-500 font-medium">
                    {language === 'kn' ? 'ಆಂತರಿಕ ಸ್ಟೋರೇಜ್' : 'In-App Sandbox'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              {t.confirmDeleteTitle}
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              {t.confirmDeleteMsg}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow"
              >
                {t.deleteBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              {t.clearAll}
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              {t.confirmClearAllMsg}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearAllModal(false)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmClearAll}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow"
              >
                {t.clearAll}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
