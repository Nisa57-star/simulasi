import React, { useState } from 'react';
import { HelpCircle, Check, Eye, EyeOff, Printer, BookmarkCheck } from 'lucide-react';
import { InquiryAnswer } from '../types';
import { sound } from '../utils/audio';

const INITIAL_QUESTIONS: InquiryAnswer[] = [
  {
    id: 1,
    question: 'Apa yang terjadi pada posisi mobil setiap detik?',
    answer: '',
    hint: 'Posisi mobil selalu bertambah secara teratur ke arah kanan (misal bertambah 2 meter setiap detik).',
  },
  {
    id: 2,
    question: 'Apakah mobil menempuh jarak yang sama setiap detik?',
    answer: '',
    hint: 'Ya, pada selang waktu yang sama (setiap 1 detik), jarak yang ditempuh mobil selalu sama besar.',
  },
  {
    id: 3,
    question: 'Bagaimana bentuk grafik posisi terhadap waktu?',
    answer: '',
    hint: 'Bentuk grafik hubungan posisi (s) terhadap waktu (t) berupa garis lurus miring ke atas (linear).',
  },
  {
    id: 4,
    question: 'Apa hubungan antara kemiringan grafik dengan kecepatan?',
    answer: '',
    hint: 'Kemiringan atau gradien garis grafik (v = Δs / Δt) menyatakan besar kecepatan mobil.',
  },
  {
    id: 5,
    question: 'Apa yang terjadi pada grafik jika kecepatan diperbesar?',
    answer: '',
    hint: 'Jika kecepatan diperbesar (misal dari 2 m/s ke 6 m/s), garis grafik akan menjadi semakin curam atau semakin tegak.',
  },
  {
    id: 6,
    question: 'Berdasarkan data, apakah gerak mobil termasuk GLB? Jelaskan alasanmu.',
    answer: '',
    hint: 'Ya, termasuk GLB (Gerak Lurus Beraturan) karena lintasan mobil lurus dan kecepatannya konstan (tidak mengalami percepatan, a = 0 m/s²).',
  },
];

interface InquiryQuestionsProps {
  onPrintLKPD: () => void;
}

export const InquiryQuestions: React.FC<InquiryQuestionsProps> = ({ onPrintLKPD }) => {
  const [questions, setQuestions] = useState<InquiryAnswer[]>(() => {
    try {
      const saved = localStorage.getItem('glb_inquiry_answers');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_QUESTIONS;
  });

  const [showHints, setShowHints] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleAnswerChange = (id: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, answer: text } : q))
    );
    setIsSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('glb_inquiry_answers', JSON.stringify(questions));
      setIsSaved(true);
      sound.playSuccess();
      setTimeout(() => setIsSaved(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div id="pertanyaan-investigasi-card" className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <span>Pertanyaan Investigasi (Lembar Kerja Siswa)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Jawab pertanyaan berdasarkan hasil pengamatan tabel dan grafik simulasi mobil.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowHints(!showHints)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
          >
            {showHints ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
            <span>{showHints ? 'Tutup Kunci Panduan' : 'Lihat Kunci Panduan'}</span>
          </button>

          <button
            type="button"
            onClick={onPrintLKPD}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
            title="Cetak format lembar kerja LKPD"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak LKPD</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Tersimpan!' : 'Simpan Jawaban'}</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q) => (
          <div
            key={q.id}
            className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200 transition-all hover:border-slate-300"
          >
            <div className="flex items-start gap-2.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0 mt-0.5">
                {q.id}
              </span>
              <div className="flex-1">
                <label
                  htmlFor={`question-input-${q.id}`}
                  className="block text-sm font-bold text-slate-800"
                >
                  {q.question}
                </label>

                {/* Input Textarea */}
                <textarea
                  id={`question-input-${q.id}`}
                  rows={2}
                  value={q.answer}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Tuliskan jawaban analisismu di sini..."
                  className="mt-2 w-full p-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400 font-sans"
                />

                {/* Educational Hint / Teacher Guide */}
                {showHints && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 animate-fadeIn">
                    <span className="font-bold text-emerald-800">Kunci Konsep / Panduan:</span>{' '}
                    <span>{q.hint}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
