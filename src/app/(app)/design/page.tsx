"use client";

import WarehouseGrid from "@/components/design/warehouse-grid";
import DesignerToolbar from "@/components/design/designer-toolbar";
import { useState, useEffect } from "react";
import type { WarehouseItemType, WarehouseLayout, NamedWarehouseLayout } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import LayoutManager from "@/components/design/layout-manager";
import { defaultLayouts } from "@/lib/default-layouts";

const GRID_SIZE = { width: 20, height: 12 };
const TOTAL_SLOTS = 4;

const createEmptyLayout = (): WarehouseLayout => {
  const layout: WarehouseLayout = [];
  for (let y = 0; y < GRID_SIZE.height; y++) {
    for (let x = 0; x < GRID_SIZE.width; x++) {
      layout.push({ id: `${x}-${y}`, type: 'floor', x, y });
    }
  }
  return layout;
}

export default function DesignPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTool, setSelectedTool] = useState<WarehouseItemType | 'eraser'>('floor');
  const [layout, setLayout] = useState<WarehouseLayout>([]);
  const [savedLayouts, setSavedLayouts] = useState<Record<string, NamedWarehouseLayout>>({});
  const [activeSlot, setActiveSlot] = useState<string>('1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      let initialLayouts: Record<string, NamedWarehouseLayout> = {};
      let layoutsFound = false;
      try {
        const savedData = localStorage.getItem(`optistock_layouts_${user.id}`);
        if (savedData) {
          initialLayouts = JSON.parse(savedData);
          if (Object.keys(initialLayouts).length > 0) {
            layoutsFound = true;
          }
        }
      } catch (e) {
        console.error("Failed to parse layouts from localStorage", e);
      }
      
      if (!layoutsFound) {
        // No layouts found, so load defaults
        initialLayouts = defaultLayouts;
        localStorage.setItem(`optistock_layouts_${user.id}`, JSON.stringify(initialLayouts));
        toast({
          title: "Diseños de ejemplo cargados",
          description: "Hemos cargado dos diseños de almacén para que puedas empezar.",
        });
      }

      setSavedLayouts(initialLayouts);

      // Load layout from active slot or create a new empty one
      const activeLayoutData = initialLayouts[activeSlot];
      setLayout(activeLayoutData ? activeLayoutData.layout : createEmptyLayout());

      setLoading(false);
    }
  }, [user, toast]);

  const handleSaveLayout = (name: string) => {
    if (user && name) {
      const newSavedLayouts = {
        ...savedLayouts,
        [activeSlot]: { name, layout }
      };
      setSavedLayouts(newSavedLayouts);
      localStorage.setItem(`optistock_layouts_${user.id}`, JSON.stringify(newSavedLayouts));
      toast({
        title: "Diseño Guardado",
        description: `El diseño "${name}" se ha guardado en la ranura ${activeSlot}.`,
      });
    }
  };

  const handleLoadLayout = (slot: string) => {
    setActiveSlot(slot);
    const layoutToLoad = savedLayouts[slot];
    setLayout(layoutToLoad ? layoutToLoad.layout : createEmptyLayout());
    toast({
        title: "Diseño Cargado",
        description: layoutToLoad ? `Cargando "${layoutToLoad.name}" desde la ranura ${slot}.` : `Ranura ${slot} vacía. Iniciando un nuevo diseño.`,
    });
  }

  const handleDeleteLayout = (slot: string) => {
    if (window.confirm(`¿Estás seguro que quieres borrar el diseño de la ranura ${slot}?`)) {
        const newSavedLayouts = { ...savedLayouts };
        delete newSavedLayouts[slot];
        setSavedLayouts(newSavedLayouts);
        localStorage.setItem(`optistock_layouts_${user.id}`, JSON.stringify(newSavedLayouts));
        
        // If deleting the active slot, clear the grid
        if (slot === activeSlot) {
            setLayout(createEmptyLayout());
        }

        toast({
            variant: "destructive",
            title: "Diseño Borrado",
            description: `El diseño de la ranura ${slot} ha sido borrado.`,
        });
    }
  }
  
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

  useEffect(() => {
    // This is a temporary measure for migration. It saves the old single layout to slot 1 if it exists.
    if (user && !loading) {
      const oldLayoutData = localStorage.getItem(`optistock_layout_${user.id}`);
      if (oldLayoutData) {
        const layouts = JSON.parse(localStorage.getItem(`optistock_layouts_${user.id}`) || '{}');
        if (!layouts['1']) {
          const oldLayout = JSON.parse(oldLayoutData);
          const newLayouts = { ...layouts, '1': { name: 'Mi primer diseño', layout: oldLayout } };
          localStorage.setItem(`optistock_layouts_${user.id}`, JSON.stringify(newLayouts));
          setSavedLayouts(newLayouts);
          localStorage.removeItem(`optistock_layout_${user.id}`);
          console.log('Old layout migrated to slot 1');
        } else {
            localStorage.removeItem(`optistock_layout_${user.id}`);
        }
      }
    }
  }, [user, loading]);


  if (loading) {
    return <div className="flex h-full min-h-[500px] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Diseñador de Almacenes</CardTitle>
            <CardDescription>Usa las herramientas para crear tu diseño. Guarda y gestiona hasta 4 diseños diferentes usando las ranuras de guardado.</CardDescription>
          </CardHeader>
          <CardContent>
            <LayoutManager 
              totalSlots={TOTAL_SLOTS}
              savedLayouts={savedLayouts}
              activeSlot={activeSlot}
              onLoad={handleLoadLayout}
              onSave={handleSaveLayout}
              onDelete={handleDeleteLayout}
            />
            <DesignerToolbar
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
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

    