import { describe, expect, it } from 'vitest';
import { DateTime } from 'luxon';
import { calculateCutoff, isWorkingDay } from '../src/cutoff';

const zone = 'America/New_York';
const weekdays = { workingWeekdays: [0, 1, 2, 3, 4], holidays: [] as string[] };

describe('cutoff', () => {
  it('Wednesday delivery, 2 working days at 16:00 locks Monday 16:00', () => {
    const cutoff = calculateCutoff('2026-10-07', 2, '16:00', weekdays, zone);
    expect(cutoff.toISO()).toBe(DateTime.fromISO('2026-10-05T16:00:00', { zone }).toISO());
  });

  it('skips kitchen holidays when counting back', () => {
    const cal = { workingWeekdays: [0, 1, 2, 3, 4], holidays: ['2026-10-05'] };
    const cutoff = calculateCutoff('2026-10-07', 2, '16:00', cal, zone);
    // skip Monday holiday: Tue (1) Fri (2)
    expect(cutoff.toFormat('yyyy-MM-dd HH:mm')).toBe('2026-10-02 16:00');
  });

  it('skips weekends', () => {
    const cutoff = calculateCutoff('2026-10-05', 1, '16:00', weekdays, zone);
    expect(cutoff.toFormat('yyyy-MM-dd')).toBe('2026-10-02');
  });

  it('does not use company holidays — caller must pass kitchen calendar only', () => {
    expect(isWorkingDay('2026-10-05', weekdays, zone)).toBe(true);
  });
});
