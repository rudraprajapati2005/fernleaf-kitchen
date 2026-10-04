import { describe, expect, it } from 'vitest';
import { assertOrdersInvoiceable, buildInvoiceTotal } from '../src/invoice';
import { applyCutoff, isBillable } from '../src/order-state';
import { finishUnit, startUnit, plannedTimes } from '../src/kitchen';
import { dropKey, markOutForDelivery, wasOnTime } from '../src/dispatch';
import { assertCompanyDomain } from '../src/domains';
import { hasPermission } from '../src/permissions';

describe('invoicing', () => {
  it('invoice total equals sum of orders', () => {
    expect(buildInvoiceTotal([12920, 800])).toBe(13720);
  });
  it('blocks duplicate invoicing', () => {
    expect(() =>
      assertOrdersInvoiceable({
        statuses: ['CONFIRMED'],
        invoiceIds: ['inv1'],
        companyIds: ['c1'],
        targetCompanyId: 'c1',
      }),
    ).toThrow(/at most one invoice/);
  });
  it('blocks unconfirmed', () => {
    expect(() =>
      assertOrdersInvoiceable({
        statuses: ['PLACED'],
        invoiceIds: [null],
        companyIds: ['c1'],
        targetCompanyId: 'c1',
      }),
    ).toThrow(/billable/);
  });
});

describe('cutoff processing mapping', () => {
  it('cancels drafts and confirms placed', () => {
    expect(applyCutoff('DRAFT')).toBe('CANCELLED');
    expect(applyCutoff('PLACED')).toBe('CONFIRMED');
    expect(applyCutoff('CONFIRMED')).toBe('CONFIRMED');
    expect(isBillable('CONFIRMED')).toBe(true);
    expect(isBillable('CANCELLED')).toBe(false);
  });
});

describe('kitchen units', () => {
  it('cannot start twice', () => {
    expect(startUnit('PENDING')).toBe('STARTED');
    expect(() => startUnit('STARTED')).toThrow();
  });
  it('finish unstarted records start', () => {
    expect(finishUnit('PENDING')).toEqual({ next: 'DONE', recordedStart: true });
  });
  it('cannot finish twice', () => {
    expect(() => finishUnit('DONE')).toThrow();
  });
  it('plans dispatch and kitchen ready from delivery', () => {
    const delivery = new Date('2026-10-05T16:00:00Z');
    const p = plannedTimes({ deliveryAt: delivery, leaveKitchenMinutes: 60 });
    expect(p.plannedDispatchReady.toISOString()).toBe('2026-10-05T15:00:00.000Z');
    expect(p.plannedKitchenReady.toISOString()).toBe('2026-10-05T14:30:00.000Z');
  });
});

describe('dispatch', () => {
  it('groups by company+address+exact time', () => {
    const a = dropKey({ companyId: 'c', addressId: 'a', deliveryDate: '2026-10-05', deliveryTimeMinutes: 720 });
    const b = dropKey({ companyId: 'c', addressId: 'a', deliveryDate: '2026-10-05', deliveryTimeMinutes: 721 });
    expect(a).not.toBe(b);
  });
  it('requires driver for out for delivery', () => {
    expect(() => markOutForDelivery('DISPATCH_READY', null)).toThrow(/driver/);
  });
  it('on-time is deliveredAt <= deliveryAt', () => {
    expect(wasOnTime(new Date('2026-10-05T12:00:00Z'), new Date('2026-10-05T12:00:00Z'))).toBe(true);
    expect(wasOnTime(new Date('2026-10-05T12:01:00Z'), new Date('2026-10-05T12:00:00Z'))).toBe(false);
  });
});

describe('domains and permissions', () => {
  it('rejects gmail', () => {
    expect(() => assertCompanyDomain('gmail.com')).toThrow(/Public/);
  });
  it('kitchen cannot manage billing', () => {
    expect(hasPermission('KITCHEN', 'billing:manage')).toBe(false);
    expect(hasPermission('ADMIN', 'billing:manage')).toBe(true);
  });
});
