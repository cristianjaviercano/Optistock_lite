"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { GameMode, OrderItemStatus } from '@/lib/types';
import type { OrderItem } from '@/lib/simulation';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Package, PackageOpen } from 'lucide-react';

interface OrderListProps {
  order: OrderItem[];
  mode: GameMode;
}

const statusIcons: Record<OrderItemStatus, React.ReactNode> = {
    pending: <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0"/>,
    carrying: <PackageOpen className="h-5 w-5 text-blue-500 mt-0.5 shrink-0"/>,
    processing: <PackageOpen className="h-5 w-5 text-orange-500 mt-0.5 shrink-0 animate-pulse"/>,
    completed: <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0"/>,
}


export default function OrderList({ order, mode }: OrderListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order List</CardTitle>
        <CardDescription>
          {mode === 'picking' ? 'Items to pick from shelves.' : 'Items to stock on shelves.'}
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
                       <p className="font-medium">{item.productName}</p>
                       <p className="text-sm">Quantity: {item.quantity}</p>
                       <p className="text-xs text-muted-foreground">Location: {String.fromCharCode(65 + item.location.x)}{item.location.y + 1}</p>
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
