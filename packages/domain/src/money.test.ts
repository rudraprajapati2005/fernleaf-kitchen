import { describe, expect, it } from 'vitest';
import { roundUpToNext5Cents, sumCents, applyBpsThenRound } from '../src/money';

describe('money', () => {
  it('rounds 211 cents up to 215', () => {
    expect(roundUpToNext5Cents(211)).toBe(215);
  });
  it('leaves 215 unchanged', () => {
    expect(roundUpToNext5Cents(215)).toBe(215);
  });
  it('sums integer cents only', () => {
    expect(sumCents([100, 250, 5])).toBe(355);
  });
  it('rejects floats', () => {
    expect(() => sumCents([1.5])).toThrow();
  });
  it('applies 2.4x then rounds up to 5 cents', () => {
    // 88 * 2.4 = 211.2 floored from integer math: 88 * 24000 / 10000 = 211.2 -> floor 211 -> 215
    expect(applyBpsThenRound(88, 24000)).toBe(215);
  });
});
