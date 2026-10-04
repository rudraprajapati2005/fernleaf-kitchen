import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequirePerm } from '../auth/decorators';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

class EmployeeDto {
  @IsString() companyId!: string;
  @IsEmail() email!: string;
  @IsString() name!: string;
  @IsOptional() @IsBoolean() canChooseAddress?: boolean;
  @IsOptional() @IsBoolean() canChangeTime?: boolean;
  @IsOptional() @IsBoolean() canChangePackaging?: boolean;
  @IsOptional() allergenIds?: string[];
  @IsOptional() dietaryTagIds?: string[];
}

@Controller('employees')
export class EmployeesController {
  constructor(private prisma: PrismaService) {}

  @RequirePerm('employee:manage')
  @Get()
  list() {
    return this.prisma.employee.findMany({
      include: { company: { select: { id: true, name: true } }, allergens: true, dietaryTags: true },
      orderBy: { name: 'asc' },
    });
  }

  @RequirePerm('order:create')
  @Get('search')
  search() {
    return this.prisma.employee.findMany({
      where: { active: true },
      include: { company: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  @RequirePerm('employee:manage')
  @Post()
  create(@Body() dto: EmployeeDto) {
    return this.prisma.employee.create({
      data: {
        companyId: dto.companyId,
        email: dto.email.toLowerCase(),
        name: dto.name,
        canChooseAddress: dto.canChooseAddress,
        canChangeTime: dto.canChangeTime,
        canChangePackaging: dto.canChangePackaging,
        allergens: { create: (dto.allergenIds ?? []).map((allergenId) => ({ allergenId })) },
        dietaryTags: { create: (dto.dietaryTagIds ?? []).map((dietaryTagId) => ({ dietaryTagId })) },
      },
    });
  }

  @RequirePerm('employee:manage')
  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: Partial<EmployeeDto> & { active?: boolean }) {
    if (dto.allergenIds) await this.prisma.employeeAllergen.deleteMany({ where: { employeeId: id } });
    if (dto.dietaryTagIds) await this.prisma.employeeDietaryTag.deleteMany({ where: { employeeId: id } });
    return this.prisma.employee.update({
      where: { id },
      data: {
        companyId: dto.companyId,
        email: dto.email?.toLowerCase(),
        name: dto.name,
        canChooseAddress: dto.canChooseAddress,
        canChangeTime: dto.canChangeTime,
        canChangePackaging: dto.canChangePackaging,
        active: dto.active,
        allergens: dto.allergenIds ? { create: dto.allergenIds.map((allergenId) => ({ allergenId })) } : undefined,
        dietaryTags: dto.dietaryTagIds
          ? { create: dto.dietaryTagIds.map((dietaryTagId) => ({ dietaryTagId })) }
          : undefined,
      },
    });
  }

  @RequirePerm('employee:manage')
  @Post('import/:companyId')
  async importCsv(@Param('companyId') companyId: string, @Body() body: { csv: string }) {
    const lines = body.csv.split(/\r?\n/).filter((l) => l.trim());
    const header = lines.shift();
    if (!header) return { created: 0, errors: [{ row: 0, error: 'Empty file' }] };
    const cols = header.split(',').map((c) => c.trim().toLowerCase());
    const idx = (name: string) => cols.indexOf(name);
    const errors: { row: number; error: string }[] = [];
    let created = 0;
    for (let i = 0; i < lines.length; i++) {
      const rowNum = i + 2;
      const parts = lines[i].split(',').map((p) => p.trim());
      const email = parts[idx('email')] ?? '';
      const name = parts[idx('name')] ?? '';
      try {
        if (!email || !name) throw new Error('name and email are required');
        await this.prisma.employee.create({
          data: {
            companyId,
            email: email.toLowerCase(),
            name,
            canChooseAddress: (parts[idx('canchooseaddress')] ?? '').toLowerCase() === 'true',
            canChangeTime: (parts[idx('canchangetime')] ?? '').toLowerCase() === 'true',
            canChangePackaging: (parts[idx('canchangepackaging')] ?? '').toLowerCase() === 'true',
          },
        });
        created += 1;
      } catch (e: any) {
        errors.push({ row: rowNum, error: e.message ?? 'Failed' });
      }
    }
    return { created, errors };
  }
}
