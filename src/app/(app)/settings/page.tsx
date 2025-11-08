import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuraciones</CardTitle>
          <CardDescription>
            Gestiona las preferencias de la aplicación y de tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-center border-dashed border-2 rounded-lg">
            <Settings className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-bold">Página en Construcción</h3>
            <p className="text-muted-foreground">
              Las opciones de configuración estarán disponibles aquí próximamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
