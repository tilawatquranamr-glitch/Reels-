import React, { useEffect, useState, useRef } from 'react';
import { speechManager, TTSState } from '../utils/tts';
import { HadithItem } from '../data/hadiths';
import {
  Volume2,
  Play,
  Pause,
  Square,
  Mic,
  Music,
  Gauge,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface AudioVoicePanelProps {
  hadith: HadithItem;
  onAudioStateChange: (state: TTSState) => void;
}

export const AudioVoicePanel: React.FC<AudioVoicePanelProps> = ({
  hadith,
  onAudioStateChange,
}) => {
  const [rate, setRate] = useState<number>(1.0);
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentWordIndex: -1,
    progress: 0,
    currentTime: 0,
    duration: hadith.audioDuration || 0,
  });

  // Ambient sound state using Web Audio API
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    speechManager.onStateChange((state) => {
      setTtsState(state);
      onAudioStateChange(state);
    });
  }, []);

  // Ambient Sound Generator (Calming, spiritual gentle resonance tone)
  const toggleAmbientSound = () => {
    if (ambientPlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setAmbientPlaying(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm harmonic frequencies
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(146.83, ctx.currentTime); // D3

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(220.0, ctx.currentTime); // A3

        gain.gain.setValueAtTime(0.035, ctx.currentTime);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        audioCtxRef.current = ctx;
        setAmbientPlaying(true);
      } catch (err) {
        console.error('AudioContext error', err);
      }
    }
  };

  const handlePlayAudio = () => {
    if (ttsState.isPaused) {
      speechManager.resume();
    } else if (ttsState.isPlaying) {
      speechManager.pause();
    } else {
      speechManager.playHadith(hadith, { rate });
    }
  };

  const handleStopAudio = () => {
    speechManager.stop();
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100">
              التعليق الصوتي النبوي الأصيل
            </h3>
            <p className="text-[11px] text-slate-400">
              صوت وقراءة الأستاذ حمد الدريهم (الصوت المعتمد 1.mp3)
            </p>
          </div>
        </div>

        {/* Ambient background sound button */}
        <button
          onClick={toggleAmbientSound}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
            ambientPlaying
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 ring-2 ring-amber-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="تشغيل صدى صوتي روحاني هادئ في الخلفية"
        >
          <Music className={`w-3.5 h-3.5 ${ambientPlaying ? 'animate-spin' : ''}`} />
          <span>{ambientPlaying ? 'الصدى الروحاني يعمل' : 'صدى روحاني هادئ'}</span>
        </button>
      </div>

      {/* Reciter Badge & Verification */}
      <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>القارئ المعتمد:</strong> {hadith.reciterName || 'حمد الدريهم'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-[11px] font-mono">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{formatSeconds(hadith.audioDuration)} دقيقة</span>
        </div>
      </div>

      {/* Main Playback Bar */}
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayAudio}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              {ttsState.isPlaying && !ttsState.isPaused ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white translate-x-[-1px]" />
                  <span>{ttsState.isPaused ? 'متابعة الاستماع' : 'استماع لصوت الحديث'}</span>
                </>
              )}
            </button>

            {ttsState.isPlaying && (
              <button
                onClick={handleStopAudio}
                className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
                title="إيقاف كلي"
              >
                <Square className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-300">
              {formatSeconds(ttsState.currentTime)} / {formatSeconds(ttsState.duration || hadith.audioDuration)}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {ttsState.progress}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-150"
            style={{ width: `${ttsState.progress}%` }}
          />
        </div>
      </div>

      {/* Speed Control Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-emerald-400" />
            سرعة الإلقاء الصوتي
          </span>
          <span className="text-emerald-400 font-mono text-[11px]">{rate}x</span>
        </div>
        <input
          type="range"
          min={0.8}
          max={1.3}
          step={0.05}
          value={rate}
          onChange={(e) => {
            const newRate = Number(e.target.value);
            setRate(newRate);
            const audio = speechManager.getAudioElement();
            if (audio) audio.playbackRate = newRate;
          }}
          className="accent-emerald-500 cursor-pointer w-full mt-1"
        />
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5">
        ✨ <strong className="text-slate-200">الصوت المعتمد:</strong> تم تضمين صوت الإلقاء الرجالي الفصيح المسجل في <code>1.mp3</code> لكل حديث نبوي، ويتم دمجه تلقائياً في ملف الفيديو المصدّر بحيث لا يفقد الصوت أبداً عند تشغيل أو تصدير الريلز على أجهزة أندرويد.
      </p>
    </div>
  );
};
