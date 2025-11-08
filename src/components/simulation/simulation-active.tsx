"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { WarehouseLayout, GameMode, WarehouseItem, OrderItemStatus, PlayMode } from '@/lib/types';
import type { OrderItem } from '@/lib/simulation';
import { calculateCost, findStartBay } from '@/lib/simulation';
import SimulationGrid from './simulation-grid';
import MetricsDashboard from './metrics-dashboard';
import OrderList from './order-list';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Gamepad, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Truck } from 'lucide-react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface SimulationActiveProps {
  layout: WarehouseLayout;
  order: OrderItem[];
  mode: GameMode;
  playMode: PlayMode;
  initialPlayerPosition: { x: number; y: number };
  onGameEnd: (finalStats: { time: number, moves: number, cost: number }) => void;
}

export default function SimulationActive({ layout, order, mode, playMode, initialPlayerPosition, onGameEnd }: SimulationActiveProps) {
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
  
  const getAdjacentCell = useCallback((): WarehouseItem | undefined => {
    const { x, y } = playerPosition;
    let targetCoords: {x: number, y: number};
    switch (direction) {
        case 'up': targetCoords = { x, y: y - 1 }; break;
        case 'down': targetCoords = { x, y: y + 1 }; break;
        case 'left': targetCoords = { x: x - 1, y }; break;
        case 'right': targetCoords = { x: x + 1, y }; break;
    }
    return layout.find(item => item.x === targetCoords.x && item.y === targetCoords.y);
  }, [playerPosition, direction, layout]);

  const isMoveValid = useCallback((x: number, y: number) => {
    if (x < 0 || x >= gridSize.width || y < 0 || y >= gridSize.height) return false;
    const cell = layout.find(item => item.x === x && item.y === y);
    
    // Cannot move onto shelves.
    if(cell?.type === 'shelf') return false;

    // Cannot move onto a processing station that is busy
    const isProcessingCell = cell?.type === 'processing';
    const isProcessingItemThere = currentOrder.some(o => o.location.x === x && o.location.y === y && o.status === 'processing');
    if (isProcessingCell && isProcessingItemThere) return false;
    
    // Can move onto bays, but cannot move through items ready for dispatch
    const isBayOutCell = cell?.type === 'bay-out';
    const isReadyForDispatchItemThere = currentOrder.some(o => o.location.x === x && o.location.y === y && o.status === 'ready-for-dispatch');
    if (isBayOutCell && isReadyForDispatchItemThere) return false;

    // Cannot move onto a cell with a pending item
    const hasPendingOrder = currentOrder.some(o => o.location.x === x && o.location.y === y && o.status === 'pending');
    if (hasPendingOrder) return false;

    return true;
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
    if (!interactionCell) return;
    const { x, y } = interactionCell;

    // === PICKING MODE LOGIC ===
    if (mode === 'picking') {
        // --- Dropping an item ---
        if (carriedItem) {
            // Drop at processing station
            if (interactionCell.type === 'processing' && carriedItem.status === 'carrying') {
                toast({ title: "Item en procesamiento", description: `Procesando ${carriedItem.productName}.`});
                
                setCurrentOrder(prev => prev.map(o => o.productId === carriedItem.productId ? {...o, status: 'processing', location: {x, y} } : o));
                const itemToProcess = { ...carriedItem, status: 'processing', location: {x,y} }
                setCarriedItem(null);

                // Simulate processing time
                const processingTime = (Math.floor(Math.random() * 5) + 2) * 1000; // 2-6 seconds
                setTimeout(() => {
                    setCurrentOrder(prev => prev.map(o => o.productId === itemToProcess.productId ? {...o, status: 'processed' } : o));
                    toast({ title: "¡Procesamiento completo!", description: `${itemToProcess.productName} está listo para ser despachado.`});
                }, processingTime);

            } // Drop at dispatch bay
            else if (interactionCell.type === 'bay-out' && carriedItem.status === 'processed') {
                toast({ title: "¡Listo para despachar!", description: `${carriedItem.productName} está en la bahía de salida.`});
                setCurrentOrder(prev => prev.map(o => o.productId === carriedItem!.productId ? {...o, status: 'ready-for-dispatch', location: {x, y}} : o));
                setCarriedItem(null);
            } else {
                toast({ variant: "destructive", title: "Ubicación incorrecta", description: "Este no es el punto de entrega correcto."})
            }
        } 
        // --- Picking up an item ---
        else {
            const itemToPick = currentOrder.find(o => o.location.x === x && o.location.y === y && o.status === 'pending');
            if(itemToPick) {
                // Check for guided mode
                if (playMode === 'guided') {
                    const firstPending = currentOrder.find(o => o.status === 'pending');
                    if (firstPending && firstPending.productId !== itemToPick.productId) {
                        toast({ variant: "destructive", title: "Orden incorrecta", description: `Por favor, recoja ${firstPending.productName} primero.` });
                        return;
                    }
                }

                if (interactionCell.type === 'shelf') { // Pick from shelf
                    setCarriedItem({...itemToPick, status: 'carrying'});
                    setCurrentOrder(prev => prev.map(o => o.productId === itemToPick.productId ? {...o, status: 'carrying'}: o));
                    toast({ title: `¡Artículo recogido!`, description: `Lleva ${itemToPick.productName} a una estación de procesamiento.` });
                } 
            }
            // Pick up a PROCESSED item from processing station
            const itemToDispatch = currentOrder.find(o => o.location.x === x && o.location.y === y && o.status === 'processed');
            if (itemToDispatch && interactionCell.type === 'processing') {
                setCarriedItem({...itemToDispatch, status: 'processed'});
                 setCurrentOrder(prev => prev.map(o => o.productId === itemToDispatch.productId ? {...o, status: 'carrying'}: o));
                toast({ title: `¡Artículo listo!`, description: `Lleva ${itemToDispatch.productName} a una bahía de despacho.` });
            }
        }
    }

    // === STOCKING MODE LOGIC ===
    if (mode === 'stocking') {
         // --- Dropping an item ---
        if (carriedItem) {
            // Drop at the target shelf
            if (interactionCell.type === 'shelf' && carriedItem.location.x === x && carriedItem.location.y === y) {
                toast({ title: `¡Artículo Almacenado!`, description: `${carriedItem.quantity}x ${carriedItem.productName}` });
                setCurrentOrder(prev => prev.map(o => o.productId === carriedItem.productId ? { ...o, status: 'completed' } : o));
                setCarriedItem(null);
            } else {
                toast({ variant: "destructive", title: "Estante incorrecto", description: "Esta no es la ubicación correcta para este artículo."})
            }
        }
        // --- Picking up an item ---
        else {
            const itemToPick = currentOrder.find(o => o.origin?.x === x && o.origin?.y === y && o.status === 'pending');
            if (itemToPick && interactionCell.type === 'bay-in') {
                 if (playMode === 'guided') {
                    const firstPending = currentOrder.find(o => o.status === 'pending');
                    if (firstPending && firstPending.productId !== itemToPick.productId) {
                        toast({ variant: "destructive", title: "Orden incorrecta", description: `Por favor, almacene ${firstPending.productName} primero.` });
                        return;
                    }
                }
                setCarriedItem({...itemToPick, status: 'carrying'});
                setCurrentOrder(prev => prev.map(o => o.productId === itemToPick.productId ? {...o, status: 'carrying'}: o));
                toast({ title: `¡Artículo Recogido!`, description: `Lleva ${itemToPick.productName} a su estante.` });
            }
        }
    }
  };

  const handleDispatch = () => {
    const itemsToDispatch = currentOrder.filter(o => o.status === 'ready-for-dispatch');
    if (itemsToDispatch.length === 0) {
        toast({ variant: "destructive", title: "Nada para despachar", description: "No hay paquetes en las bahías de salida."});
        return;
    }

    setCurrentOrder(prev => prev.map(o => o.status === 'ready-for-dispatch' ? { ...o, status: 'completed' } : o));
    toast({ title: "¡Despacho completo!", description: `${itemsToDispatch.length} paquete(s) han sido enviados.`});
  }
  
  useEffect(() => {
    // Check for game end
    if (currentOrder.length > 0 && currentOrder.every(item => item.status === 'completed' && !carriedItem)) {
      onGameEnd({ time, moves, cost });
    }
  }, [currentOrder, onGameEnd, time, moves, cost, carriedItem]);

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
  
  const showDispatchButton = mode === 'picking' && currentOrder.some(o => o.status === 'ready-for-dispatch' || o.status === 'processed' || o.status === 'carrying');

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
            <CardContent className="p-4 flex gap-2">
                <Button onClick={handleInteraction} className="w-full">Interactuar</Button>
                {showDispatchButton && <Button onClick={handleDispatch} className="w-full bg-accent text-accent-foreground hover:bg-accent/90"><Truck className="mr-2"/>Despacho</Button>}
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
                {showDispatchButton && <Button onClick={handleDispatch} className="w-full bg-accent text-accent-foreground hover:bg-accent/90"><Truck className="mr-2"/>Despacho</Button>}
                <p className="text-xs text-muted-foreground text-center">Usa las flechas para moverte y Espacio/Enter para interactuar.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
