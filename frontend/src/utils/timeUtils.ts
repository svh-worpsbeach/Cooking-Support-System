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

/**
 * Format ISO date string to localized date string
 */
export function formatDate(dateString: string, locale: string = 'de-DE'): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Format ISO date string to localized date and time string
 */
export function formatDateTime(dateString: string, locale: string = 'de-DE'): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return dateString;
  }
}

/**
 * Format ISO date string to short date string
 */
export function formatShortDate(dateString: string, locale: string = 'de-DE'): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting short date:', error);
    return dateString;
  }
}

/**
 * Format ISO date string to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string, locale: string = 'de-DE'): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return locale === 'de-DE' ? 'Heute' : 'Today';
    if (diffDays === 1) return locale === 'de-DE' ? 'Gestern' : 'Yesterday';
    if (diffDays < 7) return locale === 'de-DE' ? `vor ${diffDays} Tagen` : `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return locale === 'de-DE' ? `vor ${weeks} Woche${weeks > 1 ? 'n' : ''}` : `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return locale === 'de-DE' ? `vor ${months} Monat${months > 1 ? 'en' : ''}` : `${months} month${months > 1 ? 's' : ''} ago`;
    }
    const years = Math.floor(diffDays / 365);
    return locale === 'de-DE' ? `vor ${years} Jahr${years > 1 ? 'en' : ''}` : `${years} year${years > 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return dateString;
  }
}

// Made with Bob