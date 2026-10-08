import React, { useState, useEffect } from 'react';
import { HadithItem } from '../data/hadiths';
import { BackgroundTheme } from '../data/backgrounds';
import {
  renderHadithCanvas,
  downloadCanvasImage,
  exportHadithVideo,
  saveMediaToAndroidPhone,
  ExportSettings,
} from '../utils/exportMedia';
import { generateHadithBundleZip } from '../utils/zipDownloader';
import {
  X,
  Download,
  Video,
  Image as ImageIcon,
  Copy,
  Check,
  Share2,
  FileArchive,
  Loader2,
  Smartphone,
  CheckCircle,
  Volume2,
  AlertCircle,
  Play,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  hadith: HadithItem;
  theme: BackgroundTheme;
  fontFamily: string;
  fontSize: number;
  showTashkeel: boolean;
  showNarrator: boolean;
  showSource: boolean;
  showWatermark: boolean;
  watermarkText: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  hadith,
  theme,
  fontFamily,
  fontSize,
  showTashkeel,
  showNarrator,
  showSource,
  showWatermark,
  watermarkText,
}) => {
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipStatusText, setZipStatusText] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoDurationMode, setVideoDurationMode] = useState<'full' | 'short'>('full');

  // Generated Video state
  const [generatedVideo, setGeneratedVideo] = useState<{
    blob: Blob;
    objectUrl: string;
    extension: string;
    mimeType: string;
  } | null>(null);

  // Clean up object URLs on unmount or when modal closes
  useEffect(() => {
    return () => {
      if (generatedVideo?.objectUrl) {
        URL.revokeObjectURL(generatedVideo.objectUrl);
      }
    };
  }, [generatedVideo]);

  if (!isOpen) return null;

  const isBusy = isExportingImage || isExportingVideo || isExportingZip;

  const currentSettings: ExportSettings = {
    width: 720,
    height: 1280, // Optimized 720x1280 mobile reels resolution (no OOM crashes)
    fontFamily,
    fontSize: Math.round(fontSize * 1.3),
    showTashkeel,
    showNarrator,
    showSource,
    showWatermark,
    watermarkText,
    theme,
  };

  // 1. Export High-Res PNG & Save to Android
  const handleExportImage = async () => {
    if (isBusy) return;
    try {
      setIsExportingImage(true);
      setExportNotice(null);
      setErrorMessage(null);
      const canvas = document.createElement('canvas');
      await renderHadithCanvas(canvas, hadith, currentSettings, 1.0);
      await downloadCanvasImage(
        canvas,
        `hadith-reel-${hadith.id}.png`,
        `حديث نبوي: ${hadith.narrator}`
      );
      setExportNotice('تم تصدير وحفظ صورة الريلز بنجاح في جهازك!');
    } catch (err: any) {
      console.error('Error exporting image:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء حفظ الصورة');
    } finally {
      setIsExportingImage(false);
    }
  };

  // 2. Generate Reel Video with Narration Audio
  const handleGenerateVideo = async () => {
    if (isBusy) return;
    try {
      setIsExportingVideo(true);
      setVideoProgress(0);
      setExportNotice(null);
      setErrorMessage(null);

      // Clean old video object URL if any
      if (generatedVideo?.objectUrl) {
        URL.revokeObjectURL(generatedVideo.objectUrl);
        setGeneratedVideo(null);
      }

      // Max 60s for full narration to prevent huge memory spikes, or 15s for short clip
      const targetDuration = videoDurationMode === 'full'
        ? Math.min(hadith.audioDuration || 30, 60)
        : 15;

      const result = await exportHadithVideo(hadith, currentSettings, targetDuration, (p) => {
        setVideoProgress(p);
      });

      setGeneratedVideo(result);
      setExportNotice('تم إنشاء فيديو الريلز بنجاح! اضغط على زر "حفظ الفيديو على الهاتف" للتحميل.');
    } catch (err: any) {
      console.error('Error generating video:', err);
      setErrorMessage(err?.message || 'حدث خطأ غير متوقع أثناء معالجة وتوليد الفيديو');
    } finally {
      setIsExportingVideo(false);
    }
  };

  // 3. Save the generated video to phone / gallery
  const handleSaveVideoToPhone = async () => {
    if (!generatedVideo) return;
    try {
      setExportNotice(null);
      setErrorMessage(null);
      const filename = `hadith-reel-${hadith.id}.${generatedVideo.extension}`;
      await saveMediaToAndroidPhone(
        generatedVideo.blob,
        filename,
        generatedVideo.mimeType,
        `ريلز حديث نبوي شريف: ${hadith.narrator}`
      );
      setExportNotice('تم بدء تنزيل وحفظ الفيديو بنجاح على هاتفك!');
    } catch (err: any) {
      console.error('Error saving video to phone:', err);
      setErrorMessage(err?.message || 'فشل حفظ الفيديو على الجهاز');
    }
  };

  // 4. Export ZIP Bundle
  const handleExportZip = async () => {
    if (isBusy) return;
    try {
      setIsExportingZip(true);
      setExportNotice(null);
      setErrorMessage(null);
      await generateHadithBundleZip(hadith, theme, (status) => {
        setZipStatusText(status);
      });
      setExportNotice('تم تحميل حزمة ZIP الكاملة بنجاح!');
    } catch (err: any) {
      console.error('Error generating ZIP:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء تجميع ملف ZIP');
    } finally {
      setIsExportingZip(false);
    }
  };

  // 5. Copy Formatted Text for Social Media
  const handleCopyText = async () => {
    const formatted = `✨ حديث نبوي شريف ✨
═══════════════════
${hadith.text}

🎙️ رواه: ${hadith.narrator}
📚 المصدر: ${hadith.source} (${hadith.grade})
🔊 بصوت القارئ: ${hadith.reciterName || 'حمد الدريهم'}
${hadith.explanation ? `💡 الفائدة: ${hadith.explanation}` : ''}
═══════════════════
تم الإنشاء عبر تطبيق "حديث ريلز" للأندرويد
#حديث_شريف #ريلز_إسلامية #سنة_نبوية #أحاديث #حديث_ريلز`;

    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // 6. Native Share API (Android / Mobile)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'حديث نبوي شريف',
          text: `${hadith.text}\n\nرواه: ${hadith.narrator}\n${hadith.source}`,
        });
      } catch (e) {
        console.log('Share canceled');
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">تصدير وحفظ الفيديو</h3>
              <p className="text-xs text-slate-400">توليد مستقر وخفيف لأجهزة أندرويد وكروم</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Notice */}
        {exportNotice && (
          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Video Generation Progress Indicator */}
        {isExportingVideo && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                جارٍ إنشاء الفيديو...
              </span>
              <span className="font-mono">{videoProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-150"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400">
              يتم دمج إطارات الفيديو عالية الدقة مع صوت الإلقاء النبوي (1.mp3) باستهلاك منخفض للذاكرة...
            </span>
          </div>
        )}

        {/* Ready Generated Video & "Save to Phone" Section */}
        {generatedVideo && !isExportingVideo && (
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-emerald-500/40 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                فيديو الريلز جاهز الآن!
              </span>
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                {generatedVideo.extension} • 720x1280
              </span>
            </div>

            {/* Video Preview */}
            <div className="w-full max-h-48 rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <video
                src={generatedVideo.objectUrl}
                controls
                playsInline
                className="max-h-48 rounded-xl mx-auto"
              />
            </div>

            {/* Save to Phone Button */}
            <button
              onClick={handleSaveVideoToPhone}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span>حفظ الفيديو على الهاتف</span>
            </button>
          </div>
        )}

        {/* Video Duration Selector */}
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              مدة الفيديو مع الصوت النبوي (1.mp3)
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              {hadith.audioDuration} ثانية
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => setVideoDurationMode('full')}
              disabled={isBusy}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                videoDurationMode === 'full'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              } disabled:opacity-50`}
            >
              مدة القراءة ({Math.min(hadith.audioDuration || 30, 60)} ثانية)
            </button>
            <button
              onClick={() => setVideoDurationMode('short')}
              disabled={isBusy}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                videoDurationMode === 'short'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              } disabled:opacity-50`}
            >
              مقطع ريلز سريع (15 ثانية)
            </button>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Generate Video Button */}
          <button
            onClick={handleGenerateVideo}
            disabled={isBusy}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-right shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              {isExportingVideo ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Video className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">
                {isExportingVideo ? 'جارٍ إنشاء الفيديو...' : 'إنشاء فيديو ريلز بالصوت'}
              </span>
              <span className="text-[10px] text-emerald-100 font-normal">
                720x1280 HD مدمج بالصوت
              </span>
            </div>
          </button>

          {/* Export Image PNG */}
          <button
            onClick={handleExportImage}
            disabled={isBusy}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-right shadow transition active:scale-95 disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              {isExportingImage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">حفظ كصورة ريلز (PNG)</span>
              <span className="text-[10px] text-slate-400 font-normal">
                جاهزة للحالات والقصص والإنستغرام
              </span>
            </div>
          </button>

          {/* Export ZIP */}
          <button
            onClick={handleExportZip}
            disabled={isBusy}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-right shadow transition active:scale-95 disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              {isExportingZip ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileArchive className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">
                {isExportingZip ? zipStatusText || 'جاري الضغط...' : 'حزمة الأحاديث (ZIP)'}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                صورة + نصوص + 42 حديثاً
              </span>
            </div>
          </button>

          {/* Copy Caption */}
          <button
            onClick={handleCopyText}
            disabled={isBusy}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-right shadow transition active:scale-95 disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              {copiedText ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">
                {copiedText ? 'تم نسخ النص بنجاح!' : 'نسخ النص المنسق'}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                جاهز للصق في كابشن النشر
              </span>
            </div>
          </button>
        </div>

        {/* Android Project Status Card */}
        <div className="w-full p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">مشروع أندرويد الأصلي مدمج في مجلد (android/)</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">195 MB</span>
        </div>

        {/* Share Button for Mobile */}
        <button
          onClick={handleShare}
          disabled={isBusy}
          className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span>مشاركة مباشرة عبر تطبيقات الهاتف وواتساب وتيك توك</span>
        </button>

        {/* Android Notice */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center gap-2 text-[11px] text-slate-400">
          <Smartphone className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            تم تحسين التصدير ليعمل بسلاسة تامة على هواتف أندرويد ومتصفح Chrome دون استهلاك زائد للذاكرة.
          </span>
        </div>
      </div>
    </div>
  );
};
