export type JwtUser = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'KITCHEN' | 'DISPATCH' | 'DRIVER';
};
