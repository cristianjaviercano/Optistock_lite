"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, Move, CircleDollarSign } from 'lucide-react';
import { Separator } from '../ui/separator';

interface MetricsDashboardProps {
  time: number;
  moves: number;
  cost: number;
}

const MetricItem = ({ title, value }: { title: string, value: string | number }) => (
    <div className="flex flex-col items-center gap-1 flex-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
    </div>
)

export default function MetricsDashboard({ time, moves, cost }: MetricsDashboardProps) {
  return (
    <div className="flex items-center justify-around rounded-lg border p-4">
      <MetricItem title="Time" value={`${time}s`} />
      <Separator orientation="vertical" className="h-10" />
      <MetricItem title="Moves" value={moves} />
      <Separator orientation="vertical" className="h-10" />
      <MetricItem title="Cost" value={`$${cost.toFixed(2)}`} />
    </div>
  );
}
