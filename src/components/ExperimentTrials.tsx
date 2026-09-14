import React from 'react';
import { FlaskConical, Plus, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { ExperimentTrial } from '../types';
import { sound } from '../utils/audio';

interface ExperimentTrialsProps {
  trials: ExperimentTrial[];
  onAddCurrentTrial: () => void;
  onLoadPreset: (velocity: number) => void;
  onRemoveTrial: (id: string) => void;
  onClearTrials: () => void;
  currentVelocity: number;
}

const PRESETS = [
  { name: 'Percobaan 1', velocity: 2, color: '#38bdf8', desc: 'Mobil Lambat (2 m/s)' },
  { name: 'Percobaan 2', velocity: 4, color: '#fbbf24', desc: 'Mobil Sedang (4 m/s)' },
  { name: 'Percobaan 3', velocity: 6, color: '#a855f7', desc: 'Mobil Cepat (6 m/s)' },
];

export const ExperimentTrials: React.FC<ExperimentTrialsProps> = ({
  trials,
  onAddCurrentTrial,
  onLoadPreset,
  onRemoveTrial,
  onClearTrials,
  currentVelocity,
}) => {
  return (
    <div id="coba-dan-amati-card" className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Coba dan Amati – Bandingkan Variasi Kecepatan
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lakukan percobaan dengan kecepatan berbeda, lalu bandingkan kemiringan garis grafiknya.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {trials.length > 0 && (
            <button
              type="button"
              onClick={onClearTrials}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onAddCurrentTrial();
              sound.playSuccess();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ TAMBAH PERCOBAAN</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Runs (Percobaan 1: 2 m/s, Percobaan 2: 4 m/s, Percobaan 3: 6 m/s) */}
      <div className="mb-4">
        <label className="text-xs font-bold text-slate-700 block mb-2">
          Percobaan Rekomendasi Modul Pembelajaran SMP:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESETS.map((p) => {
            const isSelected = currentVelocity === p.velocity;
            return (
              <div
                key={p.name}
                className={`p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-purple-400 bg-purple-50/70 shadow-xs ring-2 ring-purple-300'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                </div>
                <div className="text-xs text-slate-600 mt-1">{p.desc}</div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-700">
                    v = {p.velocity} m/s
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onLoadPreset(p.velocity);
                      sound.playTick();
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Pilih & Uji</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparative Trials Table */}
      {trials.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-center text-xs text-slate-500">
          Belum ada data pembanding yang disimpan. Klik{' '}
          <strong className="text-purple-700 font-bold">+ TAMBAH PERCOBAAN</strong> untuk
          menyimpan hasil simulasi saat ini ke dalam grafik perbandingan.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold">
                <th className="px-3.5 py-2.5">Warna Garis</th>
                <th className="px-3.5 py-2.5">Nama Percobaan</th>
                <th className="px-3.5 py-2.5">Kecepatan (v)</th>
                <th className="px-3.5 py-2.5">Waktu (t)</th>
                <th className="px-3.5 py-2.5">Jarak Akhir (s = v × t)</th>
                <th className="px-3.5 py-2.5">Gradien Grafik</th>
                <th className="px-3.5 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trials.map((trial) => (
                <tr key={trial.id} className="hover:bg-slate-50">
                  <td className="px-3.5 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full inline-block border border-white shadow-2xs"
                        style={{ backgroundColor: trial.color }}
                      />
                      <span className="font-mono text-[11px] text-slate-500">{trial.color}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2 font-bold text-slate-800">{trial.name}</td>
                  <td className="px-3.5 py-2 font-mono font-bold text-blue-700">
                    {trial.velocity} m/s
                  </td>
                  <td className="px-3.5 py-2 font-mono">{trial.time} s</td>
                  <td className="px-3.5 py-2 font-mono font-bold text-emerald-700">
                    {trial.velocity * trial.time} m
                  </td>
                  <td className="px-3.5 py-2 font-mono text-purple-700 font-semibold">
                    {trial.gradient.toFixed(1)}
                  </td>
                  <td className="px-3.5 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveTrial(trial.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Hapus percobaan ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Discovery Prompt for Students */}
      <div className="mt-4 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs sm:text-sm text-purple-900 flex items-start gap-2">
        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Pertanyaan Refleksi Siswa:</span>
          <p className="mt-0.5 text-purple-800">
            Perhatikan ketiga garis pada grafik di atas! Garis percobaan manakah yang posisinya paling
            tegak / paling curam? Mengapa garis dengan kelajuan 6 m/s lebih curam daripada garis 2 m/s?
          </p>
        </div>
      </div>
    </div>
  );
};
