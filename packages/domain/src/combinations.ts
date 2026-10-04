import { Cents, assertCents, sumCents } from './money';

export type OptionChoiceInput = {
  groupId: string;
  optionId: string;
  portionSizeId?: string | null;
};

export type OptionGroupRule = {
  id: string;
  required: boolean;
  usesPortions: boolean;
  optionIds: string[];
  portionSizeIds: string[];
};

export type CombinationInput = {
  quantity: number;
  choices: OptionChoiceInput[];
};

export type PricedChoice = OptionChoiceInput & {
  optionPriceCents: Cents;
  portionExtraCents: Cents;
};

export type ValidatedCombination = {
  quantity: number;
  unitPriceCents: Cents;
  combinationTotalCents: Cents;
  choices: PricedChoice[];
};

export function validateCombinations(params: {
  dishQuantity: number;
  minOrderQty: number | null;
  dishUnitPriceCents: Cents;
  groups: OptionGroupRule[];
  combinations: CombinationInput[];
  optionPrice: (optionId: string) => Cents | null;
  portionExtra: (groupId: string, portionSizeId: string) => Cents | null;
  optionSupportsPortion: (optionId: string, portionSizeId: string) => boolean;
}): ValidatedCombination[] {
  const { dishQuantity, minOrderQty, dishUnitPriceCents, groups, combinations } = params;
  if (!Number.isInteger(dishQuantity) || dishQuantity < 1) {
    throw new Error('Dish quantity must be a positive integer');
  }
  if (minOrderQty != null && dishQuantity < minOrderQty) {
    throw new Error(`Quantity must be at least ${minOrderQty}`);
  }
  assertCents(dishUnitPriceCents);

  const comboQty = combinations.reduce((s, c) => s + c.quantity, 0);
  if (comboQty !== dishQuantity) {
    throw new Error('Combination quantities must add up exactly to the dish quantity');
  }

  return combinations.map((combo) => {
    if (!Number.isInteger(combo.quantity) || combo.quantity < 1) {
      throw new Error('Combination quantity must be a positive integer');
    }
    const chosenGroups = new Set(combo.choices.map((c) => c.groupId));
    if (chosenGroups.size !== combo.choices.length) {
      throw new Error('Each option group may be chosen at most once per combination');
    }
    for (const g of groups) {
      if (g.required && !chosenGroups.has(g.id)) {
        throw new Error('Every combination must satisfy every required group');
      }
    }

    const priced: PricedChoice[] = combo.choices.map((choice) => {
      const group = groups.find((g) => g.id === choice.groupId);
      if (!group) throw new Error('Unknown option group');
      if (!group.optionIds.includes(choice.optionId)) {
        throw new Error('Option is not offered in this group');
      }
      const optionPrice = params.optionPrice(choice.optionId);
      if (optionPrice == null) {
        throw new Error('Selected option has no price on this tier');
      }
      let portionExtraCents = 0;
      if (group.usesPortions) {
        if (!choice.portionSizeId) throw new Error('This group requires a portion size');
        if (!group.portionSizeIds.includes(choice.portionSizeId)) {
          throw new Error('Invalid portion size for group');
        }
        if (!params.optionSupportsPortion(choice.optionId, choice.portionSizeId)) {
          throw new Error('Option does not support this portion size');
        }
        const extra = params.portionExtra(group.id, choice.portionSizeId);
        if (extra == null) throw new Error('Portion extra charge is not configured');
        portionExtraCents = extra;
      } else if (choice.portionSizeId) {
        throw new Error('This group does not use portions');
      }
      return {
        ...choice,
        optionPriceCents: optionPrice,
        portionExtraCents,
      };
    });

    const optionsSum = sumCents(priced.map((p) => p.optionPriceCents + p.portionExtraCents));
    const unitPriceCents = dishUnitPriceCents + optionsSum;
    return {
      quantity: combo.quantity,
      unitPriceCents,
      combinationTotalCents: unitPriceCents * combo.quantity,
      choices: priced,
    };
  });
}

export function lineTotal(combos: ValidatedCombination[]): Cents {
  return sumCents(combos.map((c) => c.combinationTotalCents));
}
