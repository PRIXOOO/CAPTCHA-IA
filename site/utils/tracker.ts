import { Point, BehavioralMetrics } from '../types';

export class BehaviorTracker {
  private events: Point[] = [];
  private startTime: number = 0;
  private isTracking: boolean = false;

  start() {
    this.events = [];
    this.startTime = performance.now();
    this.isTracking = true;
  }

  track(x: number, y: number) {
    if (!this.isTracking) return;
    this.events.push({
      x,
      y,
      t: performance.now() - this.startTime
    });
  }

  stop() {
    this.isTracking = false;
  }

  getEvents(): Point[] {
    return this.events;
  }

  // Heavy lifting: Calculate features client-side to save LLM context window
  computeMetrics(): BehavioralMetrics {
    if (this.events.length < 2) {
      return {
        duration: 0,
        pathEfficiency: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        accelerationVariance: 0,
        jitter: 0,
        hesitationCount: 0
      };
    }

    const duration = this.events[this.events.length - 1].t;
    let totalDistance = 0;
    let maxSpeed = 0;
    let speedSum = 0;
    let speedCount = 0;
    let hesitationCount = 0;
    let speeds: number[] = [];

    // Calculate basic distance and speeds
    for (let i = 1; i < this.events.length; i++) {
      const p1 = this.events[i - 1];
      const p2 = this.events[i];
      const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const dt = p2.t - p1.t;

      totalDistance += dist;

      if (dt > 0) {
        const speed = dist / dt; // px per ms
        speeds.push(speed);
        if (speed > maxSpeed) maxSpeed = speed;
        speedSum += speed;
        speedCount++;
      }

      if (dt > 150 && dist < 5) {
        hesitationCount++;
      }
    }

    const start = this.events[0];
    const end = this.events[this.events.length - 1];
    const euclideanDistance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    
    // Path efficiency: 1.0 is a robot-like straight line. 
    // Humans are usually 0.5 - 0.9 depending on task.
    const pathEfficiency = totalDistance > 0 ? euclideanDistance / totalDistance : 0;

    // Acceleration variance (Jerky movements vs Smooth)
    let accelSum = 0;
    let accelCount = 0;
    for(let i=1; i < speeds.length; i++) {
        const acc = Math.abs(speeds[i] - speeds[i-1]);
        accelSum += acc;
        accelCount++;
    }
    const accelerationVariance = accelCount > 0 ? accelSum / accelCount : 0;

    // Jitter: Deviation from a smoothed path (moving average)
    // High jitter = mouse tremor or poor sensor. Zero jitter = simulated curve.
    let jitter = 0;
    if (this.events.length > 5) {
      for(let i=2; i < this.events.length - 2; i++) {
          const p = this.events[i];
          const prev = this.events[i-1];
          const next = this.events[i+1];
          // Predicted position if moving straight
          const predX = (prev.x + next.x) / 2;
          const predY = (prev.y + next.y) / 2;
          jitter += Math.sqrt(Math.pow(p.x - predX, 2) + Math.pow(p.y - predY, 2));
      }
    }

    return {
      duration,
      pathEfficiency,
      averageSpeed: speedCount > 0 ? speedSum / speedCount : 0,
      maxSpeed,
      accelerationVariance,
      jitter,
      hesitationCount
    };
  }
}

export const tracker = new BehaviorTracker();