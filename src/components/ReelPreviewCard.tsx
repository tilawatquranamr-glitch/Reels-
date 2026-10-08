import React from 'react';
import { HadithItem } from '../data/hadiths';
import { BackgroundTheme } from '../data/backgrounds';
import { Play, Pause, Volume2, Sparkles, BookOpen } from 'lucide-react';

interface ReelPreviewCardProps {
  hadith: HadithItem;
  theme: BackgroundTheme;
  fontFamily: string;
  fontSize: number;
  showTashkeel: boolean;
  showNarrator: boolean;
  showSource: boolean;
  showExplanation: boolean;
  showWatermark: boolean;
  watermarkText: string;
  aspectRatio: '9:16' | '1:1' | '4:5';
  isPlayingAudio: boolean;
  audioProgress: number;
  currentWordIndex: number;
  onToggleAudio: () => void;
}

export const ReelPreviewCard: React.FC<ReelPreviewCardProps> = ({
  hadith,
  theme,
  fontFamily,
  fontSize,
  showTashkeel,
  showNarrator,
  showSource,
  showExplanation,
  showWatermark,
  watermarkText,
  aspectRatio,
  isPlayingAudio,
  audioProgress,
  currentWordIndex,
  onToggleAudio,
}) => {
  // Determine aspect ratio class
  const aspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] w-[340px] sm:w-[380px] md:w-[410px] max-w-full'
      : aspectRatio === '1:1'
      ? 'aspect-square w-[340px] sm:w-[380px] md:w-[410px] max-w-full'
      : 'aspect-[4/5] w-[340px] sm:w-[380px] md:w-[410px] max-w-full';

  // Strip tashkeel if toggle is false
  const displayText = showTashkeel
    ? hadith.text
    : hadith.text.replace(/[\u064B-\u065F\u0670]/g, '');

  const words = displayText.split(' ');

  return (
    <div className="relative group mx-auto flex flex-col items-center">
      {/* Glow Behind the Phone/Card */}
      <div
        className="absolute -inset-2 rounded-3xl opacity-40 blur-xl transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${theme.accentColor} 0%, transparent 70%)`,
        }}
      />

      {/* Main Card Container */}
      <div
        id="hadith-reel-card"
        className={`relative ${aspectClass} rounded-3xl overflow-hidden shadow-2xl border-4 ${theme.borderStyle} flex flex-col justify-between p-6 sm:p-7 select-none transition-all duration-300`}
        style={{ background: theme.customImageUrl ? 'none' : theme.bgGradient }}
      >
        {/* Custom Uploaded Background Image with dark veil */}
        {theme.customImageUrl && (
          <>
            <img
              src={theme.customImageUrl}
              alt="خلفية مخصصة"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
            />
            <div className="absolute inset-0 bg-slate-950/75 z-0 pointer-events-none" />
          </>
        )}

        {/* Decorative Background Pattern */}
        {!theme.customImageUrl && theme.patternType === 'arabesque' && (
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(${theme.accentColor} 1px, transparent 1px), radial-gradient(${theme.accentColor} 1px, transparent 1px)`,
              backgroundSize: '28px 28px',
              backgroundPosition: '0 0, 14px 14px',
            }}
          />
        )}
        {!theme.customImageUrl && theme.patternType === 'arch' && (
          <div className="absolute inset-0 flex justify-center items-start opacity-15 pointer-events-none">
            <div
              className="w-3/4 h-1/2 rounded-b-full border-4 border-dashed mt-4"
              style={{ borderColor: theme.accentColor }}
            />
          </div>
        )}
        {!theme.customImageUrl && theme.patternType === 'stars' && (
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <div className="absolute top-1/2 right-1/3 w-1 h-1 rounded-full bg-sky-300 animate-ping" />
          </div>
        )}

        {/* Decorative Inner Frame */}
        <div
          className="absolute inset-3 rounded-2xl border border-white/10 pointer-events-none z-10"
          style={{ borderColor: `${theme.accentColor}25` }}
        >
          {/* Corner accents */}
          <div
            className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2"
            style={{ borderColor: theme.accentColor }}
          />
          <div
            className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2"
            style={{ borderColor: theme.accentColor }}
          />
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2"
            style={{ borderColor: theme.accentColor }}
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2"
            style={{ borderColor: theme.accentColor }}
          />
        </div>

        {/* Card Header */}
        <div className="relative z-10 text-center flex flex-col items-center gap-2 pt-2">
          {/* Basmala Calligraphy */}
          <p
            className="text-xs sm:text-sm font-semibold tracking-wider opacity-90 drop-shadow"
            style={{ color: theme.accentColor, fontFamily: 'Amiri, Cairo, serif' }}
          >
            بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </p>

          {/* Category Badge & Live Audio Indicator */}
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm"
              style={{
                backgroundColor: theme.badgeBg,
                color: theme.textColor,
                borderColor: `${theme.accentColor}40`,
              }}
            >
              <Sparkles className="w-3 h-3" style={{ color: theme.accentColor }} />
              {hadith.category}
            </span>

            {isPlayingAudio && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-md animate-pulse border"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.25)',
                  color: '#6ee7b7',
                  borderColor: 'rgba(52, 211, 153, 0.4)',
                }}
              >
                <Volume2 className="w-3 h-3 animate-bounce" />
                صوت شغال
              </span>
            )}
          </div>
        </div>

        {/* Hadith Main Text Body */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center my-3 px-2 sm:px-3 text-center">
          <div
            className="leading-relaxed sm:leading-loose transition-all duration-200"
            style={{
              fontFamily: `${fontFamily}, serif`,
              fontSize: `${fontSize}px`,
              color: theme.textColor,
              textShadow: `0 2px 14px ${theme.accentColor}30`,
            }}
          >
            {words.map((word, idx) => {
              const isCurrent = isPlayingAudio && currentWordIndex === idx;
              return (
                <span
                  key={idx}
                  className={`inline-block mx-0.5 px-1 rounded transition-all duration-150 ${
                    isCurrent
                      ? 'scale-110 font-bold bg-amber-400 text-slate-950 shadow-lg'
                      : ''
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>

          {showExplanation && hadith.explanation && (
            <div className="mt-4 p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-[11px] sm:text-xs text-white/85 leading-relaxed max-h-24 overflow-y-auto">
              <span className="font-bold text-amber-300 ml-1">💡 الفائدة:</span>
              {hadith.explanation}
            </div>
          )}
        </div>

        {/* Card Footer: Narrator & Source */}
        <div className="relative z-10 flex flex-col items-center gap-2 pb-1 text-center">
          {showNarrator && (
            <div
              className="text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-1.5"
              style={{ color: theme.quoteColor }}
            >
              <span>رواه:</span>
              <span className="font-bold underline decoration-dotted underline-offset-4">
                {hadith.narrator}
              </span>
            </div>
          )}

          {showSource && (
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-white/70">
              <BookOpen className="w-3 h-3 opacity-60" />
              <span>{hadith.source}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/90">
                {hadith.grade}
              </span>
            </div>
          )}

          {/* Audio Progress Bar */}
          {isPlayingAudio && (
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${audioProgress}%`,
                  backgroundColor: theme.accentColor,
                }}
              />
            </div>
          )}

          {/* Watermark Branding */}
          {showWatermark && (
            <div className="text-[10px] text-white/50 tracking-wider pt-1 flex items-center gap-1">
              <span>{watermarkText || 'حديث ريلز - صانع بطاقات الأحاديث'}</span>
            </div>
          )}
        </div>

        {/* Floating Quick Audio Action Button */}
        <button
          onClick={onToggleAudio}
          className="absolute bottom-5 left-5 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
          title={isPlayingAudio ? 'إيقاف مؤقت' : 'استماع للحديث الشريف'}
        >
          {isPlayingAudio ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white translate-x-[-1px]" />
          )}
        </button>
      </div>
    </div>
  );
};
