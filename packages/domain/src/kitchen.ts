export type KitchenUnitStatus = 'PENDING' | 'STARTED' | 'DONE';

export function startUnit(status: KitchenUnitStatus): KitchenUnitStatus {
  if (status !== 'PENDING') throw new Error('A unit cannot be started twice');
  return 'STARTED';
}

/** Finishing never-started is allowed and also records a start. */
export function finishUnit(status: KitchenUnitStatus): { next: KitchenUnitStatus; recordedStart: boolean } {
  if (status === 'DONE') throw new Error('A unit cannot be finished twice');
  if (status === 'PENDING') return { next: 'DONE', recordedStart: true };
  return { next: 'DONE', recordedStart: false };
}

export type PlannedTimes = {
  plannedDispatchReady: Date;
  plannedKitchenReady: Date;
};

export function plannedTimes(params: {
  deliveryAt: Date;
  leaveKitchenMinutes: number;
  kitchenReadyBufferMinutes?: number;
}): PlannedTimes {
  const buffer = params.kitchenReadyBufferMinutes ?? 30;
  const plannedDispatchReady = new Date(params.deliveryAt.getTime() - params.leaveKitchenMinutes * 60_000);
  const plannedKitchenReady = new Date(plannedDispatchReady.getTime() - buffer * 60_000);
  return { plannedDispatchReady, plannedKitchenReady };
}

export type Risk = 'ON_TRACK' | 'AT_RISK' | 'LATE';

export function unitRisk(params: {
  plannedKitchenReady: Date;
  now: Date;
  status: KitchenUnitStatus;
}): Risk {
  if (params.status === 'DONE') return 'ON_TRACK';
  if (params.now.getTime() > params.plannedKitchenReady.getTime()) return 'LATE';
  const minutesLeft = (params.plannedKitchenReady.getTime() - params.now.getTime()) / 60_000;
  if (minutesLeft <= 15) return 'AT_RISK';
  return 'ON_TRACK';
}
