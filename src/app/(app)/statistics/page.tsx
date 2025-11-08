import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";

export default function StatisticsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
          <CardDescription>
            Análisis detallado del rendimiento y las operaciones del almacén.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-center border-dashed border-2 rounded-lg">
            <BarChart className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-bold">Página en Construcción</h3>
            <p className="text-muted-foreground">
              Próximamente podrás ver aquí gráficos y análisis de tus simulaciones.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
