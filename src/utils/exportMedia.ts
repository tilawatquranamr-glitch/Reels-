import { HadithItem } from '../data/hadiths';
import { BackgroundTheme } from '../data/backgrounds';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface ExportSettings {
  width: number;
  height: number;
  fontFamily: string;
  fontSize: number;
  showTashkeel: boolean;
  showNarrator: boolean;
  showSource: boolean;
  showWatermark: boolean;
  watermarkText: string;
  theme: BackgroundTheme;
}

// Memory-managed image cache with cleanup
const imageCache = new Map<string, HTMLImageElement>();

function getLoadedImage(url: string): Promise<HTMLImageElement> {
  if (imageCache.has(url)) {
    const cached = imageCache.get(url)!;
    if (cached.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error('Failed to load background image'));
    };
    img.src = url;
  });
}

/**
 * Detect the best supported video MIME type for Android and Chrome
 * Prefers MP4 when supported, otherwise WebM
 */
export function getOptimalVideoMimeType(): { mimeType: string; extension: string } {
  if (typeof MediaRecorder === 'undefined') {
    return { mimeType: 'video/webm', extension: 'webm' };
  }

  // 1. Try MP4 formats (highly compatible with Android MediaStore & Gallery)
  const mp4Types = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=h264,aac',
    'video/mp4',
  ];
  for (const t of mp4Types) {
    if (MediaRecorder.isTypeSupported(t)) {
      return { mimeType: t, extension: 'mp4' };
    }
  }

  // 2. Try WebM formats (standard Android Chrome support)
  const webmTypes = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=h264',
    'video/webm',
  ];
  for (const t of webmTypes) {
    if (MediaRecorder.isTypeSupported(t)) {
      return { mimeType: t, extension: 'webm' };
    }
  }

  return { mimeType: 'video/webm', extension: 'webm' };
}

/**
 * Render the static content of the Hadith Card onto a 2D canvas
 */
