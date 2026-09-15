'use client';

import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';

export function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center rounded-sm border border-dashed border-slate-200 bg-slate-50/50 my-4">
      <div className="w-10 h-10 rounded-sm bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm mb-3">
        <Icon className="w-5 h-5 stroke-[1.75]" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-600 max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:bg-brand-active rounded-sm transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
