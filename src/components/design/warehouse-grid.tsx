"use client";

import type { WarehouseLayout, WarehouseItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Server, Layers, Factory, Truck } from "lucide-react";
import React from "react";

interface WarehouseGridProps {
  layout: WarehouseLayout;
  gridSize: { width: number; height: number };
  onCellInteraction: (x: number, y: number) => void;
}

const itemIcons: { [key: string]: React.ReactNode } = {
  shelf: <Server className="h-4 w-4 text-primary" />,
  bay: <Layers className="h-4 w-4 text-accent" />,
  processing: <Factory className="h-4 w-4 text-chart-3" />,
  forklift: <Truck className="h-4 w-4 text-chart-4" />,
};

function WarehouseCell({ item }: { item: WarehouseItem }) {
  const Icon = itemIcons[item.type];

  const cellClasses = cn(
    "aspect-square border flex items-center justify-center cursor-pointer transition-colors",
    "hover:bg-primary/10",
    item.type === 'floor' && "bg-background",
    item.type === 'shelf' && "bg-primary/20",
    item.type === 'bay' && "bg-accent/20",
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

export default function WarehouseGrid({ layout, gridSize, onCellInteraction }: WarehouseGridProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleInteraction = (x: number, y: number) => {
    onCellInteraction(x, y);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  
  const handleCellEnter = (x: number, y: number) => {
    if (isDragging) {
      onCellInteraction(x, y);
    }
  };

  const cells = React.useMemo(() => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, gridSize.height, gridSize.width, isDragging]);

  return (
    <div 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="grid select-none"
        style={{
          gridTemplateColumns: `repeat(${gridSize.width}, minmax(0, 1fr))`,
          minWidth: `${gridSize.width * 2.5}rem`,
        }}
      >
        {cells}
      </div>
    </div>
  );
}
