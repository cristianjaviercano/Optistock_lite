"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { WarehouseLayout, GameMode } from '@/lib/types';
import type { OrderItem } from '@/lib/simulation';
import { calculateCost } from '@/lib/simulation';
import SimulationGrid from './simulation-grid';
import MetricsDashboard from './metrics-dashboard';
import OrderList from './order-list';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Gamepad, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface SimulationActiveProps {
  layout: WarehouseLayout;
  order: OrderItem[];
  mode: GameMode;
  initialPlayerPosition: { x: number; y: number };
  onGameEnd: (finalStats: { time: number, moves: number, cost: number }) => void;
}

export default function SimulationActive({ layout, order, mode, initialPlayerPosition, onGameEnd }: SimulationActiveProps) {
  const { toast } = useToast();
  const [playerPosition, setPlayerPosition] = useState(initialPlayerPosition);
  const [direction, setDirection] = useState<Direction>('right');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>(order);
  const [time, setTime] = useState(0);
  const [moves, setMoves] = useState(0);
  const [cost, setCost] = useState(0);

  const gridSize = {
      width: Math.max(...layout.map(i => i.x)) + 1,
      height: Math.max(...layout.map(i => i.y)) + 1,
  };

  const isMoveValid = useCallback((x: number, y: number) => {
    if (x < 0 || x >= gridSize.width || y < 0 || y >= gridSize.height) return false;
    const cell = layout.find(item => item.x === x && item.y === y);
    return cell?.type === 'floor' || cell?.type === 'bay-in' || cell?.type === 'bay-out' || cell?.type === 'processing' || cell?.type === 'forklift';
  }, [layout, gridSize]);

  const handleMove = useCallback((dx: number, dy: number) => {
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    
    if (dx === 1) setDirection('right');
    else if (dx === -1) setDirection('left');
    else if (dy === 1) setDirection('down');
    else if (dy === -1) setDirection('up');

    if (isMoveValid(newX, newY)) {
      setPlayerPosition({ x: newX, y: newY });
      setMoves(prev => prev + 1);
    }
  }, [playerPosition, isMoveValid]);

  const handleInteraction = () => {
    const adjacentCells = [
      { x: playerPosition.x, y: playerPosition.y - 1 },
      { x: playerPosition.x, y: playerPosition.y + 1 },
      { x: playerPosition.x - 1, y: playerPosition.y },
      { x: playerPosition.x + 1, y: playerPosition.y },
    ];

    let interacted = false;
    const newOrder = [...currentOrder];
    
    newOrder.forEach((orderItem, index) => {
      if (!orderItem.completed && adjacentCells.some(cell => cell.x === orderItem.location.x && cell.y === orderItem.location.y)) {
        newOrder[index].completed = true;
        interacted = true;
        toast({
          title: `Item ${mode === 'picking' ? 'Picked' : 'Stocked'}!`,
          description: `${orderItem.quantity}x ${orderItem.productName}`,
        });
      }
    });

    if (interacted) {
      setCurrentOrder(newOrder);
      if(newOrder.every(item => item.completed)) {
        onGameEnd({ time, moves, cost });
      }
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp': handleMove(0, -1); break;
        case 'ArrowDown': handleMove(0, 1); break;
        case 'ArrowLeft': handleMove(-1, 0); break;
        case 'ArrowRight': handleMove(1, 0); break;
        case ' ':
        case 'Enter':
          handleInteraction(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  useEffect(() => {
    const timer = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setCost(calculateCost(moves, time));
  }, [moves, time]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <MetricsDashboard time={time} moves={moves} cost={cost} />
        <div className="w-full overflow-x-auto rounded-lg border bg-card p-2 shadow-inner md:p-4">
            <SimulationGrid
                layout={layout}
                gridSize={gridSize}
                playerPosition={playerPosition}
                playerDirection={direction}
                order={currentOrder}
            />
        </div>
        <Card className="lg:hidden">
            <CardContent className="p-4">
                <Button onClick={handleInteraction} className="w-full">Interact</Button>
            </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <OrderList order={currentOrder} mode={mode} />
        <Card className="hidden lg:block">
            <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex justify-center items-center gap-2">
                    <div className="flex flex-col items-center">
                        <Button variant="outline" size="icon" onClick={() => handleMove(0, -1)}><ArrowUp/></Button>
                    </div>
                </div>
                <div className="flex justify-center items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleMove(-1, 0)}><ArrowLeft/></Button>
                    <Button variant="outline" size="icon" onClick={handleInteraction} className="bg-primary/20"><Gamepad/></Button>
                    <Button variant="outline" size="icon" onClick={() => handleMove(1, 0)}><ArrowRight/></Button>
                </div>
                <div className="flex justify-center items-center gap-2">
                    <div className="flex flex-col items-center">
                         <Button variant="outline" size="icon" onClick={() => handleMove(0, 1)}><ArrowDown/></Button>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">Use arrow keys to move and Space/Enter to interact.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
