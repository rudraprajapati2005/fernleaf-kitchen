import { Cents, assertCents, sumCents } from './money';

export function buildInvoiceTotal(orderTotals: Cents[]): Cents {
  for (const t of orderTotals) assertCents(t);
  return sumCents(orderTotals);
}

export function assertOrdersInvoiceable(params: {
  statuses: string[];
  invoiceIds: Array<string | null>;
  companyIds: string[];
  targetCompanyId: string;
}): void {
  if (params.companyIds.some((id) => id !== params.targetCompanyId)) {
    throw new Error('An invoice can only include orders from one company');
  }
  if (params.statuses.some((s) => s !== 'CONFIRMED' && s !== 'DELIVERED')) {
    throw new Error('Only confirmed (billable) orders can be invoiced');
  }
  if (params.invoiceIds.some((id) => id != null)) {
    throw new Error('An order can be on at most one invoice');
  }
}
