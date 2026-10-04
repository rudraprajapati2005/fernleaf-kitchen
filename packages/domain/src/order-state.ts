export type OrderStatus =
  | 'DRAFT'
  | 'PLACED'
  | 'CONFIRMED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export function canEditOrCancelBeforeCutoff(status: OrderStatus): boolean {
  return status === 'DRAFT' || status === 'PLACED';
}

export function placeOrder(status: OrderStatus): OrderStatus {
  if (status !== 'DRAFT') throw new Error('Only drafts can be placed');
  return 'PLACED';
}

export function cancelOrder(status: OrderStatus, isAdmin: boolean, beforeCutoff: boolean): OrderStatus {
  if (status === 'CANCELLED' || status === 'REJECTED' || status === 'DELIVERED') {
    throw new Error('Order cannot be cancelled');
  }
  if (status === 'CONFIRMED' && !isAdmin) {
    throw new Error('Only an admin can cancel after confirmation');
  }
  if (!beforeCutoff && !isAdmin) {
    throw new Error('After cut-off only an admin can cancel');
  }
  return 'CANCELLED';
}

export function rejectOrder(status: OrderStatus): OrderStatus {
  if (status !== 'PLACED') throw new Error('Only placed orders can be rejected');
  return 'REJECTED';
}

export function applyCutoff(status: OrderStatus): OrderStatus {
  if (status === 'DRAFT') return 'CANCELLED';
  if (status === 'PLACED') return 'CONFIRMED';
  return status;
}

export function isBillable(status: OrderStatus): boolean {
  return status === 'CONFIRMED' || status === 'DELIVERED';
}
