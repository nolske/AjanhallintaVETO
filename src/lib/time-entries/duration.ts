export const MAX_ENTRY_MINUTES = 1440;

export function hoursAndMinutesToTotalMinutes(hours: number, minutes: number) {
  return hours * 60 + minutes;
}

export function splitMinutes(totalMinutes: number) {
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60
  };
}

export function formatDuration(totalMinutes: number) {
  const { hours, minutes } = splitMinutes(totalMinutes);

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

export function isValidDuration(totalMinutes: number) {
  return Number.isInteger(totalMinutes) && totalMinutes > 0 && totalMinutes <= MAX_ENTRY_MINUTES;
}

export function getTodayDateString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function isFutureDate(dateString: string, today = getTodayDateString()) {
  return dateString > today;
}