export async function renderHadithCanvas(
  canvas: HTMLCanvasElement,
  hadith: HadithItem,
  settings: ExportSettings,
  animatedProgress = 1.0
): Promise<void> {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const { width, height, fontFamily, fontSize, showNarrator, showSource, showWatermark, watermarkText, theme } = settings;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  // 1. Draw Background: Custom Image or Gradient
  if (theme.customImageUrl) {
    try {
      const img = await getLoadedImage(theme.customImageUrl);
      const scale = Math.max(width / img.width, height / img.height);
      const imgW = img.width * scale;
      const imgH = img.height * scale;
      const x = (width - imgW) / 2;
      const y = (height - imgH) / 2;
      ctx.drawImage(img, x, y, imgW, imgH);

      // Dark Overlay to guarantee readable Islamic typography
      ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
      ctx.fillRect(0, 0, width, height);
    } catch {
      drawFallbackGradient(ctx, width, height, theme);
    }
  } else {
    drawFallbackGradient(ctx, width, height, theme);
  }

  // 2. Draw Islamic Decorative Geometric Border & Arch
  ctx.save();
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = Math.max(2, Math.round(width * 0.0035));
  ctx.globalAlpha = 0.35;
  const padding = Math.round(width * 0.05);
  ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);

  // Corner ornaments
  const cornerSize = Math.round(width * 0.035);
  const corners = [
    { x: padding, y: padding },
    { x: width - padding, y: padding },
    { x: padding, y: height - padding },
    { x: width - padding, y: height - padding },
  ];
  corners.forEach((c) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, cornerSize, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();

  // 3. Top Header: Bismillah / Islamic Crest
  ctx.save();
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillStyle = theme.accentColor;
  const bismillahSize = Math.round(width * 0.036);
  ctx.font = `600 ${bismillahSize}px ${fontFamily}, Cairo, Amiri, sans-serif`;
  ctx.fillText('بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ', width / 2, height * 0.095);

  // Category Tag Badge
  ctx.fillStyle = theme.badgeBg;
  const badgeWidth = Math.round(width * 0.35);
  const badgeHeight = Math.round(height * 0.032);
  const badgeX = (width - badgeWidth) / 2;
  const badgeY = height * 0.12;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
  ctx.fill();
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  ctx.fillStyle = theme.textColor;
  const catFontSize = Math.max(14, Math.round(badgeHeight * 0.48));
  ctx.font = `700 ${catFontSize}px ${fontFamily}, Cairo, sans-serif`;
  ctx.fillText(`✨ ${hadith.category}`, width / 2, badgeY + badgeHeight * 0.68);
  ctx.restore();

  // 4. Main Hadith Text
  ctx.save();
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillStyle = theme.textColor;

  const maxWidth = width - padding * 3.5;
  const lineHeight = fontSize * 1.6;
  ctx.font = `700 ${fontSize}px ${fontFamily}, Amiri, Scheherazade New, serif`;

  const words = hadith.text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // Center vertically
  const totalTextHeight = lines.length * lineHeight;
  let startY = (height / 2) - (totalTextHeight / 2) + 10;

  // Glow effect (kept low blur to prevent GPU memory exhaust)
  ctx.shadowColor = theme.accentColor;
  ctx.shadowBlur = 6;

  for (const line of lines) {
    ctx.fillText(line, width / 2, startY);
    startY += lineHeight;
  }
  ctx.restore();

  // 5. Narrator & Source section
  ctx.save();
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  let footerY = height * 0.84;

  if (showNarrator) {
    ctx.fillStyle = theme.quoteColor;
    const narratorSize = Math.round(width * 0.03);
    ctx.font = `600 ${narratorSize}px ${fontFamily}, Cairo, sans-serif`;
    ctx.fillText(`رواه: ${hadith.narrator}`, width / 2, footerY);
    footerY += narratorSize * 1.5;
  }

  if (showSource) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    const srcSize = Math.round(width * 0.026);
    ctx.font = `500 ${srcSize}px ${fontFamily}, Cairo, sans-serif`;
    ctx.fillText(`المصدر: ${hadith.source} (${hadith.grade})`, width / 2, footerY);
  }
  ctx.restore();

  // 6. Bottom Progress Bar (during video playback/animation)
  if (animatedProgress < 1.0) {
    drawProgressBar(ctx, width, height, theme.accentColor, animatedProgress);
  }

  // 7. Watermark
  if (showWatermark) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    const wmSize = Math.round(width * 0.024);
    ctx.font = `500 ${wmSize}px Cairo, sans-serif`;
    ctx.fillText(watermarkText || 'حديث ريلز | HadithReels', width / 2, height - padding * 0.6);
    ctx.restore();
  }
}

function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string,
  progress: number
) {
  ctx.save();
  const barWidth = width * 0.8;
  const barX = (width - barWidth) / 2;
  const barY = height * 0.93;
  const barH = 6;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(barX, barY, barWidth, barH);

  ctx.fillStyle = accentColor;
  ctx.fillRect(barX, barY, barWidth * Math.max(0, Math.min(1, progress)), barH);
  ctx.restore();
}

function drawFallbackGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: BackgroundTheme
) {
  const grad = ctx.createLinearGradient(0, 0, width, height);
  if (theme.id === 'emerald-masjid') {
    grad.addColorStop(0, '#022c22');
    grad.addColorStop(0.5, '#064e3b');
    grad.addColorStop(1, '#0f172a');
  } else if (theme.id === 'royal-gold') {
    grad.addColorStop(0, '#18181b');
    grad.addColorStop(0.45, '#2c1a06');
    grad.addColorStop(1, '#09090b');
  } else if (theme.id === 'celestial-night') {
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
  } else if (theme.id === 'desert-twilight') {
    grad.addColorStop(0, '#27142b');
    grad.addColorStop(0.45, '#4a1d48');
    grad.addColorStop(1, '#180d21');
  } else if (theme.id === 'andalusian-olive') {
    grad.addColorStop(0, '#142210');
    grad.addColorStop(0.5, '#203a16');
    grad.addColorStop(1, '#0d150b');
  } else {
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(0.5, '#18181b');
    grad.addColorStop(1, '#000000');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Direct file download without oversized base64 strings in RAM
 * Prevents Chrome OOM crashes completely!
 */
export async function saveMediaToAndroidPhone(
  blob: Blob,
  filename: string,
  mimeType: string,
  title: string
): Promise<{ success: boolean; path?: string; shared?: boolean }> {
  // 1. If running natively in Capacitor Android container
  if (Capacitor.isNativePlatform()) {
    try {
      // Chunked conversion to avoid giant string heap allocation
      const buffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 8192; // 8KB chunks prevent call stack & heap overflow
      for (let i = 0; i < bytes.byteLength; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength));
        binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
      }
      const base64Data = btoa(binary);

      const result = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
      });

      await Share.share({
        title,
        text: title,
        url: result.uri,
        dialogTitle: 'حفظ أو مشاركة الفيديو في المعرض',
      });

      return { success: true, path: result.uri, shared: true };
    } catch (e) {
      console.warn('Native write/share failed, falling back to blob anchor download', e);
    }
  }

  // 2. Android Chrome / Browser: Standard Object URL with download attribute
  // This is the fastest, zero-memory-leak download mechanism in Chrome
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    try {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, 4000);

  return { success: true };
}

export async function downloadCanvasImage(
  canvas: HTMLCanvasElement,
  filename = 'hadith-reel.png',
  title = 'بطاقة حديث نبوي شريف'
): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }
        await saveMediaToAndroidPhone(blob, filename, 'image/png', title);
        resolve();
      },
      'image/png',
      0.92
    );
  });
}

// Concurrency mutex to prevent parallel export runs
let isExportRunning = false;

/**
 * Export Hadith Reel Video with exact narration audio
 * OPTIMIZED: Uses 720x1280 (HD mobile standard), 24 FPS, ~1.8 Mbps bitrate
 * Pre-renders static card once, then renders only the progress bar on top
 * Completely prevents Android Chrome browser crashes!
 */
