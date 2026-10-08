import JSZip from 'jszip';
import { HADITHS_DATA, HadithItem } from '../data/hadiths';
import { BackgroundTheme } from '../data/backgrounds';
import { renderHadithCanvas, ExportSettings } from './exportMedia';

export async function generateHadithBundleZip(
  currentHadith: HadithItem,
  theme: BackgroundTheme,
  onProgress?: (text: string) => void
): Promise<void> {
  const zip = new JSZip();
  onProgress?.('جاري تحضير ملفات الحزمة...');

  // 1. Add README & Info
  const readmeContent = `# حزمة بطاقات الأحاديث النبوية الشريفة
تم إنشاؤها عبر "صانع ريلز الأحاديث النبوية".
مناسبة للنشر على إنستغرام، تيك توك، تويتر، وحالات واتساب.

التاريخ: ${new Date().toLocaleDateString('ar-EG')}
الثيم المختار: ${theme.name}
`;
  zip.file('README.txt', readmeContent);

  // 2. Add JSON of all authentic Hadiths
  zip.file('all_hadiths.json', JSON.stringify(HADITHS_DATA, null, 2));

  // 3. Render current Hadith PNG in Full HD 1080x1920
  onProgress?.('جاري توليد بطاقة ريلز بجودة فائقة...');
  const canvas = document.createElement('canvas');
  const settings: ExportSettings = {
    width: 1080,
    height: 1920,
    fontFamily: 'Amiri',
    fontSize: 48,
    showTashkeel: true,
    showNarrator: true,
    showSource: true,
    showWatermark: true,
    watermarkText: 'صانع ريلز الأحاديث النبوية',
    theme,
  };

  await renderHadithCanvas(canvas, currentHadith, settings, 1.0);
  const imageBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.92));
  if (imageBlob) {
    zip.file(`hadith-${currentHadith.id}-1080x1920.png`, imageBlob);
  }

  // 4. Add formatted text for quick copy
  const textContent = `✨ حديث نبوي شريف ✨
═══════════════════
${currentHadith.text}

🎙️ رواه: ${currentHadith.narrator}
📚 المصدر: ${currentHadith.source} (${currentHadith.grade})
💡 الشرح والفائدة: ${currentHadith.explanation || ''}
═══════════════════
#حديث_شريف #ريلز_إسلامية #سنة_نبوية #أحاديث #أذكار
`;
  zip.file(`hadith-${currentHadith.id}-caption.txt`, textContent);

  onProgress?.('جاري ضغط الملفات وتحميل الأرشيف...');
  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);

  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `hadith-reels-pack-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(downloadUrl);
}
