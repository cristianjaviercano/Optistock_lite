"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import type { GameMode, WarehouseLayout } from '@/lib/types';
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
      const savedLayout = localStorage.getItem(`optistock_layout_${user.id}`);
      if (savedLayout) {
        try {
            const parsedLayout = JSON.parse(savedLayout);
            setLayout(parsedLayout);
            const startPosition = findStartBay(parsedLayout);
            if (startPosition) {
            setPlayerPosition(startPosition);
            }
        } catch(e) {
            console.error("Failed to parse layout from localStorage", e);
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
          <CardTitle className="text-2xl font-headline">No Warehouse Layout Found</CardTitle>
          <CardDescription>You need to design a warehouse before you can run a simulation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <Link href="/design">Go to Designer</Link>
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
