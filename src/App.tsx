import React, { useState, useEffect } from 'react';
import { HADITHS_DATA, HadithItem } from './data/hadiths';
import { BACKGROUND_PRESETS, BackgroundTheme } from './data/backgrounds';
import { ReelPreviewCard } from './components/ReelPreviewCard';
import { ReelControls } from './components/ReelControls';
import { AudioVoicePanel } from './components/AudioVoicePanel';
import { HadithDrawer } from './components/HadithDrawer';
import { ExportModal } from './components/ExportModal';
import { AndroidCompanionModal } from './components/AndroidCompanionModal';
import { speechManager, TTSState } from './utils/tts';
import {
  BookOpen,
  Download,
  Smartphone,
  Sliders,
  Mic,
  Sparkles,
  Shuffle,
  Share2,
  Volume2,
} from 'lucide-react';

export default function App() {
  // 1. Core State
  const [currentHadith, setCurrentHadith] = useState<HadithItem>(HADITHS_DATA[0]);
  const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>(BACKGROUND_PRESETS[0]);
  const [fontFamily, setFontFamily] = useState<string>('Amiri');
  const [fontSize, setFontSize] = useState<number>(24);
  const [showTashkeel, setShowTashkeel] = useState<boolean>(true);
  const [showNarrator, setShowNarrator] = useState<boolean>(true);
  const [showSource, setShowSource] = useState<boolean>(true);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [watermarkText, setWatermarkText] = useState<string>('حديث ريلز | HadithReels');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '4:5'>('9:16');

  // 2. Audio State
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentWordIndex: -1,
    progress: 0,
    currentTime: 0,
    duration: 0,
  });

  // 3. Modals & Drawer State
  const [isHadithDrawerOpen, setIsHadithDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  // 4. Active Tab for Controls on Mobile/Desktop
  const [activeTab, setActiveTab] = useState<'controls' | 'audio' | 'library'>('controls');

  // Load preferences from localStorage on initial render
  useEffect(() => {
    try {
      const savedHadithId = localStorage.getItem('last_hadith_id');
      if (savedHadithId) {
        const found = HADITHS_DATA.find((h) => h.id === savedHadithId);
        if (found) setCurrentHadith(found);
      }
      const savedThemeId = localStorage.getItem('last_theme_id');
      if (savedThemeId) {
        const foundTheme = BACKGROUND_PRESETS.find((t) => t.id === savedThemeId);
        if (foundTheme) setCurrentTheme(foundTheme);
      }
    } catch {
      // LocalStorage fallback
    }
  }, []);

  // Save selected hadith
  const handleSelectHadith = (hadith: HadithItem) => {
    speechManager.stop();
    setCurrentHadith(hadith);
    try {
      localStorage.setItem('last_hadith_id', hadith.id);
    } catch {
      // ignore
    }
  };

  // Save selected theme
  const handleSelectTheme = (theme: BackgroundTheme) => {
    setCurrentTheme(theme);
    try {
      localStorage.setItem('last_theme_id', theme.id);
    } catch {
      // ignore
    }
  };

  // Custom Background Upload
  const handleCustomImageUpload = (dataUrl: string) => {
    setCurrentTheme((prev) => ({
      ...prev,
      customImageUrl: dataUrl,
    }));
  };

  const handleRemoveCustomImage = () => {
    setCurrentTheme((prev) => {
      const copy = { ...prev };
      delete copy.customImageUrl;
      return copy;
    });
  };

  // Quick Random Hadith Picker
  const handleRandomHadith = () => {
    speechManager.stop();
    const otherHadiths = HADITHS_DATA.filter((h) => h.id !== currentHadith.id);
    const randomIndex = Math.floor(Math.random() * otherHadiths.length);
    const nextHadith = otherHadiths[randomIndex] || HADITHS_DATA[0];
    setCurrentHadith(nextHadith);
  };

  // Toggle Audio Playback
  const handleToggleAudio = () => {
    if (ttsState.isPaused) {
      speechManager.resume();
    } else if (ttsState.isPlaying) {
      speechManager.pause();
    } else {
      speechManager.playHadith(currentHadith);
    }
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    setCurrentTheme(BACKGROUND_PRESETS[0]);
    setFontFamily('Amiri');
    setFontSize(24);
    setShowTashkeel(true);
    setShowNarrator(true);
    setShowSource(true);
    setShowExplanation(false);
    setShowWatermark(true);
    setWatermarkText('حديث ريلز | HadithReels');
    setAspectRatio('9:16');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-16 lg:pb-6">
      {/* 1. Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                حديث ريلز
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  42 حديثاً شريفاً
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                استوديو صناعة وتصدير بطاقات وفيديوهات الأحاديث النبوية لأندرويد
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Library Drawer Trigger */}
            <button
              onClick={() => setIsHadithDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition"
              title="تصفح جميع الـ 42 حديثاً"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">مكتبة الأحاديث (42)</span>
            </button>

            {/* Android APK status button */}
            <button
              onClick={() => setIsAndroidModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition"
              title="مشروع وتطبيق أندرويد الأصيل"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>أندرويد APK</span>
            </button>

            {/* Direct ZIP Download Button */}
            <button
              onClick={() => setIsAndroidModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold transition shadow-sm active:scale-95"
              title="تحميل ملف ZIP"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>تحميل ملف ZIP</span>
            </button>

            {/* Export Trigger */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>تصدير وحفظ</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Reel Preview Showcase (Col 12 on mobile, Col 5 on Desktop) */}
        <section className="lg:col-span-5 flex flex-col items-center gap-4 lg:sticky lg:top-24">
          <div className="w-full flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              المعاينة الحية ({aspectRatio})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRandomHadith}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>حديث عشوائي</span>
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setIsHadithDrawerOpen(true)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                حديث #{currentHadith.number}
              </button>
            </div>
          </div>

          {/* Interactive Card */}
          <ReelPreviewCard
            hadith={currentHadith}
            theme={currentTheme}
            fontFamily={fontFamily}
            fontSize={fontSize}
            showTashkeel={showTashkeel}
            showNarrator={showNarrator}
            showSource={showSource}
            showExplanation={showExplanation}
            showWatermark={showWatermark}
            watermarkText={watermarkText}
            aspectRatio={aspectRatio}
            isPlayingAudio={ttsState.isPlaying}
            audioProgress={ttsState.progress}
            currentWordIndex={ttsState.currentWordIndex}
            onToggleAudio={handleToggleAudio}
          />

          {/* Mobile Quick Action Strip */}
          <div className="w-full max-w-[410px] flex items-center justify-between gap-2 pt-2">
            <button
              onClick={handleToggleAudio}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold border transition ${
                ttsState.isPlaying
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>{ttsState.isPlaying ? 'إيقاف الصوت' : 'استماع صوتي'}</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
            >
              <Share2 className="w-4 h-4" />
              <span>تصدير للهاتف</span>
            </button>
          </div>
        </section>

        {/* Right Side: Tabbed Controls & Customizer (Col 12 on mobile, Col 7 on Desktop) */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'controls'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>التصميم والمظهر</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'audio'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>الإلقاء الصوتي</span>
            </button>

            <button
              onClick={() => setIsHadithDrawerOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>المكتبة (42)</span>
            </button>
          </div>

          {/* Tab 1: Design Controls */}
          {activeTab === 'controls' && (
            <ReelControls
              currentTheme={currentTheme}
              onSelectTheme={handleSelectTheme}
              fontFamily={fontFamily}
              onChangeFontFamily={setFontFamily}
              fontSize={fontSize}
              onChangeFontSize={setFontSize}
              showTashkeel={showTashkeel}
              onToggleTashkeel={setShowTashkeel}
              showNarrator={showNarrator}
              onToggleNarrator={setShowNarrator}
              showSource={showSource}
              onToggleSource={setShowSource}
              showExplanation={showExplanation}
              onToggleExplanation={setShowExplanation}
              showWatermark={showWatermark}
              onToggleWatermark={setShowWatermark}
              watermarkText={watermarkText}
              onChangeWatermarkText={setWatermarkText}
              aspectRatio={aspectRatio}
              onChangeAspectRatio={setAspectRatio}
              onRandomHadith={handleRandomHadith}
              onResetDefaults={handleResetDefaults}
              onCustomImageUpload={handleCustomImageUpload}
              onRemoveCustomImage={handleRemoveCustomImage}
            />
          )}

          {/* Tab 2: Audio Voice Panel */}
          {activeTab === 'audio' && (
            <AudioVoicePanel
              hadith={currentHadith}
              onAudioStateChange={setTtsState}
            />
          )}
        </section>
      </main>

      {/* 3. Modals & Drawers */}
      <HadithDrawer
        isOpen={isHadithDrawerOpen}
        onClose={() => setIsHadithDrawerOpen(false)}
        selectedHadithId={currentHadith.id}
        onSelectHadith={handleSelectHadith}
        onAddCustomHadith={(custom) => {
          HADITHS_DATA.unshift(custom);
          handleSelectHadith(custom);
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        hadith={currentHadith}
        theme={currentTheme}
        fontFamily={fontFamily}
        fontSize={fontSize}
        showTashkeel={showTashkeel}
        showNarrator={showNarrator}
        showSource={showSource}
        showWatermark={showWatermark}
        watermarkText={watermarkText}
      />

      <AndroidCompanionModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />
    </div>
  );
}
