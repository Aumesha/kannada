export interface AppTranslations {
  appTitle: string;
  appSubtitle: string;
  offlineBadge: string;
  internalStorageBadge: string;
  storageSubtitle: string;
  recordTab: string;
  vaultTab: string;
  githubApkBtn: string;
  installBtn: string;
  
  // Recording Studio
  readyToRecord: string;
  recordingInProgress: string;
  recordingPaused: string;
  startRecording: string;
  pauseRecording: string;
  resumeRecording: string;
  stopAndSave: string;
  discardRecording: string;
  confirmDiscard: string;
  discardTitle: string;
  discardCancel: string;
  discardYes: string;

  // Filter Presets
  filterLabel: string;
  presetUltraTitle: string;
  presetUltraDesc: string;
  presetStudioTitle: string;
  presetStudioDesc: string;
  presetLectureTitle: string;
  presetLectureDesc: string;
  presetCustomTitle: string;
  presetCustomDesc: string;
  tuneFiltersBtn: string;

  // Visualizer & Metrics
  micInputLevel: string;
  noiseGateState: string;
  voiceDetected: string;
  silenceFiltered: string;
  liveWaveform: string;
  audioDuration: string;

  // Vault / Saved Recordings
  vaultTitle: string;
  savedRecordingsCount: (count: number) => string;
  totalStorageUsed: (sizeStr: string) => string;
  noRecordingsYet: string;
  noRecordingsDesc: string;
  play: string;
  pause: string;
  speed: string;
  vocalEnhance: string;
  rename: string;
  deleteBtn: string;
  confirmDeleteTitle: string;
  confirmDeleteMsg: string;
  cancel: string;
  save: string;
  exportAudio: string;
  savedToStorageSuccess: string;
  searchPlaceholder: string;
  clearAll: string;
  confirmClearAllMsg: string;

  // Audio Settings Modal
  audioSettingsTitle: string;
  noiseGateThreshold: string;
  noiseGateHelp: string;
  lowCutFilter: string;
  lowCutHelp: string;
  vocalBoost: string;
  vocalBoostHelp: string;
  resetDefaults: string;
  close: string;

  // GitHub APK Modal
  githubModalTitle: string;
  githubModalDesc: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  workflowFileCode: string;
  copyWorkflow: string;
  copiedWorkflow: string;
  downloadWorkflow: string;
}

