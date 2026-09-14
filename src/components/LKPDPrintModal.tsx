import React, { useState } from 'react';
import { X, Printer, Download, Check, FileText } from 'lucide-react';
import { DataPoint, ExperimentTrial } from '../types';

interface LKPDPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataPoints: DataPoint[];
  velocity: number;
  targetTime: number;
  trials: ExperimentTrial[];
}

export const LKPDPrintModal: React.FC<LKPDPrintModalProps> = ({
  isOpen,
  onClose,
  dataPoints,
  velocity,
  targetTime,
  trials,
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('VIII - ');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Topbar (hidden during print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800 text-white print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm sm:text-base">
              Pratinjau Lembar Kerja Peserta Didik (LKPD) GLB
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="p-6 sm:p-8 text-slate-900 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* LKPD Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide">
              Lembar Kerja Peserta Didik (LKPD)
            </h2>
            <h3 className="text-base sm:text-lg font-bold text-slate-700 mt-0.5">
              Gerak Lurus Beraturan (GLB) – Mobile Lab Virtual
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Mata Pelajaran: IPA Fisika • Jenjang: SMP Kelas VIII
            </p>
          </div>

          {/* Student Info Inputs (editable on screen, cleanly printed) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Nama Siswa:</label>
              <input
                type="text"
                placeholder="Tuliskan nama lengkap..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Kelas / No. Absen:</label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Tanggal Praktikum:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* LKPD Goals */}
          <div className="text-xs text-slate-700 space-y-1 mb-4">
            <p className="font-bold">A. Tujuan Praktikum:</p>
            <ol className="list-decimal list-inside pl-1 space-y-0.5 text-slate-600">
              <li>Membuktikan bahwa pada GLB, kecepatan mobil selalu konstan (tetap).</li>
              <li>Menganalisis hubungan jarak dan waktu dalam bentuk tabel pengamatan dan grafik.</li>
              <li>Menentukan gradien/kemiringan grafik posisi terhadap waktu sebagai kecepatan (v = Δs / Δt).</li>
            </ol>
          </div>

          {/* Table Data */}
          <div className="mb-4">
            <p className="font-bold text-xs text-slate-800 mb-1.5">
              B. Tabel Hasil Pengamatan Simulasi (v = {velocity} m/s):
            </p>
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">No.</th>
                  <th className="p-2 border-r border-slate-300">Waktu: t (s)</th>
                  <th className="p-2 border-r border-slate-300">Posisi: s (m)</th>
                  <th className="p-2 border-r border-slate-300">Kecepatan: v (m/s)</th>
                  <th className="p-2">Pertambahan Jarak: Δs (m)</th>
                </tr>
              </thead>
              <tbody>
                {dataPoints.map((row, idx) => (
                  <tr key={row.time} className="border-b border-slate-200">
                    <td className="p-1.5 border-r border-slate-300 text-center">{idx + 1}</td>
                    <td className="p-1.5 border-r border-slate-300 font-mono">{row.time.toFixed(1)}</td>
                    <td className="p-1.5 border-r border-slate-300 font-mono font-bold">{row.position.toFixed(1)}</td>
                    <td className="p-1.5 border-r border-slate-300 font-mono">{row.velocity}</td>
                    <td className="p-1.5 font-mono text-slate-600">
                      {row.deltaS !== undefined ? `+${row.deltaS.toFixed(1)} m` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gradient Calculation */}
          <div className="mb-4 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
            <p className="font-bold text-slate-800">C. Perhitungan Kemiringan / Gradien Grafik:</p>
            <p className="mt-1 font-mono text-slate-700">
              v = Δs / Δt = (s_akhir - s_awal) / (t_akhir - t_awal) = ({velocity * targetTime} - 0) / ({targetTime} - 0) = {velocity} m/s
            </p>
          </div>

          {/* Inquiry Questions preview */}
          <div>
            <p className="font-bold text-xs text-slate-800 mb-2">
              D. Pertanyaan Bahan Diskusi Siswa:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700">
              <li>Apa yang terjadi pada posisi mobil setiap detik?</li>
              <li>Apakah mobil menempuh jarak yang sama setiap detik?</li>
              <li>Bagaimana bentuk grafik posisi terhadap waktu?</li>
              <li>Apa hubungan antara kemiringan grafik dengan kecepatan?</li>
              <li>Apa yang terjadi pada grafik jika kecepatan diperbesar?</li>
              <li>Berdasarkan data, apakah gerak mobil termasuk GLB? Jelaskan alasanmu.</li>
            </ol>
          </div>

          {/* Signature Footer */}
          <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between text-xs text-slate-700">
            <div className="text-center">
              <p>Guru Pembimbing IPA,</p>
              <div className="h-12" />
              <p className="font-bold border-t border-slate-400 pt-1">
                ( .................................................. )
              </p>
            </div>
            <div className="text-center">
              <p>Praktikan / Siswa,</p>
              <div className="h-12" />
              <p className="font-bold border-t border-slate-400 pt-1">
                ( {studentName || '..................................................'} )
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
