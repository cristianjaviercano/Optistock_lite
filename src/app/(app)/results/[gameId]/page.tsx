"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import type { GameSession } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap, BrainCircuit, Route, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// Mocking the AI flow as per instructions, as no flow is provided in `src/ai/flows`.
// In a real scenario, this would import and call a Genkit flow.
const getSimulationInsights = async (session: GameSession): Promise<{ insights: string[] }> => {
    console.log("Generating mock AI insights for game:", session.id);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    
    let mockInsights = [
      `For a ${session.mode} task, your pathing efficiency was moderate. You made ${session.moves} moves. Consider grouping tasks in the same aisle to reduce backtracking.`,
      `Your total cost of $${session.cost.toFixed(2)} is a good starting point. Focusing on reducing your total time of ${session.time}s will have the biggest impact on lowering cost.`,
    ];

    if (session.playMode === 'guided') {
        mockInsights.push("You completed the simulation in Guided Mode. This is great for learning the optimal flow. Try Free Mode next to test your own strategies!");
    } else {
        mockInsights.push("You completed the simulation in Free Mode. This mode tests your ability to prioritize and plan. Review your path to see if a different task order could have been faster.");
    }
    
    return { insights: mockInsights };
};


export default function ResultsPage({ params }: { params: { gameId: string } }) {
  const { gameId } = params;
  const { user } = useAuth();
  const [session, setSession] = useState<GameSession | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    if (user && gameId) {
      const historyJson = localStorage.getItem(`optistock_history_${user.id}`);
      if (historyJson) {
        try {
          const history: GameSession[] = JSON.parse(historyJson);
          const foundSession = history.find(s => s.id === gameId);
          if (foundSession) {
            setSession(foundSession);
            getSimulationInsights(foundSession).then(result => {
              setInsights(result.insights);
              setInsightsLoading(false);
            });
          }
        } catch (e) {
            console.error("Failed to parse history or find session", e);
        }
      }
      setLoading(false);
    }
  }, [user, gameId]);

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
                    <CardTitle className="text-2xl font-headline">Simulation Complete!</CardTitle>
                    <CardDescription>
                        Here is the summary of your session from {new Date(session.date).toLocaleString()}.
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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Total Time</p>
              <p className="text-3xl font-bold">{session.time}s</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Total Moves</p>
              <p className="text-3xl font-bold">{session.moves}</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-3xl font-bold">${session.cost.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-accent" />
            <CardTitle className="font-headline">Actionable Insights</CardTitle>
        </CardHeader>
        <CardContent>
            {insightsLoading ? (
                 <div className="flex items-center gap-4 p-4">
                    <Loader2 className="h-5 w-5 animate-spin"/>
                    <p className="text-muted-foreground">Analyzing your performance...</p>
                 </div>
            ) : (
                <ul className="space-y-4">
                    {insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-4">
                            <Zap className="h-5 w-5 mt-1 text-primary/80 shrink-0" />
                            <p className="text-foreground">{insight}</p>
                        </li>
                    ))}
                </ul>
            )}
        </CardContent>
      </Card>
      <div className="flex gap-4">
        <Button asChild size="lg"><Link href="/simulation">Run Another Simulation</Link></Button>
        <Button asChild variant="outline" size="lg"><Link href="/dashboard">View Dashboard</Link></Button>
      </div>
    </div>
  );
}
