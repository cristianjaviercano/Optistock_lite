"use client";

import type { WarehouseLayout } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Forklift as ForkliftIcon, Package, Package2 } from "lucide-react";
import React from "react";
import type { OrderItem } from '@/lib/simulation';

type Direction = 'up' | 'down' | 'left' | 'right';

interface SimulationGridProps {
  layout: WarehouseLayout;
  gridSize: { width: number; height: number };
  playerPosition: { x: number; y: number };
  playerDirection: Direction;
  order: OrderItem[];
  carriedItem: OrderItem | null;
}

const GridHeaderCell = ({ children }: { children: React.ReactNode }) => (
    <div className="flex aspect-square items-center justify-center text-xs font-bold text-muted-foreground">
        {children}
    </div>
)

export default function SimulationGrid({ layout, gridSize, playerPosition, playerDirection, order, carriedItem }: SimulationGridProps) {
  
  const getRotationClass = (direction: Direction) => {
    switch (direction) {
      case 'up': return '-rotate-90';
      case 'down': return 'rotate-90';
      case 'left': return 'rotate-180';
      case 'right': return 'rotate-0';
      default: return 'rotate-0';
    }
  }

  const getForkliftAttachmentClass = (direction: Direction) => {
    switch (direction) {
        case 'up': return 'absolute -translate-y-full top-1/2 left-1/2 -translate-x-1/2';
        case 'down': return 'absolute translate-y-full bottom-1/2 left-1/2 -translate-x-1/2';
        case 'left': return 'absolute -translate-x-full left-1/2 top-1/2 -translate-y-1/2';
        case 'right': return 'absolute translate-x-full right-1/2 top-1/2 -translate-y-1/2';
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
               const orderItem = order.find(o => o.status === 'pending' && o.location.x === x && o.location.y === y);
       
               const cellClasses = cn(
                   "aspect-square border flex items-center justify-center transition-colors relative bg-background"
               );
               
               let icon = null;
                const IconComponent = {
                    shelf: <div className="w-full h-full bg-primary/20"></div>,
                    'bay-in': <div className="w-full h-full bg-accent/20"></div>,
                    'bay-out': <div className="w-full h-full bg-accent/20"></div>,
                    processing: <div className="w-full h-full bg-chart-3/20"></div>,
                    forklift: <div className="w-full h-full bg-chart-4/20"></div>,
                    floor: null,
                }[item.type];
       
               return (
                 <div key={`${x}-${y}`} className={cellClasses}>
                   {IconComponent}
                   {isPlayerPosition && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <ForkliftIcon className={cn("h-6 w-6 text-foreground transition-transform", getRotationClass(playerDirection))} />
                        {carriedItem && (
                             <Package2 className={cn("h-4 w-4 text-destructive z-20", getForkliftAttachmentClass(playerDirection))} />
                        )}
                    </div>
                   )}
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
