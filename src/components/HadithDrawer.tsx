import React, { useState, useMemo } from 'react';
import { HADITHS_DATA, CATEGORIES, HadithItem } from '../data/hadiths';
import { Search, X, Check, BookOpen, PlusCircle, Sparkles, Filter } from 'lucide-react';

interface HadithDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHadithId: string;
  onSelectHadith: (hadith: HadithItem) => void;
  onAddCustomHadith: (hadith: HadithItem) => void;
}

export const HadithDrawer: React.FC<HadithDrawerProps> = ({
  isOpen,
  onClose,
  selectedHadithId,
  onSelectHadith,
  onAddCustomHadith,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Custom Hadith Form State
  const [customText, setCustomText] = useState('');
  const [customNarrator, setCustomNarrator] = useState('');
  const [customSource, setCustomSource] = useState('');
  const [customCategory, setCustomCategory] = useState<HadithItem['category']>('الأخلاق والآداب');
  const [customExplanation, setCustomExplanation] = useState('');

  const filteredHadiths = useMemo(() => {
    return HADITHS_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'الكل' || item.category === selectedCategory;
      const matchesQuery =
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.narrator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    const newItem: HadithItem = {
      id: `custom-${Date.now()}`,
      number: HADITHS_DATA.length + 1,
      text: customText.trim(),
      narrator: customNarrator.trim() || 'صحابي جليل رضي الله عنه',
      source: customSource.trim() || 'حديث صحيح',
      category: customCategory,
      grade: 'مقبول',
      explanation: customExplanation.trim(),
      audioSrc: '',
      audioDuration: 30,
      reciterName: 'حمد الدريهم (محاكاة نبرة وقورة)',
    };

    onAddCustomHadith(newItem);
    onSelectHadith(newItem);
    setShowCustomModal(false);
    onClose();
    setCustomText('');
    setCustomNarrator('');
    setCustomSource('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-100">
                مكتبة الأحاديث النبوية الشريفة
              </h3>
              <p className="text-xs text-slate-400">
                اختر حديثاً شريفاً مصححاً أو أضف نصك الخاص
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>إضافة حديث خاص</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Category Filters */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بكلمة من متن الحديث أو اسم الصحابي..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-white font-bold shadow'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Hadith List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 divide-y divide-slate-800/40">
          {filteredHadiths.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center gap-3 text-slate-400">
              <Filter className="w-8 h-8 opacity-40" />
              <p className="text-sm">لم يتم العثور على أحاديث تطابق بحثك</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('الكل');
                }}
                className="text-xs text-emerald-400 underline"
              >
                عرض جميع الأحاديث
              </button>
            </div>
          ) : (
            filteredHadiths.map((item) => {
              const isSelected = item.id === selectedHadithId;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHadith(item);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl cursor-pointer transition flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-emerald-950/40 border border-emerald-500/50'
                      : 'hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                        <Check className="w-3.5 h-3.5" />
                        المحدد حالياً
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed font-serif line-clamp-3">
                    {item.text}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>رواه: {item.narrator}</span>
                    <span className="text-[10px] text-slate-500">{item.source}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Custom Hadith Modal Popup */}
        {showCustomModal && (
          <div className="absolute inset-0 bg-slate-950/95 z-30 p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  كتابة أو تخصيص حديث نبوي
                </h4>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCustom} className="mt-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-300 font-medium">نص الحديث الشريف:</label>
                  <textarea
                    rows={4}
                    required
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="اكتب أو الصق نص الحديث النبوي هنا..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-serif leading-relaxed focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-300 font-medium">الراوي (الصحابي):</label>
                    <input
                      type="text"
                      value={customNarrator}
                      onChange={(e) => setCustomNarrator(e.target.value)}
                      placeholder="مثال: عمر بن الخطاب رضي الله عنه"
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-300 font-medium">المصدر / التخريج:</label>
                    <input
                      type="text"
                      value={customSource}
                      onChange={(e) => setCustomSource(e.target.value)}
                      placeholder="مثال: صحيح البخاري"
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-300 font-medium">الشرح أو الفائدة:</label>
                  <input
                    type="text"
                    value={customExplanation}
                    onChange={(e) => setCustomExplanation(e.target.value)}
                    placeholder="فائدة مختصرة أو معلومة عن الحديث..."
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                  >
                    تطبيق الحديث
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
