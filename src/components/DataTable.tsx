import React, { useState, useEffect } from 'react';
import { Table, Copy, Check, Info, RotateCcw, Edit3, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { DataPoint } from '../types';
import { sound } from '../utils/audio';

interface DataTableProps {
  dataPoints: DataPoint[];
  currentSimulationTime: number;
  velocity: number;
  interval: 1 | 0.5;
  setInterval: (i: 1 | 0.5) => void;
  onReset?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  dataPoints,
  currentSimulationTime,
  velocity,
  interval,
  setInterval,
  onReset,
}) => {
  // Manual mode state: true by default so students fill the table themselves based on the simulation
  const [isManualMode, setIsManualMode] = useState(true);
  // Student inputs keyed by `${row.time}-position` and `${row.time}-velocity`
  const [userInputs, setUserInputs] = useState<Record<string, { s: string; v: string }>>({});
  const [copied, setCopied] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(false);

  // Reset student inputs if interval or velocity or target data points length change
  useEffect(() => {
    // When interval changes, keep inputs clean
    setUserInputs({});
  }, [interval]);

  const handleInputChange = (time: number, field: 's' | 'v', value: string) => {
    const key = time.toString();
    setUserInputs((prev) => ({
      ...prev,
      [key]: {
        s: field === 's' ? value : prev[key]?.s ?? '',
        v: field === 'v' ? value : prev[key]?.v ?? '',
      },
    }));
  };

  const handleAutoFillAll = () => {
    const filled: Record<string, { s: string; v: string }> = {};
    dataPoints.forEach((pt) => {
      filled[pt.time.toString()] = {
        s: pt.position.toFixed(1),
        v: pt.velocity.toString(),
      };
    });
    setUserInputs(filled);
    sound.playComplete();
  };

  const handleClearInputs = () => {
    setUserInputs({});
    if (onReset) {
      onReset();
    }
    sound.playTick();
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 1800);
  };

  // Copy table text formatted for student notes / LKPD
  const handleCopyTable = () => {
    const header = 'Waktu (s)\tPosisi/Jarak (m)\tKecepatan (m/s)\tΔs (m)\tΔt (s)\n';
    const rows = dataPoints
      .map((row) => {
        const timeKey = row.time.toString();
        const sVal = isManualMode
          ? userInputs[timeKey]?.s || '-'
          : row.position.toFixed(1);
        const vVal = isManualMode
          ? userInputs[timeKey]?.v || '-'
          : row.velocity.toString();
        const deltaSText = row.deltaS !== undefined ? row.deltaS.toFixed(1) : '-';
        const deltaTText = row.deltaT !== undefined ? row.deltaT.toFixed(1) : '-';
        return `${row.time.toFixed(1)}\t${sVal}\t${vVal}\t${deltaSText}\t${deltaTText}`;
      })
      .join('\n');
    navigator.clipboard.writeText(header + rows);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Count filled rows for student progress indicator
  const filledCount = dataPoints.filter((pt) => {
    const entry = userInputs[pt.time.toString()];
    return entry?.s && entry.s.trim() !== '';
  }).length;

  return (
    <div id="data-pengamatan-card" className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Tabel Data Hasil Pengamatan
            </h3>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                isManualMode
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              {isManualMode ? 'Pengisian Manual (Siswa)' : 'Otomatis'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isManualMode
              ? `Tabel masih kosong. Jalankan simulasi mobil, lalu catat posisi (s) dan kelajuan (v) setiap ${interval} detik.`
              : `Mencatat posisi mobil setiap selang waktu ${interval} detik secara otomatis.`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Toggle: Manual vs Otomatis */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              id="btn-mode-manual"
              onClick={() => setIsManualMode(true)}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                isManualMode
                  ? 'bg-white text-amber-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Siswa mencatat data pengamatan sendiri secara manual"
            >
              <Edit3 className="w-3 h-3 text-amber-600" />
              <span>Manual</span>
            </button>
            <button
              type="button"
              id="btn-mode-otomatis"
              onClick={() => setIsManualMode(false)}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                !isManualMode
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Isi tabel langsung otomatis dari rumus GLB"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Otomatis</span>
            </button>
          </div>

          {/* Interval Selector */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setInterval(1)}
              className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                interval === 1
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1 s
            </button>
            <button
              type="button"
              onClick={() => setInterval(0.5)}
              className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                interval === 0.5
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              0,5 s
            </button>
          </div>

          {/* Reset / Kosongkan Data Button */}
          <button
            type="button"
            id="btn-reset-data-table"
            onClick={handleClearInputs}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
              resetFeedback
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs font-bold'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
            }`}
            title="Kosongkan tabel dan kembalikan simulasi ke awal (t = 0 s)"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                resetFeedback ? 'text-emerald-600 rotate-180' : 'text-rose-600'
              }`}
            />
            <span>{resetFeedback ? 'Tabel Dikosongkan!' : 'Reset Tabel'}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            id="btn-copy-table"
            onClick={handleCopyTable}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
            title="Salin data tabel untuk LKPD"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Manual Mode helper banner */}
      {isManualMode && (
        <div className="mb-3 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Tugas Peserta Didik:</strong> Amati posisi mobil pada meteran lintasan di atas saat waktu berjalan, lalu ketikkan hasilnya di kolom <strong>Posisi (m)</strong>!
              {filledCount > 0 && (
                <span className="ml-1.5 font-bold text-emerald-700">
                  ({filledCount}/{dataPoints.length} baris terisi)
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoFillAll}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
              title="Bantu isi otomatis jika ingin memeriksa jawaban"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Bantu Isi Otomatis</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Display */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
              <th className="px-3 sm:px-4 py-3 text-center w-12 sm:w-16">No.</th>
              <th className="px-3 sm:px-4 py-3">Waktu: t (s)</th>
              <th className="px-3 sm:px-4 py-3">
                <span className="flex items-center gap-1">
                  <span>Posisi / Jarak: s (m)</span>
                  {isManualMode && <span className="text-amber-700 font-bold">*isi</span>}
                </span>
              </th>
              <th className="px-3 sm:px-4 py-3">Kecepatan: v (m/s)</th>
              <th className="px-3 sm:px-4 py-3 text-slate-600 hidden sm:table-cell">
                Pertambahan Jarak (Δs)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-xs sm:text-sm">
            {dataPoints.map((row, idx) => {
              const timeKey = row.time.toString();
              const inputState = userInputs[timeKey];
              const isCurrentStep =
                currentSimulationTime >= row.time &&
                (idx === dataPoints.length - 1 || currentSimulationTime < dataPoints[idx + 1].time);

              // Verification helper when in manual mode
              const userSNum = parseFloat(inputState?.s || '');
              const isFilled = inputState?.s !== undefined && inputState.s.trim() !== '';
              const isCorrect = isFilled && !isNaN(userSNum) && Math.abs(userSNum - row.position) < 0.15;
              const isWrong = isFilled && !isNaN(userSNum) && Math.abs(userSNum - row.position) >= 0.15;

              return (
                <tr
                  key={row.time}
                  className={`transition-colors ${
                    isCurrentStep
                      ? 'bg-blue-50/90 font-bold text-blue-900 border-l-4 border-l-blue-600'
                      : idx % 2 === 0
                      ? 'bg-white'
                      : 'bg-slate-50/50'
                  }`}
                >
                  {/* Row Number */}
                  <td className="px-3 sm:px-4 py-2.5 text-center text-slate-400 font-normal">
                    {idx + 1}
                  </td>

                  {/* Time (t) */}
                  <td className="px-3 sm:px-4 py-2.5 font-semibold text-slate-800">
                    <span className="inline-flex items-center gap-1">
                      <span>{row.time.toFixed(1)}</span>
                      {isCurrentStep && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-blue-600 text-white rounded font-sans uppercase font-bold">
                          Kini
                        </span>
                      )}
                    </span>
                  </td>

                  {/* Position (s) */}
                  <td className="px-3 sm:px-4 py-2 text-emerald-700">
                    {isManualMode ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          placeholder={idx === 0 ? '0' : '...'}
                          value={inputState?.s ?? ''}
                          onChange={(e) => handleInputChange(row.time, 's', e.target.value)}
                          className={`w-24 sm:w-28 px-2.5 py-1 rounded-lg border font-mono font-bold text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-800 focus:ring-emerald-400'
                              : isWrong
                              ? 'bg-rose-50 border-rose-400 text-rose-800 focus:ring-rose-400'
                              : 'bg-white border-amber-300 text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-blue-300'
                          }`}
                        />
                        {isCorrect && (
                          <span title="Tepat! Sesuai hasil pengamatan" className="text-emerald-600 flex items-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        )}
                        {isWrong && (
                          <span
                            title={`Periksa lagi! Pada t = ${row.time} s, posisi mobil seharusnya ${row.position.toFixed(1)} m`}
                            className="text-rose-500 flex items-center"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="font-bold text-emerald-700">
                        {row.position.toFixed(1)}
                      </span>
                    )}
                  </td>

                  {/* Velocity (v) */}
                  <td className="px-3 sm:px-4 py-2 text-blue-700">
                    {isManualMode ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.5"
                          placeholder={velocity.toString()}
                          value={inputState?.v ?? ''}
                          onChange={(e) => handleInputChange(row.time, 'v', e.target.value)}
                          className="w-20 px-2 py-1 rounded-lg border border-slate-300 bg-white font-mono text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-slate-300"
                        />
                      </div>
                    ) : (
                      <span className="font-semibold text-blue-700">{row.velocity}</span>
                    )}
                  </td>

                  {/* Delta S */}
                  <td className="px-3 sm:px-4 py-2.5 text-slate-600 hidden sm:table-cell">
                    {idx === 0 ? (
                      <span className="text-slate-400 italic">posisi awal (mula-mula)</span>
                    ) : (
                      <span className="font-semibold text-emerald-600">
                        +{row.deltaS?.toFixed(1)} m{' '}
                        <span className="text-slate-400 text-xs font-normal">
                          (tiap {row.deltaT} s)
                        </span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Observation Insight Card */}
      <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Panduan Pengamatan GLB:</p>
          <p className="text-amber-800 mt-0.5">
            Tekan <strong>Mulai Simulasi</strong> di atas. Amati waktu pada stopwatch dan baca posisi depan mobil di meteran lintasan.
            Ketikkan angka posisi yang didapat ke dalam tabel di atas. Perhatikan bahwa dalam setiap selang{' '}
            <span className="font-bold">{interval} detik</span>, mobil selalu bertambah jarak sebesar{' '}
            <span className="font-bold text-blue-700">{(velocity * interval).toFixed(1)} meter</span> dengan kelajuan konstan ({velocity} m/s)!
          </p>
        </div>
      </div>
    </div>
  );
};

