"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { WarehouseLayout, GameMode, WarehouseItem } from '@/lib/types';
import type { OrderItem } from '@/lib/simulation';
import { calculateCost, findStartBay } from '@/lib/simulation';
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
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>(order.map(o => ({...o, status: 'pending' })));
  const [carriedItem, setCarriedItem] = useState<OrderItem | null>(null);
  const [time, setTime] = useState(0);
  const [moves, setMoves] = useState(0);
  const [cost, setCost] = useState(0);

  const gridSize = {
      width: Math.max(...layout.map(i => i.x)) + 1,
      height: Math.max(...layout.map(i => i.y)) + 1,
  };
  
  const getAdjacentCell = useCallback(() => {
    const { x, y } = playerPosition;
    switch (direction) {
        case 'up': return { x, y: y - 1 };
        case 'down': return { x, y: y + 1 };
        case 'left': return { x: x - 1, y };
        case 'right': return { x: x + 1, y };
    }
  }, [playerPosition, direction]);

  const isMoveValid = useCallback((x: number, y: number) => {
    if (x < 0 || x >= gridSize.width || y < 0 || y >= gridSize.height) return false;
    const cell = layout.find(item => item.x === x && item.y === y);
    // Forklift can't move on shelves or cells with pending order items.
    const hasPendingOrder = currentOrder.some(o => o.location.x === x && o.location.y === y && o.status === 'pending');
    
    return cell?.type !== 'shelf' && !hasPendingOrder;
  }, [layout, gridSize, currentOrder]);

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
    const interactionCell = getAdjacentCell();
    const { x, y } = interactionCell;

    // Logic for dropping an item
    if (carriedItem) {
        const targetCell = layout.find(cell => cell.x === x && cell.y === y);
        // For now, let's assume we drop at the target location for the carried item.
        // This will be expanded with processing zones later.
        if(carriedItem.location.x === x && carriedItem.location.y === y) {
             setCurrentOrder(prevOrder => {
                const newOrder = prevOrder.map(o => o.productId === carriedItem.productId ? { ...o, status: 'completed' } : o);
                if(newOrder.every(item => item.status === 'completed')) {
                    onGameEnd({ time, moves, cost });
                }
                return newOrder;
             });
             setCarriedItem(null);
             toast({ title: `Item Stocked!`, description: `${carriedItem.quantity}x ${carriedItem.productName}` });
        } else {
             // Logic for dropping at a processing bay would go here.
             toast({ variant: "destructive", title: "Wrong location", description: "This is not the destination for the carried item."})
        }
        return;
    }

    // Logic for picking up an item
    const orderItemIndex = currentOrder.findIndex(orderItem =>
      orderItem.location.x === x && orderItem.location.y === y && orderItem.status === 'pending'
    );

    if (orderItemIndex !== -1) {
      const itemToPick = currentOrder[orderItemIndex];
      setCarriedItem(itemToPick);
      setCurrentOrder(prevOrder => prevOrder.map((o, index) => index === orderItemIndex ? { ...o, status: 'carrying' } : o));
      toast({
        title: `Item Picked!`,
        description: `${itemToPick.quantity}x ${itemToPick.productName}`,
      });
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
  }, [handleMove, handleInteraction]);

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
                carriedItem={carriedItem}
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
