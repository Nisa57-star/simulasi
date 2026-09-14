import React from 'react';
import { Play, Pause, RotateCcw, BarChart3, FastForward, Clock, Gauge, Sliders } from 'lucide-react';
import { sound } from '../utils/audio';

interface ControlPanelProps {
  velocity: number;
  setVelocity: (v: number) => void;
  targetTime: number;
  setTargetTime: (t: number) => void;
  interval: 1 | 0.5;
  setInterval: (i: 1 | 0.5) => void;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onScrollToData: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  velocity,
  setVelocity,
  targetTime,
  setTargetTime,
  interval,
  setInterval,
  isRunning,
  onStart,
  onPause,
  onReset,
  onScrollToData,
}) => {
  const handleVelocityChange = (val: number) => {
    const clamped = Math.min(10, Math.max(1, Math.round(val)));
    setVelocity(clamped);
    sound.playTick();
  };

  const handleTimeChange = (val: number) => {
    const clamped = Math.min(10, Math.max(1, Math.round(val)));
    setTargetTime(clamped);
    sound.playTick();
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Panel Pengaturan Parameter
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Ubah nilai sebelum atau sesudah simulasi
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Kecepatan Mobil (v) */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="velocity-input"
              className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5"
            >
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>Kecepatan Mobil (v)</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                id="velocity-input"
                type="number"
                min={1}
                max={10}
                step={1}
                value={velocity}
                disabled={isRunning}
                onChange={(e) => handleVelocityChange(Number(e.target.value))}
                className="w-16 px-2 py-1 text-center font-mono font-bold text-blue-700 bg-white border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
              />
              <span className="text-xs font-semibold text-slate-500">m/s</span>
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={velocity}
            disabled={isRunning}
            onChange={(e) => handleVelocityChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span>1 m/s</span>
            <span className="text-slate-500 font-semibold">Rentang: 1 – 10 m/s</span>
            <span>10 m/s</span>
          </div>

          {/* Preset Buttons for Percobaan (2, 4, 6 m/s) */}
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 font-medium">Pilihan cepat:</span>
            {[2, 4, 6].map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={isRunning}
                onClick={() => handleVelocityChange(preset)}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                  velocity === preset
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 disabled:opacity-50'
                }`}
              >
                {preset} m/s
              </button>
            ))}
          </div>
        </div>

        {/* 2. Waktu Simulasi (t) */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="time-input"
              className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Waktu Simulasi (t)</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                id="time-input"
                type="number"
                min={1}
                max={10}
                step={1}
                value={targetTime}
                disabled={isRunning}
                onChange={(e) => handleTimeChange(Number(e.target.value))}
                className="w-16 px-2 py-1 text-center font-mono font-bold text-amber-700 bg-white border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-60"
              />
              <span className="text-xs font-semibold text-slate-500">detik</span>
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={targetTime}
            disabled={isRunning}
            onChange={(e) => handleTimeChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span>1 s</span>
            <span className="text-slate-500 font-semibold">Rentang: 1 – 10 detik</span>
            <span>10 s</span>
          </div>

          {/* Preset Buttons for Time (3s, 5s, 8s, 10s) */}
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 font-medium">Pilihan cepat:</span>
            {[3, 5, 8, 10].map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={isRunning}
                onClick={() => handleTimeChange(preset)}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                  targetTime === preset
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 disabled:opacity-50'
                }`}
              >
                {preset} s
              </button>
            ))}
          </div>
        </div>

        {/* 3. Interval Pengambilan Data (1s / 0.5s) & Formula Preview */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <FastForward className="w-4 h-4 text-emerald-600" />
                <span>Interval Data Tabel</span>
              </span>
              <span className="text-[11px] text-slate-500">Pencatatan</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setInterval(1);
                  sound.playTick();
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                  interval === 1
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Setiap 1 detik
              </button>
              <button
                type="button"
                onClick={() => {
                  setInterval(0.5);
                  sound.playTick();
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                  interval === 0.5
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Setiap 0,5 detik
              </button>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between font-mono bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80">
            <span>s_akhir = v × t</span>
            <span className="font-bold text-blue-700">
              {velocity} × {targetTime} = {velocity * targetTime} m
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: MULAI, JEDA, RESET, TAMPILKAN DATA (Large, clear, tactile buttons) */}
      <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
        {/* MULAI */}
        {!isRunning ? (
          <button
            id="btn-mulai"
            type="button"
            onClick={onStart}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>▶ MULAI</span>
          </button>
        ) : (
          /* JEDA */
          <button
            id="btn-jeda"
            type="button"
            onClick={onPause}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Pause className="w-5 h-5 fill-current" />
            <span>⏸ JEDA</span>
          </button>
        )}

        {/* RESET */}
        <button
          id="btn-reset"
          type="button"
          onClick={onReset}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-sm sm:text-base border border-slate-300 shadow-2xs transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>🔄 RESET</span>
        </button>

        {/* TAMPILKAN DATA */}
        <button
          id="btn-tampilkan-data"
          type="button"
          onClick={onScrollToData}
          className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 font-bold text-sm sm:text-base border border-emerald-300 transition-all cursor-pointer"
        >
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <span>📊 TAMPILKAN DATA</span>
        </button>
      </div>
    </div>
  );
};
