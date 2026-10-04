import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { RequirePerm } from '../auth/decorators';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

class UpdateSettingsDto {
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() cutoffTimeHm?: string;
  @IsOptional() @IsInt() @Min(0) cutoffWorkingDays?: number;
  @IsOptional() @IsArray() workingWeekdays?: number[];
  @IsOptional() @IsInt() kitchenReadyBufferMinutes?: number;
}

class HolidayDto {
  @IsString() date!: string;
  @IsString() name!: string;
}

@Controller('settings')
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @RequirePerm('catalogue:read')
  @Get()
  get() {
    return this.settings.get();
  }

  @RequirePerm('settings:manage')
  @Patch()
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }

  @RequirePerm('settings:manage')
  @Post('holidays')
  addHoliday(@Body() dto: HolidayDto) {
    return this.settings.addHoliday(dto.date, dto.name);
  }

  @RequirePerm('settings:manage')
  @Delete('holidays/:id')
  removeHoliday(@Param('id') id: string) {
    return this.settings.removeHoliday(id);
  }

  @RequirePerm('catalogue:read')
  @Get('clock')
  clock() {
    return this.settings.zoneNow();
  }
}
