import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MenuService } from './menu.service';
import { PrismaService } from '../prisma/prisma.service';
import { RequirePerm } from '../auth/decorators';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

class CategoryDto {
  @IsString() name!: string;
  @IsInt() displayOrder!: number;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsBoolean() secret?: boolean;
}

class ItemDto {
  @IsString() dishId!: string;
  @IsInt() displayOrder!: number;
}

@Controller('menu')
export class MenuController {
  constructor(
    private menu: MenuService,
    private prisma: PrismaService,
  ) {}

  @RequirePerm('menu:manage')
  @Get('categories')
  list() {
    return this.menu.categories();
  }

  @RequirePerm('menu:manage')
  @Post('categories')
  create(@Body() dto: CategoryDto) {
    return this.prisma.menuCategory.create({ data: dto });
  }

  @RequirePerm('menu:manage')
  @Patch('categories/:id')
  patch(@Param('id') id: string, @Body() dto: Partial<CategoryDto>) {
    return this.prisma.menuCategory.update({ where: { id }, data: dto });
  }

  @RequirePerm('menu:manage')
  @Post('categories/:id/items')
  addItem(@Param('id') categoryId: string, @Body() dto: ItemDto) {
    return this.prisma.menuItem.create({ data: { categoryId, dishId: dto.dishId, displayOrder: dto.displayOrder } });
  }

  @RequirePerm('menu:manage')
  @Patch('items/:id')
  patchItem(@Param('id') id: string, @Body() dto: { active?: boolean; displayOrder?: number }) {
    return this.prisma.menuItem.update({ where: { id }, data: dto });
  }

  @RequirePerm('order:create')
  @Get('preview/:employeeId')
  preview(@Param('employeeId') employeeId: string, @Query('secretCategoryId') secretCategoryId?: string) {
    return this.menu.preview(employeeId, secretCategoryId);
  }
}
