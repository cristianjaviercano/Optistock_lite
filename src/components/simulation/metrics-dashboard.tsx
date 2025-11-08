"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, Move, CircleDollarSign } from 'lucide-react';

interface MetricsDashboardProps {
  time: number;
  moves: number;
  cost: number;
}

export default function MetricsDashboard({ time, moves, cost }: MetricsDashboardProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{time}s</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Moves</CardTitle>
          <Move className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{moves}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cost</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${cost.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
