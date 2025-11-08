"use client";

import React, { useState, useEffect } from 'react';
import type { GameSession } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PerformanceChart from '@/components/dashboard/performance-chart';
import HistoryTable from '@/components/dashboard/history-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
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

  const averageCost = gameHistory.length > 0 ? gameHistory.reduce((acc, game) => acc + game.cost, 0) / gameHistory.length : 0;

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card>
            <CardHeader>
                <CardTitle>Total Games Played</CardTitle>
                <CardDescription>Number of simulations completed.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{gameHistory.length}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Average Cost</CardTitle>
                <CardDescription>Avg. operational cost per simulation.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">
                ${averageCost.toFixed(2)}
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Best Time</CardTitle>
                <CardDescription>Fastest simulation completion time.</CardDescription>
            </CardHeader>
            <CardContent>
                 <p className="text-4xl font-bold">
                    {gameHistory.length > 0 ? `${Math.min(...gameHistory.map(g => g.time))}s` : 'N/A'}
                 </p>
            </CardContent>
        </Card>
      </div>

      {gameHistory.length > 0 ? (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Cost Over Time</CardTitle>
                    <CardDescription>Your operational costs across all simulations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PerformanceChart data={[...gameHistory].reverse()} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Simulation History</CardTitle>
                    <CardDescription>A detailed log of all your past simulations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <HistoryTable data={gameHistory} />
                </CardContent>
            </Card>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">No simulations yet!</CardTitle>
                <CardDescription>Run a simulation to see your performance metrics here.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild size="lg">
                    <Link href="/simulation">Start First Simulation</Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
