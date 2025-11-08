"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import type { GameMode, WarehouseLayout, NamedWarehouseLayout, PlayMode, GameSession } from '@/lib/types';
import { generateInventory, generateOrder, findStartBay } from '@/lib/simulation';
import SimulationSetup from '@/components/simulation/simulation-setup';
import SimulationActive from '@/components/simulation/simulation-active';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResultsPageContent from '@/components/simulation/results-content';


export default function SimulationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [savedLayouts, setSavedLayouts] = useState<Record<string, NamedWarehouseLayout>>({});
  const [gameState, setGameState] = useState<'setup' | 'active'>('setup');
  const [gameMode, setGameMode] = useState<GameMode>('picking');
  const [playMode, setPlayMode] = useState<PlayMode>('free');
  const [order, setOrder] = useState<any[]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [currentLayout, setCurrentLayout] = useState<WarehouseLayout | null>(null);

  const [activeTab, setActiveTab] = useState('simulation');
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

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
      
      try {
        const historyJson = localStorage.getItem(`optistock_history_${user.id}`);
        if (historyJson) {
            const parsedHistory: GameSession[] = JSON.parse(historyJson);
            parsedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setGameHistory(parsedHistory);
            if(parsedHistory.length > 0) {
              setSelectedGameId(parsedHistory[0].id);
            }
        }
      } catch (e) {
         console.error("Failed to parse game history from localStorage", e);
      }

      setLoading(false);
    }
  }, [user]);

  const handleStartGame = (mode: GameMode, layout: WarehouseLayout, playMode: PlayMode) => {
    const startPosition = findStartBay(layout);
    if (startPosition) {
      setPlayerPosition(startPosition);
    }
    
    setGameMode(mode);
    setPlayMode(playMode);
    setCurrentLayout(layout);
    
    const layoutWithInventory = generateInventory(layout);
    const newOrder = generateOrder(layoutWithInventory, mode, 5);
    setOrder(newOrder);

    setGameState('active');
  };
  
  const handleGameEnd = (finalStats: { time: number, moves: number, cost: number }) => {
    if (!user || !currentLayout) return;
    
    const newGameSession: GameSession = {
      id: new Date().toISOString() + Math.random(),
      userId: user.id,
      date: new Date().toISOString(),
      mode: gameMode,
      playMode: playMode,
      ...finalStats,
      layout: currentLayout,
    };
    
    const updatedHistory = [newGameSession, ...gameHistory];
    setGameHistory(updatedHistory);
    localStorage.setItem(`optistock_history_${user.id}`, JSON.stringify(updatedHistory));

    setGameState('setup'); // Reset game state
    setActiveTab('results'); // Switch to results tab
    setSelectedGameId(newGameSession.id); // Select the new game
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="simulation">Simulación</TabsTrigger>
        <TabsTrigger value="results">Resultados</TabsTrigger>
      </TabsList>
      <TabsContent value="simulation" className="mt-4">
        {gameState === 'active' && currentLayout ? (
          <SimulationActive
            layout={currentLayout}
            order={order}
            mode={gameMode}
            playMode={playMode}
            initialPlayerPosition={playerPosition}
            onGameEnd={handleGameEnd}
            onNewOrder={() => {
              if (!currentLayout) return;
              const layoutWithInventory = generateInventory(currentLayout);
              const newOrder = generateOrder(layoutWithInventory, gameMode, 5);
              setOrder(newOrder);
            }}
          />
        ) : (
          <SimulationSetup savedLayouts={savedLayouts} onStart={handleStartGame} />
        )}
      </TabsContent>
      <TabsContent value="results" className="mt-4">
        <ResultsPageContent 
            history={gameHistory}
            selectedGameId={selectedGameId}
            onSelectGame={setSelectedGameId}
        />
      </TabsContent>
    </Tabs>
  );
}
