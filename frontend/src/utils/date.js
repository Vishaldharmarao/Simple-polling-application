/**
 * Display timestamp exactly as received from backend (already in IST)
 * IMPORTANT: Do NOT use Date object - it assumes UTC and shifts by 5:30 hours
 * Just do simple string formatting to convert ISO format to readable format
 */
export function formatDateTime(value) {
  if (!value) return '';
  // Replace T with space for ISO format datetime strings
  // Convert "2026-02-17T23:42:00" to "2026-02-17 23:42:00"
  // Also handles normal MySQL format "2026-02-17 23:42:00"
  return String(value).replace('T', ' ');
}
