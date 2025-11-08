export interface User {
  id: string;
  email: string;
  password?: string; // Should not be stored long-term, but needed for signup
  role?: 'admin' | 'user';
}

export type WarehouseItemType = 'floor' | 'shelf' | 'bay';

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
