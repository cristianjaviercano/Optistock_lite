"use client";

import type { WarehouseLayout } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Forklift as ForkliftIcon, Package, Factory, Server, ArrowRightToLine, ArrowLeftFromLine, Home } from "lucide-react";
import React from "react";
import type { OrderItem } from '@/lib/simulation';

type Direction = 'up' | 'down' | 'left' | 'right';

interface SimulationGridProps {
  layout: WarehouseLayout;
  gridSize: { width: number; height: number };
  playerPosition: { x: number; y: number };
  playerDirection: Direction;
  order: OrderItem[];
}

const GridHeaderCell = ({ children }: { children: React.ReactNode }) => (
    <div className="flex aspect-square items-center justify-center text-xs font-bold text-muted-foreground">
        {children}
    </div>
)

export default function SimulationGrid({ layout, gridSize, playerPosition, playerDirection, order }: SimulationGridProps) {
  
  const getRotationClass = (direction: Direction) => {
    switch (direction) {
      case 'up': return '-rotate-90';
      case 'down': return 'rotate-90';
      case 'left': return 'rotate-180';
      case 'right': return 'rotate-0';
      default: return 'rotate-0';
    }
  }

  return (
    <div
      className="grid select-none"
      style={{
        gridTemplateColumns: `auto repeat(${gridSize.width}, minmax(0, 1fr))`,
        minWidth: `${(gridSize.width + 1) * 2.5}rem`,
      }}
    >
      {/* Corner */}
      <GridHeaderCell />
        
      {/* Column Headers */}
      {Array.from({ length: gridSize.width }).map((_, i) => (
        <GridHeaderCell key={`col-header-${i}`}>{String.fromCharCode(65 + i)}</GridHeaderCell>
      ))}

      {/* Row Headers and Grid */}
      {Array.from({ length: gridSize.height }).map((_, y) => (
        <React.Fragment key={`row-${y}`}>
          <GridHeaderCell>{y + 1}</GridHeaderCell>
            {Array.from({ length: gridSize.width }).map((_, x) => {
               const item = layout.find(i => i.x === x && i.y === y) || { id: `${x}-${y}`, type: 'floor', x, y };
               const isPlayerPosition = playerPosition.x === x && playerPosition.y === y;
               const orderItem = order.find(o => !o.completed && o.location.x === x && o.location.y === y);
       
               const cellClasses = cn(
                   "aspect-square border flex items-center justify-center transition-colors relative",
                   item.type === 'floor' && "bg-background",
                   item.type === 'shelf' && "bg-primary/20",
                   (item.type === 'bay-in' || item.type === 'bay-out') && "bg-accent/20",
                   item.type === 'processing' && "bg-chart-3/20",
                   item.type === 'forklift' && "bg-chart-4/20",
               );
               
               let icon = null;
               if(item.type === 'shelf') icon = <Server className="h-5 w-5 text-primary opacity-20" />;
               if(item.type === 'bay-in') icon = <ArrowRightToLine className="h-5 w-5 text-accent opacity-20" />;
               if(item.type === 'bay-out') icon = <ArrowLeftFromLine className="h-5 w-5 text-accent opacity-20" />;
               if(item.type === 'processing') icon = <Factory className="h-5 w-5 text-chart-3 opacity-20" />;
               if(item.type === 'forklift') icon = <Home className="h-5 w-5 text-chart-4 opacity-20" />;
       
               return (
                 <div key={`${x}-${y}`} className={cellClasses}>
                   {icon}
                   {isPlayerPosition && <ForkliftIcon className={cn("h-6 w-6 text-foreground z-10 absolute transition-transform", getRotationClass(playerDirection))} />}
                   {orderItem && (
                       <div className="absolute inset-0 flex items-center justify-center z-5">
                           <Package className="h-5 w-5 text-destructive" />
                       </div>
                   )}
                 </div>
               );
            })}
        </React.Fragment>
      ))}
    </div>
  );
}
