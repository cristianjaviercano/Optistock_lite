"use client";

import type { WarehouseLayout, WarehouseItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Server, Factory, ArrowRightToLine, ArrowLeftFromLine, Home } from "lucide-react";
import React from "react";

interface WarehouseGridProps {
  layout: WarehouseLayout;
  gridSize: { width: number; height: number };
  onCellInteraction: (x: number, y: number) => void;
}

const itemIcons: { [key: string]: React.ReactNode } = {
  shelf: <Server className="h-4 w-4 text-primary" />,
  'bay-in': <ArrowRightToLine className="h-4 w-4 text-accent" />,
  'bay-out': <ArrowLeftFromLine className="h-4 w-4 text-accent" />,
  processing: <Factory className="h-4 w-4 text-chart-3" />,
  forklift: <Home className="h-4 w-4 text-chart-4" />,
};

function WarehouseCell({ item }: { item: WarehouseItem }) {
  const Icon = itemIcons[item.type];

  const cellClasses = cn(
    "aspect-square border flex items-center justify-center cursor-pointer transition-colors",
    "hover:bg-primary/10",
    item.type === 'floor' && "bg-background",
    item.type === 'shelf' && "bg-primary/20",
    (item.type === 'bay-in' || item.type === 'bay-out') && "bg-accent/20",
    item.type === 'processing' && "bg-chart-3/20",
    item.type === 'forklift' && "bg-chart-4/20",
  );

  return (
    <div
      className={cellClasses}
      role="button"
      aria-label={`Grid cell at ${item.x}, ${item.y}, type ${item.type}`}
    >
      {Icon}
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

  const renderGrid = () => {
    const cellMap = new Map<string, WarehouseItem>();
    layout.forEach(item => cellMap.set(`${item.x}-${item.y}`, item));

    const gridCells = [];
    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        const item = cellMap.get(`${x}-${y}`) || { id: `${x}-${y}`, type: 'floor', x, y };
        gridCells.push(
          <div 
            key={`${x}-${y}`} 
            onMouseDown={() => handleInteraction(x, y)}
            onMouseEnter={() => handleCellEnter(x, y)}
          >
            <WarehouseCell item={item} />
          </div>
        );
      }
    }
    return gridCells;
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
