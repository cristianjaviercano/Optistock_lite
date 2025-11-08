
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
import { Gamepad, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Truck, Minus, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';

type Direction = 'up' | 'down' | 'left' | 'right';

interface SimulationActiveProps {
  layout: WarehouseLayout;
  order: OrderItem[];
  mode: GameMode;
  playMode: PlayMode;
  initialPlayerPosition: { x: number; y: number };
  onGameEnd: (finalStats: { time: number, moves: number, cost: number }) => void;
  onNewOrder: () => void;
}

export default function SimulationActive({ layout, order, mode, playMode, initialPlayerPosition, onGameEnd, onNewOrder }: SimulationActiveProps) {
  const { toast } = useToast();
  const [playerPosition, setPlayerPosition] = useState(initialPlayerPosition);
  const [direction, setDirection] = useState<Direction>('right');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>(order.map(o => ({...o, status: 'pending' })));
  const [carriedItem, setCarriedItem] = useState<OrderItem | null>(null);
  const [time, setTime] = useState(0);
  const [moves, setMoves] = useState(0);
  const [cost, setCost] = useState(0);
  const [isOrderComplete, setIsOrderComplete] = useState(false);

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
    if (!cell) return false;

    // Cannot move onto shelves, processing stations, in-bays, or out-bays
    if (['shelf', 'bay-in', 'bay-out', 'processing'].includes(cell.type)) {
      return false;
    }

    // Check for items on the cell that would block movement
    const itemOnCell = currentOrder.find(o => 
        o.location.x === x && 
        o.location.y === y && 
        ['pending', 'processing', 'processed', 'ready-for-dispatch'].includes(o.status)
    );

    if (itemOnCell) {
      return false;
    }

    return true;
  }, [layout, gridSize, currentOrder]);

  const handleMove = useCallback((moveDirection: Direction) => {
    // If the pressed direction is different from the current direction, just turn.
    if (direction !== moveDirection) {
        setDirection(moveDirection);
        return;
    }

    // If the direction is the same, attempt to move.
    let dx = 0, dy = 0;
    switch(moveDirection) {
      case 'up': dy = -1; break;
      case 'down': dy = 1; break;
      case 'left': dx = -1; break;
      case 'right': dx = 1; break;
    }

    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;

    if (isMoveValid(newX, newY)) {
      setPlayerPosition({ x: newX, y: newY });
      setMoves(prev => prev + 1);
    }
  }, [playerPosition, direction, isMoveValid]);
  
  const handleInteraction = useCallback(() => {
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
            const itemToPick = currentOrder.find(o => ((o.location.x === x && o.location.y === y) || (o.origin?.x === x && o.origin?.y === y)) && o.status === 'pending');
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
  }, [getAdjacentCell, carriedItem, mode, playMode, currentOrder, toast]);

  const handleDispatch = useCallback(() => {
    const itemsToDispatch = currentOrder.filter(o => o.status === 'ready-for-dispatch');
    if (itemsToDispatch.length === 0) {
        toast({ variant: "destructive", title: "Nada para despachar", description: "No hay paquetes en las bahías de salida."});
        return;
    }

    setCurrentOrder(prev => prev.map(o => o.status === 'ready-for-dispatch' ? { ...o, status: 'completed' } : o));
    toast({ title: "¡Despacho completo!", description: `${itemsToDispatch.length} paquete(s) han sido enviados.`});
  }, [currentOrder, toast]);
  
  const handleNewOrder = useCallback(() => {
    onNewOrder();
    toast({
        title: '¡Nueva Orden!',
        description: 'Se ha generado una nueva lista de tareas.'
    })
  }, [onNewOrder, toast]);


  useEffect(() => {
    if (currentOrder.length > 0 && currentOrder.every(item => item.status === 'completed' && !carriedItem)) {
      setIsOrderComplete(true);
    }
  }, [currentOrder, carriedItem]);

  useEffect(() => {
    setCurrentOrder(order.map(o => ({...o, status: 'pending' })));
    setPlayerPosition(initialPlayerPosition);
    setDirection('right');
    setCarriedItem(null);
    setTime(0);
    setMoves(0);
    setIsOrderComplete(false);
  }, [order, initialPlayerPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp': handleMove('up'); break;
        case 'ArrowDown': handleMove('down'); break;
        case 'ArrowLeft': handleMove('left'); break;
        case 'ArrowRight': handleMove('right'); break;
        case ' ':
        case 'Enter':
          handleInteraction(); break;
        case 'd':
        case 'D':
            if(mode === 'picking') handleDispatch();
            break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, handleInteraction, handleDispatch, mode]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isOrderComplete) {
      timer = setInterval(() => setTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOrderComplete]);

  useEffect(() => {
    setCost(calculateCost(moves, time));
  }, [moves, time]);

  const handleFinish = () => {
    onGameEnd({ time, moves, cost });
  }

  const handleContinue = () => {
    setIsOrderComplete(false);
    onNewOrder();
  }
  
  const showDispatchButton = mode === 'picking' && currentOrder.some(o => o.status === 'ready-for-dispatch');
  
  const HandDrawnButton = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <Button
        variant="ghost"
        className={cn("h-auto w-auto bg-transparent hover:bg-transparent border-2 border-foreground rounded-lg px-6 py-4 font-headline text-lg tracking-wider shadow-[4px_4px_0px_0px_hsl(var(--secondary))] hover:shadow-[2px_2px_0px_0px_hsl(var(--secondary))] transition-all disabled:opacity-30 disabled:shadow-none", className)}
        {...props}
    >
        {children}
    </Button>
);


  const TouchControls = () => (
    <div className="w-full flex justify-around items-center p-4">
        <HandDrawnButton onClick={handleDispatch} disabled={!showDispatchButton}>
            despacho
        </HandDrawnButton>
        
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-36 h-36">
            <div className="col-start-2 row-start-1 flex justify-center items-center">
                 <Button variant="outline" size="icon" onClick={() => handleMove('up')}><ArrowUp/></Button>
            </div>
             <div className="col-start-1 row-start-2 flex justify-center items-center">
                <Button variant="outline" size="icon" onClick={() => handleMove('left')}><ArrowLeft/></Button>
            </div>
             <div className="col-start-2 row-start-2 flex justify-center items-center">
                <Button onClick={handleInteraction} variant="primary" size="icon" className="w-12 h-12"><Minus className="w-8 h-8"/></Button>
            </div>
             <div className="col-start-3 row-start-2 flex justify-center items-center">
                <Button variant="outline" size="icon" onClick={() => handleMove('right')}><ArrowRight/></Button>
            </div>
            <div className="col-start-2 row-start-3 flex justify-center items-center">
                <Button variant="outline" size="icon" onClick={() => handleMove('down')}><ArrowDown/></Button>
            </div>
        </div>
        
        <HandDrawnButton onClick={handleNewOrder}>
            Nuevo pedido
        </HandDrawnButton>
    </div>
);


  return (
    <>
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
        </div>
        <div className="flex flex-col gap-6">
          <OrderList order={currentOrder} mode={mode} />
        </div>
      </div>
      
       {/* CONTROLS AREA */}
      <Card className="mt-6">
          <CardContent className="p-2">
             <TouchControls />
             <p className="text-xs text-muted-foreground text-center -mt-2">Usa los controles o las flechas del teclado. Espacio para interactuar. 'D' para despachar.</p>
          </CardContent>
      </Card>


      <AlertDialog open={isOrderComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Orden Completada!</AlertDialogTitle>
            <AlertDialogDescription>
              Has completado todas las tareas de la orden actual. ¿Qué te gustaría hacer ahora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleContinue}>Continuar con la siguiente orden</AlertDialogAction>
            <AlertDialogCancel onClick={handleFinish}>Terminar simulación</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    