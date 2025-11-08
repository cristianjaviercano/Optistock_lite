"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function AdBanner() {
    return (
        <div className="mx-auto w-full max-w-7xl">
             <Card className="bg-muted">
                <CardContent className="p-4">
                    <div className="flex items-center justify-center h-24 text-center">
                        <p className="text-sm text-muted-foreground">
                           <Info className="inline-block h-4 w-4 mr-2"/>
                           Este es un espacio reservado para publicidad. Reemplaza este componente con tu código de proveedor de anuncios.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
