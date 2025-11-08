"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { GameMode, OrderItemStatus } from '@/lib/types';
import type { OrderItem } from '@/lib/simulation';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface OrderListProps {
  order: OrderItem[];
  mode: GameMode;
}

const statusIcons: Record<OrderItemStatus, React.ReactNode> = {
    pending: <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0"/>,
    carrying: <Circle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0 animate-pulse"/>,
    processing: <Circle className="h-5 w-5 text-orange-500 mt-0.5 shrink-0 animate-pulse"/>,
    processed: <Circle className="h-5 w-5 text-purple-500 mt-0.5 shrink-0"/>,
    'ready-for-dispatch': <Circle className="h-5 w-5 text-accent mt-0.5 shrink-0"/>,
    completed: <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0"/>,
}

const getStatusText = (item: OrderItem, mode: GameMode): string => {
    switch (item.status) {
        case 'pending':
            return mode === 'picking' 
                ? `Recoger de: ${String.fromCharCode(65 + item.location.x)}${item.location.y + 1}`
                : `Llevar a: ${String.fromCharCode(65 + item.location.x)}${item.location.y + 1}`;
        case 'carrying':
             return mode === 'picking' ? 'Llevar a procesamiento' : `Llevando a ${String.fromCharCode(65 + item.location.x)}${item.location.y + 1}`;
        case 'processing':
            return 'En procesamiento...';
        case 'processed':
            return `Llevar a bahía de salida`;
        case 'ready-for-dispatch':
            return `En bahía de salida`;
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
        <ScrollArea className="h-72">
          <div className="space-y-1 pr-4">
            {order.map((item, index) => (
              <div key={item.productId} className={cn("flex items-start gap-3 p-3 rounded-lg", item.status === 'carrying' && 'bg-blue-50')}>
                 {statusIcons[item.status]}
                 <div className={cn("flex-grow", item.status === 'completed' && "line-through text-muted-foreground")}>
                     <p className="font-medium">{item.productName} (x{item.quantity})</p>
                     <p className="text-sm text-muted-foreground">{getStatusText(item, mode)}</p>
                 </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
