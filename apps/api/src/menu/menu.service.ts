import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class MenuService {
  constructor(
    private prisma: PrismaService,
    private pricing: PricingService,
  ) {}

  categories() {
    return this.prisma.menuCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: { items: { include: { dish: true }, orderBy: { displayOrder: 'asc' } } },
    });
  }

  async preview(employeeId: string, secretCategoryId?: string) {
    const employee = await this.prisma.employee.findUniqueOrThrow({
      where: { id: employeeId },
      include: { company: { include: { hiddenCats: true, hiddenItems: true } } },
    });
    const ctx = await this.pricing.resolveForCompany(employee.companyId);
    const hiddenCat = new Set(employee.company.hiddenCats.map((h) => h.categoryId));
    const hiddenDish = new Set(employee.company.hiddenItems.map((h) => h.dishId));
    const categories = await this.prisma.menuCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        items: {
          where: { active: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            dish: {
              include: {
                optionGroups: {
                  orderBy: { displayOrder: 'asc' },
                  include: {
                    options: { include: { option: true }, orderBy: { displayOrder: 'asc' } },
                    portions: { include: { portionSize: true } },
                  },
                },
                allergens: { include: { allergen: true } },
                dietaryTags: { include: { dietaryTag: true } },
                kitchenStation: true,
              },
            },
          },
        },
      },
    });

    const mapped = [];
    for (const cat of categories) {
      if (!cat.active) continue;
      if (hiddenCat.has(cat.id)) continue;
      if (cat.secret && cat.id !== secretCategoryId) continue;
      const items = [];
      for (const item of cat.items) {
        const dish = item.dish;
        if (!dish.active) continue;
        if (hiddenDish.has(dish.id)) continue;
        const price = this.pricing.dishPrice(dish.id, dish.costCents, ctx);
        if (price == null) continue;
        const groups = dish.optionGroups.map((g) => ({
          id: g.id,
          name: g.name,
          required: g.required,
          usesPortions: g.usesPortions,
          displayOrder: g.displayOrder,
          portions: g.portions.map((p) => ({
            portionSizeId: p.portionSizeId,
            name: p.portionSize.name,
            extraChargeCents: p.extraChargeCents,
          })),
          options: g.options
            .filter((o) => o.option.active)
            .map((o) => ({
              id: o.option.id,
              name: o.option.name,
              priceCents: this.pricing.optionPrice(o.option.id, o.option.costCents, ctx),
            }))
            .filter((o) => o.priceCents != null),
        }));
        const requiredBlocked = groups.some((g) => g.required && g.options.length === 0);
        if (requiredBlocked) continue;
        items.push({
          menuItemId: item.id,
          dishId: dish.id,
          name: dish.name,
          description: dish.description,
          imageUrl: dish.imageUrl,
          sku: dish.sku,
          temperature: dish.temperature,
          minOrderQty: dish.minOrderQty,
          priceCents: price,
          allergens: dish.allergens.map((a) => a.allergen.name),
          dietaryTags: dish.dietaryTags.map((t) => t.dietaryTag.name),
          station: dish.kitchenStation?.name ?? null,
          groups,
        });
      }
      mapped.push({
        id: cat.id,
        name: cat.name,
        secret: cat.secret,
        items,
      });
    }
    return {
      employee: { id: employee.id, name: employee.name, email: employee.email },
      company: { id: employee.company.id, name: employee.company.name },
      flags: {
        canChooseAddress: employee.canChooseAddress,
        canChangeTime: employee.canChangeTime,
        canChangePackaging: employee.canChangePackaging,
      },
      categories: mapped,
    };
  }
}
