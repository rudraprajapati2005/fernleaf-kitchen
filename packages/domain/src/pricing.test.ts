import { describe, expect, it } from 'vitest';
import { priceKey, resolveEmployeeTierId, resolvePrice, PriceTierInput } from '../src/pricing';

const tiers: PriceTierInput[] = [
  { id: 'std', isDefault: true, derivationKind: 'NONE', basisPoints: null, sourceTierId: null },
  { id: 'ent', isDefault: false, derivationKind: 'ADJUST_TIER', basisPoints: 11500, sourceTierId: 'std' },
  { id: 'partner', isDefault: false, derivationKind: 'MULTIPLY_COST', basisPoints: 24000, sourceTierId: null },
];

describe('pricing', () => {
  it('uses default tier when company has none', () => {
    expect(resolveEmployeeTierId(null, tiers)).toBe('std');
  });

  it('hides dish with no price on the tier', () => {
    const p = resolvePrice('dish', 'd1', 100, 'std', tiers, {});
    expect(p).toBeNull();
  });

  it('uses explicit override', () => {
    const explicit = { [priceKey('dish', 'd1', 'std')]: 1299 };
    expect(resolvePrice('dish', 'd1', 100, 'std', tiers, explicit)).toBe(1299);
  });

  it('derives from another tier +15% and rounds up to 5 cents', () => {
    const explicit = { [priceKey('dish', 'd1', 'std')]: 1000 };
    // 1000 * 1.15 = 1150 already on 5c
    expect(resolvePrice('dish', 'd1', 400, 'ent', tiers, explicit)).toBe(1150);
  });

  it('derives from cost × 2.4', () => {
    expect(resolvePrice('dish', 'd1', 88, 'partner', tiers, {})).toBe(215);
  });

  it('override wins over derivation', () => {
    const explicit = { [priceKey('dish', 'd1', 'partner')]: 500 };
    expect(resolvePrice('dish', 'd1', 88, 'partner', tiers, explicit)).toBe(500);
  });
});
