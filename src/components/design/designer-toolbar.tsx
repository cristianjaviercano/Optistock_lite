"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { WarehouseItemType } from "@/lib/types";
import { Eraser } from "lucide-react";

interface DesignerToolbarProps {
  selectedTool: WarehouseItemType | 'eraser';
  setSelectedTool: (tool: WarehouseItemType | 'eraser') => void;
}

const tools: { value: WarehouseItemType | 'eraser', label: string, colorClass: string }[] = [
  { value: 'shelf', label: 'Estante', colorClass: 'bg-primary' },
  { value: 'bay-in', label: 'Ingreso', colorClass: 'bg-accent' },
  { value: 'bay-out', label: 'Despacho', colorClass: 'bg-accent' },
  { value: 'processing', label: 'Procesamiento', colorClass: 'bg-chart-3' },
  { value: 'forklift', label: 'Zona de Montacargas', colorClass: 'bg-chart-4' },
]

export default function DesignerToolbar({ selectedTool, setSelectedTool }: DesignerToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 pt-4">
      <ToggleGroup
        type="single"
        variant="outline"
        value={selectedTool}
        onValueChange={(value) => {
          if (value) setSelectedTool(value as WarehouseItemType | 'eraser');
        }}
        aria-label="Herramientas de diseño de almacén"
      >
        {tools.map(tool => (
            <ToggleGroupItem key={tool.value} value={tool.value} aria-label={tool.label} className="flex gap-2">
                <div className={`h-4 w-4 rounded-sm ${tool.colorClass}`}></div>
                <span>{tool.label}</span>
            </ToggleGroupItem>
        ))}
         <ToggleGroupItem value="eraser" aria-label="Borrador" className="flex gap-2">
            <Eraser className="h-4 w-4" />
            <span>Borrador</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
