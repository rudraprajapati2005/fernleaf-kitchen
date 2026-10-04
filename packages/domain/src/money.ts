/** Integer cents. Never use IEEE floats as money. */
export type Cents = number;

export function assertCents(value: number): Cents {
  if (!Number.isInteger(value)) {
    throw new Error(`Money must be integer cents, got ${value}`);
  }
  return value;
}

export function sumCents(values: Cents[]): Cents {
  return values.reduce((acc, v) => acc + assertCents(v), 0);
}

/** Round up to the next 5 cents. $2.11 (211) → $2.15 (215). */
export function roundUpToNext5Cents(cents: Cents): Cents {
  if (cents < 0) {
    throw new Error('Negative money is not allowed');
  }
  const rem = cents % 5;
  if (rem === 0) return cents;
  return cents + (5 - rem);
}

export function applyBps(cents: Cents, bps: number): Cents {
  assertCents(cents);
  if (!Number.isInteger(bps) || bps < 0) {
    throw new Error('basis points must be a non-negative integer');
  }
  // cost * 2.4 with bps=24000 means cents * 24000 / 10000
  return Math.floor((cents * bps) / 10000);
}

export function applyBpsThenRound(cents: Cents, bps: number): Cents {
  return roundUpToNext5Cents(applyBps(cents, bps));
}
