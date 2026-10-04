import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequirePerm } from '../auth/decorators';
import * as bcrypt from 'bcryptjs';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { StaffRole } from '@prisma/client';

class CreateStaffDto {
  @IsEmail() email!: string;
  @IsString() name!: string;
  @IsEnum(StaffRole) role!: StaffRole;
  @IsString() @MinLength(8) password!: string;
}

class PatchStaffDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(StaffRole) role?: StaffRole;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsString() @MinLength(8) password?: string;
}

@Controller('staff')
export class StaffController {
  constructor(private prisma: PrismaService) {}

  @RequirePerm('staff:manage')
  @Get()
  list() {
    return this.prisma.staff.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
    });
  }

  @RequirePerm('staff:manage')
  @Post()
  async create(@Body() dto: CreateStaffDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.staff.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        role: dto.role,
        passwordHash,
      },
      select: { id: true, email: true, name: true, role: true, active: true },
    });
  }

  @RequirePerm('staff:manage')
  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: PatchStaffDto) {
    const data: any = { name: dto.name, role: dto.role, active: dto.active };
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.staff.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, active: true },
    });
  }
}
