import React, { useRef, useEffect } from 'react';
import { Gauge, Timer, MapPin, Flag, Eye } from 'lucide-react';

interface TrackSimulationProps {
  currentTime: number; // seconds
  targetTime: number; // seconds
  velocity: number; // m/s
  currentPosition: number; // meters
  maxDistance: number; // meters (total track capacity)
  isRunning: boolean;
  isFinished: boolean;
}

export const TrackSimulation: React.FC<TrackSimulationProps> = ({
  currentTime,
  targetTime,
  velocity,
  currentPosition,
  maxDistance,
  isRunning,
  isFinished,
}) => {
  const trackContainerRef = useRef<HTMLDivElement>(null);

  // Determine the display track span: at least 10 meters, rounded to nearest 5 or 10
  const trackCapacity = Math.max(10, Math.ceil(maxDistance / 5) * 5);
  
  // Percent of current position along the track (0 to 100%)
  const positionPercentage = Math.min(100, Math.max(0, (currentPosition / trackCapacity) * 100));
  const finishPercentage = Math.min(100, Math.max(0, ((velocity * targetTime) / trackCapacity) * 100));

  // Determine tick interval for meter marks:
  // if track is small (<= 20m), show every 1m
  // if track is medium (<= 50m), show every 2m or 5m with minor ticks every 1m
  // if track is large (up to 100m), show major ticks every 5m/10m and minor ticks every 1m
  const majorTickStep = trackCapacity <= 15 ? 1 : trackCapacity <= 30 ? 2 : 5;

  const ticks: number[] = [];
  for (let i = 0; i <= trackCapacity; i++) {
    ticks.push(i);
  }

  // Auto-scroll the track container horizontally if on mobile or track overflows
  useEffect(() => {
    if (trackContainerRef.current && isRunning) {
      const el = trackContainerRef.current;
      const scrollTarget = (positionPercentage / 100) * (el.scrollWidth - el.clientWidth);
      el.scrollLeft = Math.max(0, scrollTarget - el.clientWidth / 3);
    }
  }, [positionPercentage, isRunning]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden">
      {/* Simulation HUD Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>Lintasan Lurus & Mobil Uji</span>
            <span className="text-xs px-2 py-0.5 font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              GLB (a = 0 m/s²)
            </span>
          </h2>
        </div>

        {/* Real-Time Live Readout Indicators (Required by prompt: Waktu, Kecepatan, Posisi) */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Waktu */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold">
            <Timer className="w-4 h-4 text-amber-500" />
            <span className="text-slate-500">Waktu:</span>
            <span className="font-mono text-slate-900 font-bold">
              {currentTime.toFixed(1)} s
            </span>
            <span className="text-slate-400 text-xs">/ {targetTime} s</span>
          </div>

          {/* Kecepatan */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs sm:text-sm font-semibold">
            <Gauge className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700">Kecepatan:</span>
            <span className="font-mono text-blue-900 font-bold">
              {velocity} m/s
            </span>
          </div>

          {/* Posisi / Jarak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-semibold">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700">Posisi:</span>
            <span className="font-mono text-emerald-900 font-bold">
              {currentPosition.toFixed(1)} m
            </span>
          </div>
        </div>
      </div>

      {/* Track Canvas Area */}
      <div
        ref={trackContainerRef}
        className="relative w-full overflow-x-auto py-6 px-4 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl mt-4 border border-slate-200/80 min-h-[220px] select-none"
      >
        <div className="relative min-w-[720px] sm:min-w-full h-44 flex flex-col justify-end">
          {/* Sky / Environment Backdrop with distance markers */}
          <div className="absolute top-1 left-2 flex items-center gap-2 text-xs font-medium text-slate-400">
            <Eye className="w-3.5 h-3.5" />
            <span>Skala Pengukuran Lintasan (0 s.d. {trackCapacity} meter)</span>
          </div>

          {/* Target Finish Marker Flag */}
          <div
            className="absolute top-3 z-10 transition-all duration-75 flex flex-col items-center pointer-events-none"
            style={{ left: `${finishPercentage}%`, transform: 'translateX(-50%)' }}
          >
            <div className="bg-amber-500 text-white font-bold text-[11px] px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
              <Flag className="w-3 h-3" />
              <span>Target: {(velocity * targetTime).toFixed(0)} m</span>
            </div>
            <div className="w-0.5 h-20 border-r-2 border-dashed border-amber-400/80 mt-1" />
          </div>

          {/* Real-time Indicator Floating Label attached to Car */}
          <div
            className="absolute z-20 pointer-events-none transition-all duration-75"
            style={{
              left: `${positionPercentage}%`,
              bottom: '108px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-slate-900/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg shadow-md border border-slate-700 text-center whitespace-nowrap text-xs font-mono">
              <div className="font-bold text-emerald-400">
                s = {currentPosition.toFixed(1)} m
              </div>
              <div className="text-[10px] text-slate-300 flex items-center gap-1.5 justify-center">
                <span>t = {currentTime.toFixed(1)}s</span>
                <span>•</span>
                <span>v = {velocity} m/s</span>
              </div>
            </div>
            {/* Pointer triangle */}
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-900/90 mx-auto" />
          </div>

          {/* Animated Car Graphic */}
          <div
            className="absolute z-10 pointer-events-none transition-transform duration-75"
            style={{
              left: `${positionPercentage}%`,
              bottom: '48px',
              transform: 'translateX(-50%)',
            }}
          >
            {/* Realistic stylized Car SVG */}
            <svg
              className="w-24 h-14 sm:w-28 sm:h-16 drop-shadow-md"
              viewBox="0 0 140 75"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Headlight beam if moving */}
              {isRunning && (
                <polygon
                  points="130,45 170,30 170,60"
                  fill="url(#lightBeam)"
                  opacity="0.6"
                />
              )}

              <defs>
                <linearGradient id="lightBeam" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
                <linearGradient id="carRoof" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>
                <linearGradient id="windowGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#bae6fd" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Shadow underneath car */}
              <ellipse cx="68" cy="67" rx="55" ry="6" fill="#0f172a" opacity="0.3" />

              {/* Lower Car Chassis / Body */}
              <path
                d="M 12 48 Q 10 38 24 38 L 118 38 Q 134 38 132 50 L 126 58 Q 120 62 108 62 L 28 62 Q 14 62 12 48 Z"
                fill="url(#carBody)"
              />

              {/* Cabin / Roof */}
              <path
                d="M 32 38 L 48 20 Q 52 18 64 18 L 94 18 Q 104 18 112 38 Z"
                fill="url(#carRoof)"
              />

              {/* Windshield & Windows */}
              <path
                d="M 52 22 L 66 22 L 66 36 L 38 36 Z"
                fill="url(#windowGlass)"
                opacity="0.9"
              />
              <path
                d="M 72 22 L 92 22 L 105 36 L 72 36 Z"
                fill="url(#windowGlass)"
                opacity="0.9"
              />

              {/* Science Lab Decal "GLB v=konstan" */}
              <rect x="74" y="44" width="34" height="11" rx="3" fill="#ffffff" />
              <text
                x="91"
                y="52"
                fill="#1e293b"
                fontSize="7.5"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                GLB LAB
              </text>

              {/* Headlights */}
              <rect x="126" y="44" width="6" height="8" rx="2" fill="#fef08a" />
              {/* Taillights */}
              <rect x="11" y="44" width="4" height="7" rx="1.5" fill="#fca5a5" />

              {/* Wheels */}
              {/* Left/Back Wheel */}
              <g
                transform={`rotate(${((currentPosition * 60) % 360).toFixed(1)} 35 60)`}
              >
                <circle cx="35" cy="60" r="12" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
                <circle cx="35" cy="60" r="5" fill="#cbd5e1" />
                <line x1="35" y1="48" x2="35" y2="72" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="23" y1="60" x2="47" y2="60" stroke="#94a3b8" strokeWidth="1.5" />
              </g>

              {/* Right/Front Wheel */}
              <g
                transform={`rotate(${((currentPosition * 60) % 360).toFixed(1)} 105 60)`}
              >
                <circle cx="105" cy="60" r="12" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
                <circle cx="105" cy="60" r="5" fill="#cbd5e1" />
                <line x1="105" y1="48" x2="105" y2="72" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="93" y1="60" x2="117" y2="60" stroke="#94a3b8" strokeWidth="1.5" />
              </g>
            </svg>
          </div>

          {/* Road / Asphalt Track */}
          <div className="relative w-full h-12 bg-slate-800 rounded-lg shadow-inner border-y-2 border-slate-700 flex items-center">
            {/* Starting Line (0m) */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-white flex flex-col justify-between py-0.5">
              <div className="w-full h-1 bg-black" />
              <div className="w-full h-1 bg-black" />
              <div className="w-full h-1 bg-black" />
            </div>

            {/* Road Dashed Center Divider Line */}
            <div className="w-full h-1 border-t-2 border-dashed border-amber-300/80" />

            {/* Finish Line Checkered Bar at the exact target */}
            <div
              className="absolute top-0 bottom-0 w-2.5 z-5 transition-all duration-75"
              style={{
                left: `${finishPercentage}%`,
                transform: 'translateX(-50%)',
                backgroundImage:
                  'repeating-linear-gradient(45deg, #000, #000 3px, #fff 3px, #fff 6px)',
              }}
            />
          </div>

          {/* Ruler / Position Markers (0 m, 1 m, 2 m, 3 m, ...) */}
          <div className="relative w-full h-10 mt-1 border-t border-slate-300">
            {ticks.map((meter) => {
              const tickPercentage = (meter / trackCapacity) * 100;
              const isMajor = meter % majorTickStep === 0;
              const isPassed = meter <= currentPosition;

              return (
                <div
                  key={meter}
                  className="absolute top-0 flex flex-col items-center"
                  style={{
                    left: `${tickPercentage}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {/* Tick line */}
                  <div
                    className={`w-0.5 ${
                      isMajor
                        ? isPassed
                          ? 'h-3.5 bg-blue-600 font-bold'
                          : 'h-3.5 bg-slate-700'
                        : 'h-2 bg-slate-400'
                    }`}
                  />

                  {/* Meter label */}
                  {isMajor && (
                    <span
                      className={`text-[10px] sm:text-xs font-mono mt-0.5 font-semibold ${
                        isPassed ? 'text-blue-700 font-bold' : 'text-slate-600'
                      }`}
                    >
                      {meter} m
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Bar / Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            Garis Jalan Lurus
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            Titik Target Waktu
          </span>
        </div>

        <div>
          {isFinished ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              ✓ Mobil telah sampai di {currentPosition.toFixed(1)} meter dalam {currentTime.toFixed(1)} detik
            </span>
          ) : isRunning ? (
            <span className="inline-flex items-center gap-1 font-medium text-blue-600 animate-pulse">
              Mobil bergerak dengan kelajuan konstan v = {velocity} m/s...
            </span>
          ) : (
            <span className="text-slate-400">Tekan tombol MULAI untuk menjalankan mobil</span>
          )}
        </div>
      </div>
    </div>
  );
};
