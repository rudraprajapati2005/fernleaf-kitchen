export type Permission =
  | 'staff:manage'
  | 'catalogue:manage'
  | 'catalogue:read'
  | 'menu:manage'
  | 'pricing:manage'
  | 'company:manage'
  | 'employee:manage'
  | 'order:read'
  | 'order:create'
  | 'order:edit'
  | 'order:admin-override'
  | 'cutoff:trigger'
  | 'kitchen:work'
  | 'kitchen:force'
  | 'dispatch:work'
  | 'driver:deliver'
  | 'billing:manage'
  | 'settings:manage'
  | 'dashboard:admin'
  | 'dashboard:kitchen'
  | 'dashboard:dispatch'
  | 'dashboard:driver';

export type Role = 'ADMIN' | 'KITCHEN' | 'DISPATCH' | 'DRIVER';

const ALL_ADMIN: Permission[] = [
  'staff:manage',
  'catalogue:manage',
  'catalogue:read',
  'menu:manage',
  'pricing:manage',
  'company:manage',
  'employee:manage',
  'order:read',
  'order:create',
  'order:edit',
  'order:admin-override',
  'cutoff:trigger',
  'kitchen:work',
  'kitchen:force',
  'dispatch:work',
  'driver:deliver',
  'billing:manage',
  'settings:manage',
  'dashboard:admin',
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: ALL_ADMIN,
  KITCHEN: ['catalogue:read', 'order:read', 'kitchen:work', 'dashboard:kitchen'],
  DISPATCH: ['order:read', 'dispatch:work', 'dashboard:dispatch'],
  DRIVER: ['driver:deliver', 'dashboard:driver'],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
