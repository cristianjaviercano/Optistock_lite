"use client";

import type { WarehouseLayout, WarehouseItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import React from "react";

interface WarehouseGridProps {
  layout: WarehouseLayout;
  gridSize: { width: number; height: number };
  onCellInteraction: (x: number, y: number) => void;
}

function WarehouseCell({ item }: { item: WarehouseItem }) {
  const cellClasses = cn(
    "aspect-square border flex items-center justify-center cursor-pointer transition-colors",
    "hover:bg-primary/10",
    "bg-background"
  );

  return (
    <div
      className={cellClasses}
      role="button"
      aria-label={`Grid cell at ${item.x}, ${item.y}, type ${item.type}`}
    >
      {item.type === 'shelf' && <div className="w-full h-full bg-primary/80"></div>}
      {item.type === 'bay-in' && <div className="w-full h-full bg-accent/80"></div>}
      {item.type === 'bay-out' && <div className="w-full h-full bg-accent/80"></div>}
      {item.type === 'processing' && <div className="w-full h-full bg-chart-3/80"></div>}
      {item.type === 'forklift' && <div className="w-full h-full bg-chart-4/80"></div>}
    </div>
  );
}

const GridHeaderCell = ({ children }: { children: React.ReactNode }) => (
    <div className="flex aspect-square items-center justify-center text-xs font-bold text-muted-foreground">
        {children}
    </div>
)

export default function WarehouseGrid({ layout, gridSize, onCellInteraction }: WarehouseGridProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleInteraction = (x: number, y: number) => {
    onCellInteraction(x, y);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // prevent text selection while dragging
    e.preventDefault();
    setIsDragging(true);
  }
  const handleMouseUp = () => setIsDragging(false);
  
  const handleCellEnter = (x: number, y: number) => {
    if (isDragging) {
      onCellInteraction(x, y);
    }
  };
  
  return (
    <div 
      className="select-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="grid" style={{ gridTemplateColumns: `auto repeat(${gridSize.width}, minmax(0, 1fr))` }}>
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
               return (
                <div 
                  key={`${x}-${y}`} 
                  onMouseDown={(e) => { e.stopPropagation(); handleInteraction(x,y); }}
                  onMouseEnter={() => handleCellEnter(x, y)}
                >
                  <WarehouseCell item={item} />
                </div>
               )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
