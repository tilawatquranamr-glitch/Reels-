export interface BackgroundTheme {
  id: string;
  name: string;
  category: 'إسلامي كلاسيكي' | 'طبيعة هادئة' | 'ألوان ملكية' | 'تدرج حديث' | 'مخصص';
  bgGradient: string;
  patternType: 'arabesque' | 'stars' | 'arch' | 'circles' | 'none';
  accentColor: string;
  textColor: string;
  quoteColor: string;
  badgeBg: string;
  borderStyle: string;
  particleColor: string;
  customImageUrl?: string;
}

export const BACKGROUND_PRESETS: BackgroundTheme[] = [
  {
    id: 'emerald-masjid',
    name: 'الزمرد النبوي',
    category: 'إسلامي كلاسيكي',
    bgGradient: 'linear-gradient(145deg, #022c22 0%, #064e3b 45%, #0f172a 100%)',
    patternType: 'arabesque',
    accentColor: '#34d399',
    textColor: '#f8fafc',
    quoteColor: '#a7f3d0',
    badgeBg: 'rgba(6, 78, 59, 0.7)',
    borderStyle: 'border-emerald-500/30',
    particleColor: 'rgba(52, 211, 153, 0.25)',
  },
  {
    id: 'royal-gold',
    name: 'المحراب الذهبي',
    category: 'ألوان ملكية',
    bgGradient: 'linear-gradient(135deg, #18181b 0%, #291807 40%, #09090b 100%)',
    patternType: 'arch',
    accentColor: '#fbbf24',
    textColor: '#fef3c7',
    quoteColor: '#fde68a',
    badgeBg: 'rgba(120, 53, 15, 0.6)',
    borderStyle: 'border-amber-500/40',
    particleColor: 'rgba(251, 191, 36, 0.3)',
  },
  {
    id: 'celestial-night',
    name: 'ليالي السكينة',
    category: 'تدرج حديث',
    bgGradient: 'linear-gradient(160deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
    patternType: 'stars',
    accentColor: '#60a5fa',
    textColor: '#f8fafc',
    quoteColor: '#93c5fd',
    badgeBg: 'rgba(30, 41, 59, 0.7)',
    borderStyle: 'border-sky-500/30',
    particleColor: 'rgba(96, 165, 250, 0.25)',
  },
  {
    id: 'desert-twilight',
    name: 'شفق الروح',
    category: 'طبيعة هادئة',
    bgGradient: 'linear-gradient(135deg, #27142b 0%, #4a1d48 45%, #180d21 100%)',
    patternType: 'circles',
    accentColor: '#f472b6',
    textColor: '#fdf2f8',
    quoteColor: '#fbcfe8',
    badgeBg: 'rgba(74, 29, 72, 0.7)',
    borderStyle: 'border-pink-500/30',
    particleColor: 'rgba(244, 114, 182, 0.25)',
  },
  {
    id: 'andalusian-olive',
    name: 'الزيتون الأندلسي',
    category: 'إسلامي كلاسيكي',
    bgGradient: 'linear-gradient(145deg, #142210 0%, #203a16 50%, #0d150b 100%)',
    patternType: 'arabesque',
    accentColor: '#a3e635',
    textColor: '#f7fee7',
    quoteColor: '#d9f99d',
    badgeBg: 'rgba(32, 58, 22, 0.7)',
    borderStyle: 'border-lime-500/30',
    particleColor: 'rgba(163, 230, 53, 0.25)',
  },
  {
    id: 'deep-obsidian',
    name: 'الفخامة السوداء',
    category: 'ألوان ملكية',
    bgGradient: 'linear-gradient(180deg, #09090b 0%, #18181b 50%, #000000 100%)',
    patternType: 'stars',
    accentColor: '#e4e4e7',
    textColor: '#ffffff',
    quoteColor: '#d4d4d8',
    badgeBg: 'rgba(39, 39, 42, 0.8)',
    borderStyle: 'border-zinc-700/50',
    particleColor: 'rgba(255, 255, 255, 0.2)',
  }
];
