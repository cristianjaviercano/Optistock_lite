"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Gamepad, Move, Package, PackageCheck, PackageOpen, PackageSearch, Shuffle, Route, CircleDollarSign, Timer, Truck, Warehouse, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import type { OrderItemStatus } from "@/lib/types";


const PalletBoxIcon = ({ boxColor, className }: { boxColor: string; className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        className={cn("h-full w-full", className)}
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        {/* Pallet (70% size, centered) */}
        <rect width="16.8" height="16.8" x="3.6" y="3.6" fill="#A0522D" rx="1" />
        {/* Box (40% size, centered on top) */}
        <rect width="9.6" height="9.6" x="7.2" y="5.2" fill={boxColor} rx="1" stroke="#000" strokeWidth="0.5" />
        {/* Box fold line */}
        <line x1="7.2" y1="10" x2="16.8" y2="10" stroke="#000" strokeOpacity="0.2" strokeWidth="1" />
    </svg>
);

const ForkliftSvg = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        className={className} 
        {...props}
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <rect width="18" height="18" x="3" y="3" fill="#FFC700" stroke="none" rx="2"></rect>
        <line x1="15" y1="7" x2="21" y2="7" stroke="black"></line>
        <line x1="15" y1="17" x2="21" y2="17" stroke="black"></line>
    </svg>
);


const GalleryItem = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="flex items-center gap-4 rounded-md border p-4">
    <div className="h-12 w-12 flex-shrink-0">{children}</div>
    <p className="font-medium">{title}</p>
  </div>
);

const InstructionStep = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <li className="flex items-start gap-4">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </li>
);


export default function TutorialPage() {

  const packageStates: { status: OrderItemStatus; title: string; color: string }[] = [
    { status: 'pending', title: 'Pendiente', color: 'hsl(var(--destructive))' },
    { status: 'carrying', title: 'Transportando', color: 'hsl(var(--destructive))' },
    { status: 'processing', title: 'Procesando', color: '#f97316' },
    { status: 'processed', title: 'Procesado', color: '#8b5cf6' },
    { status: 'ready-for-dispatch', title: 'Listo para Despacho', color: 'hsl(var(--accent))' },
    { status: 'completed', title: 'Completado', color: '#22c55e' },
  ];

  const warehouseItems = [
      { title: 'Estante', colorClass: 'bg-primary/80' },
      { title: 'Bahía (Ingreso/Despacho)', colorClass: 'bg-accent/80' },
      { title: 'Zona de Procesamiento', colorClass: 'bg-chart-3/80' },
  ];


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <BookOpen className="h-6 w-6" />
            Tutorial y Galería de Componentes
          </CardTitle>
          <CardDescription>
            Aprende a jugar y familiarízate con los elementos visuales del simulador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="how-to-play">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="how-to-play">Cómo Jugar</TabsTrigger>
              <TabsTrigger value="gallery">Galería de Componentes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="how-to-play" className="mt-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Controles Básicos</h3>
                  <ul className="space-y-4">
                    <InstructionStep 
                      icon={Move}
                      title="Mover y Girar"
                      description="Usa las teclas de flecha (↑, ↓, ←, →). El primer toque gira el montacargas en esa dirección. El segundo toque en la misma dirección avanza una casilla."
                    />
                    <InstructionStep 
                      icon={Gamepad}
                      title="Interactuar (Recoger/Dejar)"
                      description="Usa la barra espaciadora o la tecla 'Enter' para recoger o dejar un paquete en una casilla adyacente en la dirección que apuntas."
                    />
                     <InstructionStep 
                      icon={Truck}
                      title="Despachar Orden (Modo Picking)"
                      description="Usa la tecla 'D' para despachar todos los paquetes que estén listos en las bahías de salida."
                    />
                  </ul>
                </div>
                 <div>
                  <h3 className="text-xl font-semibold mb-4">Modos de Juego</h3>
                  <ul className="space-y-4">
                    <InstructionStep 
                      icon={PackageSearch}
                      title="Modo Picking (Recolección)"
                      description="Tu objetivo es completar una orden. Recoge los artículos de los estantes, llévalos a la zona de procesamiento, y finalmente a una bahía de salida para su despacho."
                    />
                    <InstructionStep 
                      icon={Package}
                      title="Modo Stocking (Almacenamiento)"
                      description="Tu objetivo es almacenar la mercancía nueva. Recoge los paquetes de las bahías de entrada y llévalos a los estantes designados."
                    />
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Estilos de Juego</h3>
                   <ul className="space-y-4">
                    <InstructionStep 
                      icon={Route}
                      title="Guiado"
                      description="Debes completar las tareas en el orden exacto en que aparecen en la lista. Ideal para aprender el flujo de trabajo óptimo."
                    />
                    <InstructionStep 
                      icon={Shuffle}
                      title="Libre"
                      description="Puedes completar las tareas en el orden que prefieras. ¡Usa tu propia estrategia para ser más eficiente!"
                    />
                  </ul>
                </div>
                 <div>
                  <h3 className="text-xl font-semibold mb-4">Métricas</h3>
                   <ul className="space-y-4">
                    <InstructionStep 
                      icon={Timer}
                      title="Tiempo"
                      description="El tiempo total en segundos que tardas en completar las órdenes."
                    />
                    <InstructionStep 
                      icon={Move}
                      title="Movimientos"
                      description="Cada casilla que avanzas cuenta como un movimiento."
                    />
                     <InstructionStep 
                      icon={CircleDollarSign}
                      title="Costo"
                      description="Un costo operativo calculado en base a tus movimientos y el tiempo total. ¡Intenta minimizarlo!"
                    />
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
               <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-semibold mb-4">Elementos del Almacén</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {warehouseItems.map(item => (
                           <GalleryItem key={item.title} title={item.title}>
                                <div className={cn("w-full h-full rounded-sm", item.colorClass)}></div>
                           </GalleryItem>
                       ))}
                        <GalleryItem title="Suelo / Pasillo">
                            <div className="w-full h-full rounded-sm bg-background border"></div>
                        </GalleryItem>
                        <GalleryItem title="Montacargas">
                            <ForkliftSvg className="w-full h-full p-1" />
                        </GalleryItem>
                         <GalleryItem title="Borrador">
                            <Eraser className="w-8 h-8 text-muted-foreground mx-auto" />
                        </GalleryItem>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Estados de los Paquetes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {packageStates.map(state => (
                             <GalleryItem key={state.status} title={state.title}>
                                <PalletBoxIcon boxColor={state.color} />
                           </GalleryItem>
                        ))}
                    </div>
                </div>
               </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
