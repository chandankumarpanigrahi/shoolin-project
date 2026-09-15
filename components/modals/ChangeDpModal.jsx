'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Camera, Image as ImageIcon } from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=160&auto=format&fit=crop&q=80',
];

export function ChangeDpModal({ isOpen, onClose, currentUser, onUpdateAvatar }) {
  const [selectedUrl, setSelectedUrl] = useState(currentUser?.avatar || '');
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    if (currentUser?.avatar) {
      setSelectedUrl(currentUser.avatar);
    }
    setCustomUrl('');
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result;
        if (typeof result === 'string') {
          setSelectedUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (selectedUrl) {
      onUpdateAvatar(selectedUrl);
    }
    onClose();
  };

  const handleCustomUrlApply = () => {
    if (customUrl.trim()) {
      setSelectedUrl(customUrl.trim());
    }
  };

  const previewUser = {
    ...currentUser,
    avatar: selectedUrl,
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xl w-full max-w-md overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-sm bg-brand-light text-brand">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Update Display Picture (DP)
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Change profile avatar across PulsePM
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Live Preview */}
          <div className="flex items-center gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-sm">
            <div className="relative">
              <UserAvatar user={previewUser} size="xl" />
              <div className="absolute -bottom-1 -right-1 p-1 bg-brand text-white rounded-full shadow-sm">
                <Check className="w-2.5 h-2.5" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                {currentUser?.name}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                {currentUser?.role} · {currentUser?.department || 'PulsePM Team'}
              </p>
              <span className="inline-block mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Live Preview Active
              </span>
            </div>
          </div>

          {/* Quick Preset Avatars (Circular 50% border radius) */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Choose from Curated Presets
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {AVATAR_PRESETS.map((preset, idx) => {
                const isSelected = selectedUrl === preset;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedUrl(preset)}
                    style={{ borderRadius: '50%' }}
                    className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all group ${
                      isSelected
                        ? 'border-brand ring-2 ring-brand/30 scale-105'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preset}
                      alt={`Avatar preset ${idx + 1}`}
                      style={{ borderRadius: '50%' }}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-200"
                    />
                    {isSelected && (
                      <div
                        style={{ borderRadius: '50%' }}
                        className="absolute inset-0 bg-brand/40 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Custom Image */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Upload from Device
            </label>
            <label className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-brand rounded-sm cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 hover:bg-brand-subtle transition-all text-slate-600 dark:text-slate-400 hover:text-brand">
              <Upload className="w-3.5 h-3.5" />
              <span className="font-medium">Browse image file (PNG, JPG, WebP)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Or Paste Direct Image URL */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Or Custom Image URL
            </label>
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand"
                />
              </div>
              <button
                type="button"
                onClick={handleCustomUrlApply}
                disabled={!customUrl.trim()}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-sm disabled:opacity-50 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 bg-brand hover:bg-brand-hover active:bg-brand-hover text-white font-semibold rounded-sm shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save DP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
