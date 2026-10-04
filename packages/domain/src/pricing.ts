import { Cents, applyBpsThenRound, assertCents } from './money';

export type PriceTierInput = {
  id: string;
  isDefault: boolean;
  derivationKind: 'NONE' | 'MULTIPLY_COST' | 'ADJUST_TIER';
  /** For MULTIPLY_COST: 24000 = ×2.40. For ADJUST_TIER: 11500 = 115% of source (source + 15%). */
  basisPoints: number | null;
  sourceTierId: string | null;
};

export type PriceTable = Record<string, Cents | undefined>; // key `${kind}:${id}:${tierId}`

export function priceKey(kind: 'dish' | 'option', id: string, tierId: string): string {
  return `${kind}:${id}:${tierId}`;
}

export function resolveEmployeeTierId(
  companyTierId: string | null | undefined,
  tiers: PriceTierInput[],
): string {
  if (companyTierId) {
    const found = tiers.find((t) => t.id === companyTierId);
    if (found) return found.id;
  }
  const def = tiers.find((t) => t.isDefault);
  if (!def) throw new Error('No default price tier configured');
  return def.id;
}

function getTier(tiers: PriceTierInput[], id: string): PriceTierInput {
  const t = tiers.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown tier ${id}`);
  return t;
}

/**
 * Resolve a selling price in cents, or null if the item must be hidden / cannot be sold.
 */
export function resolvePrice(
  kind: 'dish' | 'option',
  itemId: string,
  costCents: Cents,
  tierId: string,
  tiers: PriceTierInput[],
  explicit: PriceTable,
  seen: Set<string> = new Set(),
): Cents | null {
  assertCents(costCents);
  const cycleKey = `${kind}:${itemId}:${tierId}`;
  if (seen.has(cycleKey)) return null;
  seen.add(cycleKey);

  const explicitPrice = explicit[priceKey(kind, itemId, tierId)];
  if (explicitPrice !== undefined) {
    return assertCents(explicitPrice);
  }

  const tier = getTier(tiers, tierId);
  if (tier.derivationKind === 'NONE') {
    return null;
  }
  if (tier.derivationKind === 'MULTIPLY_COST') {
    if (tier.basisPoints == null) return null;
    return applyBpsThenRound(costCents, tier.basisPoints);
  }
  if (tier.derivationKind === 'ADJUST_TIER') {
    if (!tier.sourceTierId || tier.basisPoints == null) return null;
    const source = resolvePrice(kind, itemId, costCents, tier.sourceTierId, tiers, explicit, seen);
    if (source == null) return null;
    return applyBpsThenRound(source, tier.basisPoints);
  }
  return null;
}
