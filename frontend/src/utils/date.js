/**
 * Display timestamp exactly as received from backend (already in IST)
 * IMPORTANT: Do NOT use Date object - it assumes UTC and shifts by 5:30 hours
 * Just do simple string formatting to convert ISO format to readable format
 */
export const formatDateTime = (value) => {
  if (!value) return '';
  // Normalize ISO-ish strings to "YYYY-MM-DD HH:MM:SS"
  // - Replace T with space
  // - Remove trailing .000Z if present
  return String(value).replace('T', ' ').replace('.000Z', '');
};
