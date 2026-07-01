export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_ECTS = 27;
export const ECTS_MINUTES = MINUTES_PER_HOUR * HOURS_PER_ECTS;

export function minutesToEcts(minutes: number) {
  return minutes / ECTS_MINUTES;
}

export function formatEcts(minutes: number) {
  return minutesToEcts(minutes).toFixed(2);
}

export function roundEcts(minutes: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(minutesToEcts(minutes) * factor) / factor;
}

export function minutesToHours(minutes: number) {
  return minutes / MINUTES_PER_HOUR;
}

export function formatMinutesAsHours(minutes: number) {
  return `${minutesToHours(minutes).toFixed(1)} h`;
}
