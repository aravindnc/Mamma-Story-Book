const CONCEPTION_DATE = new Date('2024-05-01T00:00:00Z');
const DELIVERY_DATE = new Date('2025-01-01T00:00:00Z');

// Helper to get difference in days
const daysBetween = (date1: Date, date2: Date): number => {
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.round((date2.getTime() - date1.getTime()) / oneDay);
};

export function calculateJourneyContext(photoDateStr: string): string {
    if (!photoDateStr) return "on a special day";

    const photoDate = new Date(photoDateStr + 'T00:00:00Z');
    
    if (isNaN(photoDate.getTime())) {
        return "on a memorable day";
    }

    if (photoDate < CONCEPTION_DATE) {
        return "before our beautiful journey to parenthood began";
    }

    if (photoDate >= CONCEPTION_DATE && photoDate <= DELIVERY_DATE) {
        const diffDays = daysBetween(CONCEPTION_DATE, photoDate);
        const week = Math.floor(diffDays / 7) + 1;
        return `during week ${week} of your pregnancy`;
    }

    if (photoDate > DELIVERY_DATE) {
        const diffDays = daysBetween(DELIVERY_DATE, photoDate);

        if (diffDays < 7) {
            const day = diffDays + 1;
            return `when our little one was ${day} ${day === 1 ? 'day' : 'days'} old`;
        }
        
        if (diffDays < 60) { // Approx 2 months
            const week = Math.floor(diffDays / 7);
            return `when our little one was ${week} ${week === 1 ? 'week' : 'weeks'} old`;
        }

        const months = Math.floor(diffDays / 30.44); // Average days in a month
        if (months < 12) {
             return `when our little one was ${months} ${months === 1 ? 'month' : 'months'} old`;
        }
        
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (remainingMonths === 0) {
            return `on our little one's ${years === 1 ? 'first' : years + 'th'} birthday`;
        }
        return `when our little one was ${years} ${years === 1 ? 'year' : 'years'} and ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} old`;
    }

    return "during a precious moment in our journey";
}

/**
 * Tries to parse a date from a filename.
 * Looks for formats like YYYY-MM-DD, YYYY_MM_DD, YYYY.MM.DD, or YYYYMMDD.
 * @param fileName The name of the file.
 * @returns A date string in 'YYYY-MM-DD' format if found, otherwise null.
 */
export function parseDateFromFileName(fileName: string): string | null {
  // Regex to find date-like patterns with consistent separators (or no separators).
  // e.g., 2024-05-20, 2024_05_20, or 20240520 (common in phone photos like PXL_20241213...).
  // It uses a backreference (\2) to ensure the same separator is used between year-month and month-day.
  const regex = /(\d{4})([-_.]?)(\d{2})\2(\d{2})/;
  const match = fileName.match(regex);

  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[3], 10); // Group 3 is month
    const day = parseInt(match[4], 10);   // Group 4 is day

    // Basic validation for the parsed date parts
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    // More robust validation by creating a UTC Date object to avoid timezone shifts
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    if (
      utcDate.getUTCFullYear() === year &&
      utcDate.getUTCMonth() === month - 1 &&
      utcDate.getUTCDate() === day
    ) {
      // It's a valid date. Format it to YYYY-MM-DD manually to avoid timezone issues.
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      return `${year}-${monthStr}-${dayStr}`;
    }
  }

  return null;
}

/**
 * Formats a date string (YYYY-MM-DD) into a more readable format (e.g., Aug 30, 2025).
 * This function is timezone-safe.
 * @param dateStr The date string in 'YYYY-MM-DD' format.
 * @returns A formatted date string.
 */
export function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return '';
  // The input is 'YYYY-MM-DD'. Splitting it and creating a UTC date avoids timezone issues.
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}