import Swal from 'sweetalert2';

/**
 * Shoolin Innovations Limited — Enterprise Confirmation & Alert System
 * Transforms generic SweetAlert2 popups into a high-end, modern,
 * dark/light-mode aware enterprise modal experience.
 */

const ICONS = {
  warning: `
    <div class="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-3.5 shadow-sm shadow-amber-500/10">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    </div>
  `,
  danger: `
    <div class="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3.5 shadow-sm shadow-rose-500/10">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"/>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
      </svg>
    </div>
  `,
  success: `
    <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3.5 shadow-sm shadow-emerald-500/10">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    </div>
  `,
  info: `
    <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3.5 shadow-sm shadow-indigo-500/10">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/>
        <path d="M12 8h.01"/>
      </svg>
    </div>
  `,
  error: `
    <div class="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3.5 shadow-sm shadow-rose-500/10">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    </div>
  `
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatSubtext(text) {
  if (!text) return '';
  // Convert double-quoted items e.g. "Captains Cafe" into a sleek tag badge
  let formatted = escapeHtml(text);
  formatted = formatted.replace(
    /&quot;([^&]+)&quot;/g,
    '<span class="inline-block px-1.5 py-0.5 mx-0.5 font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700/80 text-[11px] sm:text-xs tracking-tight">$1</span>'
  );
  // Highlight irreversible warnings
  formatted = formatted.replace(
    /\b(IRREVERSIBLE|cannot be undone|permanently removed|permanently delete)\b/gi,
    '<span class="font-bold text-rose-600 dark:text-rose-400">$1</span>'
  );
  return formatted;
}

function detectVariant({ icon, title = '', text = '', confirmButtonColor = '', confirmButtonText = '' }) {
  const combined = `${title} ${text} ${confirmButtonText}`.toLowerCase();
  
  if (
    confirmButtonColor === '#e11d48' ||
    icon === 'error' ||
    icon === 'danger' ||
    combined.includes('permanently delete') ||
    combined.includes('terminate session') ||
    combined.includes('clear all') ||
    combined.includes('revoke')
  ) {
    return 'danger';
  }

  if (
    icon === 'warning' ||
    combined.includes('move project') ||
    combined.includes('delete') ||
    combined.includes('remove') ||
    combined.includes('archive') ||
    combined.includes('pause') ||
    combined.includes('deactivate')
  ) {
    return 'warning';
  }

  if (icon === 'success' || combined.includes('success')) {
    return 'success';
  }

  return 'info';
}

export const showConfirm = async ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  icon = 'warning',
  confirmButtonText = 'Yes, Proceed!',
  cancelButtonText = 'Cancel',
  confirmButtonColor = '',
}) => {
  const variant = detectVariant({ icon, title, text, confirmButtonColor, confirmButtonText });
  const iconMarkup = ICONS[variant] || ICONS.warning;
  const formattedText = formatSubtext(text);

  let confirmButtonClass =
    'px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 border border-indigo-500/30 transition-all cursor-pointer';

  if (variant === 'danger') {
    confirmButtonClass =
      'px-4 sm:px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/25 border border-rose-500/30 transition-all cursor-pointer';
  } else if (variant === 'warning') {
    confirmButtonClass =
      'px-4 sm:px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-md shadow-amber-500/25 border border-amber-400/30 transition-all cursor-pointer';
  }

  const result = await Swal.fire({
    html: `
      <div class="swal-modal-content text-center">
        ${iconMarkup}
        <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">
          ${escapeHtml(title)}
        </h3>
        <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          ${formattedText}
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: 'swal-enterprise-popup',
      confirmButton: confirmButtonClass,
      cancelButton:
        'px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer',
    },
  });

  return result.isConfirmed;
};

export const showSuccess = (title = 'Success!', text = '') => {
  const iconMarkup = ICONS.success;
  const formattedText = formatSubtext(text);

  return Swal.fire({
    html: `
      <div class="swal-modal-content text-center py-1">
        ${iconMarkup}
        <h3 class="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
          ${escapeHtml(title)}
        </h3>
        ${text ? `<div class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">${formattedText}</div>` : ''}
      </div>
    `,
    timer: 2200,
    timerProgressBar: true,
    showConfirmButton: false,
    showCancelButton: false,
    buttonsStyling: false,
    customClass: {
      popup: 'swal-enterprise-popup',
    },
  });
};

export const showError = (title = 'Action Failed', text = 'Something went wrong.') => {
  const iconMarkup = ICONS.error;
  const formattedText = formatSubtext(text);

  return Swal.fire({
    html: `
      <div class="swal-modal-content text-center py-1">
        ${iconMarkup}
        <h3 class="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
          ${escapeHtml(title)}
        </h3>
        <div class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
          ${formattedText}
        </div>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: 'Dismiss',
    showCancelButton: false,
    buttonsStyling: false,
    customClass: {
      popup: 'swal-enterprise-popup',
      confirmButton:
        'px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold text-xs transition-all cursor-pointer',
    },
  });
};

export const showPrompt = async ({
  title = 'Confirmation Required',
  text = '',
  html = '',
  placeholder = 'Type here...',
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  requiredMatch = null,
  isDanger = true,
  errorMessage = null,
}) => {
  const iconMarkup = isDanger ? ICONS.danger : ICONS.info;
  const content = html || (text ? formatSubtext(text) : '');

  const confirmBtnClass = isDanger
    ? 'px-4 sm:px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/25 border border-rose-500/30 transition-all cursor-pointer'
    : 'px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 border border-indigo-500/30 transition-all cursor-pointer';

  const { value } = await Swal.fire({
    html: `
      <div class="swal-modal-content text-center py-1">
        ${iconMarkup}
        <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">
          ${escapeHtml(title)}
        </h3>
        <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          ${content}
        </div>
      </div>
    `,
    input: 'text',
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: 'swal-enterprise-popup',
      input: 'swal-enterprise-input',
      confirmButton: confirmBtnClass,
      cancelButton:
        'px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer',
    },
    inputValidator: (val) => {
      if (requiredMatch !== null) {
        if (!val || val.trim() !== requiredMatch) {
          return errorMessage || `You must type "${requiredMatch}" exactly (case-sensitive) to confirm!`;
        }
      }
    },
  });

  return value;
};

export default Swal;

