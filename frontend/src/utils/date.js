// Display timestamp exactly as stored in database (already in IST)
// Do NOT use Date object - it assumes UTC and shifts by 5:30 hours
export function formatDateTime(value) {
  return value || '';
}
