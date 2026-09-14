import React, { useState } from 'react';
import { BookOpen, Check, Award, Compass, Zap } from 'lucide-react';

export const GLBConceptSummary: React.FC = () => {
  const [activeFormula, setActiveFormula] = useState<'s' | 'v' | 't'>('s');

  return (
    <div id="konsep-glb-card" className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
        <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Rangkuman Konsep Gerak Lurus Beraturan (GLB)
          </h3>
          <p className="text-xs text-slate-500">
            Materi Pembelajaran IPA Fisika SMP Kelas VIII
          </p>
        </div>
      </div>

      {/* Primary Definition Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xs">
        <div className="text-xs uppercase tracking-wider font-semibold text-blue-200 mb-1 flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          <span>Definisi Utama</span>
        </div>
        <p className="text-base sm:text-lg font-extrabold leading-snug">
          “GLB adalah gerak benda pada lintasan lurus dengan kecepatan tetap.”
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        {/* Characteristics Checklist */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Ciri-ciri Utama GLB:</span>
          </h4>

          <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
            <li className="flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span><strong>Lintasan lurus:</strong> arah gerak benda tidak berbelok atau berubah.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span><strong>Kecepatan konstan (v = tetap):</strong> kelajuan dan arah geraknya selalu sama setiap saat.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span><strong>Percepatan sama dengan nol (a = 0):</strong> benda tidak bertambah cepat dan tidak melambat.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span><strong>Jarak tempuh setara:</strong> jarak yang ditempuh setiap selang waktu yang sama adalah sama.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span><strong>Grafik posisi–waktu (s–t):</strong> berbentuk garis lurus miring dengan gradien = v.</span>
            </li>
          </ul>
        </div>

        {/* Interactive Formula Triangle */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Segitiga Rumus Ajaib GLB:</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Klik salah satu besaran di bawah untuk melihat cara menghitungnya:
            </p>

            {/* Formula Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/80 rounded-xl text-center">
              <button
                type="button"
                onClick={() => setActiveFormula('s')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFormula === 's'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mencari s (Jarak)
              </button>
              <button
                type="button"
                onClick={() => setActiveFormula('v')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFormula === 'v'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mencari v (Kecepatan)
              </button>
              <button
                type="button"
                onClick={() => setActiveFormula('t')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFormula === 't'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mencari t (Waktu)
              </button>
            </div>
          </div>

          {/* Active Formula Card */}
          <div className="mt-4 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs font-mono">
            {activeFormula === 's' && (
              <div className="text-center">
                <div className="text-lg sm:text-xl font-extrabold text-blue-700">
                  s = v × t
                </div>
                <div className="text-xs font-sans text-slate-600 mt-1">
                  Posisi / Jarak (m) = Kecepatan (m/s) × Waktu (s)
                </div>
              </div>
            )}
            {activeFormula === 'v' && (
              <div className="text-center">
                <div className="text-lg sm:text-xl font-extrabold text-emerald-700">
                  v = s / t
                </div>
                <div className="text-xs font-sans text-slate-600 mt-1">
                  Kecepatan (m/s) = Posisi / Jarak (m) : Waktu (s)
                </div>
              </div>
            )}
            {activeFormula === 't' && (
              <div className="text-center">
                <div className="text-lg sm:text-xl font-extrabold text-amber-700">
                  t = s / v
                </div>
                <div className="text-xs font-sans text-slate-600 mt-1">
                  Waktu (s) = Posisi / Jarak (m) : Kecepatan (m/s)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
