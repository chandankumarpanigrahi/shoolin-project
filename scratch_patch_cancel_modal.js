import fs from 'fs';

let content = fs.readFileSync('components/views/MeetingsView.jsx', 'utf8');

// 1. Add state variables for Cancel Modal right after reschedule states
const oldState = `  // Reschedule Dialog State
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00');
  const [rescheduleDuration, setRescheduleDuration] = useState('45 mins');
  const [rescheduleApproverId, setRescheduleApproverId] = useState('');
  const [rescheduleNote, setRescheduleNote] = useState('');`;

const newState = `  // Reschedule Dialog State
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00');
  const [rescheduleDuration, setRescheduleDuration] = useState('45 mins');
  const [rescheduleApproverId, setRescheduleApproverId] = useState('');
  const [rescheduleNote, setRescheduleNote] = useState('');

  // Custom Cancel Modal State
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);`;

if (content.includes(oldState)) {
  content = content.replace(oldState, newState);
  console.log('1. Added Cancel Modal state!');
}

// 2. Replace onCancel function
const oldOnCancel = `  const onCancel = async (m) => {
    const isDark =
      typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

    const { value: reason } = await Swal.fire({
      title: 'Cancel Meeting Sync',
      text: \`Provide a mandatory cancellation reason for "\${m.title}":\`,
      input: 'text',
      inputPlaceholder: 'e.g. Schedule conflict, client milestone shifted...',
      showCancelButton: true,
      confirmButtonText: 'Cancel Sync',
      cancelButtonText: 'Keep Sync',
      confirmButtonColor: '#e11d48',
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'A cancellation reason is required!';
        }
      },
    });

    if (reason) {
      try {
        await handleCancelMeeting(m.id || m._id, reason.trim());
        showSuccess(
          'Meeting Cancelled',
          \`"\${m.title}" was cancelled and moved to Archive. Cancellation emails dispatched to all attendees.\`
        );
      } catch (error) {
        showError('Cancellation Failed', error.message || 'Unable to cancel this meeting.');
      }
    }
  };`;

const newOnCancel = `  const onCancel = (m) => {
    setCancelTarget(m);
    setCancelReasonInput('');
    setCancelError('');
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelTarget) return;
    if (!cancelReasonInput.trim()) {
      setCancelError('Please enter a cancellation reason.');
      return;
    }
    setIsCancelling(true);
    try {
      await handleCancelMeeting(cancelTarget.id || cancelTarget._id, cancelReasonInput.trim());
      showSuccess(
        'Meeting Cancelled',
        \`"\${cancelTarget.title}" was cancelled and moved to Archive. Cancellation emails dispatched to all attendees.\`
      );
      setCancelTarget(null);
    } catch (error) {
      setCancelError(error.message || 'Unable to cancel this meeting.');
    } finally {
      setIsCancelling(false);
    }
  };`;

if (content.includes(oldOnCancel)) {
  content = content.replace(oldOnCancel, newOnCancel);
  console.log('2. Replaced onCancel logic!');
}

// 3. Render Cancel Meeting Modal at the bottom of the component
const cancelModalJSX = `
      {/* Custom Cancel Meeting Modal */}
      {cancelTarget && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setCancelTarget(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-100">
            <div className="px-5 py-3.5 border-b border-rose-100 dark:border-rose-950/60 bg-rose-50/70 dark:bg-rose-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h3 className="text-sm font-bold text-rose-950 dark:text-rose-100">
                  Cancel Meeting Sync
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="p-5 space-y-3.5 text-xs">
              {cancelError && (
                <div className="p-2.5 rounded border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300 text-[11px]">
                  {cancelError}
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {cancelTarget.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>📅 {formatDate(cancelTarget.date)}</span>
                  <span>⏰ {cancelTarget.time} ({cancelTarget.duration || '45 mins'})</span>
                </p>
              </div>

              <div className="p-2.5 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded text-rose-800 dark:text-rose-300 text-[11px]">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Cancelling will send email dispatches &amp; archive sync</span>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mandatory Cancellation Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReasonInput}
                  onChange={(e) => {
                    setCancelReasonInput(e.target.value);
                    setCancelError('');
                  }}
                  placeholder="e.g. Host travel conflict; emergency schedule shift..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-md transition-colors cursor-pointer"
                >
                  Keep Meeting
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-md transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

const endTarget = `      {/* Reschedule Modal */}`;

if (content.includes(endTarget)) {
  content = content.replace(endTarget, `${cancelModalJSX}\n${endTarget}`);
  console.log('3. Added Cancel Modal JSX!');
}

fs.writeFileSync('components/views/MeetingsView.jsx', content, 'utf8');
console.log('MeetingsView.jsx updated successfully!');
