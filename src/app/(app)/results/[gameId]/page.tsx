"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import type { GameSession } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap, BrainCircuit, Route, Shuffle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { calculateCost } from '@/lib/simulation';
import { aStar } from '@/lib/pathfinding';

interface OptimalStats {
  time: number;
  moves: number;
  cost: number;
}

// This function will house the optimization logic in the future.
// For now, it returns mock data.
const calculateOptimalPath = async (session: GameSession): Promise<OptimalStats> => {
    console.log("Calculating optimal path for game:", session.id);
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, we'll return a mock result that is better than the user's.
    // In the future, this would run a real pathfinding algorithm (like A* or a VRP solver).
    const mockMoves = Math.floor(session.moves * (Math.random() * 0.2 + 0.7)); // 70-90% of user moves
    const mockTime = Math.floor(session.time * (Math.random() * 0.2 + 0.75)); // 75-95% of user time
    const mockCost = calculateCost(mockMoves, mockTime);

    return {
      time: mockTime,
      moves: mockMoves,
      cost: mockCost,
    };
};


export default function ResultsPage({ params }: { params: { gameId: string } }) {
  const gameId = params.gameId;
  const { user } = useAuth();
  const [session, setSession] = useState<GameSession | null>(null);
  const [optimalStats, setOptimalStats] = useState<OptimalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    if (user && gameId) {
      const historyJson = localStorage.getItem(`optistock_history_${user.id}`);
      if (historyJson) {
        try {
          const history: GameSession[] = JSON.parse(historyJson);
          const foundSession = history.find(s => s.id === gameId);
          if (foundSession) {
            setSession(foundSession);
          }
        } catch (e) {
            console.error("Failed to parse history or find session", e);
        }
      }
      setLoading(false);
    }
  }, [user, gameId]);

  const handleCompare = async () => {
    if (!session) return;
    setComparisonLoading(true);
    const stats = await calculateOptimalPath(session);
    setOptimalStats(stats);
    setComparisonLoading(false);
  }

  if (loading) {
    return <div className="flex h-full min-h-[500px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!session) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Session Not Found</CardTitle>
          <CardDescription>The requested simulation result could not be found.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
            <div className='flex justify-between items-start'>
                <div>
                    <CardTitle className="text-2xl font-headline">¡Simulación Completa!</CardTitle>
                    <CardDescription>
                        Este es el resumen de tu sesión de {new Date(session.date).toLocaleString()}.
                    </CardDescription>
                </div>
                 <div className="flex gap-2">
                    <Badge variant="secondary" className="capitalize">{session.mode}</Badge>
                    <Badge variant={session.playMode === 'guided' ? 'default' : 'outline'} className="capitalize">
                        {session.playMode === 'guided' ? <Route className="mr-2 h-4 w-4"/> : <Shuffle className="mr-2 h-4 w-4" />}
                        {session.playMode}
                    </Badge>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Tu Tiempo Total</p>
              <p className="text-3xl font-bold">{session.time}s</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Tus Movimientos Totales</p>
              <p className="text-3xl font-bold">{session.moves}</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Tu Costo Total</p>
              <p className="text-3xl font-bold">${session.cost.toFixed(2)}</p>
            </div>
          </div>
          {!optimalStats && (
            <div className="text-center border-t pt-6">
              <Button onClick={handleCompare} disabled={comparisonLoading} size="lg">
                {comparisonLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trophy className="mr-2 h-4 w-4" />
                )}
                {comparisonLoading ? "Calculando..." : "Comparar con Ruta Óptima"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {optimalStats && (
        <Card className="border-accent">
            <CardHeader>
                <div className='flex items-center gap-3'>
                    <Trophy className="h-6 w-6 text-accent" />
                    <CardTitle className="font-headline text-accent">Comparación de Rendimiento Óptimo</CardTitle>
                </div>
                <CardDescription>
                    Así se compara tu rendimiento con una solución optimizada para la misma tarea.
                </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Tiempo Óptimo</p>
                  <p className="text-3xl font-bold text-accent">{optimalStats.time}s</p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Movimientos Óptimos</p>
                  <p className="text-3xl font-bold text-accent">{optimalStats.moves}</p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Costo Óptimo</p>
                  <p className="text-3xl font-bold text-accent">${optimalStats.cost.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button asChild size="lg"><Link href="/simulation">Correr Otra Simulación</Link></Button>
        <Button asChild variant="outline" size="lg"><Link href="/dashboard">Ver Dashboard</Link></Button>
      </div>
    </div>
  );
}
