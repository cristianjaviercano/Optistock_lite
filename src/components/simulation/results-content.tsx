"use client";

import { useEffect, useState } from 'react';
import type { GameSession } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Route, Shuffle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calculateCost } from '@/lib/simulation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface OptimalStats {
  time: number;
  moves: number;
  cost: number;
}

const calculateOptimalPath = async (session: GameSession): Promise<OptimalStats> => {
    console.log("Calculating optimal path for game:", session.id);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockMoves = Math.floor(session.moves * (Math.random() * 0.2 + 0.7)); // 70-90%
    const mockTime = Math.floor(session.time * (Math.random() * 0.2 + 0.75)); // 75-95%
    const mockCost = calculateCost(mockMoves, mockTime);

    return {
      time: mockTime,
      moves: mockMoves,
      cost: mockCost,
    };
};

interface ResultsPageContentProps {
    history: GameSession[];
    selectedGameId: string | null;
    onSelectGame: (gameId: string) => void;
}

export default function ResultsPageContent({ history, selectedGameId, onSelectGame }: ResultsPageContentProps) {
  const [session, setSession] = useState<GameSession | null>(null);
  const [optimalStats, setOptimalStats] = useState<OptimalStats | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    if (selectedGameId) {
        const foundSession = history.find(s => s.id === selectedGameId);
        setSession(foundSession || null);
        setOptimalStats(null); // Reset comparison when game changes
    } else {
        setSession(null);
    }
  }, [selectedGameId, history]);

  const handleCompare = async () => {
    if (!session) return;
    setComparisonLoading(true);
    const stats = await calculateOptimalPath(session);
    setOptimalStats(stats);
    setComparisonLoading(false);
  }

  if (history.length === 0) {
     return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>No hay resultados de simulación</CardTitle>
          <CardDescription>Completa una simulación para ver tus resultados aquí.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Selecciona una simulación</CardTitle>
          <CardDescription>Elige una simulación del menú para ver sus detalles.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                 <Label htmlFor="game-select">Seleccionar Simulación</Label>
            </CardHeader>
            <CardContent>
                <Select value={selectedGameId || ''} onValueChange={onSelectGame}>
                    <SelectTrigger id="game-select">
                        <SelectValue placeholder="Elige una simulación para ver..." />
                    </SelectTrigger>
                    <SelectContent>
                        {history.map(s => (
                            <SelectItem key={s.id} value={s.id}>
                                {new Date(s.date).toLocaleString()} - Coste: ${s.cost.toFixed(2)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>

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
            </Header>
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
    </div>
  );
}
