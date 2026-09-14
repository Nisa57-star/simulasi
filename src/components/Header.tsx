import React from 'react';
import { Sparkles, Compass, Volume2, VolumeX, FileSpreadsheet } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onScrollToLKPD: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onScrollToLKPD,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs backdrop-blur-xs bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Main Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <Compass className="w-3.5 h-3.5" />
                Eksperimen Virtual
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5" />
                IPA Fisika SMP Kelas VIII
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
              MOBILE LAB – Simulasi Gerak Lurus Beraturan
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-600 mt-0.5">
              “Bagaimana grafik dapat menceritakan cara sebuah mobil bergerak?”
            </p>
          </div>

          {/* Quick Actions / Notices */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <button
              onClick={onScrollToLKPD}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-2xs"
              title="Pergi ke Lembar Kerja Siswa"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Data untuk LKPD</span>
            </button>

            <button
              onClick={() => {
                sound.enabled = !soundEnabled;
                onToggleSound();
              }}
              className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                soundEnabled
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              }`}
              title={soundEnabled ? 'Matikan Suara Efek' : 'Nyalakan Suara Efek'}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* LKPD Student Notice Banner */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span className="font-semibold text-slate-700">Catatan Siswa:</span>
            <span>Data hasil simulasi dapat digunakan siswa untuk mengisi LKPD.</span>
          </p>
          <span className="hidden sm:inline text-slate-400 font-mono">Rumus GLB: s = v × t</span>
        </div>
      </div>
    </header>
  );
};
