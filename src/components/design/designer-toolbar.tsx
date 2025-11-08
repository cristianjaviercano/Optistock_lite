"use client";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { WarehouseItemType } from "@/lib/types";
import { Eraser, Save, Server, Layers, Factory, Truck } from "lucide-react";

interface DesignerToolbarProps {
  selectedTool: WarehouseItemType | 'eraser';
  setSelectedTool: (tool: WarehouseItemType | 'eraser') => void;
  onSave: () => void;
}

const tools = [
  { value: 'shelf', label: 'Shelf', icon: Server },
  { value: 'bay', label: 'Bay', icon: Layers },
  { value: 'processing', label: 'Processing Zone', icon: Factory },
  { value: 'forklift', label: 'Forklift Zone', icon: Truck },
  { value: 'eraser', label: 'Eraser', icon: Eraser },
]

export default function DesignerToolbar({ selectedTool, setSelectedTool, onSave }: DesignerToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ToggleGroup
        type="single"
        variant="outline"
        value={selectedTool}
        onValueChange={(value) => {
          if (value) setSelectedTool(value as WarehouseItemType | 'eraser');
        }}
        aria-label="Warehouse design tools"
      >
        {tools.map(tool => (
            <ToggleGroupItem key={tool.value} value={tool.value} aria-label={tool.label} className="flex gap-2">
                <tool.icon className="h-4 w-4" />
                <span>{tool.label}</span>
            </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Button onClick={onSave} className="ml-auto">
        <Save className="h-4 w-4 mr-2" />
        Save Layout
      </Button>
    </div>
  );
}
