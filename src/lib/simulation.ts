import type { WarehouseLayout, InventoryItem, GameMode, OrderItemStatus } from './types';

const PRODUCT_NAMES = [
  "Flux Capacitor", "Quantum Carburetor", "Hyperdrive Core", "Plasma Injector",
  "Tachyon Emitter", "Graviton Beam", "Singularity Drive", "Warp Coil", "Sensor Array",
  "Shield Generator", "Navicomputer", "Ion Engine"
];

export function generateInventory(layout: WarehouseLayout): WarehouseLayout {
  return layout.map(item => {
    if (item.type === 'shelf') {
      const inventory: InventoryItem[] = [];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1 to 3 different items
      for (let i = 0; i < numItems; i++) {
        inventory.push({
          id: `${item.id}-item-${i}`,
          name: PRODUCT_NAMES[Math.floor(Math.random() * PRODUCT_NAMES.length)],
          quantity: Math.floor(Math.random() * 20) + 5, // 5 to 25 quantity
        });
      }
      return { ...item, inventory };
    }
    return item;
  });
}

export interface OrderItem {
  productId: string;
  productName: string;
  location: { x: number; y: number };
  quantity: number;
  status: OrderItemStatus;
}

export function generateOrder(layoutWithInventory: WarehouseLayout, mode: GameMode, size: number = 5): OrderItem[] {
  const order: OrderItem[] = [];
  const availableItems: { item: InventoryItem; location: { x: number; y: number } }[] = [];

  layoutWithInventory.forEach(warehouseItem => {
    if (warehouseItem.type === 'shelf' && warehouseItem.inventory) {
      warehouseItem.inventory.forEach(invItem => {
        availableItems.push({ item: invItem, location: { x: warehouseItem.x, y: warehouseItem.y } });
      });
    }
  });

  if (availableItems.length === 0) return [];
  
  const shuffledItems = availableItems.sort(() => 0.5 - Math.random());
  const selectedItems = shuffledItems.slice(0, Math.min(size, shuffledItems.length));


  for (const selectedItem of selectedItems) {
    const quantity = mode === 'picking'
      ? Math.min(selectedItem.item.quantity, Math.floor(Math.random() * 5) + 1) // Pick 1-5
      : Math.floor(Math.random() * 10) + 1; // Stock 1-10

    order.push({
      productId: selectedItem.item.id,
      productName: selectedItem.item.name,
      location: selectedItem.location,
      quantity,
      status: 'pending',
    });
  }

  return order;
}

export function calculateCost(moves: number, time: number): number {
    const moveCost = 0.25; // Cost per move
    const timeCost = 0.1; // Cost per second
    return (moves * moveCost) + (time * timeCost);
}

export function findStartBay(layout: WarehouseLayout): { x: number; y: number } {
    const forkliftZone = layout.find(item => item.type === 'forklift');
    if (forkliftZone) {
      return { x: forkliftZone.x, y: forkliftZone.y };
    }
    const bayIn = layout.find(item => item.type === 'bay-in');
    if (bayIn) {
      return { x: bayIn.x, y: bayIn.y };
    }
    const bayOut = layout.find(item => item.type === 'bay-out');
    if (bayOut) {
      return { x: bayOut.x, y: bayOut.y };
    }
    // Fallback to the first floor tile if no bay exists
    const floor = layout.find(item => item.type === 'floor');
    return floor ? { x: floor.x, y: floor.y } : {x: 0, y: 0};
}
