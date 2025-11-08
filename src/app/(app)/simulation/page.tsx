"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import type { GameMode, WarehouseLayout, NamedWarehouseLayout, PlayMode } from '@/lib/types';
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
  const [savedLayouts, setSavedLayouts] = useState<Record<string, NamedWarehouseLayout>>({});
  const [selectedLayout, setSelectedLayout] = useState<WarehouseLayout | null>(null);
  const [gameState, setGameState] = useState<'setup' | 'active' | 'finished'>('setup');
  const [gameMode, setGameMode] = useState<GameMode>('picking');
  const [playMode, setPlayMode] = useState<PlayMode>('free');
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      let initialLayouts: Record<string, NamedWarehouseLayout> = {};
      try {
        const savedData = localStorage.getItem(`optistock_layouts_${user.id}`);
        if (savedData) {
          initialLayouts = JSON.parse(savedData);
        }
      } catch (e) {
        console.error("Failed to parse layouts from localStorage", e);
      }
      setSavedLayouts(initialLayouts);
      setLoading(false);
    }
  }, [user]);

  const generateNewOrder = useCallback(() => {
    if (!selectedLayout) return;
    const layoutWithInventory = generateInventory(selectedLayout);
    const newOrder = generateOrder(layoutWithInventory, gameMode, 5);
    setOrder(newOrder);
  }, [selectedLayout, gameMode]);

  const handleStartGame = (mode: GameMode, layout: WarehouseLayout, playMode: PlayMode) => {
    const startPosition = findStartBay(layout);
    if (startPosition) {
      setPlayerPosition(startPosition);
    }
    
    setGameMode(mode);
    setPlayMode(playMode);
    setSelectedLayout(layout);
    
    const layoutWithInventory = generateInventory(layout);
    const newOrder = generateOrder(layoutWithInventory, mode, 5);
    setOrder(newOrder);

    setGameState('active');
  };
  
  const handleGameEnd = (finalStats: { time: number, moves: number, cost: number }) => {
    if (!user || !selectedLayout) return;
    const gameId = new Date().toISOString() + Math.random();
    const newGameSession = {
      id: gameId,
      userId: user.id,
      date: new Date().toISOString(),
      mode: gameMode,
      playMode: playMode,
      ...finalStats,
      layout: selectedLayout,
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

  const hasLayouts = Object.keys(savedLayouts).length > 0;

  if (!hasLayouts) {
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

  if (gameState === 'active' && selectedLayout) {
    return (
        <SimulationActive
          layout={selectedLayout}
          order={order}
          mode={gameMode}
          playMode={playMode}
          initialPlayerPosition={playerPosition}
          onGameEnd={handleGameEnd}
          onNewOrder={generateNewOrder}
        />
      )
  }

  return (
    <SimulationSetup savedLayouts={savedLayouts} onStart={handleStartGame} />
  );
}
