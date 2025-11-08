"use client";

import WarehouseGrid from "@/components/design/warehouse-grid";
import DesignerToolbar from "@/components/design/designer-toolbar";
import { useState, useEffect } from "react";
import type { WarehouseItemType, WarehouseLayout } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const GRID_SIZE = { width: 20, height: 12 };

export default function DesignPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTool, setSelectedTool] = useState<WarehouseItemType | 'eraser'>('floor');
  const [layout, setLayout] = useState<WarehouseLayout>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      let initialLayout: WarehouseLayout = [];
      try {
        const savedLayout = localStorage.getItem(`optistock_layout_${user.id}`);
        if (savedLayout) {
          initialLayout = JSON.parse(savedLayout);
        }
      } catch (e) {
        console.error("Failed to parse layout from localStorage", e);
      }

      if (initialLayout.length === 0) {
        // Initialize with an empty floor layout if nothing is saved or parsing fails
        for (let y = 0; y < GRID_SIZE.height; y++) {
          for (let x = 0; x < GRID_SIZE.width; x++) {
            initialLayout.push({ id: `${x}-${y}`, type: 'floor', x, y });
          }
        }
      }
      setLayout(initialLayout);
      setLoading(false);
    }
  }, [user]);

  const handleSaveLayout = () => {
    if (user) {
      localStorage.setItem(`optistock_layout_${user.id}`, JSON.stringify(layout));
      toast({
        title: "Layout Saved",
        description: "Your warehouse design has been saved successfully.",
      });
    }
  };
  
  const handleCellInteraction = (x: number, y: number) => {
    setLayout(prevLayout => {
      const newLayout = [...prevLayout];
      const index = newLayout.findIndex(item => item.x === x && item.y === y);
      const newType = selectedTool === 'eraser' ? 'floor' : selectedTool;
      if (index !== -1 && newLayout[index].type !== newType) {
        newLayout[index] = { ...newLayout[index], type: newType };
      }
      return newLayout;
    });
  };

  if (loading) {
    return <div className="flex h-full min-h-[500px] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Warehouse Designer</CardTitle>
            <CardDescription>Click a tool then click or drag on the grid to place or remove items. Don't forget to save your layout.</CardDescription>
          </CardHeader>
          <CardContent>
            <DesignerToolbar
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
              onSave={handleSaveLayout}
            />
          </CardContent>
        </Card>
        <div className="w-full overflow-x-auto rounded-lg border bg-card p-2 shadow-inner md:p-4">
           <WarehouseGrid
            layout={layout}
            gridSize={GRID_SIZE}
            onCellInteraction={handleCellInteraction}
          />
        </div>
      </div>
  );
}
