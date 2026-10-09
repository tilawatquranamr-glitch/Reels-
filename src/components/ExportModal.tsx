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
    height: 1280,
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
      setExportNotice('تم تصدير وحفظ صورة الريال بنجاح في جهازك!');
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

      if (generatedVideo?.objectUrl) {
        URL.revokeObjectURL(generatedVideo.objectUrl);
        setGeneratedVideo(null);
      }

      const targetDuration = videoDurationMode === 'full'
        ? Math.min(hadith.audioDuration || 30, 60)
        : 15;

      const result = await exportHadithVideo(hadith, currentSettings, targetDuration, (p) => {
        setVideoProgress(p);
      });

      setGeneratedVideo(result);
      setExportNotice('تم إنشاء الفيديو بنجاح! اضغط على "حفظ الفيديو على الهاتف" للتنزيل.');
    } catch (err: any) {
      console.error('Error generating video:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء إنشاء الفيديو');
    } finally {
      setIsExportingVideo(false);
    }
  };

  // 3. Save Video Directly to Device (بدون Share Sheet)
  const handleSaveVideoToPhone = async () => {
    if (!generatedVideo) return;
    try {
      setExportNotice(null);
      setErrorMessage(null);
      const filename = `hadith-reel-${hadith.id}.${generatedVideo.extension}`;
      
      // التنزيل المباشر برابط Blob مؤقت بدلاً من navigator.share
      const a = document.createElement('a');
      a.href = generatedVideo.objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setExportNotice('تم بدء تنزيل وحفظ الفيديو على جهازك بنجاح!');
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
      setExportNotice('تم إعداد وتحميل حزمة ZIP بنجاح!');
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

${hadith.text}

📖 رواية: ${hadith.narrator}
📚 المصدر: ${hadith.source} ${hadith.grade ? `(${hadith.grade})` : ''}
🎙️ الصوت: ${hadith.reciterName || 'حمد الدريهم'}
${hadith.explanation ? `💡 الفائدة: ${hadith.explanation}` : ''}

تم الإنشاء عبر تطبيق حديث ريلز للأندرويد
#حديث_شريف #سنة_نبوية #أحاديث #حديث_ريلز`;

    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // 6. Direct WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = `✨ *حديث نبوي شريف*\n\n« ${hadith.text} »\n\n📖 *رواية:* ${hadith.narrator}\n📚 *المصدر:* ${hadith.source}\n\nتم الإنشاء بواسطة تطبيق حديث ريلز 🕌`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto text-slate-100 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">حفظ وتصدير الفيديو</h3>
              <p className="text-xs text-slate-400">خيارات التصدير والأندرويد المتاحة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Notice */}
        {exportNotice && (
          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Video Generation Progress Indicator */}
        {isExportingVideo && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                جاري إنشاء الفيديو...
              </span>
              <span className="font-mono">{videoProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              يرجى الانتظار، يتم دمج إطارات الفيديو مع صوت التلاوة...
            </p>
          </div>
        )}

        {/* Ready Generated Video & Save to Phone Section */}
        {generatedVideo && !isExportingVideo && (
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                الفيديو جاهز الآن
              </span>
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                {generatedVideo.extension} • 720x1280
              </span>
            </div>

            {/* Video Preview */}
            <div className="w-full max-h-48 rounded-xl overflow-hidden bg-black flex justify-center">
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
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>حفظ الفيديو مباشرة على الهاتف</span>
            </button>
          </div>
        )}

        {/* Options Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            تحديد مدة الفيديو المراد إنشاؤه:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setVideoDurationMode('full')}
              disabled={isBusy}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                videoDurationMode === 'full'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              } disabled:opacity-50`}
            >
              كامل القراءة ({hadith.audioDuration || 30}ثانية)
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
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/30 hover:border-emerald-500/60 transition text-right disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              {isExportingVideo ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Video className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">
                {isExportingVideo ? 'جاري إنشاء الفيديو...' : 'إنشاء فيديو ريلز بالصوت'}
              </span>
              <span className="text-[10px] text-emerald-300/80">
                مدمج بصوت التلاوة 720x1280
              </span>
            </div>
          </button>

          {/* Export Image PNG */}
          <button
            onClick={handleExportImage}
            disabled={isBusy}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 transition text-right disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              {isExportingImage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">حفظ كصورة ريلز (PNG)</span>
              <span className="text-[10px] text-slate-400">جاهزة للحالات والقصص</span>
            </div>
          </button>

          {/* Export ZIP */}
          <button
            onClick={handleExportZip}
            disabled={isBusy}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 transition text-right disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              {isExportingZip ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileArchive className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">
                {isExportingZip ? zipStatusText || 'جاري الضغط...' : 'تصدير حزمة ZIP'}
              </span>
              <span className="text-[10px] text-slate-400">صورة + نصوص + صوت</span>
            </div>
          </button>

          {/* Copy Caption */}
          <button
            onClick={handleCopyText}
            disabled={isBusy}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 transition text-right disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              {copiedText ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">
                {copiedText ? 'تم نسخ النص بنجاح!' : 'نسخ النص للمنشور'}
              </span>
              <span className="text-[10px] text-slate-400">جاهز للحق في الكابشن</span>
            </div>
          </button>
        </div>

        {/* Share Button for WhatsApp */}
        <button
          onClick={handleWhatsAppShare}
          disabled={isBusy}
          className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-md"
        >
          <Share2 className="w-4 h-4" />
          <span>مشاركة مباشرة عبر واتساب</span>
        </button>

        {/* Android Notice */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-[10px] text-slate-400">
          <Smartphone className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            تم تحسين التصدير ليعمل بسلاسة على كافة هواتف الأندرويد ومتصفح Chrome.
          </span>
        </div>
      </div>
    </div>
  );
};
