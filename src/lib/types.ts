export interface User {
  id: string;
  email: string;
  password?: string; // Should not be stored long-term, but needed for signup
  role?: 'admin' | 'user';
}

export type WarehouseItemType = 'floor' | 'shelf' | 'bay-in' | 'bay-out' | 'processing' | 'forklift';

export interface WarehouseItem {
  id: string;
  type: WarehouseItemType;
  x: number;
  y: number;
  inventory?: InventoryItem[];
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

export type WarehouseLayout = WarehouseItem[];

export interface NamedWarehouseLayout {
  name: string;
  layout: WarehouseLayout;
}

export type GameMode = 'picking' | 'stocking';

export interface GameSession {
  id:string;
  userId: string;
  date: string;
  mode: GameMode;
  time: number; // in seconds
  moves: number;
  cost: number;
  layout: WarehouseLayout;
}

export type OrderItemStatus = 'pending' | 'carrying' | 'processing' | 'completed';

export interface OrderItem {
  productId: string;
  productName: string;
  location: { x: number; y: number };
  quantity: number;
  status: OrderItemStatus;
}
