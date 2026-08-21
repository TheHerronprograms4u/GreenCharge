import { EnergyReading } from '@/types/energy';

export class HardwareTelemetrySimulator {
  private baseVoltage: number = 2.35;
  private baseCurrent: number = 0.12;
  private noiseFactor: number = 0.02;
  private loadPatternIndex: number = 0;

  // Realistic load wave pattern to simulate real MAX471 sensor measuring variable circuit load
  private loadMultiplierPattern: number[] = [
    1.0, 1.02, 1.05, 1.12, 1.25, 1.4, 1.55, 1.5, 1.3, 1.1,
    0.95, 0.9, 0.88, 0.92, 1.0, 1.05, 1.1, 1.15, 1.08, 1.02
  ];

  public generateReading(deviceId: string = 'DAGITAB-001'): {
    reading: EnergyReading;
    rawUart: string;
  } {
    // Increment pattern
    this.loadPatternIndex = (this.loadPatternIndex + 1) % this.loadMultiplierPattern.length;
    const mult = this.loadMultiplierPattern[this.loadPatternIndex];

    // Add slight random jitter
    const vNoise = (Math.random() - 0.5) * 0.02;
    const cNoise = (Math.random() - 0.5) * 0.008;

    const voltage = Math.max(0.1, Number((this.baseVoltage * (0.98 + mult * 0.02) + vNoise).toFixed(3)));
    const current = Math.max(0.01, Number((this.baseCurrent * mult + cNoise).toFixed(3)));
    const power = Number((voltage * current).toFixed(3));

    const rawUart = `DATA,${voltage.toFixed(3)},${current.toFixed(3)},${power.toFixed(3)}`;

    const reading: EnergyReading = {
      id: `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      device_id: deviceId,
      voltage,
      current,
      power,
      created_at: new Date().toISOString(),
    };

    return { reading, rawUart };
  }

  public generateInitialHistory(deviceId: string = 'DAGITAB-001', count: number = 40): EnergyReading[] {
    const readings: EnergyReading[] = [];
    const now = Date.now();
    const intervalMs = 3000; // 3 sec interval

    for (let i = count - 1; i >= 0; i--) {
      const timestamp = new Date(now - i * intervalMs).toISOString();
      const mult = this.loadMultiplierPattern[(count - i) % this.loadMultiplierPattern.length];
      const vNoise = (Math.sin(i / 3) * 0.04) + (Math.random() - 0.5) * 0.015;
      const cNoise = (Math.cos(i / 2) * 0.02) + (Math.random() - 0.5) * 0.005;

      const voltage = Math.max(0.1, Number((this.baseVoltage + vNoise).toFixed(3)));
      const current = Math.max(0.01, Number((this.baseCurrent * mult + cNoise).toFixed(3)));
      const power = Number((voltage * current).toFixed(3));

      readings.push({
        id: `hist-${i}-${Date.now()}`,
        device_id: deviceId,
        voltage,
        current,
        power,
        created_at: timestamp,
      });
    }

    return readings;
  }
}

export const telemetrySimulator = new HardwareTelemetrySimulator();
