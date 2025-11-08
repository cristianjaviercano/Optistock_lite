"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { GameMode } from '@/lib/types';
import { PackageSearch, PackagePlus } from 'lucide-react';

interface SimulationSetupProps {
  onStart: (mode: GameMode) => void;
}

export default function SimulationSetup({ onStart }: SimulationSetupProps) {
  const [mode, setMode] = useState<GameMode>('picking');

  return (
    <Card className="max-w-2xl mx-auto text-center">
      <CardHeader>
        <CardTitle className="text-3xl font-headline">Start a New Simulation</CardTitle>
        <CardDescription>Choose a simulation mode to test your warehouse's efficiency.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value: GameMode) => value && setMode(value)}
          className="grid grid-cols-2 gap-4 w-full"
        >
          <ToggleGroupItem value="picking" aria-label="Picking Mode" className="flex flex-col h-auto p-6 gap-2">
            <PackageSearch className="h-8 w-8 text-primary" />
            <span className="font-semibold text-lg">Picking</span>
            <p className="text-sm text-muted-foreground">Fulfill a customer order by picking items from shelves.</p>
          </ToggleGroupItem>
          <ToggleGroupItem value="stocking" aria-label="Stocking Mode" className="flex flex-col h-auto p-6 gap-2">
            <PackagePlus className="h-8 w-8 text-accent" />
            <span className="font-semibold text-lg">Stocking</span>
            <p className="text-sm text-muted-foreground">Restock inventory by moving items to their designated shelves.</p>
          </ToggleGroupItem>
        </ToggleGroup>
        <Button size="lg" onClick={() => onStart(mode)} className="w-full">
          Start {mode === 'picking' ? 'Picking' : 'Stocking'} Simulation
        </Button>
      </CardContent>
    </Card>
  );
}
