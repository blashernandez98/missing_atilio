/**
 * Date utilities for Uruguay timezone (America/Montevideo)
 * Ensures consistent date handling across local and production environments
 */

const URUGUAY_TIMEZONE = 'America/Montevideo';

/**
 * Get the current date in Uruguay timezone
 * Returns a Date object adjusted to Uruguay time
 */
export function getUruguayDate(): Date {
  const now = new Date();
  // Get the date string in Uruguay timezone
  const uruguayDateStr = now.toLocaleDateString('en-CA', { timeZone: URUGUAY_TIMEZONE });
  // Parse it back to a Date object (en-CA format is YYYY-MM-DD)
  const [year, month, day] = uruguayDateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get today's date in Uruguay timezone formatted as dd-mm-yyyy
 */
export function getTodayStringUruguay(): string {
  const now = new Date();
  // Get date components in Uruguay timezone
  const day = now.toLocaleDateString('en-GB', { timeZone: URUGUAY_TIMEZONE, day: '2-digit' });
  const month = now.toLocaleDateString('en-GB', { timeZone: URUGUAY_TIMEZONE, month: '2-digit' });
  const year = now.toLocaleDateString('en-GB', { timeZone: URUGUAY_TIMEZONE, year: 'numeric' });
  return `${day}-${month}-${year}`;
}

/**
 * Get tomorrow's date in Uruguay timezone formatted as dd-mm-yyyy
 */
export function getTomorrowStringUruguay(): string {
  const uruguayDate = getUruguayDate();
  uruguayDate.setDate(uruguayDate.getDate() + 1);
  return formatDateToDDMMYYYY(uruguayDate);
}

/**
 * Format a Date object to dd-mm-yyyy string
 */
export function formatDateToDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Parse dd-mm-yyyy string to Date object
 */
export function parseDDMMYYYYToDate(dateString: string): Date {
  const [day, month, year] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get date components in Uruguay timezone
 * Useful for individual day/month/year access
 */
export function getUruguayDateComponents(): { day: number; month: number; year: number } {
  const now = new Date();
  const day = parseInt(now.toLocaleDateString('en-GB', { timeZone: URUGUAY_TIMEZONE, day: 'numeric' }), 10);
  const month = parseInt(now.toLocaleDateString('en-GB', { timeZone: URUGUAY_TIMEZONE, month: 'numeric' }), 10);
  const year = parseInt(now.toLocaleDateString('en-GB', { timeZone: URUGUAY_TIMEZONE, year: 'numeric' }), 10);
  return { day, month, year };
}