export const translations: Record<'kn' | 'en', AppTranslations> = {
  kn: {
    appTitle: 'ಧ್ವನಿ ಸ್ಪಷ್ಟ',
    appSubtitle: 'ಕ್ರಿಸ್ಟಲ್-ಕ್ಲಿಯರ್ ಆಫ್‌ಲೈನ್ ವಾಯ್ಸ್ ಸ್ಟುಡಿಯೋ',
    offlineBadge: '೧೦೦% ಆಫ್‌ಲೈನ್',
    internalStorageBadge: 'ಆಂತರಿಕ ಪ್ರೈವೇಟ್ ಸ್ಟೋರೇಜ್',
    storageSubtitle: 'ಯಾವುದೇ ಕ್ಲೌಡ್ ಅಥವಾ ಮೊಬೈಲ್ ಫೋಲ್ಡರ್‌ಗೆ ಕನೆಕ್ಟ್ ಆಗಿಲ್ಲ - ಕೇವಲ ಆ್ಯಪ್ ಒಳಗೆ ಸುರಕ್ಷಿತ',
    recordTab: 'ರೆಕಾರ್ಡರ್',
    vaultTab: 'ಉಳಿಸಿದ ರೆಕಾರ್ಡಿಂಗ್‌ಗಳು',
    githubApkBtn: 'GitHub APK ವರ್ಕ್‌ಫ್ಲೋ',
    installBtn: 'ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ',

    readyToRecord: 'ರೆಕಾರ್ಡಿಂಗ್ ಮಾಡಲು ಸಿದ್ಧ',
    recordingInProgress: 'ಸ್ಪಷ್ಟ ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ...',
    recordingPaused: 'ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಲಾಗಿದೆ (ಪಾಸ್)',
    startRecording: 'ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ',
    pauseRecording: 'ವಿರಾಮ (Pause)',
    resumeRecording: 'ಮುಂದುವರಿಸಿ',
    stopAndSave: 'ಮುಕ್ತಾಯಗೊಳಿಸಿ & ಉಳಿಸಿ',
    discardRecording: 'ರದ್ದುಗೊಳಿಸಿ (Discard)',
    confirmDiscard: 'ಪ್ರಸ್ತುತ ರೆಕಾರ್ಡಿಂಗ್ ಅನ್ನು ರದ್ದುಮಾಡಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?',
    discardTitle: 'ರೆಕಾರ್ಡಿಂಗ್ ರದ್ದು',
    discardCancel: 'ಹಿಂತಿರುಗಿ',
    discardYes: 'ಹೌದು, ರದ್ದುಮಾಡಿ',

    filterLabel: 'ಧ್ವನಿ ಫಿಲ್ಟರ್ ಮೋಡ್:',
    presetUltraTitle: 'ಅಲ್ಟ್ರಾ ನಾಯ್ಸ್ ಕಟ್‌ಆಫ್',
    presetUltraDesc: 'ಫ್ಯಾನ್, ವಾಹನ, ಗಾಳಿ ಮತ್ತು ಸದ್ದು ಸಂಪೂರ್ಣ ಬ್ಲಾಕ್ - ಕೇವಲ ಧ್ವನಿ ಮಾತ್ರ',
    presetStudioTitle: 'ಸ್ಟುಡಿಯೋ ಸ್ಪಷ್ಟತೆ',
    presetStudioDesc: 'ರೂಮ್ ಎಕೋ ನಿವಾರಣೆ, ಸಮತೋಲಿತ ವೃತ್ತಿಪರ ಧ್ವನಿ ಗರಿಷ್ಠ ಸ್ಪಷ್ಟತೆ',
    presetLectureTitle: 'ಮೀಟಿಂಗ್ & ಭಾಷಣ',
    presetLectureDesc: 'ಸ್ವಲ್ಪ ದೂರದಿಂದ ಮಾತನಾಡುವ ಧ್ವನಿಗಳನ್ನು ಸಹ ಸ್ಪಷ್ಟವಾಗಿ ಆಲಿಸುವ ಮೋಡ್',
    presetCustomTitle: 'ಕಸ್ಟಮ್ ನಿಯಂತ್ರಣ',
    presetCustomDesc: 'ಮೈಕ್ ಸೂಕ್ಷ್ಮತೆ ಮತ್ತು ಫಿಲ್ಟರ್‌ಗಳನ್ನು ನೀವೇ ಹೊಂದಿಸಿ',
    tuneFiltersBtn: 'ಫಿಲ್ಟರ್ ಸೆಟ್ಟಿಂಗ್ಸ್',

    micInputLevel: 'ಮೈಕ್ ಇನ್‌ಪುಟ್ ಮಟ್ಟ',
    noiseGateState: 'ನಾಯ್ಸ್ ಗೇಟ್ ಸ್ಥಿತಿ:',
    voiceDetected: 'ಧ್ವನಿ ಗುರುತಿಸಲಾಗಿದೆ (Voice Live)',
    silenceFiltered: 'ಹಿನ್ನೆಲೆ ಸದ್ದು ಬ್ಲಾಕ್ ಆಗಿದೆ (Gate Muted)',
    liveWaveform: 'ಲೈವ್ ಆಡಿಯೋ ವೇವ್‌ಫಾರ್ಮ್',
    audioDuration: 'ಅವಧಿ',

    vaultTitle: 'ಉಳಿಸಲಾದ ಆಡಿಯೋಗಳು',
    savedRecordingsCount: (count: number) => `${count} ರೆಕಾರ್ಡಿಂಗ್‌ಗಳು ಲಭ್ಯ`,
    totalStorageUsed: (sizeStr: string) => `ಬಳಕೆಯಾದ ಜಾಗ: ${sizeStr}`,
    noRecordingsYet: 'ಯಾವುದೇ ರೆಕಾರ್ಡಿಂಗ್‌ಗಳಿಲ್ಲ',
    noRecordingsDesc: 'ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ನಿಮ್ಮ ಮೊದಲ ಸ್ಪಷ್ಟ ಧ್ವನಿಯನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಿ. ಇದು ಸಂಪೂರ್ಣವಾಗಿ ಈ ಆ್ಯಪ್ ಒಳಗೆ ಮಾತ್ರ ಇರುತ್ತದೆ.',
    play: 'ಪ್ಲೇ ಮಾಡಿ',
    pause: 'ವಿರಾಮ',
    speed: 'ವೇಗ',
    vocalEnhance: 'ಧ್ವನಿ ವರ್ಧನೆ (Clarity Boost)',
    rename: 'ಹೆಸರು ಬದಲಾಯಿಸಿ',
    deleteBtn: 'ಅಳಿಸಿ (Delete)',
    confirmDeleteTitle: 'ರೆಕಾರ್ಡಿಂಗ್ ಅಳಿಸುವಿರಾ?',
    confirmDeleteMsg: 'ಈ ರೆಕಾರ್ಡಿಂಗ್ ಅನ್ನು ಖಾಸಗಿ ಸ್ಟೋರೇಜ್‌ನಿಂದ ಶಾಶ್ವತವಾಗಿ ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ.',
    cancel: 'ರದ್ದು',
    save: 'ಉಳಿಸಿ',
    exportAudio: 'ಆಡಿಯೋ ಡೌನ್‌ಲೋಡ್ / ಶೇರ್',
    savedToStorageSuccess: 'ರೆಕಾರ್ಡಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ಆಂತರಿಕ ಸ್ಟೋರೇಜ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ!',
    searchPlaceholder: 'ರೆಕಾರ್ಡಿಂಗ್ ಹುಡುಕಿ...',
    clearAll: 'ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ',
    confirmClearAllMsg: 'ಎಲ್ಲಾ ಉಳಿಸಲಾದ ರೆಕಾರ್ಡಿಂಗ್‌ಗಳನ್ನು ಖಚಿತವಾಗಿ ಅಳಿಸಬೇಕೇ?',

    audioSettingsTitle: 'ಸ್ಟುಡಿಯೋ ಆಡಿಯೋ ಮತ್ತು ನಾಯ್ಸ್ ಫಿಲ್ಟರ್ ಸೆಟ್ಟಿಂಗ್ಸ್',
    noiseGateThreshold: 'ನಾಯ್ಸ್ ಗೇಟ್ ಥ್ರೆಶೋಲ್ಡ್ (ಹಿನ್ನೆಲೆ ಸದ್ದು ಬ್ಲಾಕ್ ಮಾಡುವ ಮಟ್ಟ)',
    noiseGateHelp: 'ಸಂಖ್ಯೆಯನ್ನು ಹೆಚ್ಚಿಸಿದರೆ (ಉದಾ: -35dB) ಸಣ್ಣ ಸದ್ದುಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಕಟ್ ಆಗುತ್ತವೆ.',
    lowCutFilter: 'ಲೋ-ಕಟ್ ಫಿಲ್ಟರ್ (High-Pass Rumble Filter)',
    lowCutHelp: 'ಫ್ಯಾನ್ ಶಬ್ದ, ಗಾಳಿ, ಮೈಕ್ ಸ್ಪರ್ಶದ ಶಬ್ದವನ್ನು 85Hz ಗಿಂತ ಕೆಳಗೆ ಕಟ್ ಮಾಡುತ್ತದೆ.',
    vocalBoost: 'ಧ್ವನಿ ಸ್ಪಷ್ಟತೆ ಬೂಸ್ಟ್ (Vocal Presence Peaking)',
    vocalBoostHelp: 'ಮಾನವನ ಧ್ವನಿಯ 2800Hz ಫ್ರೀಕ್ವೆನ್ಸಿಯನ್ನು ಬೂಸ್ಟ್ ಮಾಡಿ ಸ್ಪಷ್ಟತೆ ನೀಡುತ್ತದೆ.',
    resetDefaults: 'ಡಿಫಾಲ್ಟ್‌ಗೆ ಮರುಹೊಂದಿಸಿ',
    close: 'ಮುಚ್ಚಿ',

    githubModalTitle: 'GitHub ನಲ್ಲಿ ನೇರವಾಗಿ APK ಬಿಲ್ಡ್ ಮಾಡುವುದು ಹೇಗೆ?',
    githubModalDesc: 'ಯಾವುದೇ ಎರರ್ ಬಾರದ ಹಾಗೆ GitHub Actions ಮೂಲಕ ಕೆಲವೇ ನಿಮಿಷಗಳಲ್ಲಿ Android APK ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಿ.',
    step1Title: '೧. GitHub ಗೆ ಪ್ರಾಜೆಕ್ಟ್ ಪುಶ್ ಮಾಡಿ',
    step1Desc: 'ನಿಮ್ಮ GitHub ರೆಪೊಸಿಟರಿಗೆ ಈ ಸಂಪೂರ್ಣ ಕೋಡ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    step2Title: '೨. GitHub Actions ವರ್ಕ್‌ಫ್ಲೋ ಸೇರಿಸಿ',
    step2Desc: 'ನಿಮ್ಮ ರೆಪೊಸಿಟರಿಯಲ್ಲಿ `.github/workflows/build-apk.yml` ಫೈಲ್ ಸೇರಿಸಿ (ಕೆಳಗಿನ ಕೋಡ್ ಕಾಪಿ ಮಾಡಿಕೊಳ್ಳಿ).',
    step3Title: '೩. APK ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಿ',
    step3Desc: 'GitHub ನಲ್ಲಿ "Actions" ಟ್ಯಾಬ್ ಕ್ಲಿಕ್ ಮಾಡಿ. ಬಿಲ್ಡ್ ಮುಗಿದ ನಂತರ "Artifacts" ವಿಭಾಗದಲ್ಲಿ `app-debug.apk` ರೆಡಿಯಾಗಿರುತ್ತದೆ!',
    workflowFileCode: 'GitHub Actions Workflow (.github/workflows/build-apk.yml):',
    copyWorkflow: 'ವರ್ಕ್‌ಫ್ಲೋ ಕೋಡ್ ಕಾಪಿ ಮಾಡಿ',
    copiedWorkflow: 'ಕಾಪಿ ಮಾಡಲಾಗಿದೆ! ✓',
    downloadWorkflow: 'ವರ್ಕ್‌ಫ್ಲೋ ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
  },
  en: {
    appTitle: 'CrystalVoice Studio',
    appSubtitle: 'Crystal-Clear Offline Mobile Voice Recorder',
    offlineBadge: '100% Offline',
    internalStorageBadge: 'Sandboxed In-App Storage',
    storageSubtitle: 'Zero external cloud or disk sync — securely preserved inside the app only',
    recordTab: 'Recorder',
    vaultTab: 'Recordings Vault',
    githubApkBtn: 'GitHub APK Workflow',
    installBtn: 'Install App',

    readyToRecord: 'Ready to Record',
    recordingInProgress: 'Capturing Studio Voice...',
    recordingPaused: 'Recording Paused',
    startRecording: 'Start Recording',
    pauseRecording: 'Pause',
    resumeRecording: 'Resume',
    stopAndSave: 'Finish & Save',
    discardRecording: 'Discard',
    confirmDiscard: 'Are you sure you want to discard this recording?',
    discardTitle: 'Discard Recording',
    discardCancel: 'Keep Recording',
    discardYes: 'Yes, Discard',

    filterLabel: 'Voice Isolation Preset:',
    presetUltraTitle: 'Ultra Noise Cutoff',
    presetUltraDesc: 'Aggressive fan, road & background hum suppression — vocal only',
    presetStudioTitle: 'Studio Clarity',
    presetStudioDesc: 'Room echo removal, warm vocal presence, balanced studio quality',
    presetLectureTitle: 'Meeting & Speech',
    presetLectureDesc: 'Increased gain & speech boost for distant or soft speaking',
    presetCustomTitle: 'Custom Tuning',
    presetCustomDesc: 'Adjust sensitivity threshold and audio filters manually',
    tuneFiltersBtn: 'Filter Tuning',

    micInputLevel: 'Mic Input Level',
    noiseGateState: 'Noise Gate Status:',
    voiceDetected: 'Voice Active (Recording)',
    silenceFiltered: 'Background Noise Blocked (Gate Muted)',
    liveWaveform: 'Live Waveform',
    audioDuration: 'Duration',

    vaultTitle: 'Saved Recordings',
    savedRecordingsCount: (count: number) => `${count} recordings saved`,
    totalStorageUsed: (sizeStr: string) => `Storage Used: ${sizeStr}`,
    noRecordingsYet: 'No recordings yet',
    noRecordingsDesc: 'Tap the record button to capture your first studio-quality audio. Stored 100% offline inside this app.',
    play: 'Play',
    pause: 'Pause',
    speed: 'Speed',
    vocalEnhance: 'Vocal Clarity Boost',
    rename: 'Rename',
    deleteBtn: 'Delete',
    confirmDeleteTitle: 'Delete Recording?',
    confirmDeleteMsg: 'This audio will be permanently deleted from in-app storage.',
    cancel: 'Cancel',
    save: 'Save',
    exportAudio: 'Download / Export Audio',
    savedToStorageSuccess: 'Recording successfully saved to private internal storage!',
    searchPlaceholder: 'Search recordings...',
    clearAll: 'Clear All',
    confirmClearAllMsg: 'Are you sure you want to delete all saved recordings?',

    audioSettingsTitle: 'Studio Audio & Noise Filter Settings',
    noiseGateThreshold: 'Noise Gate Threshold (Background Noise Cutoff Level)',
    noiseGateHelp: 'Higher values (e.g. -35dB) aggressively mute fainter ambient noises.',
    lowCutFilter: 'Low-Cut Filter (High-Pass Rumble Filter)',
    lowCutHelp: 'Eliminates air conditioner hum, traffic, and mic handling rumble under 85Hz.',
    vocalBoost: 'Vocal Presence Peaking (+dB)',
    vocalBoostHelp: 'Accentuates 2800Hz voice formant frequencies for crystal-clear diction.',
    resetDefaults: 'Reset Defaults',
    close: 'Close',

    githubModalTitle: 'How to build APK on GitHub Actions with zero errors?',
    githubModalDesc: 'Automated GitHub Actions workflow to generate an installable Android APK from this repo in minutes.',
    step1Title: '1. Push project to GitHub',
    step1Desc: 'Push this entire project to your GitHub repository.',
    step2Title: '2. Add GitHub Actions Workflow',
    step2Desc: 'Add `.github/workflows/build-apk.yml` in your repo (copy or download below).',
    step3Title: '3. Download APK from Artifacts',
    step3Desc: 'Click the "Actions" tab in GitHub. When the build passes, download `app-debug.apk` under Artifacts!',
    workflowFileCode: 'GitHub Actions Workflow (.github/workflows/build-apk.yml):',
    copyWorkflow: 'Copy Workflow Code',
    copiedWorkflow: 'Copied to Clipboard! ✓',
    downloadWorkflow: 'Download Workflow File',
  },
};
