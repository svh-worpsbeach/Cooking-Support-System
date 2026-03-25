/**
 * Parse time string in format "H:MM" or "HH:MM" to minutes
 */
export function parseTimeToMinutes(timeString: string): number {
  const parts = timeString.split(':');
  if (parts.length !== 2) return 0;
  
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  
  return hours * 60 + minutes;
}

/**
 * Format minutes to time string "H:MM" or "HH:MM"
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Calculate total time from preparation and cooking time
 */
export function calculateTotalTime(preparationTime: string, cookingTime: string): string {
  const prepMinutes = parseTimeToMinutes(preparationTime);
  const cookMinutes = parseTimeToMinutes(cookingTime);
  return formatMinutesToTime(prepMinutes + cookMinutes);
}

/**
 * Format time string for display (e.g., "1:30" -> "1h 30min")
 */
export function formatTimeForDisplay(timeString: string): string {
  const totalMinutes = parseTimeToMinutes(timeString);
  
  if (totalMinutes === 0) return '0 min';
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

// Made with Bob