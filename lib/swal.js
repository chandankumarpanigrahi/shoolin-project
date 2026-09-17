import Swal from 'sweetalert2';

/**
 * Custom SweetAlert2 Helper Utility for Shoolin OS
 * Provides sleek, dark/light theme aware Yes/No confirmations, alerts, and notifications.
 */

const isDarkMode = () => {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

const getSwalTheme = () => {
  const dark = isDarkMode();
  return {
    background: dark ? '#0f172a' : '#ffffff',
    color: dark ? '#f8fafc' : '#0f172a',
    customClass: {
      popup: dark
        ? 'border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl'
        : 'border border-slate-200 rounded-2xl shadow-2xl',
      title: 'text-lg font-bold tracking-tight',
      htmlContainer: 'text-xs text-slate-500 dark:text-slate-400',
      confirmButton:
        'px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all mx-1.5 cursor-pointer',
      cancelButton:
        'px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all mx-1.5 cursor-pointer',
    },
    buttonsStyling: false,
  };
};

export const showConfirm = async ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  icon = 'warning',
  confirmButtonText = 'Yes, Proceed!',
  cancelButtonText = 'Cancel',
}) => {
  const theme = getSwalTheme();
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    ...theme,
  });
  return result.isConfirmed;
};

export const showSuccess = (title = 'Success!', text = '') => {
  const theme = getSwalTheme();
  return Swal.fire({
    title,
    text,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    ...theme,
  });
};

export const showError = (title = 'Error!', text = 'Something went wrong') => {
  const theme = getSwalTheme();
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    ...theme,
  });
};

export default Swal;
