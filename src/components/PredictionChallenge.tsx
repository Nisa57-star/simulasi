import React, { useState } from 'react';
import { Target, CheckCircle2, XCircle, Lightbulb, RefreshCw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface ChallengeState {
  velocity: number;
  time: number;
  correctAnswer: number;
}

export const PredictionChallenge: React.FC = () => {
  // Default challenge question as specified in prompt: v = 5 m/s, t = 6 s => s = 30 m
  const [challenge, setChallenge] = useState<ChallengeState>({
    velocity: 5,
    time: 6,
    correctAnswer: 30,
  });

  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    status: 'idle' | 'correct' | 'incorrect';
    message: string;
    hint?: string;
  }>({
    status: 'idle',
    message: '',
  });

  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);

  const handleCheckAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseFloat(userAnswer.replace(',', '.').trim());

    if (isNaN(parsed)) {
      setFeedback({
        status: 'incorrect',
        message: 'Masukkan angka jawaban terlebih dahulu!',
        hint: 'Ketikkan angka jarak dalam meter (contoh: 30).',
      });
      sound.playError();
      return;
    }

    setAttemptCount((prev) => prev + 1);

    if (Math.abs(parsed - challenge.correctAnswer) < 0.01) {
      setFeedback({
        status: 'correct',
        message: 'Hebat! Prediksimu tepat.',
        hint: `Perhitungan: s = v × t = ${challenge.velocity} m/s × ${challenge.time} s = ${challenge.correctAnswer} meter.`,
      });
      setSolvedCount((prev) => prev + 1);
      sound.playSuccess();

      // Launch cheerful confetti
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    } else {
      setFeedback({
        status: 'incorrect',
        message: 'Jawabanmu belum tepat. Ayo coba hitung kembali!',
        hint: 'Petunjuk: Pada Gerak Lurus Beraturan (GLB), posisi/jarak dihitung menggunakan rumus s = v × t (jarak = kecepatan × waktu).',
      });
      sound.playError();
    }
  };

  const handleGenerateNewChallenge = () => {
    // Random velocity between 2 and 9 m/s, random time between 3 and 10 s
    const newV = Math.floor(Math.random() * 8) + 2;
    const newT = Math.floor(Math.random() * 7) + 3;
    const newS = newV * newT;

    setChallenge({
      velocity: newV,
      time: newT,
      correctAnswer: newS,
    });
    setUserAnswer('');
    setFeedback({
      status: 'idle',
      message: '',
    });
    sound.playTick();
  };

  const handleResetToDefault = () => {
    setChallenge({
      velocity: 5,
      time: 6,
      correctAnswer: 30,
    });
    setUserAnswer('');
    setFeedback({
      status: 'idle',
      message: '',
    });
    sound.playTick();
  };

  return (
    <div id="tantangan-prediksi-card" className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Tantangan Prediksi
            </h3>
            <p className="text-xs text-slate-500">
              Uji pemahamanmu mengenai hubungan s = v × t sebelum melihat jawaban
            </p>
          </div>
        </div>

        {solvedCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Tantangan Terpecahkan: {solvedCount}</span>
          </div>
        )}
      </div>

      {/* Main Question Box */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100">
        <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
          Soal Tantangan Fisika:
        </div>
        <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
          “Jika mobil bergerak dengan kecepatan{' '}
          <span className="text-blue-700 underline underline-offset-4">
            {challenge.velocity} m/s
          </span>
          , berapa posisi mobil setelah{' '}
          <span className="text-amber-700 underline underline-offset-4">
            {challenge.time} detik
          </span>
          ?”
        </p>

        {/* Input Form */}
        <form onSubmit={handleCheckAnswer} className="mt-4 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <input
              id="challenge-input"
              type="number"
              step="any"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Ketikkan jawaban posisi..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none pr-12 font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              meter
            </span>
          </div>

          <button
            id="btn-cek-jawaban"
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>CEK JAWABAN</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateNewChallenge}
            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1"
            title="Buat soal tantangan acak baru"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Soal Baru</span>
          </button>
        </form>

        {/* Feedback Section */}
        {feedback.status !== 'idle' && (
          <div
            className={`mt-4 p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
              feedback.status === 'correct'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {feedback.status === 'correct' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold">{feedback.message}</p>
              {feedback.hint && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-start gap-1.5 text-xs text-slate-700">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{feedback.hint}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Restore default button if modified */}
        {challenge.velocity !== 5 && (
          <button
            type="button"
            onClick={handleResetToDefault}
            className="mt-2 text-[11px] text-slate-500 hover:text-blue-600 underline"
          >
            Kembali ke soal standar (v = 5 m/s, t = 6 s)
          </button>
        )}
      </div>
    </div>
  );
};
