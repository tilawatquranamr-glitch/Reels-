import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Terminal,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
  FolderCheck,
  Package,
} from 'lucide-react';

interface AndroidCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCompanionModal: React.FC<AndroidCompanionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const buildCommand = `cd android && chmod +x gradlew && ./gradlew assembleDebug`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(buildCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                مشروع أندرويد الكامل (APK & AAB)
              </h3>
              <p className="text-xs text-slate-400">
                التطبيق: حديث ريلز 1 | الحزمة: com.hadithreels.app
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Standalone Direct APK Download Section */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border-2 border-emerald-500/60 flex flex-col gap-3.5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/40">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  تنزيل ملف APK المباشر والمستقل
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                    بدون مشروع الـ ZIP
                  </span>
                </h4>
                <p className="text-[11px] text-emerald-200/80">
                  حجم خفيف (~20-25 MB) جاهز للتثبيت الفوري على الهاتف بنقرة واحدة
                </p>
              </div>
            </div>
          </div>

          {/* APK Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  app-debug.apk
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  للتجربة المباشرة
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                مثالي للتثبيت الفوري السريع على هاتفك الأندرويد دون الحاجة لأي مفاتيح أو فك ضغط.
              </p>
              <div className="mt-auto pt-1 font-mono text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800 break-all select-all text-left" dir="ltr">
                releases/latest/download/app-debug.apk
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-teal-500/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  app-release.apk
                </span>
                <span className="text-[10px] font-mono text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-500/30">
                  النسخة الموقعة
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                نسخة نهائية مجهزة وموقعة تلقائياً للتشغيل المستقر ومشاركتها عبر واتساب وتليجرام.
              </p>
              <div className="mt-auto pt-1 font-mono text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800 break-all select-all text-left" dir="ltr">
                releases/latest/download/app-release.apk
              </div>
            </div>
          </div>

          {/* GitHub Actions Auto-Build Banner */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>الرابط المباشر للـ APK عبر GitHub Releases:</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">بناء تلقائي 100%</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              تم إعداد وتجهيز سير عمل <span className="font-mono text-emerald-300">.github/workflows/release.yml</span> ليقوم ببناء ملف الـ APK ورفعه تلقائياً وتوفير هذا الرابط المباشر لهاتفك:
            </p>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 select-all text-left" dir="ltr">
              https://github.com/USERNAME/REPO/releases/latest/download/app-debug.apk
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">42 حديثاً كاملاً</span>
            <span className="text-[10px] text-slate-400">مدمجة Offline بالصوت النبوي</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-slate-200">تصدير بدون تهنيج</span>
            <span className="text-[10px] text-slate-400">720p HD بذاكرة منخفضة</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1">
            <FolderCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">مشروع Android Studio</span>
            <span className="text-[10px] text-slate-400">Gradle 8.14 جاهز للتجميع</span>
          </div>
        </div>

        {/* Output Locations */}
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-xs text-slate-300">
            📍 مسارات ملفات APK و AAB الناتجة بعد البناء:
          </h4>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-left" dir="ltr">
              <span className="text-slate-500 font-sans text-[10px] block">Debug APK (للتجربة المباشرة):</span>
              android/app/build/outputs/apk/debug/app-debug.apk
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 text-left" dir="ltr">
              <span className="text-slate-500 font-sans text-[10px] block">Google Play Bundle (للمتجر AAB):</span>
              android/app/build/outputs/bundle/release/app-release.aab
            </div>
          </div>
        </div>

        {/* Build Commands */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              أوامر البناء في الطرفية (Terminal):
            </h4>
            <button
              onClick={handleCopyCommand}
              className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الأمر</span>
                </>
              )}
            </button>
          </div>
          <div
            className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1 text-left"
            dir="ltr"
          >
            <p className="text-slate-500"># 1. بناء ملف APK للتثبيت المباشر بنقرة واحدة</p>
            <p className="text-emerald-300 font-bold select-all">
              ./build-apk.sh
            </p>
            <p className="text-slate-500 mt-2"># أو يدوياً عبر Gradle (Debug & Release):</p>
            <p className="text-white select-all">
              cd android && chmod +x gradlew && ./gradlew assembleDebug assembleRelease
            </p>
            <p className="text-slate-500 mt-2"># 2. بناء حزمة AAB لمتجر Google Play</p>
            <p className="text-amber-300 select-all">
              cd android && ./gradlew bundleRelease
            </p>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
        >
          إغلاق ومتابعة التصميم
        </button>
      </div>
    </div>
  );
};
