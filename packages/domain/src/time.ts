import { DateTime } from 'luxon';

export const DEFAULT_KITCHEN_ZONE = 'America/New_York';

export type CivilDate = string; // YYYY-MM-DD

export function parseCivilDate(date: CivilDate, zone: string): DateTime {
  const dt = DateTime.fromISO(date, { zone });
  if (!dt.isValid) throw new Error(`Invalid civil date ${date}`);
  return dt.startOf('day');
}

export function toCivilDate(dt: DateTime): CivilDate {
  return dt.toFormat('yyyy-MM-dd');
}

export function nowInZone(zone: string, now: Date = new Date()): DateTime {
  return DateTime.fromJSDate(now, { zone });
}

export function todayCivil(zone: string, now: Date = new Date()): CivilDate {
  return toCivilDate(nowInZone(zone, now));
}

export function atTimeOnDate(
  date: CivilDate,
  timeHm: string,
  zone: string,
): DateTime {
  const [h, m] = timeHm.split(':').map(Number);
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) {
    throw new Error(`Invalid time ${timeHm}`);
  }
  return parseCivilDate(date, zone).set({ hour: h, minute: m, second: 0, millisecond: 0 });
}

export function weekdayMonday0Sunday6(dt: DateTime): number {
  // Luxon weekday: 1=Mon ... 7=Sun
  return dt.weekday === 7 ? 6 : dt.weekday - 1;
}

export function deliveryInstant(
  date: CivilDate,
  minutesFromMidnight: number,
  zone: string,
): DateTime {
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  return parseCivilDate(date, zone).set({ hour: h, minute: m, second: 0, millisecond: 0 });
}
