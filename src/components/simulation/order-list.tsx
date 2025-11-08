"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { GameMode, OrderItemStatus } from '@/lib/types';
import type { OrderItem } from '@/lib/simulation';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, PackageOpen, PackageSearch, PackageCheck, Truck } from 'lucide-react';

interface OrderListProps {
  order: OrderItem[];
  mode: GameMode;
}

const statusIcons: Record<OrderItemStatus, React.ReactNode> = {
    pending: <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0"/>,
    carrying: <PackageOpen className="h-5 w-5 text-blue-500 mt-0.5 shrink-0"/>,
    processing: <PackageSearch className="h-5 w-5 text-orange-500 mt-0.5 shrink-0 animate-pulse"/>,
    processed: <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 shrink-0"/>,
    'ready-for-dispatch': <Truck className="h-5 w-5 text-accent mt-0.5 shrink-0"/>,
    completed: <PackageCheck className="h-5 w-5 text-green-500 mt-0.5 shrink-0"/>,
}

const getStatusText = (item: OrderItem, mode: GameMode): string => {
    switch (item.status) {
        case 'pending':
            return mode === 'picking' 
                ? `Recoger de: ${String.fromCharCode(65 + item.location.x)}${item.location.y + 1}`
                : `Recoger de bahía de entrada y llevar a: ${String.fromCharCode(65 + item.location.x)}${item.location.y + 1}`;
        case 'carrying':
            if (mode === 'picking') {
                if (item.productId.startsWith('new-item')) { // This is a stocking item logic, but might be needed if modes get mixed
                     return `Llevar a: ${String.fromCharCode(65 + item.location.x)}${item.location.y + 1}`;
                }
                const isProcessed = item.status === 'processed' || item.status === 'ready-for-dispatch'; // A bit of a hack to know if it came from processing
                 return `Llevar a zona de procesamiento`
            }
            return `Llevar a: ${String.fromCharCode(65 + item.location.x)}${item.location.y + 1}`;
        case 'processing':
            return 'En procesamiento...';
        case 'processed':
            return `Listo. Llévalo a una bahía de salida.`;
        case 'ready-for-dispatch':
            return `En bahía de salida. Esperando despacho.`;
        case 'completed':
            return 'Completado';
        default:
            return '';
    }
}


export default function OrderList({ order, mode }: OrderListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Tareas</CardTitle>
        <CardDescription>
          {mode === 'picking' ? 'Completa la orden para despacho.' : 'Almacena la mercancía entrante.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4 pr-4">
            {order.map((item, index) => (
              <div key={item.productId}>
                <div className="flex items-start gap-3">
                   {statusIcons[item.status]}
                   <div className={cn("flex-grow", item.status === 'completed' && "line-through text-muted-foreground")}>
                       <p className="font-medium">{item.productName} (x{item.quantity})</p>
                       <p className="text-sm text-muted-foreground">{getStatusText(item, mode)}</p>
                   </div>
                </div>
                {index < order.length - 1 && <Separator className="my-4"/>}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
