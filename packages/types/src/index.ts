export const StaffRole = {
  ADMIN: 'ADMIN',
  KITCHEN: 'KITCHEN',
  DISPATCH: 'DISPATCH',
  DRIVER: 'DRIVER',
} as const;
export type StaffRole = (typeof StaffRole)[keyof typeof StaffRole];

export const OrderStatus = {
  DRAFT: 'DRAFT',
  PLACED: 'PLACED',
  CONFIRMED: 'CONFIRMED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const KitchenUnitStatus = {
  PENDING: 'PENDING',
  STARTED: 'STARTED',
  DONE: 'DONE',
} as const;
export type KitchenUnitStatus = (typeof KitchenUnitStatus)[keyof typeof KitchenUnitStatus];

export const DispatchStep = {
  KITCHEN_READY: 'KITCHEN_READY',
  DISPATCH_READY: 'DISPATCH_READY',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
} as const;
export type DispatchStep = (typeof DispatchStep)[keyof typeof DispatchStep];

export const Temperature = {
  HOT: 'HOT',
  COLD: 'COLD',
} as const;
export type Temperature = (typeof Temperature)[keyof typeof Temperature];

export const PackagingType = {
  STANDARD: 'STANDARD',
  INSULATED: 'INSULATED',
  COLD_PACK: 'COLD_PACK',
} as const;
export type PackagingType = (typeof PackagingType)[keyof typeof PackagingType];

export const DerivationKind = {
  NONE: 'NONE',
  MULTIPLY_COST: 'MULTIPLY_COST',
  ADJUST_TIER: 'ADJUST_TIER',
} as const;
export type DerivationKind = (typeof DerivationKind)[keyof typeof DerivationKind];

export const InvoiceStatus = {
  OPEN: 'OPEN',
  PAID: 'PAID',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];
