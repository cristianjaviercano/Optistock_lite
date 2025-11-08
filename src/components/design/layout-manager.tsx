"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Save, Trash2, FolderOpen, FilePlus } from 'lucide-react';
import type { NamedWarehouseLayout } from '@/lib/types';

interface LayoutManagerProps {
    totalSlots: number;
    savedLayouts: Record<string, NamedWarehouseLayout>;
    activeSlot: string;
    onLoad: (slot: string) => void;
    onSave: (name: string) => void;
    onDelete: (slot: string) => void;
}

export default function LayoutManager({ totalSlots, savedLayouts, activeSlot, onLoad, onSave, onDelete }: LayoutManagerProps) {
    const [layoutName, setLayoutName] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSaveClick = () => {
        const currentName = savedLayouts[activeSlot]?.name || '';
        setLayoutName(currentName);
        setIsDialogOpen(true);
    }
    
    const handleConfirmSave = () => {
        if (layoutName) {
            onSave(layoutName);
            setIsDialogOpen(false);
            setLayoutName('');
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-4 border-b pb-4 mb-4">
            <p className="text-sm font-medium">Ranuras de Diseño:</p>
            <ToggleGroup
                type="single"
                variant="outline"
                value={activeSlot}
                onValueChange={(value) => {
                    if (value) onLoad(value);
                }}
                aria-label="Ranuras de guardado de diseño"
            >
                {Array.from({ length: totalSlots }, (_, i) => (
                    <ToggleGroupItem key={i+1} value={String(i+1)} aria-label={`Cargar Ranura ${i+1}`} className="flex flex-col h-auto px-3 py-2 text-xs">
                       <span>Ranura {i+1}</span>
                       <span className="font-light text-muted-foreground truncate max-w-[60px]">
                        {savedLayouts[String(i+1)] ? savedLayouts[String(i+1)].name : '(Vacío)'}
                       </span>
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
            
            <div className="flex gap-2 ml-auto">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleSaveClick}>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Guardar Diseño</DialogTitle>
                            <DialogDescription>
                                Dale un nombre a tu diseño para guardarlo en la Ranura {activeSlot}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Input 
                                id="name" 
                                value={layoutName} 
                                onChange={(e) => setLayoutName(e.target.value)}
                                placeholder="Ej: Mi Almacén Principal"
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                               <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button onClick={handleConfirmSave} disabled={!layoutName}>Guardar Diseño</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {savedLayouts[activeSlot] && (
                    <Button variant="destructive" onClick={() => onDelete(activeSlot)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Borrar
                    </Button>
                )}
            </div>
        </div>
    );
}
