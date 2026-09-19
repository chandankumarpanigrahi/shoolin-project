import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export function getStatusStyle(status, masterStatuses = null) {
  const norm = (status || '').trim();
  const lower = norm.toLowerCase();

  const colorMap = {
    emerald: {
      style: 'bg-emerald-100/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/70',
      dot: 'bg-emerald-500'
    },
    blue: {
      style: 'bg-blue-100/90 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700/70',
      dot: 'bg-blue-500'
    },
    violet: {
      style: 'bg-purple-100/90 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700/70',
      dot: 'bg-purple-500'
    },
    purple: {
      style: 'bg-purple-100/90 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700/70',
      dot: 'bg-purple-500'
    },
    amber: {
      style: 'bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/70',
      dot: 'bg-amber-500'
    },
    rose: {
      style: 'bg-rose-100/90 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/70',
      dot: 'bg-rose-500 animate-pulse'
    },
    teal: {
      style: 'bg-teal-100/90 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700/70',
      dot: 'bg-teal-500'
    },
    slate: {
      style: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      dot: 'bg-slate-400'
    },
  };

  let list = masterStatuses;
  if (!list && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('pulsepm_master_statuses_v2');
      if (saved) list = JSON.parse(saved);
    } catch (e) {
      list = null;
    }
  }

  if (Array.isArray(list) && list.length > 0) {
    const found = list.find(s => s.name && s.name.trim().toLowerCase() === lower);
    if (found && found.color && colorMap[found.color]) {
      return colorMap[found.color];
    }
  }

  const map = {
    Completed: colorMap.emerald,
    Resolved: colorMap.emerald,
    Accepted: colorMap.emerald,
    'On Track': colorMap.teal,
    'In Progress': colorMap.blue,
    'Active Project': colorMap.emerald,
    'In Planning': colorMap.blue,
    Planning: colorMap.blue,
    Review: colorMap.purple,
    Requested: { style: 'bg-brand-light/40 text-brand border-brand/40', dot: 'bg-brand' },
    Waiting: colorMap.amber,
    'On Hold': colorMap.amber,
    Paused: colorMap.amber,
    Blocked: colorMap.rose,
    'At Risk': colorMap.rose,
    Delayed: colorMap.rose,
    Declined: colorMap.slate,
    Rescheduled: colorMap.purple,
    'Not Started': colorMap.slate,
    Archived: colorMap.slate,
  };

  if (map[norm]) return map[norm];

  if (lower.includes('complete') || lower.includes('done') || lower.includes('resolved') || lower.includes('finish') || lower.includes('ship')) {
    return colorMap.emerald;
  } else if (lower.includes('progress') || lower.includes('dev') || lower.includes('wip') || lower.includes('active')) {
    return colorMap.blue;
  } else if (lower.includes('review') || lower.includes('test') || lower.includes('qa') || lower.includes('audit')) {
    return colorMap.purple;
  } else if (lower.includes('block') || lower.includes('delay') || lower.includes('cancel') || lower.includes('defect') || lower.includes('bug') || lower.includes('risk')) {
    return colorMap.rose;
  } else if (lower.includes('wait') || lower.includes('hold') || lower.includes('pause') || lower.includes('pend')) {
    return colorMap.amber;
  }

  return colorMap.slate;
}

export function StatusBadge({ status, size = 'sm' }) {
  const { style, dot } = getStatusStyle(status);
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border whitespace-nowrap shadow-2xs ${sizeClass} ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
}

export function StatusSelect({
  value,
  onChange,
  options = [],
  size = 'xs',
  disabled = false,
  direction = 'auto',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, bottom: 'auto' });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return null;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = direction === 'up' || (direction === 'auto' && spaceBelow < 230 && rect.top > spaceBelow);

    return {
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 170)),
      top: openUp ? 'auto' : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : 'auto',
    };
  }, [direction]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      const pos = calculatePosition();
      if (pos) setMenuPos(pos);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      const pos = calculatePosition();
      if (pos) setMenuPos(pos);
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    function handleClickOutside(event) {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, calculatePosition]);

  const currentStyle = getStatusStyle(value);
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const formattedOptions = (options || []).map(opt => {
    if (typeof opt === 'string') return { id: opt, name: opt };
    return opt;
  });

  if (value && !formattedOptions.some(o => o.name === value)) {
    formattedOptions.unshift({ id: value, name: value });
  }

  const renderPortalMenu = () => {
    if (!isOpen || !mounted || typeof document === 'undefined') return null;

    return createPortal(
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          left: `${menuPos.left}px`,
          top: menuPos.top !== 'auto' ? `${menuPos.top}px` : 'auto',
          bottom: menuPos.bottom !== 'auto' ? `${menuPos.bottom}px` : 'auto',
        }}
        className="z-[9999] min-w-[155px] max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[15px] shadow-2xl p-1.5 space-y-1 animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {formattedOptions.map((st) => {
          const stName = st.name || st;
          const stStyle = getStatusStyle(stName);
          const isSelected = stName === value;

          return (
            <button
              key={st.id || stName}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(stName);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all cursor-pointer ${stStyle.style} ${isSelected ? '' : 'hover:scale-[1.01] hover:brightness-95 opacity-90 hover:opacity-100'
                }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${stStyle.dot}`}></span>
                <span>{stName}</span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 text-current shrink-0" />}
            </button>
          );
        })}
      </div>,
      document.body
    );
  };

  return (
    <div className={`inline-block text-left ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`inline-flex items-center justify-between gap-1.5 font-semibold rounded-full border whitespace-nowrap shadow-2xs transition-all duration-150 cursor-pointer hover:shadow-xs hover:brightness-95 active:scale-95 ${sizeClass} ${currentStyle.style} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${currentStyle.dot}`}></span>
          <span>{value || 'Select Status'}</span>
        </div>
        <ChevronDown className={`w-3 h-3 opacity-60 shrink-0 ml-0.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {renderPortalMenu()}
    </div>
  );
}

export function PriorityBadge({ priority, size = 'sm' }) {
  const map = {
    Urgent: 'bg-rose-100/90 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/80',
    High: 'bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/80',
    Medium: 'bg-sky-100/90 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700/80',
    Low: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  };

  const dotColor = {
    Urgent: 'bg-rose-500 animate-pulse',
    High: 'bg-amber-500',
    Medium: 'bg-sky-500',
    Low: 'bg-slate-400',
  };

  const style = map[priority] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border whitespace-nowrap shadow-2xs ${sizeClass} ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor[priority] || 'bg-slate-400'}`}></span>
      {priority}
    </span>
  );
}

export function ProjectTypeBadge({ type, size = 'sm' }) {
  const isRecurring = type === 'recurring';
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  if (isRecurring) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-cyan-100/90 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-700/80 whitespace-nowrap shadow-2xs ${sizeClass}`}>
        <svg className="w-3 h-3 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Recurring
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-brand-light text-brand-text border-brand-border whitespace-nowrap shadow-2xs ${sizeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
      One Time
    </span>
  );
}

export function RoleBadge({ role, size = 'sm' }) {
  const map = {
    'Super Admin': 'bg-purple-100/90 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700/80',
    Admin: 'bg-indigo-100/90 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700/80',
    'Manager / TL': 'bg-emerald-100/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80',
    User: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  const style = map[role] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border whitespace-nowrap shadow-2xs ${sizeClass} ${style}`}>
      {role}
    </span>
  );
}
