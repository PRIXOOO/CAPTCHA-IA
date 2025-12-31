export interface Point {
  x: number;
  y: number;
  t: number; // timestamp
}

export interface BehavioralMetrics {
  duration: number;
  pathEfficiency: number; // 0 to 1 (1 = straight line)
  averageSpeed: number;
  maxSpeed: number;
  accelerationVariance: number;
  jitter: number; // sum of micro-deviations
  hesitationCount: number; // stops > 100ms
}

export interface SessionData {
  sessionId: string;
  taskId: 'puzzle' | 'image-select' | 'trace';
  timestamp: string;
  userAgent: string;
  screen: {
    width: number;
    height: number;
  };
  events: Point[]; // Raw path for replay
  metrics: BehavioralMetrics; // Pre-calculated for LLM
  outcome: {
    success: boolean;
    details: any; // Task specific details (e.g., deviation amount)
  };
}

export enum Step {
  INTRO = 'INTRO',
  PUZZLE = 'PUZZLE',
  IMAGE_SELECT = 'IMAGE_SELECT',
  TRACE = 'TRACE',
  ANALYSIS = 'ANALYSIS'
}