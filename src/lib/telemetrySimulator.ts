import { EnergyReading } from '@/types/energy';

export class DagitabTelemetrySimulator {
  private baseMfcVoltage: number = 0.785; // Microbial Fuel Cell raw voltage ~785 mV
  private baseStorageVoltage: number = 3.280; // Supercapacitor / Storage rail ~3.28 V
  private baseHarvestCurrent: number = 18.450; // INA219 current reading in mA
  private patternStep: number = 0;

  // Bio-electrochemical diurnal cycle and metabolic wave pattern
  private microbialMetabolicPattern: number[] = [
    1.00, 1.02, 1.05, 1.08, 1.14, 1.20, 1.28, 1.35, 1.30, 1.22,
    1.12, 1.04, 0.98, 0.94, 0.90, 0.88, 0.92, 0.96, 1.00, 1.03
  ];

  /**
   * Generate a realistic live reading from Microbial Fuel Cell + INA219 + BQ25570
   */
  public generateReading(
    deviceId: string = 'DAGITAB-001',
    loadEnabled: boolean = false
  ): {
    reading: EnergyReading;
    rawUart: string;
  } {
    this.patternStep = (this.patternStep + 1) % this.microbialMetabolicPattern.length;
    const factor = this.microbialMetabolicPattern[this.patternStep];

    // Jitter & subtle analog sensor noise
    const vJitter = (Math.random() - 0.5) * 0.008;
    const cJitter = (Math.random() - 0.5) * 0.15;

    // Load impact: when load is active, slight voltage sag across storage buffer and higher overall current throughput
    const loadFactor = loadEnabled ? 1.15 : 0.92;

    const voltage = Math.max(0.1, Number((this.baseMfcVoltage * (0.95 + factor * 0.05) + vJitter).toFixed(3)));
    const current = Math.max(0.1, Number((this.baseHarvestCurrent * factor * loadFactor + cJitter).toFixed(3)));
    
    // Power (P = V * I in mW): e.g. 0.785 V * 18.45 mA = 14.48 mW
    const power = Number((voltage * current).toFixed(2));

    const rawUart = `DAGITAB-DATA,V=${voltage.toFixed(3)}V,I=${current.toFixed(3)}mA,P=${power.toFixed(2)}mW,LOAD=${loadEnabled ? '1' : '0'}`;

    const reading: EnergyReading = {
      id: `sim-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      device_id: deviceId,
      voltage,
      current,
      power,
      created_at: new Date().toISOString(),
    };

    return { reading, rawUart };
  }

  /**
   * Seed realistic historical records for charts
   */
  public generateInitialHistory(
    deviceId: string = 'DAGITAB-001',
    count: number = 40,
    loadEnabled: boolean = false
  ): EnergyReading[] {
    const readings: EnergyReading[] = [];
    const now = Date.now();
    const intervalMs = 3000; // 3 second sample interval

    for (let i = count - 1; i >= 0; i--) {
      const timestamp = new Date(now - i * intervalMs).toISOString();
      const patternIdx = (count - i) % this.microbialMetabolicPattern.length;
      const factor = this.microbialMetabolicPattern[patternIdx];

      const vNoise = Math.sin(i / 4) * 0.015 + (Math.random() - 0.5) * 0.006;
      const cNoise = Math.cos(i / 3) * 0.45 + (Math.random() - 0.5) * 0.12;

      const loadFactor = loadEnabled ? 1.12 : 0.95;

      const voltage = Math.max(0.1, Number((this.baseMfcVoltage * factor + vNoise).toFixed(3)));
      const current = Math.max(0.1, Number((this.baseHarvestCurrent * factor * loadFactor + cNoise).toFixed(3)));
      const power = Number((voltage * current).toFixed(2));

      readings.push({
        id: `seed-${i}-${Date.now()}`,
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

export const telemetrySimulator = new DagitabTelemetrySimulator();
