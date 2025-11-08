"use client";

import React, { useState, useEffect } from 'react';
import type { GameSession } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PerformanceChart from '@/components/dashboard/performance-chart';
import HistoryTable from '@/components/dashboard/history-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function StatisticsPage() {
  const { user } = useAuth();
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      try {
        const historyJson = localStorage.getItem(`optistock_history_${user.id}`);
        if (historyJson) {
            const parsedHistory = JSON.parse(historyJson);
            // Sort by date descending
            parsedHistory.sort((a: GameSession, b: GameSession) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setGameHistory(parsedHistory);
        }
      } catch (e) {
        console.error("Failed to parse game history from localStorage", e);
      }
    }
  }, [user]);

  return (
    <div className="grid gap-6">
        {gameHistory.length > 0 ? (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Coste a lo largo del tiempo</CardTitle>
                    <CardDescription>Costes operativos en todas las simulaciones.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PerformanceChart data={[...gameHistory].reverse()} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Simulaciones</CardTitle>
                    <CardDescription>Un registro detallado de todas tus simulaciones pasadas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <HistoryTable data={gameHistory} />
                </CardContent>
            </Card>
        </>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">¡Aún no hay estadísticas!</CardTitle>
                <CardDescription>Ejecuta una simulación para ver tus métricas de rendimiento aquí.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild size="lg">
                    <Link href="/simulation">Comenzar Primera Simulación</Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
