import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequirePerm } from '../auth/decorators';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Temperature } from '@prisma/client';

class DishDto {
  @IsString() name!: string;
  @IsString() description!: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsString() sku!: string;
  @IsEnum(Temperature) temperature!: Temperature;
  @IsInt() @Min(0) costCents!: number;
  @IsOptional() @IsString() kitchenStationId?: string | null;
  @IsOptional() @IsInt() minOrderQty?: number | null;
  @IsOptional() @IsArray() allergenIds?: string[];
  @IsOptional() @IsArray() dietaryTagIds?: string[];
}

class OptionDto {
  @IsString() name!: string;
  @IsInt() @Min(0) costCents!: number;
  @IsOptional() @IsArray() allergenIds?: string[];
  @IsOptional() @IsArray() dietaryTagIds?: string[];
  @IsOptional() @IsArray() portionSizeIds?: string[];
}

class GroupDto {
  @IsString() name!: string;
  @IsBoolean() required!: boolean;
  @IsInt() displayOrder!: number;
  @IsBoolean() usesPortions!: boolean;
  @IsArray() optionIds!: string[];
  @IsOptional() @IsArray() portionSizeIds?: string[];
  @IsOptional() extras?: { portionSizeId: string; extraChargeCents: number }[];
}

class NamedDto {
  @IsString() name!: string;
}

@Controller('catalogue')
export class CatalogueController {
  constructor(private prisma: PrismaService) {}

  @RequirePerm('catalogue:read')
  @Get('reference')
  async reference() {
    const [allergens, dietaryTags, stations, portionSizes] = await Promise.all([
      this.prisma.allergen.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.dietaryTag.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.kitchenStation.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.portionSize.findMany({ orderBy: { name: 'asc' } }),
    ]);
    return { allergens, dietaryTags, stations, portionSizes };
  }

  @RequirePerm('catalogue:manage')
  @Post('allergens')
  createAllergen(@Body() dto: NamedDto) {
    return this.prisma.allergen.create({ data: { name: dto.name } });
  }

  @RequirePerm('catalogue:manage')
  @Post('dietary-tags')
  createTag(@Body() dto: NamedDto) {
    return this.prisma.dietaryTag.create({ data: { name: dto.name } });
  }

  @RequirePerm('catalogue:manage')
  @Post('stations')
  createStation(@Body() dto: NamedDto) {
    return this.prisma.kitchenStation.create({ data: { name: dto.name } });
  }

  @RequirePerm('catalogue:manage')
  @Post('portion-sizes')
  createPortion(@Body() dto: NamedDto) {
    return this.prisma.portionSize.create({ data: { name: dto.name } });
  }

  @RequirePerm('catalogue:read')
  @Get('dishes')
  dishes() {
    return this.prisma.dish.findMany({
      orderBy: { name: 'asc' },
      include: {
        kitchenStation: true,
        allergens: { include: { allergen: true } },
        dietaryTags: { include: { dietaryTag: true } },
        optionGroups: { include: { options: { include: { option: true } }, portions: true }, orderBy: { displayOrder: 'asc' } },
      },
    });
  }

  @RequirePerm('catalogue:manage')
  @Post('dishes')
  async createDish(@Body() dto: DishDto) {
    return this.prisma.dish.create({
      data: {
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        sku: dto.sku,
        temperature: dto.temperature,
        costCents: dto.costCents,
        kitchenStationId: dto.kitchenStationId,
        minOrderQty: dto.minOrderQty,
        allergens: { create: (dto.allergenIds ?? []).map((allergenId) => ({ allergenId })) },
        dietaryTags: { create: (dto.dietaryTagIds ?? []).map((dietaryTagId) => ({ dietaryTagId })) },
      },
    });
  }

  @RequirePerm('catalogue:manage')
  @Patch('dishes/:id')
  async patchDish(@Param('id') id: string, @Body() dto: Partial<DishDto> & { active?: boolean }) {
    if (dto.allergenIds) {
      await this.prisma.dishAllergen.deleteMany({ where: { dishId: id } });
    }
    if (dto.dietaryTagIds) {
      await this.prisma.dishDietaryTag.deleteMany({ where: { dishId: id } });
    }
    return this.prisma.dish.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        sku: dto.sku,
        temperature: dto.temperature,
        costCents: dto.costCents,
        kitchenStationId: dto.kitchenStationId,
        minOrderQty: dto.minOrderQty,
        active: dto.active,
        allergens: dto.allergenIds ? { create: dto.allergenIds.map((allergenId) => ({ allergenId })) } : undefined,
        dietaryTags: dto.dietaryTagIds
          ? { create: dto.dietaryTagIds.map((dietaryTagId) => ({ dietaryTagId })) }
          : undefined,
      },
    });
  }

  @RequirePerm('catalogue:read')
  @Get('options')
  options() {
    return this.prisma.option.findMany({
      include: {
        allergens: { include: { allergen: true } },
        dietaryTags: { include: { dietaryTag: true } },
        portions: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  @RequirePerm('catalogue:manage')
  @Post('options')
  createOption(@Body() dto: OptionDto) {
    return this.prisma.option.create({
      data: {
        name: dto.name,
        costCents: dto.costCents,
        allergens: { create: (dto.allergenIds ?? []).map((allergenId) => ({ allergenId })) },
        dietaryTags: { create: (dto.dietaryTagIds ?? []).map((dietaryTagId) => ({ dietaryTagId })) },
        portions: { create: (dto.portionSizeIds ?? []).map((portionSizeId) => ({ portionSizeId })) },
      },
    });
  }

  @RequirePerm('catalogue:manage')
  @Patch('options/:id')
  async patchOption(@Param('id') id: string, @Body() dto: Partial<OptionDto> & { active?: boolean }) {
    if (dto.allergenIds) await this.prisma.optionAllergen.deleteMany({ where: { optionId: id } });
    if (dto.dietaryTagIds) await this.prisma.optionDietaryTag.deleteMany({ where: { optionId: id } });
    if (dto.portionSizeIds) await this.prisma.optionPortionSupport.deleteMany({ where: { optionId: id } });
    return this.prisma.option.update({
      where: { id },
      data: {
        name: dto.name,
        costCents: dto.costCents,
        active: dto.active,
        allergens: dto.allergenIds ? { create: dto.allergenIds.map((allergenId) => ({ allergenId })) } : undefined,
        dietaryTags: dto.dietaryTagIds
          ? { create: dto.dietaryTagIds.map((dietaryTagId) => ({ dietaryTagId })) }
          : undefined,
        portions: dto.portionSizeIds ? { create: dto.portionSizeIds.map((portionSizeId) => ({ portionSizeId })) } : undefined,
      },
    });
  }

  @RequirePerm('catalogue:manage')
  @Post('dishes/:id/groups')
  async addGroup(@Param('id') dishId: string, @Body() dto: GroupDto) {
    return this.prisma.optionGroup.create({
      data: {
        dishId,
        name: dto.name,
        required: dto.required,
        displayOrder: dto.displayOrder,
        usesPortions: dto.usesPortions,
        options: {
          create: dto.optionIds.map((optionId, i) => ({ optionId, displayOrder: i })),
        },
        portions: {
          create: (dto.extras ?? []).map((e) => ({
            portionSizeId: e.portionSizeId,
            extraChargeCents: e.extraChargeCents,
          })),
        },
      },
    });
  }
}
