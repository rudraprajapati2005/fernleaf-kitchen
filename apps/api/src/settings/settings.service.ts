import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { nowInZone, todayCivil } from '@fernleaf/domain';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    let row = await this.prisma.kitchenSettings.findUnique({ where: { id: 'singleton' } });
    if (!row) {
      row = await this.prisma.kitchenSettings.create({ data: { id: 'singleton' } });
    }
    const holidays = await this.prisma.kitchenHoliday.findMany({ orderBy: { date: 'asc' } });
    return { ...row, holidays };
  }

  async update(data: {
    timezone?: string;
    cutoffTimeHm?: string;
    cutoffWorkingDays?: number;
    workingWeekdays?: number[];
    kitchenReadyBufferMinutes?: number;
  }) {
    await this.get();
    return this.prisma.kitchenSettings.update({ where: { id: 'singleton' }, data });
  }

  async addHoliday(date: string, name: string) {
    return this.prisma.kitchenHoliday.create({
      data: { date: new Date(date + 'T00:00:00.000Z'), name },
    });
  }

  async removeHoliday(id: string) {
    await this.prisma.kitchenHoliday.delete({ where: { id } });
    return { ok: true };
  }

  async zoneNow() {
    const s = await this.get();
    return { timezone: s.timezone, today: todayCivil(s.timezone), now: nowInZone(s.timezone).toISO() };
  }
}
