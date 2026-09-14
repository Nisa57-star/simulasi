export interface SimulationConfig {
  velocity: number; // m/s (1 - 10)
  targetTime: number; // seconds (1 - 10)
  interval: 1 | 0.5; // seconds
}

export interface DataPoint {
  time: number; // s
  position: number; // m
  velocity: number; // m/s
  deltaS?: number; // m
  deltaT?: number; // s
}

export interface ExperimentTrial {
  id: string;
  name: string;
  velocity: number; // m/s
  time: number; // s
  color: string;
  dataPoints: DataPoint[];
  gradient: number;
}

export interface InquiryAnswer {
  id: number;
  question: string;
  answer: string;
  hint: string;
}

export interface ChallengeQuestion {
  id: number;
  v: number; // m/s
  t: number; // s
  correctS: number; // m
  explanation: string;
}
