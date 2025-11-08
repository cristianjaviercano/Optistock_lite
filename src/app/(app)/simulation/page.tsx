"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import type { GameMode, WarehouseLayout, NamedWarehouseLayout } from '@/lib/types';
import { generateInventory, generateOrder, findStartBay } from '@/lib/simulation';
import SimulationSetup from '@/components/simulation/simulation-setup';
import SimulationActive from '@/components/simulation/simulation-active';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import type { OrderItem } from '@/lib/simulation';
import { useRouter } from 'next/navigation';

export default function SimulationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [layout, setLayout] = useState<WarehouseLayout | null>(null);
  const [gameState, setGameState] = useState<'setup' | 'active' | 'finished'>('setup');
  const [gameMode, setGameMode] = useState<GameMode>('picking');
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // For simulation, we'll try to load the layout from the first available slot.
      // A more complex implementation could let the user choose which layout to simulate.
      const savedLayoutsJson = localStorage.getItem(`optistock_layouts_${user.id}`);
      if (savedLayoutsJson) {
        try {
            const savedLayouts: Record<string, NamedWarehouseLayout> = JSON.parse(savedLayoutsJson);
            // Find the first available layout to use for the simulation
            const firstSlotKey = Object.keys(savedLayouts).sort()[0];
            const layoutToSimulate = firstSlotKey ? savedLayouts[firstSlotKey].layout : null;

            if (layoutToSimulate) {
              setLayout(layoutToSimulate);
              const startPosition = findStartBay(layoutToSimulate);
              if (startPosition) {
                setPlayerPosition(startPosition);
              }
            }
        } catch(e) {
            console.error("Failed to parse layouts from localStorage", e);
        }
      }
      setLoading(false);
    }
  }, [user]);

  const handleStartGame = (mode: GameMode) => {
    if (!layout) return;
    const layoutWithInventory = generateInventory(layout);
    const newOrder = generateOrder(layoutWithInventory, mode, 5);
    setOrder(newOrder);
    setGameMode(mode);
    setGameState('active');
  };
  
  const handleGameEnd = (finalStats: { time: number, moves: number, cost: number }) => {
    if (!user || !layout) return;
    const gameId = new Date().toISOString() + Math.random();
    const newGameSession = {
      id: gameId,
      userId: user.id,
      date: new Date().toISOString(),
      mode: gameMode,
      ...finalStats,
      layout,
    };
    const historyJson = localStorage.getItem(`optistock_history_${user.id}`);
    const history = historyJson ? JSON.parse(historyJson) : [];
    history.push(newGameSession);
    localStorage.setItem(`optistock_history_${user.id}`, JSON.stringify(history));

    setGameState('finished');
    router.push(`/results/${gameId}`);
  };


  if (loading) {
    return <div className="flex h-full min-h-[500px] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!layout || layout.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">No se encontró ningún diseño de almacén guardado</CardTitle>
          <CardDescription>Necesitas diseñar y guardar un almacén antes de poder ejecutar una simulación.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <Link href="/design">Ir al Diseñador</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'active' && layout) {
    return (
        <SimulationActive
          layout={layout}
          order={order}
          mode={gameMode}
          initialPlayerPosition={playerPosition}
          onGameEnd={handleGameEnd}
        />
      )
  }

  return (
    <SimulationSetup onStart={handleStartGame} />
  );
}
