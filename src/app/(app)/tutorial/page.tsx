"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function TutorialPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <BookOpen className="h-6 w-6" />
            Tutorial y Galería de Componentes
          </CardTitle>
          <CardDescription>
            Este es un espacio para visualizar todos los elementos del simulador. Aquí podemos probar y ajustar su apariencia de forma segura sin afectar la lógica principal de la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 rounded-md border border-dashed text-muted-foreground">
            <p>La galería de componentes aparecerá aquí.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
