export type DispatchStatus =
  | 'PENDING'
  | 'KITCHEN_READY'
  | 'DISPATCH_READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export function markDispatchReady(status: DispatchStatus): DispatchStatus {
  if (status !== 'KITCHEN_READY') {
    throw new Error('Dispatch-ready requires kitchen-ready and cannot be repeated');
  }
  return 'DISPATCH_READY';
}

export function markOutForDelivery(status: DispatchStatus, driverId: string | null): DispatchStatus {
  if (status !== 'DISPATCH_READY') {
    throw new Error('Out for delivery requires dispatch-ready and cannot be repeated');
  }
  if (!driverId) throw new Error('Out for delivery requires an assigned driver');
  return 'OUT_FOR_DELIVERY';
}

export function markDelivered(status: DispatchStatus): DispatchStatus {
  if (status !== 'OUT_FOR_DELIVERY') {
    throw new Error('Delivered requires out-for-delivery and cannot be repeated');
  }
  return 'DELIVERED';
}

export function dropKey(input: {
  companyId: string;
  addressId: string;
  deliveryDate: string;
  deliveryTimeMinutes: number;
}): string {
  return `${input.companyId}|${input.addressId}|${input.deliveryDate}|${input.deliveryTimeMinutes}`;
}

export function wasOnTime(deliveredAt: Date, deliveryAt: Date): boolean {
  return deliveredAt.getTime() <= deliveryAt.getTime();
}
