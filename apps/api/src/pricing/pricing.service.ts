import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PriceTierInput,
  priceKey,
  resolveEmployeeTierId,
  resolvePrice,
} from '@fernleaf/domain';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async loadTiers(): Promise<PriceTierInput[]> {
    const tiers = await this.prisma.priceTier.findMany();
    return tiers.map((t) => ({
      id: t.id,
      isDefault: t.isDefault,
      derivationKind: t.derivationKind,
      basisPoints: t.basisPoints,
      sourceTierId: t.sourceTierId,
    }));
  }

  async loadExplicitTable() {
    const [dishes, options] = await Promise.all([
      this.prisma.dishPrice.findMany(),
      this.prisma.optionPrice.findMany(),
    ]);
    const table: Record<string, number> = {};
    for (const d of dishes) table[priceKey('dish', d.dishId, d.tierId)] = d.amountCents;
    for (const o of options) table[priceKey('option', o.optionId, o.tierId)] = o.amountCents;
    return table;
  }

  async resolveForCompany(companyId: string) {
    const company = await this.prisma.company.findUniqueOrThrow({ where: { id: companyId } });
    const tiers = await this.loadTiers();
    const explicit = await this.loadExplicitTable();
    const tierId = resolveEmployeeTierId(company.priceTierId, tiers);
    return { tiers, explicit, tierId };
  }

  dishPrice(dishId: string, cost: number, ctx: { tiers: PriceTierInput[]; explicit: Record<string, number>; tierId: string }) {
    return resolvePrice('dish', dishId, cost, ctx.tierId, ctx.tiers, ctx.explicit);
  }

  optionPrice(optionId: string, cost: number, ctx: { tiers: PriceTierInput[]; explicit: Record<string, number>; tierId: string }) {
    return resolvePrice('option', optionId, cost, ctx.tierId, ctx.tiers, ctx.explicit);
  }
}
