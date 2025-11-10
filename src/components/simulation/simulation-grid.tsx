"use client";

import type { WarehouseLayout, OrderItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import React from "react";

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

const ForkliftSvg = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        className={className} 
        {...props}
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <rect width="18" height="18" x="3" y="3" fill="#FFC700" stroke="none" rx="2"></rect>
        <line x1="15" y1="7" x2="21" y2="7" stroke="black"></line>
        <line x1="15" y1="17" x2="21" y2="17" stroke="black"></line>
    </svg>
);


const PalletBoxIcon = ({ boxColor, className }: { boxColor: string; className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        className={cn("h-full w-full", className)}
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        {/* Pallet (70% size, centered) */}
        <rect width="16.8" height="16.8" x="3.6" y="3.6" fill="#A0522D" rx="1" />
        {/* Box (40% size, centered on top) */}
        <rect width="9.6" height="9.6" x="7.2" y="5.2" fill={boxColor} rx="1" stroke="#000" strokeWidth="0.5" />
        {/* Box fold line */}
        <line x1="7.2" y1="10" x2="16.8" y2="10" stroke="#000" strokeOpacity="0.2" strokeWidth="1" />
    </svg>
);


export default function SimulationGrid({ layout, gridSize, playerPosition, playerDirection, order, carriedItem }: SimulationGridProps) {
  
  const getRotationClass = (direction: Direction) => {
    switch (direction) {
      case 'up': return '-rotate-90';
      case 'down': return 'rotate-90';
      case 'left': return 'scale-x-[-1]';
      case 'right': return '';
      default: return '';
    }
  }

  const getForkliftAttachmentClass = (direction: Direction) => {
    switch (direction) {
        case 'up': return 'absolute -translate-y-full top-1/2 left-1/2 -translate-x-1/2';
        case 'down': return 'absolute translate-y-full bottom-1/2 left-1/2 -translate-x-1/2';
        case 'left': return 'absolute -translate-x-full left-[25%] top-1/2 -translate-y-1/2'; // Flipped
        case 'right': return 'absolute translate-x-full right-[25%] top-1/2 -translate-y-1/2';
    }
  }

  const getOrderItemIcon = (item: OrderItem) => {
    const commonClasses = "p-1";
    switch (item.status) {
        case 'pending': return <PalletBoxIcon boxColor='hsl(var(--destructive))' className={commonClasses} />;
        case 'processing': return <PalletBoxIcon boxColor='#f97316' className={cn(commonClasses, "animate-pulse")} />;
        case 'processed': return <PalletBoxIcon boxColor='#8b5cf6' className={commonClasses} />;
        case 'ready-for-dispatch': return <PalletBoxIcon boxColor='hsl(var(--accent))' className={commonClasses} />;
        case 'completed': return <PalletBoxIcon boxColor='#22c55e' className={cn(commonClasses, "opacity-50")} />;
        default: return null;
    }
  }

  const getCarriedItemColor = () => {
      if (!carriedItem) return '';
      // This is a simplified logic. In a real scenario, you'd have the full item info.
      // We assume if it's carried, it's equivalent to pending/carrying state.
      return 'hsl(var(--destructive))';
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
               const orderItemOnCell = order.find(o => ((o.location.x === x && o.location.y === y) || (o.origin?.x === x && o.origin?.y === y)) && o.status !== 'carrying');
       
               const cellClasses = cn(
                   "aspect-square border flex items-center justify-center transition-colors relative bg-background"
               );
               
               let icon = null;
                const IconComponent = {
                    shelf: <div className="w-full h-full bg-primary/80"></div>,
                    'bay-in': <div className="w-full h-full bg-accent/80"></div>,
                    'bay-out': <div className="w-full h-full bg-accent/80"></div>,
                    processing: <div className="w-full h-full bg-chart-3/80"></div>,
                    forklift: <div className="w-full h-full bg-chart-4/80"></div>,
                    floor: null,
                }[item.type];
       
               return (
                 <div key={`${x}-${y}`} className={cellClasses}>
                   {IconComponent}
                   {isPlayerPosition && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <ForkliftSvg className={cn("h-full w-full text-foreground transition-transform scale-[0.8]", getRotationClass(playerDirection))} />
                        {carriedItem && (
                             <div className={cn("h-3/5 w-3/5 z-20", getForkliftAttachmentClass(playerDirection))}>
                                <PalletBoxIcon boxColor={getCarriedItemColor()} />
                             </div>
                        )}
                    </div>
                   )}
                   {orderItemOnCell && !isPlayerPosition && (
                       <div className="absolute inset-0 flex items-center justify-center z-5 p-1">
                           {getOrderItemIcon(orderItemOnCell)}
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
