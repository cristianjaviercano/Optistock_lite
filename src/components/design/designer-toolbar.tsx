"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { WarehouseItemType } from "@/lib/types";
import { Eraser, Server, Factory, ArrowRightToLine, ArrowLeftFromLine, Forklift, Home } from "lucide-react";

interface DesignerToolbarProps {
  selectedTool: WarehouseItemType | 'eraser';
  setSelectedTool: (tool: WarehouseItemType | 'eraser') => void;
}

const tools = [
  { value: 'shelf', label: 'Estante', icon: Server },
  { value: 'bay-in', label: 'Ingreso', icon: ArrowRightToLine },
  { value: 'bay-out', label: 'Despacho', icon: ArrowLeftFromLine },
  { value: 'processing', label: 'Procesamiento', icon: Factory },
  { value: 'forklift', label: 'Zona de Montacargas', icon: Home },
  { value: 'eraser', label: 'Borrador', icon: Eraser },
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
                <tool.icon className="h-4 w-4" />
                <span>{tool.label}</span>
            </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
