import { describe, expect, it } from 'vitest';
import { lineTotal, validateCombinations } from '../src/combinations';

const groups = [
  {
    id: 'protein',
    required: true,
    usesPortions: false,
    optionIds: ['paneer', 'tofu'],
    portionSizeIds: [],
  },
  {
    id: 'rice',
    required: true,
    usesPortions: false,
    optionIds: ['brown', 'jeera'],
    portionSizeIds: [],
  },
];

function prices(id: string) {
  const map: Record<string, number> = { paneer: 200, tofu: 150, brown: 100, jeera: 80 };
  return map[id] ?? null;
}

describe('combinations', () => {
  it('splits 10 bowls into 6 brown + 4 jeera', () => {
    const result = validateCombinations({
      dishQuantity: 10,
      minOrderQty: null,
      dishUnitPriceCents: 1000,
      groups,
      combinations: [
        {
          quantity: 6,
          choices: [
            { groupId: 'protein', optionId: 'paneer' },
            { groupId: 'rice', optionId: 'brown' },
          ],
        },
        {
          quantity: 4,
          choices: [
            { groupId: 'protein', optionId: 'paneer' },
            { groupId: 'rice', optionId: 'jeera' },
          ],
        },
      ],
      optionPrice: prices,
      portionExtra: () => null,
      optionSupportsPortion: () => false,
    });
    expect(result[0].unitPriceCents).toBe(1300);
    expect(result[0].combinationTotalCents).toBe(7800);
    expect(result[1].combinationTotalCents).toBe(5120);
    expect(lineTotal(result)).toBe(12920);
  });

  it('rejects combo qty mismatch', () => {
    expect(() =>
      validateCombinations({
        dishQuantity: 10,
        minOrderQty: null,
        dishUnitPriceCents: 1000,
        groups,
        combinations: [
          { quantity: 6, choices: [{ groupId: 'protein', optionId: 'paneer' }, { groupId: 'rice', optionId: 'brown' }] },
        ],
        optionPrice: prices,
        portionExtra: () => null,
        optionSupportsPortion: () => false,
      }),
    ).toThrow(/add up exactly/);
  });

  it('rejects missing required group', () => {
    expect(() =>
      validateCombinations({
        dishQuantity: 1,
        minOrderQty: null,
        dishUnitPriceCents: 1000,
        groups,
        combinations: [{ quantity: 1, choices: [{ groupId: 'protein', optionId: 'paneer' }] }],
        optionPrice: prices,
        portionExtra: () => null,
        optionSupportsPortion: () => false,
      }),
    ).toThrow(/required group/);
  });
});
