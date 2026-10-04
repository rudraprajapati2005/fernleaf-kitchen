import { DateTime } from 'luxon';
import { CivilDate, parseCivilDate, toCivilDate, weekdayMonday0Sunday6, atTimeOnDate } from './time';

export type CalendarConfig = {
  /** 0=Mon ... 6=Sun */
  workingWeekdays: number[];
  holidays: CivilDate[];
};

export function isWorkingDay(date: CivilDate, calendar: CalendarConfig, zone: string): boolean {
  const dt = parseCivilDate(date, zone);
  const wd = weekdayMonday0Sunday6(dt);
  if (!calendar.workingWeekdays.includes(wd)) return false;
  if (calendar.holidays.includes(date)) return false;
  return true;
}

export function assertDeliveryDateAllowed(
  date: CivilDate,
  companyCalendar: CalendarConfig,
  zone: string,
): void {
  if (!isWorkingDay(date, companyCalendar, zone)) {
    throw new Error('Company cannot receive deliveries on non-working days or holidays');
  }
}

/**
 * Cut-off instant for a delivery date.
 * Counts kitchen working days backward from the delivery date (exclusive).
 * Company holidays must NOT be passed in kitchenCalendar.
 */
export function calculateCutoff(
  deliveryDate: CivilDate,
  workingDaysBefore: number,
  cutoffTimeHm: string,
  kitchenCalendar: CalendarConfig,
  zone: string,
): DateTime {
  if (workingDaysBefore < 0) throw new Error('workingDaysBefore must be >= 0');
  let cursor = parseCivilDate(deliveryDate, zone);
  let remaining = workingDaysBefore;
  while (remaining > 0) {
    cursor = cursor.minus({ days: 1 });
    const civil = toCivilDate(cursor);
    if (isWorkingDay(civil, kitchenCalendar, zone)) {
      remaining -= 1;
    }
  }
  return atTimeOnDate(toCivilDate(cursor), cutoffTimeHm, zone);
}

export function isBeforeCutoff(now: DateTime, cutoff: DateTime): boolean {
  return now < cutoff;
}
