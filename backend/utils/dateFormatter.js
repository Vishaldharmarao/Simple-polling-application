/**
 * Date formatting utility for IST timezone handling
 * MySQL DATETIME fields are stored without timezone info but represent IST values
 */

/**
 * Format a Date object to IST datetime string
 * MySQL stores DATETIME values that represent IST, but we need to preserve them as-is
 * in the API responses without any timezone conversion
 * 
 * @param {Date} dateObj - JavaScript Date object from MySQL
 * @returns {string} - Formatted datetime string "YYYY-MM-DD HH:MM:SS"
 */
function formatDateTimeToIST(dateObj) {
    if (!dateObj || !(dateObj instanceof Date)) {
        return null;
    }

    // Get the ISO string which is in UTC
    const isoString = dateObj.toISOString();
    
    // IST is UTC+5:30, so add 5.5 hours to the UTC time to get the original IST value
    // that was stored in the DATETIME field
    const utcDate = new Date(isoString);
    const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
    
    // Format as "YYYY-MM-DD HH:MM:SS"
    const year = istDate.getUTCFullYear();
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    const hours = String(istDate.getUTCHours()).padStart(2, '0');
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
    formatDateTimeToIST
};
