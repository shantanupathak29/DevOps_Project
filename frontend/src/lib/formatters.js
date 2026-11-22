/**
 * Format timestamp string or Date object into localized short time (HH:MM AM/PM)
 * @param {string | Date} dateInput
 * @returns {string}
 */
export const formatShortTime = (dateInput) => {
  if (!dateInput) return '--';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Normalizes identifier input (trim and lower-case)
 * @param {string} value
 * @returns {string}
 */
export const normalizeStudentIdentifier = (value = '') =>
  String(value).trim().toLowerCase();
