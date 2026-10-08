import { HadithItem } from '../data/hadiths';

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentWordIndex: number;
  progress: number;
  currentTime: number;
  duration: number;
}

export class HadithNarrationManager {
  private audioElement: HTMLAudioElement | null = null;
  private currentHadith: HadithItem | null = null;
  private onStateChangeCallback: ((state: TTSState) => void) | null = null;
  private animFrameId: number | null = null;

  // SpeechSynthesis ONLY for custom non-catalog text if ever needed
  private synth: SpeechSynthesis | null = null;

  private state: TTSState = {
    isPlaying: false,
    isPaused: false,
    currentWordIndex: -1,
    progress: 0,
    currentTime: 0,
    duration: 0,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';

      this.audioElement.addEventListener('timeupdate', () => this.handleTimeUpdate());
      this.audioElement.addEventListener('ended', () => this.handleEnded());
      this.audioElement.addEventListener('pause', () => {
        if (!this.audioElement?.ended) {
          this.updateState({ isPlaying: false, isPaused: true });
        }
      });
      this.audioElement.addEventListener('play', () => {
        this.updateState({ isPlaying: true, isPaused: false });
      });

      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  public onStateChange(callback: (state: TTSState) => void) {
    this.onStateChangeCallback = callback;
  }

  private updateState(partial: Partial<TTSState>) {
    this.state = { ...this.state, ...partial };
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.state);
    }
  }

  private handleTimeUpdate() {
    if (!this.audioElement) return;

    const current = this.audioElement.currentTime;
    const dur = this.audioElement.duration || this.currentHadith?.audioDuration || 1;
    const progress = Math.min(100, Math.round((current / dur) * 100));

    // Word tracking based on actual timing
    let wordIdx = -1;
    if (this.currentHadith) {
      const words = this.currentHadith.text.split(' ');
      const wordProgress = current / dur;
      wordIdx = Math.min(words.length - 1, Math.floor(wordProgress * words.length));
    }

    this.updateState({
      currentTime: current,
      duration: dur,
      progress,
      currentWordIndex: wordIdx,
    });
  }

  private handleEnded() {
    this.updateState({
      isPlaying: false,
      isPaused: false,
      currentWordIndex: -1,
      progress: 100,
    });
  }

  /**
   * Play the authentic male audio narration from 1.mp3 / sliced hadith assets
   */
  public playHadith(hadith: HadithItem, options?: { rate?: number }) {
    this.stop();
    this.currentHadith = hadith;

    if (this.audioElement && hadith.audioSrc) {
      this.audioElement.src = hadith.audioSrc;
      this.audioElement.playbackRate = options?.rate ?? 1.0;
      this.audioElement.currentTime = 0;

      this.audioElement
        .play()
        .then(() => {
          this.updateState({
            isPlaying: true,
            isPaused: false,
            currentWordIndex: 0,
            progress: 0,
            duration: hadith.audioDuration,
          });
        })
        .catch((err) => {
          console.warn('Direct audio play failed, trying fallback:', err);
          // Fallback to custom speech if file cannot be reached
          this.speakCustomFallback(hadith.text, options);
        });
    } else {
      // Fallback for custom added hadiths
      this.speakCustomFallback(hadith.text, options);
    }
  }

  /**
   * Dignified Male Voice Fallback using calm low pitch for custom user-added hadiths
   */
  private speakCustomFallback(text: string, options?: { rate?: number }) {
    if (!this.synth) return;

    this.stop();
    const cleanText = text.replace(/[«»""'']/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    // Dignified, calm male characteristics
    utterance.pitch = 0.78; // deeper male resonance
    utterance.rate = options?.rate ? options.rate * 0.88 : 0.85;

    // Filter strictly for male Arabic voice if available
    const voices = this.synth.getVoices();
    const arVoices = voices.filter((v) => v.lang.startsWith('ar'));
    const maleVoice = arVoices.find(
      (v) =>
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('tariq') ||
        v.name.toLowerCase().includes('maged') ||
        v.name.toLowerCase().includes('hamad')
    );
    if (maleVoice) {
      utterance.voice = maleVoice;
    } else if (arVoices.length > 0) {
      utterance.voice = arVoices[0];
      utterance.pitch = 0.75; // enforce male pitch
    }

    const words = cleanText.split(/\s+/);
    let wordCount = 0;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        wordCount++;
        const prog = Math.min(100, Math.round((wordCount / Math.max(1, words.length)) * 100));
        this.updateState({
          currentWordIndex: wordCount - 1,
          progress: prog,
        });
      }
    };

    utterance.onstart = () => {
      this.updateState({
        isPlaying: true,
        isPaused: false,
        currentWordIndex: 0,
        progress: 0,
      });
    };

    utterance.onend = () => {
      this.handleEnded();
    };

    utterance.onerror = () => {
      this.updateState({ isPlaying: false, isPaused: false });
    };

    this.synth.speak(utterance);
  }

  public pause() {
    if (this.audioElement && this.state.isPlaying) {
      this.audioElement.pause();
    } else if (this.synth && this.state.isPlaying) {
      this.synth.pause();
      this.updateState({ isPaused: true });
    }
  }

  public resume() {
    if (this.audioElement && this.state.isPaused) {
      this.audioElement.play();
    } else if (this.synth && this.state.isPaused) {
      this.synth.resume();
      this.updateState({ isPaused: false });
    }
  }

  public stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.updateState({
      isPlaying: false,
      isPaused: false,
      currentWordIndex: -1,
      progress: 0,
      currentTime: 0,
    });
  }

  public getAudioElement(): HTMLAudioElement | null {
    return this.audioElement;
  }
}

export const speechManager = new HadithNarrationManager();
