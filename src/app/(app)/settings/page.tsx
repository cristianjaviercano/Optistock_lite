
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Paintbrush, CircleDollarSign, Volume2 } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  // NOTE: In a real app, these values would be persisted (e.g., localStorage or a backend)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [moveCost, setMoveCost] = useState(0.25);
  const [timeCost, setTimeCost] = useState(0.1);

  const handleSave = () => {
    // Logic to save settings would go here
    toast({
      title: "Configuración Guardada",
      description: "Tus preferencias han sido guardadas.",
    });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuraciones</CardTitle>
          <CardDescription>
            Gestiona las preferencias de la aplicación y de tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Theme Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2"><Paintbrush className="h-5 w-5 text-primary" />Apariencia</h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="dark-mode">Modo Oscuro</Label>
                    <p className="text-xs text-muted-foreground">
                        Activa el tema oscuro para una experiencia visual diferente.
                    </p>
                </div>
                <Switch
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                    aria-label="Toggle dark mode"
                    disabled // Functionality not yet implemented
                />
            </div>
          </div>

          {/* Sound Settings */}
           <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2"><Volume2 className="h-5 w-5 text-primary" />Sonido</h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="sound-enabled">Activar Sonido</Label>
                    <p className="text-xs text-muted-foreground">
                        Habilita o deshabilita los efectos de sonido del juego.
                    </p>
                </div>
                <Switch
                    id="sound-enabled"
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                    aria-label="Toggle sound"
                    disabled // Functionality not yet implemented
                />
            </div>
          </div>

          {/* Cost Settings */}
          <div className="space-y-4">
             <h3 className="text-lg font-medium flex items-center gap-2"><CircleDollarSign className="h-5 w-5 text-primary" />Costos de Simulación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border p-4">
                <div className="space-y-2">
                    <Label htmlFor="move-cost">Costo por Movimiento ($)</Label>
                    <Input
                        id="move-cost"
                        type="number"
                        value={moveCost}
                        onChange={(e) => setMoveCost(parseFloat(e.target.value))}
                        step="0.01"
                        min="0"
                    />
                     <p className="text-xs text-muted-foreground">
                        El costo asociado con cada casilla que el montacargas se mueve.
                    </p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="time-cost">Costo por Segundo ($)</Label>
                    <Input
                        id="time-cost"
                        type="number"
                        value={timeCost}
                        onChange={(e) => setTimeCost(parseFloat(e.target.value))}
                        step="0.01"
                        min="0"
                    />
                    <p className="text-xs text-muted-foreground">
                        El costo "operativo" que se acumula por cada segundo de simulación.
                    </p>
                </div>
              </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Guardar Cambios</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
