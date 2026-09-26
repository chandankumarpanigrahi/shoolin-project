/**
 * Universal Date Utility for DD-MM-YYYY format
 */

/**
 * Formats any date input (YYYY-MM-DD, ISO string, Date object, timestamp) into DD-MM-YYYY
 * @param {string | Date | number | null | undefined} val
 * @param {string} fallback Default is '—'
 * @returns {string} Formatted date in DD-MM-YYYY or fallback
 */
export function formatDate(val, fallback = '—') {
  if (!val) return fallback;

  if (typeof val === 'string') {
    val = val.trim();
    if (!val || val === '—' || val === 'null' || val === 'undefined') return fallback;

    // Already in DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(val)) return val;

    // Match YYYY-MM-DD (e.g. '2026-09-25' or '2026-09-25T11:02:10.000Z')
    const ymdMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
      const [, yyyy, mm, dd] = ymdMatch;
      return `${dd}-${mm}-${yyyy}`;
    }

    // Match DD/MM/YYYY
    const dmyMatch = val.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (dmyMatch) {
      const [, dd, mm, yyyy] = dmyMatch;
      return `${dd}-${mm}-${yyyy}`;
    }
  }

  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return typeof val === 'string' ? val : fallback;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  } catch (e) {
    return typeof val === 'string' ? val : fallback;
  }
}

/**
 * Formats any date input into DD-MM-YYYY HH:mm
 * @param {string | Date | number | null | undefined} val
 * @param {string} fallback Default is '—'
 * @returns {string}
 */
export function formatDateTime(val, fallback = '—') {
  if (!val) return fallback;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return formatDate(val, fallback);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  } catch (e) {
    return formatDate(val, fallback);
  }
}

/**
 * Formats a date range into "DD-MM-YYYY → DD-MM-YYYY"
 * @param {string | Date} start
 * @param {string | Date} end
 * @param {string} fallback
 * @returns {string}
 */
export function formatDateRange(start, end, fallback = '—') {
  const s = formatDate(start, '');
  const e = formatDate(end, '');
  if (s && e) return `${s} → ${e}`;
  if (s) return `From ${s}`;
  if (e) return `Until ${e}`;
  return fallback;
}