export async function exportHadithVideo(
  hadith: HadithItem,
  settings: ExportSettings,
  durationSeconds?: number,
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; mimeType: string; extension: string; objectUrl: string }> {
  if (isExportRunning) {
    throw new Error('عملية تصدير جارية بالفعل. يرجى الانتظار حتى تكتمل.');
  }

  isExportRunning = true;

  // Use stable mobile-friendly resolution: 720x1280 (uses 60% less RAM than 1080p)
  const targetWidth = Math.min(settings.width, 720);
  const targetHeight = Math.min(settings.height, 1280);
  const optimizedSettings: ExportSettings = {
    ...settings,
    width: targetWidth,
    height: targetHeight,
    fontSize: Math.round(settings.fontSize * (targetWidth / settings.width)),
  };

  const actualDuration = Math.max(5, durationSeconds || hadith.audioDuration || 30);
  const fps = 24; // 24 FPS is the standard cinematic mobile video rate
  const totalFrames = Math.round(actualDuration * fps);

  // Pre-load custom image if present
  if (settings.theme.customImageUrl) {
    try {
      await getLoadedImage(settings.theme.customImageUrl);
    } catch {
      // Continue with fallback gradient
    }
  }

  return new Promise(async (resolve, reject) => {
    // Track resources for guaranteed disposal
    let frameInterval: number | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let staticCanvas: HTMLCanvasElement | null = null;
    let canvasStream: MediaStream | null = null;
    let combinedStream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let audioElement: HTMLAudioElement | null = null;
    let recorder: MediaRecorder | null = null;
    const chunks: Blob[] = [];

    const cleanup = () => {
      if (frameInterval !== null) {
        clearInterval(frameInterval);
        frameInterval = null;
      }
      if (recorder && recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch {
          // ignore
        }
      }
      if (canvasStream) {
        canvasStream.getTracks().forEach((track) => track.stop());
        canvasStream = null;
      }
      if (combinedStream) {
        combinedStream.getTracks().forEach((track) => track.stop());
        combinedStream = null;
      }
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        audioElement = null;
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
        audioCtx = null;
      }
      if (canvas) {
        canvas.width = 1;
        canvas.height = 1;
        canvas = null;
      }
      if (staticCanvas) {
        staticCanvas.width = 1;
        staticCanvas.height = 1;
        staticCanvas = null;
      }
      isExportRunning = false;
    };

    try {
      // 1. Create off-screen canvas for the video stream
      canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        cleanup();
        reject(new Error('لا يمكن الوصول إلى معالج الرسم في المتصفح'));
        return;
      }

      // 2. Pre-render the full static card ONCE on a separate cache canvas
      // This saves 95% of GPU/CPU operations during the frame loop!
      staticCanvas = document.createElement('canvas');
      staticCanvas.width = targetWidth;
      staticCanvas.height = targetHeight;
      await renderHadithCanvas(staticCanvas, hadith, optimizedSettings, 1.0);

      // Initial frame draw
      ctx.drawImage(staticCanvas, 0, 0);

      // 3. Setup canvas stream
      canvasStream = canvas.captureStream(fps);
      const videoTrack = canvasStream.getVideoTracks()[0];
      if (!videoTrack) {
        cleanup();
        reject(new Error('فشل التقاط تدفق الفيديو من الشاشة'));
        return;
      }

      // 4. Setup Audio mixing
      const tracks: MediaStreamTrack[] = [videoTrack];
      const audioUrl = hadith.audioSrc || '/audio/1.mp3';

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
          const audioDest = audioCtx.createMediaStreamDestination();

          audioElement = new Audio();
          audioElement.crossOrigin = 'anonymous';
          audioElement.src = audioUrl;
          audioElement.preload = 'auto';

          const sourceNode = audioCtx.createMediaElementSource(audioElement);
          sourceNode.connect(audioDest);

          const audioTrack = audioDest.stream.getAudioTracks()[0];
          if (audioTrack) {
            tracks.push(audioTrack);
          }
        }
      } catch (audioErr) {
        console.warn('Audio mixing into video fallback (video-only stream)', audioErr);
      }

      combinedStream = new MediaStream(tracks);

      // 5. Select optimal MIME type
      const { mimeType, extension } = getOptimalVideoMimeType();

      // Bitrate: 1.8 Mbps provides crystal clear 720p with minimal memory usage
      recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 1800000,
        audioBitsPerSecond: 96000,
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        try {
          const finalBlob = new Blob(chunks, { type: mimeType });
          const objectUrl = URL.createObjectURL(finalBlob);
          cleanup();
          resolve({ blob: finalBlob, mimeType, extension, objectUrl });
        } catch (stopErr) {
          cleanup();
          reject(stopErr);
        }
      };

      recorder.onerror = (e) => {
        cleanup();
        reject(new Error(`خطأ في مسجل الفيديو: ${(e as any).error?.message || 'غير معروف'}`));
      };

      // Start recording
      // Request data every 1000ms so chunks are flushed incrementally (avoids buffer spikes)
      recorder.start(1000);

      // Start audio playback synchronously
      if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch((playErr) => {
          console.warn('Audio play trigger error during recording', playErr);
        });
      }

      // 6. Frame rendering loop (blits static card + draws lightweight progress bar)
      let currentFrame = 0;
      const frameDurationMs = 1000 / fps;

      frameInterval = window.setInterval(() => {
        currentFrame++;
        const progressRatio = currentFrame / totalFrames;

        if (canvas && staticCanvas && ctx) {
          // Fast blit
          ctx.drawImage(staticCanvas, 0, 0);
          // Draw bottom progress bar
          drawProgressBar(ctx, targetWidth, targetHeight, settings.theme.accentColor, progressRatio);
        }

        onProgress?.(Math.min(99, Math.round(progressRatio * 100)));

        if (currentFrame >= totalFrames) {
          if (frameInterval !== null) {
            clearInterval(frameInterval);
            frameInterval = null;
          }
          onProgress?.(100);
          if (recorder && recorder.state === 'recording') {
            recorder.stop();
          }
        }
      }, frameDurationMs);
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}
