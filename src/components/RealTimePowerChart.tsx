'use client';

import React from 'react';
import { EnergyTrendGraph } from './EnergyTrendGraph';
import { EnergyReading } from '@/types/energy';

interface RealTimePowerChartProps {
  history?: EnergyReading[];
}

export const RealTimePowerChart: React.FC<RealTimePowerChartProps> = () => {
  return <EnergyTrendGraph />;
};
