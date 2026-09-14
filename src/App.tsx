import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { TrackSimulation } from './components/TrackSimulation';
import { ControlPanel } from './components/ControlPanel';
import { DataTable } from './components/DataTable';
import { GraphView } from './components/GraphView';
import { ExperimentTrials } from './components/ExperimentTrials';
import { InquiryQuestions } from './components/InquiryQuestions';
import { PredictionChallenge } from './components/PredictionChallenge';
import { GLBConceptSummary } from './components/GLBConceptSummary';
import { LKPDPrintModal } from './components/LKPDPrintModal';
import { DataPoint, ExperimentTrial } from './types';
import { sound } from './utils/audio';

export default function App() {
  // Simulation configuration parameters
  const [velocity, setVelocity] = useState<number>(2); // m/s, default 2 m/s (1-10)
  const [targetTime, setTargetTime] = useState<number>(5); // s, default 5 s (1-10)
  const [interval, setInterval] = useState<1 | 0.5>(1); // s, default 1 s

  // Live simulation execution state
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Comparison trials state ("Coba dan Amati")
  const [trials, setTrials] = useState<ExperimentTrial[]>([
    {
      id: 'preset-1',
      name: 'Percobaan 1',
      velocity: 2,
      time: 5,
      color: '#38bdf8',
      gradient: 2,
      dataPoints: [
        { time: 0, position: 0, velocity: 2 },
        { time: 1, position: 2, velocity: 2 },
        { time: 2, position: 4, velocity: 2 },
        { time: 3, position: 6, velocity: 2 },
        { time: 4, position: 8, velocity: 2 },
        { time: 5, position: 10, velocity: 2 },
      ],
    },
  ]);

  // LKPD Print Modal
  const [isLKPDModalOpen, setIsLKPDModalOpen] = useState<boolean>(false);

  // High precision animation frame ref
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const lastSecTickRef = useRef<number>(-1);

  // Current position calculated strictly from GLB formula: s = v * t
  const currentPosition = velocity * currentTime;

  // Generate full data table points for the current velocity and target time
  const fullDataPoints: DataPoint[] = useMemo(() => {
    const points: DataPoint[] = [];
    const step = interval;
    const stepsCount = Math.round(targetTime / step);

    for (let i = 0; i <= stepsCount; i++) {
      const t = Math.round(i * step * 10) / 10;
      const s = velocity * t;
      const prevS = i > 0 ? points[i - 1].position : 0;
      const prevT = i > 0 ? points[i - 1].time : 0;

      points.push({
        time: t,
        position: s,
        velocity: velocity,
        deltaS: i > 0 ? s - prevS : undefined,
        deltaT: i > 0 ? Math.round((t - prevT) * 10) / 10 : undefined,
      });
    }
    return points;
  }, [velocity, targetTime, interval]);

  // Animation Loop using requestAnimationFrame
  const animate = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setCurrentTime((prevTime) => {
        const nextTime = prevTime + delta;

        // Check if crossed an integer second for sound tick
        const currentSec = Math.floor(nextTime);
        if (currentSec > lastSecTickRef.current && currentSec <= targetTime) {
          lastSecTickRef.current = currentSec;
          sound.playTick();
        }

        if (nextTime >= targetTime) {
          setIsRunning(false);
          setIsFinished(true);
          sound.playComplete();
          return targetTime;
        }
        return nextTime;
      });

      animRef.current = requestAnimationFrame(animate);
    },
    [targetTime]
  );

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = null;
      animRef.current = requestAnimationFrame(animate);
    } else {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    }
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isRunning, animate]);

  // Handlers
  const handleStart = () => {
    if (currentTime >= targetTime) {
      // If at the end, restart from 0
      setCurrentTime(0);
      lastSecTickRef.current = -1;
    }
    setIsFinished(false);
    setIsRunning(true);
    sound.playStart();
  };

  const handlePause = () => {
    setIsRunning(false);
    sound.playTick();
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setCurrentTime(0);
    lastSecTickRef.current = -1;
    sound.playTick();
  };

  const handleScrollToData = () => {
    const el = document.getElementById('data-pengamatan-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToLKPD = () => {
    const el = document.getElementById('pertanyaan-investigasi-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add current simulation configuration to comparison trials
  const handleAddCurrentTrial = () => {
    const colors = ['#38bdf8', '#fbbf24', '#a855f7', '#ec4899', '#10b981', '#f97316'];
    const trialIndex = trials.length + 1;
    const assignedColor = colors[(trialIndex - 1) % colors.length];

    const newTrial: ExperimentTrial = {
      id: `trial-${Date.now()}`,
      name: `Percobaan ${trialIndex}`,
      velocity: velocity,
      time: targetTime,
      color: assignedColor,
      gradient: velocity,
      dataPoints: fullDataPoints,
    };

    setTrials((prev) => [...prev, newTrial]);
  };

  const handleLoadPreset = (presetVelocity: number) => {
    handleReset();
    setVelocity(presetVelocity);
  };

  const handleRemoveTrial = (id: string) => {
    setTrials((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearTrials = () => {
    setTrials([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Sticky Top Header */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onScrollToLKPD={handleScrollToLKPD}
      />

      {/* Main Lab Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* SECTION 1 & 2: Main Simulation Track & Control Panel */}
        <div className="space-y-4">
          <TrackSimulation
            currentTime={currentTime}
            targetTime={targetTime}
            velocity={velocity}
            currentPosition={currentPosition}
            maxDistance={velocity * targetTime}
            isRunning={isRunning}
            isFinished={isFinished}
          />

          <ControlPanel
            velocity={velocity}
            setVelocity={(v) => {
              if (isRunning) return;
              setVelocity(v);
              setCurrentTime(0);
              setIsFinished(false);
            }}
            targetTime={targetTime}
            setTargetTime={(t) => {
              if (isRunning) return;
              setTargetTime(t);
              setCurrentTime(0);
              setIsFinished(false);
            }}
            interval={interval}
            setInterval={setInterval}
            isRunning={isRunning}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onScrollToData={handleScrollToData}
          />
        </div>

        {/* SECTION 3 & 4: Data Hasil Pengamatan & Grafik Posisi-Waktu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <DataTable
            dataPoints={fullDataPoints}
            currentSimulationTime={currentTime}
            velocity={velocity}
            interval={interval}
            setInterval={setInterval}
            onReset={handleReset}
          />

          <GraphView
            currentDataPoints={fullDataPoints}
            velocity={velocity}
            targetTime={targetTime}
            currentTime={currentTime}
            currentPosition={currentPosition}
            comparisonTrials={trials}
            onReset={handleReset}
            onClearTrials={handleClearTrials}
          />
        </div>

        {/* SECTION 5: Coba dan Amati (Fitur Eksperimen Perbandingan) */}
        <ExperimentTrials
          trials={trials}
          onAddCurrentTrial={handleAddCurrentTrial}
          onLoadPreset={handleLoadPreset}
          onRemoveTrial={handleRemoveTrial}
          onClearTrials={handleClearTrials}
          currentVelocity={velocity}
        />

        {/* SECTION 6 & 7: Pertanyaan Investigasi & Tantangan Prediksi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <InquiryQuestions onPrintLKPD={() => setIsLKPDModalOpen(true)} />
          <PredictionChallenge />
        </div>

        {/* SECTION 8: Rangkuman Konsep GLB */}
        <GLBConceptSummary />
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-600">
            MOBILE LAB • Laboratorium Virtual Gerak Lurus Beraturan (GLB) – IPA Fisika Kelas VIII
          </p>
          <p className="text-slate-400">
            Dibuat untuk pembelajaran interaktif & pengisian Lembar Kerja Siswa (LKPD).
          </p>
        </div>
      </footer>

      {/* Printable LKPD Modal */}
      <LKPDPrintModal
        isOpen={isLKPDModalOpen}
        onClose={() => setIsLKPDModalOpen(false)}
        dataPoints={fullDataPoints}
        velocity={velocity}
        targetTime={targetTime}
        trials={trials}
      />
    </div>
  );
}
