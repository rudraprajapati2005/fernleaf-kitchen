import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequirePerm } from '../auth/decorators';
import { assertCompanyDomain } from '@fernleaf/domain';
import { IsArray, IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PackagingType } from '@prisma/client';

class CompanyDto {
  @IsString() name!: string;
  @IsString() billingContactName!: string;
  @IsEmail() billingContactEmail!: string;
  @IsString() billingContactPhone!: string;
  @IsOptional() @IsString() priceTierId?: string | null;
  @IsOptional() @IsInt() defaultDeliveryMinutes?: number;
  @IsOptional() @IsInt() @Min(0) leaveKitchenMinutes?: number;
  @IsOptional() defaultPackaging?: PackagingType;
  @IsOptional() @IsString() driverStandingInstructions?: string;
  @IsOptional() @IsString() defaultDriverId?: string | null;
  @IsOptional() @IsArray() workingWeekdays?: number[];
  @IsOptional() @IsArray() domains?: string[];
}

class AddressDto {
  @IsString() label!: string;
  @IsString() line1!: string;
  @IsOptional() @IsString() line2?: string;
  @IsString() city!: string;
  @IsString() state!: string;
  @IsString() zip!: string;
}

@Controller('companies')
export class CompaniesController {
  constructor(private prisma: PrismaService) {}

  @RequirePerm('company:manage')
  @Get()
  list() {
    return this.prisma.company.findMany({
      orderBy: { name: 'asc' },
      include: { domains: true, addresses: true, holidays: true, hiddenCats: true, hiddenItems: true },
    });
  }

  @RequirePerm('order:read')
  @Get('lite')
  lite() {
    return this.prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
  }

  @RequirePerm('company:manage')
  @Get(':id')
  get(@Param('id') id: string) {
    return this.prisma.company.findUniqueOrThrow({
      where: { id },
      include: {
        domains: true,
        addresses: true,
        holidays: true,
        hiddenCats: true,
        hiddenItems: true,
        employees: true,
      },
    });
  }

  @RequirePerm('company:manage')
  @Post()
  async create(@Body() dto: CompanyDto) {
    const domains = (dto.domains ?? []).map(assertCompanyDomain);
    return this.prisma.company.create({
      data: {
        name: dto.name,
        billingContactName: dto.billingContactName,
        billingContactEmail: dto.billingContactEmail,
        billingContactPhone: dto.billingContactPhone,
        priceTierId: dto.priceTierId,
        defaultDeliveryMinutes: dto.defaultDeliveryMinutes,
        leaveKitchenMinutes: dto.leaveKitchenMinutes,
        defaultPackaging: dto.defaultPackaging,
        driverStandingInstructions: dto.driverStandingInstructions,
        defaultDriverId: dto.defaultDriverId,
        workingWeekdays: dto.workingWeekdays,
        domains: { create: domains.map((domain) => ({ domain })) },
      },
    });
  }

  @RequirePerm('company:manage')
  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: CompanyDto & { ownerEmployeeId?: string | null }) {
    if (dto.domains) {
      const domains = dto.domains.map(assertCompanyDomain);
      await this.prisma.companyDomain.deleteMany({ where: { companyId: id } });
      await this.prisma.companyDomain.createMany({ data: domains.map((domain) => ({ companyId: id, domain })) });
    }
    return this.prisma.company.update({
      where: { id },
      data: {
        name: dto.name,
        billingContactName: dto.billingContactName,
        billingContactEmail: dto.billingContactEmail,
        billingContactPhone: dto.billingContactPhone,
        priceTierId: dto.priceTierId,
        ownerEmployeeId: dto.ownerEmployeeId,
        defaultDeliveryMinutes: dto.defaultDeliveryMinutes,
        leaveKitchenMinutes: dto.leaveKitchenMinutes,
        defaultPackaging: dto.defaultPackaging,
        driverStandingInstructions: dto.driverStandingInstructions,
        defaultDriverId: dto.defaultDriverId,
        workingWeekdays: dto.workingWeekdays,
      },
    });
  }

  @RequirePerm('company:manage')
  @Post(':id/addresses')
  addAddress(@Param('id') companyId: string, @Body() dto: AddressDto) {
    return this.prisma.companyAddress.create({ data: { companyId, ...dto } });
  }

  @RequirePerm('company:manage')
  @Post(':id/holidays')
  addHoliday(@Param('id') companyId: string, @Body() body: { date: string; name: string }) {
    return this.prisma.companyHoliday.create({
      data: { companyId, date: new Date(body.date + 'T00:00:00.000Z'), name: body.name },
    });
  }

  @RequirePerm('company:manage')
  @Post(':id/hidden-categories/:categoryId')
  hideCat(@Param('id') companyId: string, @Param('categoryId') categoryId: string) {
    return this.prisma.companyHiddenCategory.upsert({
      where: { companyId_categoryId: { companyId, categoryId } },
      create: { companyId, categoryId },
      update: {},
    });
  }

  @RequirePerm('company:manage')
  @Post(':id/hidden-items/:dishId')
  hideItem(@Param('id') companyId: string, @Param('dishId') dishId: string) {
    return this.prisma.companyHiddenItem.upsert({
      where: { companyId_dishId: { companyId, dishId } },
      create: { companyId, dishId },
      update: {},
    });
  }
}
