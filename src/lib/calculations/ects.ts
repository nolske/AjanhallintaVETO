export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_ECTS = 27;
export const ECTS_MINUTES = MINUTES_PER_HOUR * HOURS_PER_ECTS;

export function minutesToEcts(minutes: number) {
  return minutes / ECTS_MINUTES;
}

export function formatEcts(minutes: number) {
  return minutesToEcts(minutes).toFixed(2);
}
