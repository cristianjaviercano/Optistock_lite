"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { GameMode, WarehouseLayout, NamedWarehouseLayout, PlayMode } from '@/lib/types';
import { PackageSearch, PackagePlus, Warehouse, Route, Shuffle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SimulationSetupProps {
  savedLayouts: Record<string, NamedWarehouseLayout>;
  onStart: (mode: GameMode, layout: WarehouseLayout, playMode: PlayMode) => void;
}

export default function SimulationSetup({ savedLayouts, onStart }: SimulationSetupProps) {
  const [mode, setMode] = useState<GameMode>('picking');
  const [playMode, setPlayMode] = useState<PlayMode>('free');
  const [selectedSlot, setSelectedSlot] = useState<string>(Object.keys(savedLayouts)[0] || '');
  const { toast } = useToast();

  const handleStartClick = () => {
    if (!selectedSlot) {
      toast({
        variant: "destructive",
        title: "No se ha seleccionado ningún diseño",
        description: "Por favor, elige un diseño de almacén para la simulación.",
      });
      return;
    }
    const layoutToSimulate = savedLayouts[selectedSlot].layout;
    onStart(mode, layoutToSimulate, playMode);
  }

  return (
    <Card className="max-w-2xl mx-auto text-center">
      <CardHeader>
        <CardTitle className="text-3xl font-headline">Start a New Simulation</CardTitle>
        <CardDescription>Choose a warehouse layout and simulation mode to test its efficiency.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-8">
        <div className="grid w-full gap-4">
          <div className='text-left'>
            <Label htmlFor="layout-select">Warehouse Layout</Label>
            <Select value={selectedSlot} onValueChange={setSelectedSlot}>
              <SelectTrigger id="layout-select" className="w-full">
                <SelectValue placeholder="Select a layout..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(savedLayouts).map(([slot, { name }]) => (
                  <SelectItem key={slot} value={slot}>
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-4 w-4 text-muted-foreground" />
                      <span>{name} (Slot {slot})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='text-left'>
            <Label>Simulation Task Mode</Label>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(value: GameMode) => value && setMode(value)}
              className="grid grid-cols-2 gap-4 w-full"
            >
              <ToggleGroupItem value="picking" aria-label="Picking Mode" className="flex flex-col h-auto p-6 gap-2 text-center">
                <PackageSearch className="h-8 w-8 text-primary" />
                <span className="font-semibold text-lg">Picking</span>
                <p className="text-sm text-muted-foreground whitespace-normal">Fulfill a customer order by picking items from shelves.</p>
              </ToggleGroupItem>
              <ToggleGroupItem value="stocking" aria-label="Stocking Mode" className="flex flex-col h-auto p-6 gap-2 text-center">
                <PackagePlus className="h-8 w-8 text-accent" />
                <span className="font-semibold text-lg">Stocking</span>
                <p className="text-sm text-muted-foreground whitespace-normal">Restock inventory by moving items to their designated shelves.</p>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className='text-left'>
            <Label>Play Style</Label>
            <ToggleGroup
              type="single"
              value={playMode}
              onValueChange={(value: PlayMode) => value && setPlayMode(value)}
              className="grid grid-cols-2 gap-4 w-full"
            >
              <ToggleGroupItem value="guided" aria-label="Guided Mode" className="flex flex-col h-auto p-6 gap-2 text-center">
                <Route className="h-8 w-8 text-primary" />
                <span className="font-semibold text-lg">Guided</span>
                <p className="text-sm text-muted-foreground whitespace-normal">Must complete tasks in the order they are listed.</p>
              </ToggleGroupItem>
              <ToggleGroupItem value="free" aria-label="Free Mode" className="flex flex-col h-auto p-6 gap-2 text-center">
                <Shuffle className="h-8 w-8 text-accent" />
                <span className="font-semibold text-lg">Free</span>
                <p className="text-sm text-muted-foreground whitespace-normal">Complete tasks in any order you choose.</p>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

        </div>

        <Button size="lg" onClick={handleStartClick} className="w-full">
          Start {mode === 'picking' ? 'Picking' : 'Stocking'} Simulation
        </Button>
      </CardContent>
    </Card>
  );
}
