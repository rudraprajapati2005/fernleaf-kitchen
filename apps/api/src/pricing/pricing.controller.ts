import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PrismaService } from '../prisma/prisma.service';
import { RequirePerm } from '../auth/decorators';
import { resolvePrice } from '@fernleaf/domain';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

class UpsertTierDto {
  @IsString() name!: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
  @IsOptional() @IsString() derivationKind?: 'NONE' | 'MULTIPLY_COST' | 'ADJUST_TIER';
  @IsOptional() @IsInt() basisPoints?: number | null;
  @IsOptional() @IsString() sourceTierId?: string | null;
}

class PriceCellDto {
  @IsString() id!: string;
  @IsInt() @Min(0) amountCents!: number;
}

@Controller('pricing')
export class PricingController {
  constructor(
    private pricing: PricingService,
    private prisma: PrismaService,
  ) {}

  @RequirePerm('pricing:manage')
  @Get('tiers')
  tiers() {
    return this.prisma.priceTier.findMany({ orderBy: { name: 'asc' } });
  }

  @RequirePerm('pricing:manage')
  @Post('tiers')
  createTier(@Body() dto: UpsertTierDto) {
    return this.prisma.priceTier.create({
      data: {
        name: dto.name,
        isDefault: dto.isDefault ?? false,
        derivationKind: dto.derivationKind ?? 'NONE',
        basisPoints: dto.basisPoints ?? null,
        sourceTierId: dto.sourceTierId ?? null,
      },
    });
  }

  @RequirePerm('pricing:manage')
  @Patch('tiers/:id')
  async updateTier(@Param('id') id: string, @Body() dto: UpsertTierDto) {
    if (dto.isDefault) {
      await this.prisma.priceTier.updateMany({ data: { isDefault: false } });
    }
    return this.prisma.priceTier.update({
      where: { id },
      data: {
        name: dto.name,
        isDefault: dto.isDefault,
        derivationKind: dto.derivationKind,
        basisPoints: dto.basisPoints,
        sourceTierId: dto.sourceTierId,
      },
    });
  }

  @RequirePerm('pricing:manage')
  @Get('tiers/:id/grid')
  async grid(@Param('id') tierId: string) {
    const [tiers, explicit, dishes, options] = await Promise.all([
      this.pricing.loadTiers(),
      this.pricing.loadExplicitTable(),
      this.prisma.dish.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
      this.prisma.option.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    ]);
    const ctx = { tiers, explicit, tierId };
    return {
      dishes: dishes.map((d) => {
        const resolved = resolvePrice('dish', d.id, d.costCents, tierId, tiers, explicit);
        const override = explicit[`dish:${d.id}:${tierId}`];
        return {
          id: d.id,
          name: d.name,
          sku: d.sku,
          costCents: d.costCents,
          overrideCents: override,
          resolvedCents: resolved,
          missing: resolved == null,
        };
      }),
      options: options.map((o) => {
        const resolved = resolvePrice('option', o.id, o.costCents, tierId, tiers, explicit);
        const override = explicit[`option:${o.id}:${tierId}`];
        return {
          id: o.id,
          name: o.name,
          costCents: o.costCents,
          overrideCents: override,
          resolvedCents: resolved,
          missing: resolved == null,
        };
      }),
    };
  }

  @RequirePerm('pricing:manage')
  @Post('tiers/:id/dishes')
  setDish(@Param('id') tierId: string, @Body() dto: PriceCellDto) {
    return this.prisma.dishPrice.upsert({
      where: { dishId_tierId: { dishId: dto.id, tierId } },
      create: { dishId: dto.id, tierId, amountCents: dto.amountCents },
      update: { amountCents: dto.amountCents },
    });
  }

  @RequirePerm('pricing:manage')
  @Post('tiers/:id/options')
  setOption(@Param('id') tierId: string, @Body() dto: PriceCellDto) {
    return this.prisma.optionPrice.upsert({
      where: { optionId_tierId: { optionId: dto.id, tierId } },
      create: { optionId: dto.id, tierId, amountCents: dto.amountCents },
      update: { amountCents: dto.amountCents },
    });
  }
}
