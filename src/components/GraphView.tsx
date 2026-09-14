import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, TrendingUp, HelpCircle, Eye, Calculator, RotateCcw, Trash2, Edit3, Sparkles, CheckCircle2, Plus, MousePointerClick } from 'lucide-react';
import { DataPoint, ExperimentTrial } from '../types';
import { sound } from '../utils/audio';

interface GraphViewProps {
  currentDataPoints: DataPoint[];
  velocity: number;
  targetTime: number;
  currentTime: number;
  currentPosition: number;
  comparisonTrials?: ExperimentTrial[];
  showSlopeTriangle?: boolean;
  onReset?: () => void;
  onClearTrials?: () => void;
}

interface ManualPlottedPoint {
  time: number;
  position: number;
  isCorrect?: boolean;
}

export const GraphView: React.FC<GraphViewProps> = ({
  currentDataPoints,
  velocity,
  targetTime,
  currentTime,
  currentPosition,
  comparisonTrials = [],
  onReset,
  onClearTrials,
}) => {
  // Graph Mode: Manual plotting by default as requested by user
  const [isManualMode, setIsManualMode] = useState(true);
  // Manual points plotted by student
  const [manualPoints, setManualPoints] = useState<ManualPlottedPoint[]>([]);
  // Quick coordinate input form state
  const [inputTime, setInputTime] = useState<string>('0');
  const [inputPos, setInputPos] = useState<string>('');
  
  const [hoveredPoint, setHoveredPoint] = useState<{ t: number; s: number; v: number } | null>(null);
  const [showSlopeDetails, setShowSlopeDetails] = useState(true);
  const [resetFeedback, setResetFeedback] = useState(false);

  // Clear manual points when velocity or targetTime changes
  useEffect(() => {
    setManualPoints([]);
  }, [velocity, targetTime]);

  const handleResetGraph = () => {
    setHoveredPoint(null);
    setManualPoints([]);
    if (onReset) {
      onReset();
    }
    sound.playTick();
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 1800);
  };

  // Determine axes bounds
  // Max time: at least 10s
  const maxTime = Math.max(10, Math.ceil(targetTime));
  
  // Calculate max position among current run and any comparison trials
  let maxPosVal = velocity * targetTime;
  comparisonTrials.forEach((t) => {
    if (t.velocity * t.time > maxPosVal) {
      maxPosVal = t.velocity * t.time;
    }
  });
  // Also factor in any student plotted points
  manualPoints.forEach((pt) => {
    if (pt.position > maxPosVal) maxPosVal = pt.position;
  });
  const maxPos = Math.max(20, Math.ceil(maxPosVal / 10) * 10);

  // SVG dimensions & padding
  const width = 640;
  const height = 360;
  const padding = { top: 30, right: 40, bottom: 55, left: 65 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Coordinate mappers
  const getX = (t: number) => padding.left + (t / maxTime) * chartWidth;
  const getY = (s: number) => padding.top + chartHeight - (s / maxPos) * chartHeight;

  // Inverse mappers for interactive clicking on SVG
  const getTimeFromX = (svgX: number) => {
    const rawT = ((svgX - padding.left) / chartWidth) * maxTime;
    return Math.max(0, Math.min(maxTime, Math.round(rawT * 2) / 2)); // snap to 0.5s
  };
  const getPosFromY = (svgY: number) => {
    const rawS = ((padding.top + chartHeight - svgY) / chartHeight) * maxPos;
    return Math.max(0, Math.min(maxPos, Math.round(rawS))); // snap to 1m
  };

  // Add manual point with validation against theoretical GLB position
  const addManualPoint = (t: number, s: number) => {
    const expectedPos = velocity * t;
    const isCorrect = Math.abs(s - expectedPos) <= Math.max(1, velocity * 0.2); // tolerance
    setManualPoints((prev) => {
      // replace if same time already exists, else append
      const filtered = prev.filter((p) => Math.abs(p.time - t) > 0.05);
      return [...filtered, { time: t, position: s, isCorrect }].sort((a, b) => a.time - b.time);
    });
    if (isCorrect) {
      sound.playTick();
    }
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isManualMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if within chart area
    if (
      clickX >= padding.left - 10 &&
      clickX <= padding.left + chartWidth + 10 &&
      clickY >= padding.top - 10 &&
      clickY <= padding.top + chartHeight + 10
    ) {
      const t = getTimeFromX(clickX);
      const s = getPosFromY(clickY);
      addManualPoint(t, s);
    }
  };

  const handleFormAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseFloat(inputTime);
    const s = parseFloat(inputPos);
    if (!isNaN(t) && !isNaN(s) && t >= 0 && s >= 0) {
      addManualPoint(t, s);
      setInputPos('');
      // Advance to next time step suggestion
      const nextT = Math.min(targetTime, t + 1);
      setInputTime(nextT.toString());
    }
  };

  const handleAutoFillGraph = () => {
    const pts = currentDataPoints.map((dp) => ({
      time: dp.time,
      position: dp.position,
      isCorrect: true,
    }));
    setManualPoints(pts);
    sound.playComplete();
  };

  // Slope calculation points: between (0, 0) and final point (targetTime, targetPos)
  const finalTime = targetTime;
  const finalPos = velocity * targetTime;
  const deltaS = finalPos;
  const deltaT = finalTime;
  const calculatedGradient = deltaT > 0 ? deltaS / deltaT : velocity;

  // X Axis Ticks (0, 1, 2, 3, ... maxTime)
  const xTicks: number[] = [];
  const xStep = maxTime <= 10 ? 1 : 2;
  for (let t = 0; t <= maxTime; t += xStep) {
    xTicks.push(t);
  }

  // Y Axis Ticks (0, 5, 10, 15, ... maxPos)
  const yTicks: number[] = [];
  const yStep = maxPos <= 20 ? 4 : maxPos <= 50 ? 10 : 20;
  for (let s = 0; s <= maxPos; s += yStep) {
    yTicks.push(s);
  }

  // Determine line to draw in manual mode: connect manual points or draw best-fit through origin
  const manualPolylinePoints = useMemo(() => {
    if (manualPoints.length < 2) return '';
    return manualPoints.map((p) => `${getX(p.time)},${getY(p.position)}`).join(' ');
  }, [manualPoints, maxTime, maxPos]);

  return (
    <div id="grafik-card" className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Grafik Posisi (s) terhadap Waktu (t)
            </h3>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                isManualMode
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              {isManualMode ? 'Plot Manual (Siswa)' : 'Otomatis'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isManualMode
              ? 'Grafik masih kosong. Siswa membuat titik plot koordinat (t, s) sendiri dari data tabel.'
              : 'Sumbu horizontal = Waktu (s), Sumbu vertikal = Posisi/Jarak (m).'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Toggle: Manual vs Otomatis */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              id="btn-graph-mode-manual"
              onClick={() => setIsManualMode(true)}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                isManualMode
                  ? 'bg-white text-amber-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Siswa membuat plot titik grafik sendiri secara manual"
            >
              <Edit3 className="w-3 h-3 text-amber-600" />
              <span>Manual</span>
            </button>
            <button
              type="button"
              id="btn-graph-mode-otomatis"
              onClick={() => setIsManualMode(false)}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                !isManualMode
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan grafik garis otomatis GLB"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Otomatis</span>
            </button>
          </div>

          {/* Slope Triangle Toggle (Available in auto mode or when manual points exist) */}
          {(!isManualMode || manualPoints.length >= 2) && (
            <button
              type="button"
              id="btn-toggle-slope-triangle"
              onClick={() => setShowSlopeDetails(!showSlopeDetails)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                showSlopeDetails
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>{showSlopeDetails ? 'Segitiga Gradien' : 'Tampilkan Gradien'}</span>
            </button>
          )}

          {/* Reset Graph Button */}
          <button
            type="button"
            id="btn-reset-graph"
            onClick={handleResetGraph}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
              resetFeedback
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs font-bold'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
            }`}
            title="Kosongkan titik-titik pada grafik dan mulai dari awal (t = 0 s)"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                resetFeedback ? 'text-emerald-600 rotate-180' : 'text-rose-600'
              }`}
            />
            <span>{resetFeedback ? 'Grafik Dikosongkan!' : 'Reset Grafik'}</span>
          </button>

          {/* Clear Comparison Trials if any */}
          {comparisonTrials && comparisonTrials.length > 0 && onClearTrials && (
            <button
              type="button"
              id="btn-clear-graph-trials"
              onClick={() => {
                onClearTrials();
                sound.playTick();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              title="Hapus kurva pembanding dari grafik"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Hapus Pembanding ({comparisonTrials.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Manual Mode Instruction & Input Bar */}
      {isManualMode && (
        <div className="mb-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Cara Mengisi Grafik:</strong> Klik langsung pada bidang kisi grafik di bawah <em>atau</em> masukkan nilai koordinat pada formulir berikut:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">
                {manualPoints.length} titik dibuat
              </span>
              <button
                type="button"
                onClick={handleAutoFillGraph}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
                title="Plot semua titik otomatis dari data tabel"
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Bantu Plot Otomatis</span>
              </button>
            </div>
          </div>

          {/* Point Input Form */}
          <form onSubmit={handleFormAddPoint} className="flex items-center gap-2 flex-wrap pt-1 border-t border-amber-200/60">
            <div className="flex items-center gap-1">
              <span className="text-slate-600 font-semibold">Waktu t (s):</span>
              <input
                type="number"
                step="0.5"
                min="0"
                max={maxTime}
                value={inputTime}
                onChange={(e) => setInputTime(e.target.value)}
                className="w-16 px-2 py-1 bg-white border border-amber-300 rounded font-mono font-bold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-600 font-semibold">Posisi s (m):</span>
              <input
                type="number"
                step="1"
                min="0"
                max={maxPos}
                placeholder="misal: 6"
                value={inputPos}
                onChange={(e) => setInputPos(e.target.value)}
                className="w-24 px-2 py-1 bg-white border border-amber-300 rounded font-mono font-bold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Plot Titik</span>
            </button>
            {manualPoints.length > 0 && (
              <button
                type="button"
                onClick={() => setManualPoints([])}
                className="text-[11px] text-rose-600 hover:text-rose-800 underline ml-auto"
              >
                Hapus Semua Titik ({manualPoints.length})
              </button>
            )}
          </form>
        </div>
      )}

      {/* Main SVG Graph Container */}
      <div className="w-full bg-slate-900 rounded-xl p-2 sm:p-4 text-white overflow-hidden shadow-inner relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          onClick={handleSvgClick}
          className={`w-full h-auto select-none ${isManualMode ? 'cursor-crosshair' : 'cursor-default'}`}
          style={{ maxHeight: '420px' }}
        >
          <defs>
            <linearGradient id="primaryLineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <pattern id="graphGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={chartHeight}
            fill="url(#graphGrid)"
          />

          {/* Y Axis Grid lines & labels */}
          {yTicks.map((val) => {
            const yPos = getY(val);
            return (
              <g key={`y-${val}`}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={padding.left + chartWidth}
                  y2={yPos}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? undefined : '3 3'}
                />
                <text
                  x={padding.left - 10}
                  y={yPos + 4}
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X Axis Grid lines & labels */}
          {xTicks.map((val) => {
            const xPos = getX(val);
            return (
              <g key={`x-${val}`}>
                <line
                  x1={xPos}
                  y1={padding.top}
                  x2={xPos}
                  y2={padding.top + chartHeight}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? undefined : '3 3'}
                />
                <text
                  x={xPos}
                  y={padding.top + chartHeight + 20}
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          {/* Y Axis Label */}
          <text
            x={-(padding.top + chartHeight / 2)}
            y="20"
            transform="rotate(-90)"
            fill="#38bdf8"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            Posisi / Jarak: s (meter)
          </text>

          {/* X Axis Label */}
          <text
            x={padding.left + chartWidth / 2}
            y={height - 12}
            fill="#fbbf24"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            Waktu: t (detik)
          </text>

          {/* Slope Triangle (Visualizing Gradient = v = Δs / Δt) */}
          {showSlopeDetails && (!isManualMode || manualPoints.length >= 2) && finalTime > 0 && (
            <g className="transition-opacity duration-300">
              {/* Shaded Triangle Area */}
              <polygon
                points={`
                  ${getX(0)},${getY(0)}
                  ${getX(finalTime)},${getY(0)}
                  ${getX(finalTime)},${getY(finalPos)}
                `}
                fill="#f59e0b"
                fillOpacity="0.12"
              />

              {/* Horizontal Δt leg */}
              <line
                x1={getX(0)}
                y1={getY(0)}
                x2={getX(finalTime)}
                y2={getY(0)}
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <text
                x={getX(finalTime / 2)}
                y={getY(0) - 8}
                fill="#fbbf24"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                Δt = {finalTime} s
              </text>

              {/* Vertical Δs leg */}
              <line
                x1={getX(finalTime)}
                y1={getY(0)}
                x2={getX(finalTime)}
                y2={getY(finalPos)}
                stroke="#34d399"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <text
                x={getX(finalTime) + 8}
                y={getY(finalPos / 2) + 4}
                fill="#34d399"
                fontSize="11"
                fontWeight="bold"
                textAnchor="start"
              >
                Δs = {finalPos.toFixed(0)} m
              </text>
            </g>
          )}

          {/* Any Comparison Trials Lines */}
          {comparisonTrials.map((trial) => {
            const trialFinalPos = trial.velocity * trial.time;
            return (
              <g key={trial.id} opacity="0.85">
                <line
                  x1={getX(0)}
                  y1={getY(0)}
                  x2={getX(trial.time)}
                  y2={getY(trialFinalPos)}
                  stroke={trial.color}
                  strokeWidth="3"
                  strokeDasharray="6 3"
                />
                {trial.dataPoints.map((pt) => (
                  <circle
                    key={`${trial.id}-${pt.time}`}
                    cx={getX(pt.time)}
                    cy={getY(pt.position)}
                    r="4"
                    fill={trial.color}
                  />
                ))}
                {/* Trial label at the end */}
                <text
                  x={getX(trial.time) + 6}
                  y={getY(trialFinalPos) + 3}
                  fill={trial.color}
                  fontSize="10"
                  fontWeight="bold"
                >
                  {trial.name} ({trial.velocity} m/s)
                </text>
              </g>
            );
          })}

          {/* MODE OTOMATIS: Full GLB Line and points */}
          {!isManualMode && (
            <>
              {currentDataPoints.length > 0 && (
                <line
                  x1={getX(0)}
                  y1={getY(0)}
                  x2={getX(finalTime)}
                  y2={getY(finalPos)}
                  stroke="url(#primaryLineGlow)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              )}

              {currentDataPoints.map((pt) => {
                const cx = getX(pt.time);
                const cy = getY(pt.position);
                const isLatest = pt.time <= currentTime;

                return (
                  <g
                    key={`point-${pt.time}`}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredPoint({ t: pt.time, s: pt.position, v: pt.velocity })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isLatest ? '5.5' : '4'}
                      fill={isLatest ? '#38bdf8' : '#64748b'}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-all duration-150 group-hover:r-7 group-hover:fill-amber-400"
                    />
                    <text
                      x={cx}
                      y={cy - 10}
                      fill="#e2e8f0"
                      fontSize="9.5"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="opacity-80 group-hover:opacity-100 font-bold"
                    >
                      ({pt.time.toFixed(1)}, {pt.position.toFixed(0)})
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* MODE MANUAL: User plotted line and points */}
          {isManualMode && (
            <>
              {/* Connect plotted points with a line */}
              {manualPolylinePoints && (
                <polyline
                  points={manualPolylinePoints}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Render manual points with student feedback */}
              {manualPoints.map((pt) => {
                const cx = getX(pt.time);
                const cy = getY(pt.position);

                return (
                  <g
                    key={`manual-pt-${pt.time}`}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredPoint({ t: pt.time, s: pt.position, v: velocity })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6.5"
                      fill={pt.isCorrect ? '#34d399' : '#f87171'}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="transition-transform group-hover:scale-125"
                    />
                    <text
                      x={cx}
                      y={cy - 12}
                      fill={pt.isCorrect ? '#34d399' : '#f87171'}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ({pt.time.toFixed(1)}, {pt.position.toFixed(0)})
                    </text>
                  </g>
                );
              })}

              {/* Empty State Banner inside SVG if no points yet */}
              {manualPoints.length === 0 && (
                <g>
                  <rect
                    x={padding.left + chartWidth / 2 - 140}
                    y={padding.top + chartHeight / 2 - 30}
                    width="280"
                    height="60"
                    rx="10"
                    fill="#1e293b"
                    fillOpacity="0.9"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  <text
                    x={padding.left + chartWidth / 2}
                    y={padding.top + chartHeight / 2 - 6}
                    fill="#fbbf24"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Grafik Belum Diisi Siswa
                  </text>
                  <text
                    x={padding.left + chartWidth / 2}
                    y={padding.top + chartHeight / 2 + 14}
                    fill="#94a3b8"
                    fontSize="10.5"
                    textAnchor="middle"
                  >
                    Klik area kisi grafik atau gunakan formulir di atas
                  </text>
                </g>
              )}
            </>
          )}

          {/* Real-time moving point along the line during active simulation */}
          {currentTime > 0 && (
            <g>
              <circle
                cx={getX(currentTime)}
                cy={getY(currentPosition)}
                r="7"
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <circle
                cx={getX(currentTime)}
                cy={getY(currentPosition)}
                r="12"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                opacity="0.7"
                className="animate-ping"
              />
            </g>
          )}

          {/* Interactive Tooltip in SVG */}
          {hoveredPoint && (
            <g
              transform={`translate(${Math.min(chartWidth, getX(hoveredPoint.t) + 10)}, ${Math.max(
                padding.top + 20,
                getY(hoveredPoint.s) - 25
              )})`}
            >
              <rect
                x="0"
                y="0"
                width="130"
                height="46"
                rx="6"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.95"
              />
              <text x="10" y="18" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                t = {hoveredPoint.t.toFixed(1)} s, s = {hoveredPoint.s.toFixed(1)} m
              </text>
              <text x="10" y="34" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                v = {hoveredPoint.v} m/s (konstan)
              </text>
            </g>
          )}
        </svg>

        {/* Mobile touch hint */}
        <div className="text-[11px] text-slate-400 text-center mt-1 sm:hidden">
          {isManualMode
            ? 'Ketuk kisi grafik untuk memplot titik koordinat pengamatan.'
            : 'Sentuh titik pada grafik untuk melihat rincian koordinat waktu & posisi.'}
        </div>
      </div>

      {/* Gradient & Slope Calculation Box (Required by prompt: v = Δs / Δt) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Box 1: Perhitungan Kemiringan/Gradien */}
        <div className="p-4 rounded-xl bg-blue-50/90 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-1.5">
            <Calculator className="w-4 h-4 text-blue-600" />
            <span>Keterangan Gradien & Kecepatan:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700">
            <strong>Kemiringan / gradien grafik = kecepatan (v)</strong>
          </p>
          <div className="mt-2 p-2.5 bg-white rounded-lg border border-blue-200 font-mono text-xs sm:text-sm text-slate-800">
            <div className="flex items-center justify-between">
              <span>Rumus Gradien:</span>
              <span className="font-bold text-blue-700">v = Δs / Δt</span>
            </div>
            <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-slate-600">
              <span>Substitusi Nilai:</span>
              <span className="font-bold text-emerald-700">
                v = {deltaS.toFixed(1)} m / {deltaT.toFixed(1)} s ={' '}
                <span className="text-blue-700 underline">{calculatedGradient.toFixed(1)} m/s</span>
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 italic">
            Posisi berubah dari 0 m menjadi {deltaS.toFixed(0)} m dalam {deltaT.toFixed(0)} s,
            menghasilkan kecepatan konstan {calculatedGradient.toFixed(1)} m/s.
          </p>
        </div>

        {/* Box 2: Kesimpulan Karakteristik Garis GLB */}
        <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Karakteristik Garis Lurus GLB:</span>
          </div>
          <ul className="text-xs sm:text-sm text-slate-700 space-y-1.5 list-disc list-inside">
            <li>
              Grafik hubungan posisi (s) terhadap waktu (t) pada GLB selalu berupa{' '}
              <strong className="text-emerald-800">garis lurus miring ke atas</strong>.
            </li>
            <li>
              Ketika siswa menghubungkan titik-titik hasil plot, terbentuk garis lurus sempurna.
            </li>
            <li>
              Semakin curam kemiringan garis, semakin besar kelajuan mobil tersebut.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

