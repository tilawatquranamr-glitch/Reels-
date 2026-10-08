import React, { useRef } from 'react';
import { BackgroundTheme, BACKGROUND_PRESETS } from '../data/backgrounds';
import {
  Type,
  Palette,
  Sliders,
  Smartphone,
  Eye,
  RotateCcw,
  Sparkles,
  Shuffle,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

interface ReelControlsProps {
  currentTheme: BackgroundTheme;
  onSelectTheme: (theme: BackgroundTheme) => void;
  fontFamily: string;
  onChangeFontFamily: (font: string) => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  showTashkeel: boolean;
  onToggleTashkeel: (val: boolean) => void;
  showNarrator: boolean;
  onToggleNarrator: (val: boolean) => void;
  showSource: boolean;
  onToggleSource: (val: boolean) => void;
  showExplanation: boolean;
  onToggleExplanation: (val: boolean) => void;
  showWatermark: boolean;
  onToggleWatermark: (val: boolean) => void;
  watermarkText: string;
  onChangeWatermarkText: (text: string) => void;
  aspectRatio: '9:16' | '1:1' | '4:5';
  onChangeAspectRatio: (ratio: '9:16' | '1:1' | '4:5') => void;
  onRandomHadith: () => void;
  onResetDefaults: () => void;
  onCustomImageUpload: (dataUrl: string) => void;
  onRemoveCustomImage: () => void;
}

const FONTS = [
  { id: 'Amiri', name: 'الخط الأميري (كلاسيكي مصحفي)' },
  { id: 'Cairo', name: 'خط كايرو (عصري بارز)' },
  { id: 'Scheherazade New', name: 'خط شهرزاد (نسخ أصيل)' },
  { id: 'Reem Kufi', name: 'خط ريم الكوفي (تراثي مميز)' },
  { id: 'Tajawal', name: 'خط تجوال (أنيق وسلس)' },
];

export const ReelControls: React.FC<ReelControlsProps> = ({
  currentTheme,
  onSelectTheme,
  fontFamily,
  onChangeFontFamily,
  fontSize,
  onChangeFontSize,
  showTashkeel,
  onToggleTashkeel,
  showNarrator,
  onToggleNarrator,
  showSource,
  onToggleSource,
  showExplanation,
  onToggleExplanation,
  showWatermark,
  onToggleWatermark,
  watermarkText,
  onChangeWatermarkText,
  aspectRatio,
  onChangeAspectRatio,
  onRandomHadith,
  onResetDefaults,
  onCustomImageUpload,
  onRemoveCustomImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onCustomImageUpload(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col gap-6">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-base text-slate-100">تخصيص التصميم والبطاقة</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRandomHadith}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition active:scale-95"
            title="اختيار حديث نبوي عشوائي"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>حديث عشوائي</span>
          </button>
          <button
            onClick={onResetDefaults}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
            title="إعادة تعيين الافتراضيات"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Aspect Ratio Picker */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>أبعاد التصميم والمنصة</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '9:16', label: '9:16 ريلز / شورتس', icon: '📱' },
            { id: '1:1', label: '1:1 مربع (انستغرام)', icon: '🟦' },
            { id: '4:5', label: '4:5 بوست عمودي', icon: '📄' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeAspectRatio(item.id as any)}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl text-xs font-medium border transition-all ${
                aspectRatio === item.id
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="text-sm mb-1">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Custom Background Upload or Presets */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-emerald-400" />
            <span>الخلفية الإسلامية أو صورة من هاتفك</span>
          </label>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>رفع صورة من المعرض</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* If custom image is uploaded */}
        {currentTheme.customImageUrl && (
          <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentTheme.customImageUrl}
                alt="خلفية مخصصة"
                className="w-12 h-12 rounded-xl object-cover border border-white/20"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-teal-200">خلفية مخصصة من جهازك</span>
                <span className="text-[10px] text-teal-400/80">يتم تطبيقها مع طبقة تظليل إسلامية ملائمة</span>
              </div>
            </div>

            <button
              onClick={onRemoveCustomImage}
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition"
              title="إزالة الصورة المخصصة والعودة للخلفيات الجاهزة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {BACKGROUND_PRESETS.map((preset) => {
            const isSelected = !currentTheme.customImageUrl && currentTheme.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectTheme(preset)}
                className={`flex items-center gap-2.5 p-2 rounded-2xl border text-right transition-all group ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/20'
                    : 'border-slate-700/70 hover:border-slate-600 bg-slate-800/40'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-xl shadow-inner border border-white/20 shrink-0"
                  style={{ background: preset.bgGradient }}
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-slate-200 truncate group-hover:text-emerald-300">
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {preset.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Typography & Font Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Font Family */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-emerald-400" />
            <span>نوع الخط العربي</span>
          </label>
          <select
            value={fontFamily}
            onChange={(e) => onChangeFontFamily(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500"
          >
            {FONTS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>حجم الخط</span>
            <span className="text-emerald-400 font-mono text-[11px]">{fontSize}px</span>
          </div>
          <input
            type="range"
            min={18}
            max={36}
            step={1}
            value={fontSize}
            onChange={(e) => onChangeFontSize(Number(e.target.value))}
            className="accent-emerald-500 cursor-pointer w-full mt-1.5"
          />
        </div>
      </div>

      {/* 4. Display Toggles */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>عناصر وظهور البطاقة</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Tashkeel */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800">
            <input
              type="checkbox"
              checked={showTashkeel}
              onChange={(e) => onToggleTashkeel(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span className="text-xs text-slate-200 font-medium">حركات التشكيل</span>
          </label>

          {/* Narrator */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800">
            <input
              type="checkbox"
              checked={showNarrator}
              onChange={(e) => onToggleNarrator(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span className="text-xs text-slate-200 font-medium">اسم الراوي</span>
          </label>

          {/* Source */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800">
            <input
              type="checkbox"
              checked={showSource}
              onChange={(e) => onToggleSource(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span className="text-xs text-slate-200 font-medium">المصدر والدرجة</span>
          </label>

          {/* Explanation */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800">
            <input
              type="checkbox"
              checked={showExplanation}
              onChange={(e) => onToggleExplanation(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span className="text-xs text-slate-200 font-medium">الشرح والفائدة</span>
          </label>

          {/* Watermark Toggle */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800">
            <input
              type="checkbox"
              checked={showWatermark}
              onChange={(e) => onToggleWatermark(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span className="text-xs text-slate-200 font-medium">شعار الحساب</span>
          </label>
        </div>
      </div>

      {/* 5. Watermark Text Input */}
      {showWatermark && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-slate-400">
            نص الشعار / اسم قناتك أو حسابك:
          </label>
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => onChangeWatermarkText(e.target.value)}
            placeholder="@yourchannel أو اسم الصفحة"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>
      )}
    </div>
  );
};
