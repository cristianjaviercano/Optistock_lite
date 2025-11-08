"use client";

import type { WarehouseLayout } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Server, Layers, User as UserIcon, Package, Target, Factory, Truck } from "lucide-react";
import React from "react";
import type { OrderItem } from '@/lib/simulation';

interface SimulationGridProps {
  layout: WarehouseLayout;
  gridSize: { width: number; height: number };
  playerPosition: { x: number; y: number };
  order: OrderItem[];
}

export default function SimulationGrid({ layout, gridSize, playerPosition, order }: SimulationGridProps) {
  
  const cells = React.useMemo(() => {
    const gridCells = [];
    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        const item = layout.find(i => i.x === x && i.y === y) || { id: `${x}-${y}`, type: 'floor', x, y };
        const isPlayerPosition = playerPosition.x === x && playerPosition.y === y;
        const orderItem = order.find(o => !o.completed && o.location.x === x && o.location.y === y);

        const cellClasses = cn(
            "aspect-square border flex items-center justify-center transition-colors relative",
            item.type === 'floor' && "bg-background",
            item.type === 'shelf' && "bg-primary/20",
            item.type === 'bay' && "bg-accent/20",
            item.type === 'processing' && "bg-chart-3/20",
            item.type === 'forklift' && "bg-chart-4/20",
        );
        
        let icon = null;
        if(item.type === 'shelf') icon = <Server className="h-5 w-5 text-primary opacity-60" />;
        if(item.type === 'bay') icon = <Layers className="h-5 w-5 text-accent opacity-60" />;
        if(item.type === 'processing') icon = <Factory className="h-5 w-5 text-chart-3 opacity-60" />;
        if(item.type === 'forklift') icon = <Truck className="h-5 w-5 text-chart-4 opacity-60" />;

        gridCells.push(
          <div key={`${x}-${y}`} className={cellClasses}>
            {icon}
            {isPlayerPosition && <UserIcon className="h-6 w-6 text-foreground z-10 absolute" />}
            {orderItem && (
                <div className="absolute inset-0 flex items-center justify-center z-20 animate-pulse">
                    <Target className="h-5 w-5 text-destructive" />
                </div>
            )}
          </div>
        );
      }
    }
    return gridCells;
  }, [layout, gridSize, playerPosition, order]);

  return (
    <div
      className="grid select-none"
      style={{
        gridTemplateColumns: `repeat(${gridSize.width}, minmax(0, 1fr))`,
        minWidth: `${gridSize.width * 2.5}rem`,
      }}
    >
      {cells}
    </div>
  );
}
